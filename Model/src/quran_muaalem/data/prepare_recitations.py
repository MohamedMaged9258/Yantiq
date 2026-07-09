"""
Prepare the `obadx/mualem-recitations-annotated` dataset for MSA fine-tuning.

The recitations dataset ships 16 kHz audio + Quranic text (`uthmani` / `imlaey`) but
NO phoneme labels. This module phonemizes the chosen text field into the existing
35-class MSA inventory (reusing `ArabicToPhonemes` from `prepare_common_voice`) and emits
the exact same `manifest.json` that `MSAPhonemeDataset` / `train_msa.py` already consume:

    { "train": [ {"audio": "<path>.wav", "phonemes": "د ر س"} ], "val": [...], "test": [...] }

Nothing downstream (model, heads, tokenizer, dataset loader, trainer) changes.

The source dataset only exposes a single `train` split per reciter config, so train/val/test
are synthesized here by a seeded shuffle + ratio partition. Audio is streamed (never the
full ~97.8 GB at once) and materialized as flat WAV or FLAC files under `<output_dir>/audio/`
(`--audio-format flac` roughly halves disk). On quota'd machines, `--max-disk-gb N` stops
ingest once the written audio reaches N GB and finalizes the manifest with what was kept.

Run via the `setup_recitations.py` bootstrap, or directly:

    python -m quran_muaalem.data.prepare_recitations --configs moshaf_0.0 --max-total 50
"""

import argparse
import json
import os
import random
import sys
from pathlib import Path
from typing import Optional

import soundfile as sf
from tqdm import tqdm

from .prepare_common_voice import ArabicToPhonemes

DATASET_REPO = "obadx/mualem-recitations-annotated"

# The 27 audio (moshaf_*) configs shipped by the dataset. The two metadata configs
# (moshaf_metadata, reciters_metadata) are intentionally excluded -- they carry no audio.
ALL_CONFIGS = [
    "moshaf_0.0", "moshaf_0.1", "moshaf_0.2", "moshaf_0.3",
    "moshaf_1.0", "moshaf_2.0", "moshaf_2.1", "moshaf_3.0",
    "moshaf_4.0", "moshaf_5.0", "moshaf_6.0", "moshaf_7.0",
    "moshaf_8.0", "moshaf_9.0", "moshaf_11.0", "moshaf_12.0",
    "moshaf_13.0", "moshaf_19.0", "moshaf_22.0", "moshaf_24.0",
    "moshaf_25.0", "moshaf_26.0", "moshaf_26.1", "moshaf_27.0",
    "moshaf_28.0", "moshaf_29.0", "moshaf_30.0",
]


class RecitationsProcessor:
    """Stream the recitations dataset, phonemize text, and build manifest.json."""

    def __init__(
        self,
        output_dir: str | Path = "datasets/msa_speech",
        text_field: str = "uthmani",
        sample_rate: int = 16000,
        min_duration: float = 0.5,
        max_duration: float = 30.0,
        audio_format: str = "wav",
        max_disk_gb: Optional[float] = None,
    ):
        if audio_format not in ("wav", "flac"):
            raise ValueError(f"audio_format must be 'wav' or 'flac', got {audio_format!r}")

        self.output_dir = Path(output_dir)
        self.text_field = text_field
        self.sample_rate = sample_rate
        self.min_duration = min_duration
        self.max_duration = max_duration
        self.audio_format = audio_format
        # Optional disk budget (GB) for the materialized audio. Guards a user quota:
        # ingest stops once this is reached and the manifest is finalized with what we have.
        self.max_disk_gb = max_disk_gb
        self.bytes_written = 0

        self.audio_dir = self.output_dir / "audio"
        self.audio_dir.mkdir(parents=True, exist_ok=True)

    def process(
        self,
        configs: list[str],
        max_samples_per_config: Optional[int] = None,
        max_total: Optional[int] = None,
    ) -> list[dict]:
        """Stream every requested config and return a list of {audio, phonemes} dicts."""
        # Imported lazily so `--help` and import of this module don't require `datasets`.
        from datasets import load_dataset
        import datasets as _ds

        # Be patient with a flaky CDN: longer per-request timeout + more streaming retries.
        try:
            _ds.config.STREAMING_READ_MAX_RETRIES = max(
                getattr(_ds.config, "STREAMING_READ_MAX_RETRIES", 20), 20)
            _ds.config.STREAMING_READ_RETRY_INTERVAL = 5
        except Exception:  # noqa: BLE001
            pass

        samples: list[dict] = []
        skipped_total = 0
        budget_bytes = int(self.max_disk_gb * 1e9) if self.max_disk_gb else None
        if budget_bytes is not None:
            print(f"Disk budget: {self.max_disk_gb:.1f} GB for audio (stops ingest when reached)")

        def budget_reached() -> bool:
            return budget_bytes is not None and self.bytes_written >= budget_bytes

        for config in configs:
            if max_total is not None and len(samples) >= max_total:
                break
            if budget_reached():
                break

            print(f"\nStreaming config '{config}' from {DATASET_REPO} ...")
            try:
                ds = load_dataset(
                    DATASET_REPO,
                    config,
                    split="train",
                    streaming=True,
                )
            except Exception as e:  # noqa: BLE001 - surface config-level failures, keep going
                print(f"  WARNING: could not load config '{config}': {e}")
                continue

            # Iterate manually so a mid-stream CDN failure (IncompleteRead /
            # ChunkedEncodingError raised by the iterator, not by _process_row) doesn't
            # abort the whole run. We keep what we have and move to the next config.
            kept_here = 0
            row_iter = iter(ds)
            pbar = tqdm(desc=f"  {config}")
            while True:
                if max_samples_per_config is not None and kept_here >= max_samples_per_config:
                    break
                if max_total is not None and len(samples) >= max_total:
                    break
                if budget_reached():
                    print(f"\n  Reached disk budget ({self.max_disk_gb:.1f} GB); stopping ingest.")
                    break

                try:
                    row = next(row_iter)
                except StopIteration:
                    break
                except Exception as e:  # noqa: BLE001 - transient stream/CDN failure
                    print(f"\n  WARNING: stream error in '{config}' after {kept_here} kept "
                          f"({type(e).__name__}); skipping rest of this config and continuing.")
                    break

                pbar.update(1)
                sample = self._process_row(row, config, kept_here)
                if sample is None:
                    skipped_total += 1
                    continue

                samples.append(sample)
                kept_here += 1
            pbar.close()

            print(f"  kept {kept_here} samples from '{config}' "
                  f"(audio so far ~{self.bytes_written/1e9:.2f} GB)")
            if budget_reached():
                break

        print(f"\nTotal kept: {len(samples)} ({skipped_total} skipped), "
              f"audio ~{self.bytes_written/1e9:.2f} GB in {self.audio_dir}")
        return samples

    def _process_row(self, row: dict, config: str, idx: int) -> Optional[dict]:
        """Turn one dataset row into a {audio, phonemes} dict, or None if it should be skipped."""
        try:
            text = row.get(self.text_field)
            if not text:
                return None

            phonemes = ArabicToPhonemes.text_to_phonemes(text)
            if not phonemes:
                return None

            audio = row.get("audio")
            if not audio or "array" not in audio:
                return None
            array = audio["array"]
            sr = audio.get("sampling_rate", self.sample_rate)

            # Duration gate. Prefer the dataset's own field, fall back to the array length.
            duration = row.get("duration_seconds")
            if not duration:
                duration = len(array) / sr if sr else 0.0
            if duration < self.min_duration or duration > self.max_duration:
                return None

            # Namespace filenames by config so the flat audio dir never collides.
            safe_config = config.replace(".", "_")
            out_path = self.audio_dir / f"{safe_config}_{idx:06d}.{self.audio_format}"
            sf.write(str(out_path), array, sr)
            try:
                self.bytes_written += out_path.stat().st_size
            except OSError:
                pass

            return {"audio": str(out_path), "phonemes": phonemes}
        except Exception:  # noqa: BLE001 - one bad row shouldn't kill the whole run
            return None

    def create_manifest(
        self,
        samples: list[dict],
        val_ratio: float = 0.05,
        test_ratio: float = 0.05,
        seed: int = 42,
    ) -> dict:
        """Deterministically split samples into train/val/test and write manifest.json."""
        shuffled = list(samples)
        random.Random(seed).shuffle(shuffled)

        n = len(shuffled)
        n_val = int(n * val_ratio)
        n_test = int(n * test_ratio)

        manifest = {
            "val": shuffled[:n_val],
            "test": shuffled[n_val:n_val + n_test],
            "train": shuffled[n_val + n_test:],
        }

        manifest_path = self.output_dir / "manifest.json"
        with open(manifest_path, "w", encoding="utf-8") as f:
            json.dump(manifest, f, ensure_ascii=False, indent=2)

        print(f"\nManifest saved to {manifest_path}")
        print(f"   Train: {len(manifest['train'])} samples")
        print(f"   Val:   {len(manifest['val'])} samples")
        print(f"   Test:  {len(manifest['test'])} samples")
        return manifest


def parse_configs(raw: str) -> list[str]:
    """Resolve the --configs value ('all' or a comma-separated list) to config names."""
    raw = raw.strip()
    if raw.lower() == "all":
        return list(ALL_CONFIGS)
    requested = [c.strip() for c in raw.split(",") if c.strip()]
    unknown = [c for c in requested if c not in ALL_CONFIGS]
    if unknown:
        raise SystemExit(
            f"Unknown config(s): {unknown}\nValid configs: {', '.join(ALL_CONFIGS)}"
        )
    return requested


def build_arg_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        description="Prepare obadx/mualem-recitations-annotated into datasets/msa_speech/manifest.json",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    p.add_argument(
        "--configs",
        default="moshaf_0.0",
        help="Comma-separated reciter configs, or 'all' for every audio config.",
    )
    p.add_argument(
        "--text-field",
        default="uthmani",
        choices=["uthmani", "imlaey"],
        help="Which text column to phonemize into the 35-class labels.",
    )
    p.add_argument("--max-samples-per-config", type=int, default=None)
    p.add_argument("--max-total", type=int, default=None)
    p.add_argument("--output-dir", default="datasets/msa_speech")
    p.add_argument("--val-ratio", type=float, default=0.05)
    p.add_argument("--test-ratio", type=float, default=0.05)
    p.add_argument("--seed", type=int, default=42)
    p.add_argument("--min-duration", type=float, default=0.5)
    p.add_argument("--max-duration", type=float, default=30.0)
    p.add_argument(
        "--audio-format",
        default="wav",
        choices=["wav", "flac"],
        help="Container for materialized audio. 'flac' ~halves disk vs 'wav' and the "
             "loader (librosa) reads both transparently.",
    )
    p.add_argument(
        "--max-disk-gb",
        type=float,
        default=None,
        help="Stop ingesting once written audio reaches this many GB (guards a disk "
             "quota). The manifest is finalized with whatever was collected.",
    )
    return p


def _relax_resource_limits() -> None:
    """Make the HF download stack survive low process/thread caps.

    Disables the thread-heavy hf_xet backend and raises the soft RLIMIT_NPROC to the
    hard cap. The bootstrap (setup_recitations.py) also does this, but doing it here
    means a direct `python -m ...prepare_recitations` run is safe too. Must run before
    `datasets`/`huggingface_hub` are imported (they read these env vars at import).
    (BLAS thread env can't be fixed here — numpy is already imported by this point;
    export OPENBLAS_NUM_THREADS=1 in the shell for direct runs.)
    """
    os.environ.setdefault("HF_HUB_DISABLE_XET", "1")
    os.environ.setdefault("HF_HUB_DISABLE_TELEMETRY", "1")
    # Give the flaky CDN more time per request before a read times out.
    os.environ.setdefault("HF_HUB_DOWNLOAD_TIMEOUT", "60")
    try:
        import resource

        soft, hard = resource.getrlimit(resource.RLIMIT_NPROC)
        if hard == resource.RLIM_INFINITY or soft < hard:
            resource.setrlimit(resource.RLIMIT_NPROC, (hard, hard))
    except Exception:  # noqa: BLE001 - resource missing (Windows) or not permitted
        pass


def main(argv: Optional[list[str]] = None):
    _relax_resource_limits()
    args = build_arg_parser().parse_args(argv)

    configs = parse_configs(args.configs)
    print("Preparing recitations dataset for MSA training")
    print(f"  Configs:      {', '.join(configs)}")
    print(f"  Text field:   {args.text_field}")
    print(f"  Audio format: {args.audio_format}")
    print(f"  Output:       {args.output_dir}")

    processor = RecitationsProcessor(
        output_dir=args.output_dir,
        text_field=args.text_field,
        min_duration=args.min_duration,
        max_duration=args.max_duration,
        audio_format=args.audio_format,
        max_disk_gb=args.max_disk_gb,
    )

    # Report filesystem free space. NOTE: this is the filesystem's free space, which on a
    # quota'd home may be far larger than your personal quota headroom -- use --max-disk-gb
    # to cap against the quota, not this number.
    try:
        import shutil

        free_gb = shutil.disk_usage(processor.output_dir).free / 1e9
        print(f"  Filesystem free at output: {free_gb:.1f} GB "
              f"(your user disk QUOTA may be lower -- guard with --max-disk-gb)")
    except Exception:  # noqa: BLE001
        pass

    samples = processor.process(
        configs=configs,
        max_samples_per_config=args.max_samples_per_config,
        max_total=args.max_total,
    )

    if not samples:
        print("\nERROR: no samples were kept. Check the config names and text field.")
        return 1

    processor.create_manifest(
        samples,
        val_ratio=args.val_ratio,
        test_ratio=args.test_ratio,
        seed=args.seed,
    )

    print("\nDataset ready for training. Next steps (use python3, not python):")
    print("  0. on a thread-limited box, first: ulimit -u 1024 && "
          "export OPENBLAS_NUM_THREADS=1 HF_HUB_DISABLE_XET=1")
    print("  1. (once) resize the phoneme head 43 -> 35:")
    print('     python3 -c "from src.quran_muaalem.modeling.adapt_model_for_msa '
          'import adapt_model_for_msa; adapt_model_for_msa()"')
    print("  2. train:")
    print("     python3 train_msa_simple.py --model_name checkpoints/msa_model_adapted "
          "--device cuda --epochs 20 --batch_size 4")
    return 0


if __name__ == "__main__":
    sys.exit(main())
