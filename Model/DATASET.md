# DATASET — MSA Training Data

This document covers preparing the training data that feeds the MSA fine-tuning pipeline.
For what to do *with* the prepared data, see [TRAINING.md](TRAINING.md).

There are two sources:
- **Recitations dataset (current, recommended)** — `obadx/mualem-recitations-annotated`,
  a large 16 kHz Arabic recitation corpus. See section 0 below.
- **Common Voice Arabic (legacy fallback)** — the original source, documented from
  section 1 onward.

Both emit the **same** `datasets/msa_speech/manifest.json`, so training is identical
regardless of which you use.

---

## 0. Recitations Dataset (current)

`obadx/mualem-recitations-annotated` is a ~97.8 GB / 286,586-row 16 kHz Arabic recitation
dataset (by the same author as the base model). It ships audio + Quranic text but **no
phoneme labels**, so preparation phonemizes a text column (`uthmani` by default) into the
existing 35-class MSA inventory using the same map as Common Voice, then emits the standard
manifest. The source only has a `train` split per reciter config, so train/val/test are
synthesized by a seeded shuffle.

### One-shot bootstrap (Linux server)

`setup_recitations.py` installs the `training` extra and prepares the dataset in one go:

```bash
# tiny end-to-end smoke run (streams only ~50 rows, no full download)
python setup_recitations.py --configs moshaf_0.0 --max-total 50

# a real subset: two reciters, capped per reciter
python setup_recitations.py --configs moshaf_0.0,moshaf_1.0 --max-samples-per-config 5000

# everything (~100 GB streamed; large disk + long run)
python setup_recitations.py --configs all

# skip the dependency install step if deps are already present
python setup_recitations.py --skip-install --configs moshaf_0.0 --max-total 50
```

The dataset is streamed (`streaming=True`), so caps like `--max-total` stop early without
downloading the full corpus. Audio is written as flat WAVs under
`datasets/msa_speech/audio/` and referenced by `manifest.json`.

### Running the prep module directly

If deps are already installed, skip the bootstrap and call the module (needs `src/` on
`PYTHONPATH`, or run via `uv`):

```bash
python -m quran_muaalem.data.prepare_recitations --configs moshaf_0.0 --max-total 50
python -m quran_muaalem.data.prepare_recitations --help   # all flags
```

Key flags: `--configs` (comma list or `all`), `--text-field` (`uthmani`|`imlaey`),
`--max-samples-per-config`, `--max-total`, `--val-ratio`/`--test-ratio`, `--seed`,
`--min-duration`/`--max-duration`, `--output-dir`,
`--audio-format` (`wav`|`flac`), `--max-disk-gb`.

### Disk footprint on quota'd servers

Each kept clip is materialized as 16 kHz audio in `<output-dir>/audio/`. WAV is uncompressed
(~32 KB per second); **`--audio-format flac` roughly halves that** and the loader
(`librosa.load`) reads FLAC transparently, so there's no downstream change. On a machine with
a per-user disk **quota** (not just filesystem free space), guard it with **`--max-disk-gb N`**:
ingest stops once the written audio reaches N GB and the manifest is finalized with whatever
was collected. The prep run prints running audio size per config and a final total. Estimate
your real per-sample size after a run with `du -sh datasets/msa_speech/audio`.

> Note: `uthmani` carries orthography the 35-class map lacks (superscript alif, hamzat
> wasl, madda, small letters, shadda, tanween) — those glyphs are simply dropped during
> phonemization. Switch to `--text-field imlaey` for plainer spelling if desired.

Once the manifest exists, proceed to [TRAINING.md](TRAINING.md) exactly as with Common
Voice. Everything below documents the legacy Common Voice path.

### Thread-limited servers (OpenBLAS / nproc)

Some GPU boxes ship a low `RLIMIT_NPROC` (e.g. 512 soft / 1024 hard) on a many-core host.
OpenBLAS then tries to spawn one thread per core at import and dies with
`pthread_create failed / Resource temporarily unavailable`, and the HF download stack hits
`can't start new thread`. `setup_recitations.py` already handles this for the prep step.
For the **torch-heavy** steps (head adapt + training), run them through `run_msa.sh`, which
raises the soft nproc limit and forces single-threaded BLAS before exec'ing your command:

```bash
chmod +x run_msa.sh
./run_msa.sh python3 -c "from src.quran_muaalem.modeling.adapt_model_for_msa import adapt_model_for_msa; adapt_model_for_msa()"
./run_msa.sh python3 train_msa_simple.py --model_name checkpoints/msa_model_adapted --device cuda --epochs 20 --batch_size 4
```

The wrapper respects thread vars you set yourself, so `OPENBLAS_NUM_THREADS=4 ./run_msa.sh ...`
gives the CPU-side ops more threads for GPU training. Also note: on this box the default
`python` is Python 2 — always use `python3`.

---

## 1. What We Use

**Common Voice Arabic** — a crowdsourced corpus of Arabic speech recordings with text transcriptions, released by Mozilla under CC0. It's the largest free MSA-leaning Arabic speech dataset, which is why we use it.

| Property | Value |
|---|---|
| Source | https://mozilladatacollective.com/datasets/cmn2g7uu701fqo1072r5na25l |
| Format | MP3 audio + TSV metadata |
| License | CC0 (public domain) |
| Size on disk | ~3–8 GB depending on the release |
| After preparation | ~2 GB of 16 kHz mono WAV + a single `manifest.json` |

After running our preparation script you should end up with roughly **49,601 samples / 17.4 hours** split 70 / 15 / 15 train / val / test. Exact counts vary slightly with the release.

---

## 2. Download

1. Visit the dataset page: https://mozilladatacollective.com/datasets/cmn2g7uu701fqo1072r5na25l
2. Pick the **Arabic** locale.
3. Download the archive (`.tar.gz`). It's typically named like `cv-corpus-XX.X-YYYY-MM-DD-ar.tar.gz`.

Note: Mozilla may ask you to accept terms or provide an email before the download starts. The archive is several GB — give it time on a slow connection.

---

## 3. Extract Into the Repo

Place the extracted contents at `datasets/common_voice_ar/` so the prep script finds it without configuration.

### PowerShell (Windows — what this machine uses)

```powershell
# from the project root
mkdir -Force datasets\common_voice_ar
tar -xzf path\to\cv-corpus-XX.X-YYYY-MM-DD-ar.tar.gz -C datasets\common_voice_ar --strip-components=1
```

The `--strip-components=1` flag drops the wrapping `cv-corpus-XX.X-YYYY-MM-DD-ar/` directory so the TSVs and `clips/` end up directly inside `datasets/common_voice_ar/`.

### bash

```bash
mkdir -p datasets/common_voice_ar
tar -xzf path/to/cv-corpus-XX.X-YYYY-MM-DD-ar.tar.gz -C datasets/common_voice_ar --strip-components=1
```

---

## 4. Expected Layout

After extraction `datasets/common_voice_ar/` should look like:

```
datasets/common_voice_ar/
├── clips/                    # *.mp3 files (this is the bulk of the data)
├── train.tsv                 # train split metadata
├── dev.tsv                   # validation split metadata
├── test.tsv                  # test split metadata
├── validated.tsv             # all validated clips
├── invalidated.tsv           # rejected clips (we ignore these)
├── other.tsv                 # unverified (we ignore)
├── reported.tsv              # community-flagged clips (we ignore)
├── times.txt
└── ...
```

The columns we care about in each TSV are:

| Column | Used for |
|---|---|
| `path` | filename inside `clips/` (e.g. `common_voice_ar_12345.mp3`) |
| `sentence` | the Arabic transcription (or `text` in older releases) |

Anything else (votes, ages, accents, locales) is ignored by our pipeline.

### Quick sanity check

```powershell
# how many clips Mozilla shipped
(Get-ChildItem datasets\common_voice_ar\clips -Filter *.mp3).Count

# how many rows in each split
Get-Content datasets\common_voice_ar\train.tsv | Measure-Object -Line
```

You should see hundreds of thousands of MP3s and a `train.tsv` with tens of thousands of lines. If `clips/` is missing or the TSVs are zero bytes, the archive didn't extract cleanly.

---

## 5. Prepare the Manifest

Run the conversion script. It resamples each MP3 to 16 kHz mono WAV, phonemizes the transcription, filters bad clips, and writes a single `manifest.json`.

```bash
python3.14 -m uv run python -m quran_muaalem.data.prepare_common_voice
```

What it does — see [src/quran_muaalem/data/prepare_common_voice.py](src/quran_muaalem/data/prepare_common_voice.py):

- **Source**: reads `train.tsv`, `dev.tsv`, `test.tsv` from `datasets/common_voice_ar/`.
- **Audio**: loads each MP3 with `librosa`, resamples to 16 kHz, mono.
- **Filter**: drops clips shorter than 0.5 s or longer than 30 s.
- **Phonemize**: maps each Arabic character to its MSA phoneme using `ArabicToPhonemes.PHONEME_MAP`. **Drops `ا` and `ى`** (long-vowel markers) — the model is trained without them, so the labels match.
- **Write**: WAVs go to `datasets/msa_speech/{train,val,test}/audio_NNNNNN.wav`; metadata into `datasets/msa_speech/manifest.json`.

This step takes **2–3 hours** on a typical machine because it's I/O-bound (decoding MP3 + writing WAV for ~50k clips). It's one-shot — the WAVs and manifest persist after.

---

## 6. Output

```
datasets/msa_speech/
├── train/
│   ├── audio_000000.wav
│   ├── audio_000001.wav
│   └── ... (~28,864 files)
├── val/
│   └── ... (~10,229 files)
├── test/
│   └── ... (~10,508 files)
└── manifest.json
```

`manifest.json` has the shape:

```json
{
  "train": [
    {"audio": "datasets/msa_speech/train/audio_000000.wav", "phonemes": "د ر س"},
    {"audio": "datasets/msa_speech/train/audio_000001.wav", "phonemes": "س ل م"}
  ],
  "val":  [...],
  "test": [...]
}
```

This is the file that [src/quran_muaalem/data/msa_dataset.py](src/quran_muaalem/data/msa_dataset.py) reads, so it's the only artifact the trainer cares about.

---

## 7. Smaller Subset for Iteration

If you want to dry-run the pipeline on a fraction of the data (much faster than the full 2–3 h conversion), edit the bottom of [prepare_common_voice.py](src/quran_muaalem/data/prepare_common_voice.py) and pass `max_samples=` to `process_cv_dataset(...)`:

```python
samples = processor.process_cv_dataset(
    splits=["train", "dev", "test"],
    max_samples=500,   # ~5 minutes total
)
```

You can also skip preparation entirely for a smoke test by using `--max_samples 100` on the trainer once the manifest exists.

---

## 8. Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| `FileNotFoundError: datasets/common_voice_ar` | Archive extracted to a nested folder. | Move contents up one level, or re-extract with `--strip-components=1`. |
| `KeyError: 'sentence'` during prep | Older Common Voice release uses `text` instead of `sentence`. | The script already falls back to `text`; if both are missing, the TSV is corrupt. |
| Many "skipped" lines in the prep output | Some MP3s are missing or shorter than 0.5 s. | Normal — Common Voice has noise. Expect 5–15 % skip rate. |
| Prep is extremely slow (> 5 h) | Disk I/O bottleneck (HDD, antivirus scanning every WAV). | Move `datasets/` to an SSD, or temporarily exclude the folder from antivirus. |
| `librosa.util.exceptions.ParameterError: Audio buffer is not finite everywhere` | One bad MP3. | The script catches per-clip exceptions and skips — should not abort the run. |
| Prep finishes but `manifest.json` is empty | All TSVs were empty or all clips skipped. | Check that `train.tsv` has a header and rows; check that `clips/` actually contains MP3s. |

---

## 9. Re-running After Updates

If you change the phonemization rules in `prepare_common_voice.py` (e.g., to include `ا`), you must:

1. Delete `datasets/msa_speech/`.
2. Re-run the prep script (regenerates WAVs + manifest).
3. Re-run `adapt_model_for_msa()` only if you change the vocab size.
4. Re-train.

The WAVs themselves are deterministic — only the `phonemes` field in `manifest.json` changes, so steps 1+2 only really need to regenerate `manifest.json`. To do that without re-decoding audio, you can write a small one-off that just re-reads the TSVs and writes a fresh manifest pointing at the existing WAV paths.
