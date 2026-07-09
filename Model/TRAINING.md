# TRAINING — MSA Fine-Tuning Process

This document covers the full training pipeline: from prepared dataset to a fine-tuned MSA phoneme recognizer. For obtaining and preparing the dataset, see [DATASET.md](DATASET.md). For the model itself, see [MODEL.md](MODEL.md). For serving, see [RUNNING.md](RUNNING.md).

> **Heads-up if you trained before this revision.** Two bugs in the data pipeline meant earlier runs trained on corrupted labels: every sample's label was clipped to a single phoneme (wrong shape index in `MSAPhonemeDataset.__getitem__`), and the four emphatic consonants `ص ض ط ظ` were missing from the vocab and silently mapped to `[UNK]`. Both are fixed; any pre-existing `checkpoints/msa_model_adapted/` and `checkpoints/msa_model_v*/` are unusable. Re-run the adapter, then retrain from scratch.

---

## 1. Pipeline Overview

```
  obadx/mualem-recitations-annotated    prepare_recitations.py       manifest.json
  (streamed 16 kHz audio + text)   ───► (phonemize uthmani→35)  ───►  + 16 kHz WAV/FLAC
  [legacy: Common Voice via prepare_common_voice.py]                       │
                                                                           ▼
   adapt_model_for_msa.py        msa_model_adapted          msa_dataset.py
   (resize phoneme head)   ───►  checkpoint (35 classes) ◄── (PyTorch Dataset)
                                                                           │
                                                                           ▼
                                                            train_msa.py
                                                            (CTC fine-tune, auto-GPU)
                                                                           │
                                                                           ▼
                                                       checkpoints/msa_model_v1/
                                                       best_model/
```

Everything lives under [src/quran_muaalem/data/](src/quran_muaalem/data/), [src/quran_muaalem/modeling/](src/quran_muaalem/modeling/), and [src/quran_muaalem/training/](src/quran_muaalem/training/).

### One command for the whole pipeline

On a Linux GPU server, [`run_full_training.sh`](run_full_training.sh) chains prep → adapt →
train, self-detaches (`setsid`+`nohup`) so it survives SSH drops, and logs to
`training_run.log`:

```bash
chmod +x run_full_training.sh
./run_full_training.sh --configs all --max-per-config 0   # full dataset, FLAC, 80 GB guard
tail -f training_run.log
```

If the dataset is already prepared, skip prep with `--dataset-ready`:

```bash
bash run_full_training.sh --dataset-ready
```

The rest of this document explains each step the script runs, so you can also run them
individually.

---

## 2. Step 1 — Install Training Dependencies

```bash
python3.14 -m uv sync --extra training
```

This adds `soundfile`, `librosa`, `tqdm`, `accelerate`, `datasets` (<4.0), and
`huggingface_hub` on top of the base install. (On a Linux server, `setup_recitations.py`
installs this extra for you.) Verify with:

```bash
python3.14 -m uv run python -c "import torch, librosa, soundfile; print(torch.__version__)"
```

Note: `pyproject.toml` pins `torch` to the **CPU** wheel index (`pytorch-cpu`), so a plain `uv sync` installs CPU-only PyTorch. If you have an NVIDIA GPU and want CUDA, install a CUDA build of `torch` separately (e.g. from the `pytorch-cu121` index) after syncing. Confirm CUDA is visible with:

```bash
python3.14 -m uv run python -c "import torch; print(torch.cuda.is_available(), torch.cuda.get_device_name(0) if torch.cuda.is_available() else '')"
```

---

## 3. Step 2 — Prepare the Dataset

**Current source: `obadx/mualem-recitations-annotated`** — a large 16 kHz Arabic recitation
corpus that ships audio + Quranic text but no phoneme labels. Preparation streams it,
phonemizes the `uthmani` field into the 35-class MSA inventory, and writes
`datasets/msa_speech/manifest.json` (same schema the trainer already reads). The
`setup_recitations.py` bootstrap installs the training extra then runs the prep module:

```bash
# smoke run (streams ~50 rows, no full download)
python3 setup_recitations.py --configs moshaf_0.0 --max-total 50

# a real subset / the full corpus (FLAC halves disk; --max-disk-gb guards a quota)
python3 setup_recitations.py --skip-install --configs all --max-samples-per-config 5000 --audio-format flac
```

Full instructions, the config/scope flags, disk-footprint guidance, and the legacy
Common Voice path are in **[DATASET.md](DATASET.md)**.

---

## 4. Step 3 — Adapt the Pre-Trained Model

The pre-trained checkpoint outputs 43 Quranic phonemes. We resize it to 35 MSA phonemes once, then train.

```bash
python3.14 -m uv run python -c "from src.quran_muaalem.modeling.adapt_model_for_msa import adapt_model_for_msa; adapt_model_for_msa()"
```

This produces `checkpoints/msa_model_adapted/`. Details of the resize are in [MODEL.md §3](MODEL.md). You only need to run this once.

---

## 5. Step 4 — Run Training

The entry point is [train_msa_simple.py](train_msa_simple.py), which delegates to `quran_muaalem.training.train_msa.main`.

### Arguments

| Flag | Default | Meaning |
|---|---|---|
| `--manifest` | `datasets/msa_speech/manifest.json` | Path to the manifest from step 3b. |
| `--model_name` | `obadx/muaalem-model-v3_2` | Pre-trained model or local checkpoint dir. **Use `checkpoints/msa_model_adapted` after step 4.** |
| `--output_dir` | `checkpoints/msa_model_v1` | Where checkpoints and history are written. |
| `--epochs` | `20` | Total epochs. |
| `--batch_size` | `4` | Per-device batch size. |
| `--lr` | `1e-4` | Initial learning rate (cosine decay over `--epochs`). |
| `--accumulation_steps` | `1` | Gradient accumulation. |
| `--device` | `cuda` | `cuda` or `cpu`. Auto-falls back to CPU if no GPU. |
| `--gpu` | `None` | CUDA device index to pin to. If omitted (and `--device cuda`), the GPU with the **most free memory** is auto-selected — handy on shared multi-GPU boxes, especially where `nvidia-smi` is unavailable. |
| `--num_workers` | `0` | DataLoader workers. Keep `0` on Windows; 2–4 is fine on Linux. |
| `--max_samples` | `None` | Cap the train/val sets. Useful for quick smoke tests. |

At startup with `--device cuda`, training prints the chosen device and its free/total
memory (via `torch.cuda.mem_get_info`), so you can monitor even without `nvidia-smi`.

### Recommended GPU command

```bash
# Big GPU (e.g. RTX A6000, 48 GB) — auto-picks a free card, large batch.
python3 train_msa_simple.py --model_name checkpoints/msa_model_adapted \
    --device cuda --epochs 20 --batch_size 32 --num_workers 4 --output_dir checkpoints/msa_model_v1

# Small GPU (e.g. 4 GB) — keep activations small, accumulate gradients.
python3 train_msa_simple.py --model_name checkpoints/msa_model_adapted \
    --device cuda --epochs 20 --batch_size 1 --accumulation_steps 4 --output_dir checkpoints/msa_model_v1
```

Because the encoder is frozen, GPU memory is dominated by **activations** during the
forward pass, not optimizer state. On a small card, `batch_size 1 + accumulation_steps 4`
keeps activations small while preserving an effective batch size of 4. Pin a specific
card with `--gpu N` (e.g. `--gpu 5`).

### Thread-limited servers (OpenBLAS / nproc)

Some GPU boxes ship a low `RLIMIT_NPROC`, which makes OpenBLAS die at import
(`pthread_create failed`) and starves the HF download stack. Run the torch-heavy steps
through [`run_msa.sh`](run_msa.sh), which raises the soft limit and forces single-threaded
BLAS before exec'ing your command:

```bash
bash run_msa.sh python3 train_msa_simple.py --model_name checkpoints/msa_model_adapted \
    --device cuda --epochs 20 --batch_size 32 --num_workers 4
```

It respects thread vars you set yourself, so `OPENBLAS_NUM_THREADS=8 bash run_msa.sh ...`
gives the CPU-side ops more threads. (`run_full_training.sh` already wraps every step this
way.)

### Quick CPU smoke test (5 minutes)

```bash
python3 train_msa_simple.py --model_name checkpoints/msa_model_adapted \
    --device cpu --epochs 1 --batch_size 1 --max_samples 100
```

This validates the whole pipeline end-to-end without committing to a real training run.

---

## 6. What Training Actually Does

Inside `CTCTrainer` (see [src/quran_muaalem/training/train_msa.py](src/quran_muaalem/training/train_msa.py)):

1. **Freeze**: `load_model_for_msa()` sets `requires_grad=False` on every parameter, then re-enables only `level_to_lm_head["phonemes"]`. The encoder and unused heads stay frozen. `AdamW` is given only the trainable subset, so no optimizer state is allocated for the ~605 M frozen params.
2. **Forward**: `_forward_loss(batch)` casts inputs to `model.dtype` (so bf16 weights on CUDA don't meet fp32 activations), runs the model, and pulls `outputs.logits["phonemes"]` of shape `(batch, T_enc, 35)`. The same helper is used for both training and validation, so the two paths never drift.
3. **Lengths**: `input_lengths` = the actual logits time dimension `T_enc` (NOT the attention-mask sum — the encoder downsamples ~2×). `target_lengths` = count of non-pad tokens per sample.
4. **Loss**: log-probs are explicitly upcast to fp32 before `nn.CTCLoss(blank=0, zero_infinity=True)` — CTC doesn't support fp16/bf16.
5. **Backward**: gradient accumulation (`--accumulation_steps`), `clip_grad_norm_(max_norm=1.0)`, `AdamW(weight_decay=0.01)`, `CosineAnnealingLR` step at end of epoch.
6. **Checkpointing**: every epoch writes `checkpoint_epoch_N/`. Whenever `val_loss` improves, also writes `best_model/`. Each save includes the **feature extractor** (`preprocessor_config.json`) alongside `config.json` and `model.safetensors`, so the resulting directory can be loaded directly by `AutoFeatureExtractor.from_pretrained` with no extra setup. Final `training_history.json` records per-epoch train/val loss and learning rate.

The dataset class [src/quran_muaalem/data/msa_dataset.py](src/quran_muaalem/data/msa_dataset.py) handles audio loading, feature extraction with `AutoFeatureExtractor`, padding to a fixed `max_features`, and tokenization via `MSATokenizer`. Labels are padded to length 256 with zeros for batching, and any label longer than `T_enc - 5` is clipped so CTC can always emit it. The clip uses `features["input_features"].shape[1]` (the time axis) — an earlier bug used `shape[0]` (the batch dim, always 1), which silently truncated **every** label to a single phoneme. If `model_name` looks like a local path that doesn't exist (starts with `.`, `/`, `\`, `checkpoints`, or has a Windows drive letter), the dataset fails fast with a clear `FileNotFoundError`; plain HuggingFace repo ids like `obadx/muaalem-model-v3_2` are passed through untouched.

---

## 7. Expected Numbers

Targets after a full 20-epoch run on the adapted model with the full ~17 h MSA set:

| Metric | Start | After 20 epochs |
|---|---|---|
| Train CTC loss | ~40 | 5–10 |
| Val CTC loss | ~35 | 10–20 |
| Phoneme accuracy (test) | — | 80–85 % |

### Rough wall-clock

With the encoder frozen, the **forward pass** still runs over all 605 M parameters (you still need its features), but **backward + optimizer** only touch the ~36 K-param head. Per-step time is dominated by the encoder forward, not the optimizer.

| Hardware | Per epoch | 20 epochs |
|---|---|---|
| RTX 2050 (4 GB) | 15–20 min | ~5–6 h |
| Modern CPU (10 cores) | 2–3 h | 40–60 h |
| Modest CPU (4 cores) | 5–8 h | 100+ h |

CPU is fine for smoke tests but impractical for the full run. First batch on CUDA always pays a 30–90 s warm-up tax (kernel JIT + cuDNN autotune); subsequent batches are 5–10× faster.

---

## 8. Outputs

After training:

```
checkpoints/msa_model_v1/
├── best_model/                # checkpoint with lowest val loss
├── checkpoint_epoch_1/
├── checkpoint_epoch_2/
├── ...
└── training_history.json      # {"train_loss": [...], "val_loss": [...], "lr": [...]}
```

`best_model/` is what you point the MSA API at (via `MSA_MODEL_PATH`) — see [RUNNING.md](RUNNING.md) for swapping checkpoints.

---

## 9. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `CUDA not available, falling back to CPU` | NVIDIA driver / CUDA toolkit not installed. | Install CUDA 12.1 + matching driver, or accept CPU. |
| `Expected input_lengths to have value at most N, but got value M` | Training script desync — CTC `input_lengths` must equal logits time dim, not attention mask sum. | Already fixed in `train_msa.py`; pull latest if you're seeing this. |
| `stack expects each tensor to be equal size` in DataLoader | Variable feature lengths across the batch. | `MSAPhonemeDataset.__getitem__` pads to `max_features`; check that `max_duration` is consistent. |
| `RuntimeError: expected scalar type Float but found BFloat16` | Inputs reaching the model in fp32 while the model is bf16. | Already fixed: `_forward_loss` casts inputs to `model.dtype`. If you write a custom forward path, do the same. |
| `RuntimeError: CUDA error: out of memory` after first batch finishes | Likely AdamW lazy-allocating optimizer state on the first `.step()`. | The trainer now passes only trainable params to AdamW (encoder is frozen), so this should be gone. If it returns, lower `--batch_size`. |
| `Repository Not Found … 401 Client Error … checkpoints/msa_model_adapted` | The local path doesn't exist; transformers tried it as a HF repo id. | The dataset and adapter both validate the path now. Re-run `adapt_model_for_msa()` to recreate the directory. |
| `Can't load … preprocessor_config.json` when serving a checkpoint | Older checkpoint saved without the feature extractor. | Re-save with the current trainer (which writes `preprocessor_config.json` on every save), or copy it from `obadx/muaalem-model-v3_2`. |
| Loss stays at ~40, never drops | LR too high or label/blank mismatch. | Try `--lr 1e-5`. Verify `[PAD]=0` matches the CTC `blank=0`. |
| OOM on GPU | Batch too large for 4 GB. | `--batch_size 1 --accumulation_steps 4`. |
| Validation loss climbs while training drops | Overfitting on small data subset. | Train on the full set, lower LR, or stop earlier (use `best_model/`). |
| `/transcribe` returns no phonemes after epoch 1 even on familiar audio | Pre-fix label-truncation bug clipped every label to 1 token, so the model only learned to emit a single phoneme then collapse to blanks; OR the head size doesn't match the active vocab. | Re-run the adapter to regenerate `checkpoints/msa_model_adapted/` against the current vocab, then retrain — old checkpoints are not salvageable. Use `POST /debug` on the API to inspect `blank_ratio` and the top-3 frame predictions. |
| Loss drops fast on a small `--max_samples` run but the model produces empty output | Memorization of a tiny set + CTC blank collapse. | Validate the pipeline on the full dataset; the loss-vs-decode gap is real and only goes away with enough data and epochs. |

---

## 10. File Map

| File | Role |
|---|---|
| [src/quran_muaalem/data/prepare_recitations.py](src/quran_muaalem/data/prepare_recitations.py) | **Current** prep: stream recitations dataset → WAV/FLAC + phoneme manifest. |
| [src/quran_muaalem/data/prepare_common_voice.py](src/quran_muaalem/data/prepare_common_voice.py) | Legacy prep (Common Voice); supplies the shared `ArabicToPhonemes` map. |
| [setup_recitations.py](setup_recitations.py) | Bootstrap: install training extra + run the recitations prep. |
| [src/quran_muaalem/data/msa_dataset.py](src/quran_muaalem/data/msa_dataset.py) | `MSAPhonemeDataset` and `get_data_loaders`. |
| [src/quran_muaalem/modeling/adapt_model_for_msa.py](src/quran_muaalem/modeling/adapt_model_for_msa.py) | One-shot head resize: 43 → 35. |
| [src/quran_muaalem/training/train_msa.py](src/quran_muaalem/training/train_msa.py) | `CTCTrainer` + CLI `main()` (with `--gpu` auto-select). |
| [train_msa_simple.py](train_msa_simple.py) | Thin wrapper that calls `train_msa.main`. |
| [run_msa.sh](run_msa.sh) | Env wrapper for torch-heavy steps on thread-limited servers. |
| [run_full_training.sh](run_full_training.sh) | One-command, self-detaching prep → adapt → train pipeline. |
