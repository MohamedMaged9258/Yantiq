# RUNNING — Setup & Serving the MSA System

This document covers how to install the project and run the live MSA system (REST API + Gradio UI). For training, see [TRAINING.md](TRAINING.md). For the model itself, see [MODEL.md](MODEL.md).

> This tree is the **MSA-only** stack. The upstream Quranic services (engine on :8000, app on :8001, Quranic UI on :7860) were removed when the project was stripped down to MSA fine-tuning — they are not part of this repo anymore. If you find a reference to them, it's stale.

---

## 1. The System at a Glance

The MSA stack is **two processes**:

```
   browser ─► Gradio UI :7870 ─► API (FastAPI) :8010 ─► fine-tuned MSA checkpoint
```

| Service | Port | Started by | Purpose |
|---|---|---|---|
| **MSA API** | 8010 | `quran-muaalem-msa-api` | Loads the fine-tuned 35-class MSA model. Endpoints: `/transcribe`, `/align`, `/compare`, `/debug`, `/health`. |
| **MSA UI** | 7870 | `quran-muaalem-msa-ui` | Single-page Gradio frontend. Calls the API over HTTP. |

The UI needs the API, so start the API first.

---

## 2. Prerequisites

- **OS**: Windows 11 (developed and tested); Linux/macOS should also work.
- **Python**: `pyproject.toml` requires `>=3.11,<3.15`. This machine's launcher is `python3.14`.
- **Disk**: ~10 GB free (PyTorch + transformers + first-run model download).
- **Memory**: ~3 GB (the model at `float32` uses ~3 GB once loaded).
- **GPU**: optional. CPU works but is slow (10–30 s per 15-second clip). PyTorch is installed CPU-only by default (see [TRAINING.md §2](TRAINING.md)).
- **ffmpeg**: optional, only needed to accept compressed uploads (mp3/m4a/webm). Microphone recordings are WAV and need no ffmpeg.

---

## 3. Installation

```bash
# 1. Install uv if you don't have it
pip install uv

# 2. From the project root, install what you need to serve the MSA stack.
#    `engine` supplies FastAPI/uvicorn for the API; `ui` supplies Gradio + httpx.
python3.14 -m uv sync --extra engine --extra ui
```

Verify the two console scripts are wired up:

```bash
python3.14 -m uv run quran-muaalem-msa-api --help
python3.14 -m uv run quran-muaalem-msa-ui --help
```

If either errors out, re-run `uv sync` and check for missing dependencies. (The `engine`/`ui` extra names are inherited from the upstream layout — there is no separate upstream engine to run; those extras just carry the FastAPI/Gradio deps the MSA stack needs.)

---

## 4. Configuration (`.env`)

The repo ships with a `.env` at the project root that selects CPU mode and points the MSA API at a fine-tuned checkpoint:

```dotenv
MSA_MODEL_PATH=checkpoints/msa_model_v1/best_model
MSA_DEVICE=cpu
```

These are read by `MSASettings` (Pydantic, env prefix `MSA_`) in [src/quran_muaalem/msa/settings.py](src/quran_muaalem/msa/settings.py):

| Variable | Default | Notes |
|---|---|---|
| `MSA_MODEL_PATH` | `checkpoints/msa_model_v1/best_model` | Local MSA checkpoint dir. Must contain `config.json`, `model.safetensors`, and `preprocessor_config.json`. |
| `MSA_DEVICE` | `cuda` | `cpu` or `cuda`. Auto-falls back to CPU if CUDA is unavailable. |
| `MSA_SAMPLE_RATE` | `16000` | Audio sample rate (must be 16000). |
| `MSA_API_HOST` | `0.0.0.0` | API bind address (`0.0.0.0` is LAN-accessible). |
| `MSA_API_PORT` | `8010` | API bind port. |
| `MSA_API_URL` | `http://127.0.0.1:8010` | Where the UI looks for the API. |
| `MSA_UI_HOST` | `0.0.0.0` | UI bind address. |
| `MSA_UI_PORT` | `7870` | UI bind port. |

Only `MSA_`-prefixed variables are read. (Older `.env` files carried `ACCELERATOR`/`DTYPE`/`ENGINE_URL` keys from the removed upstream engine — nothing reads them, so they've been dropped.)

### Swap in a different checkpoint

After a training run (see [TRAINING.md](TRAINING.md)), point the API at your new checkpoint:

```dotenv
MSA_MODEL_PATH=checkpoints/msa_model_v2/best_model
```

Restart the API to pick up the change.

---

## 5. Starting the Services

Open **two terminals**, both in the project root.

### Terminal 1 — MSA API (must start first)

```bash
python3.14 -m uv run quran-muaalem-msa-api
```

Wait for:

```
INFO:     Started server process [XXXX]
INFO:     Application startup complete.
```

The first run downloads the base model (~660 MB) into the HuggingFace cache if it isn't there yet, and loads the checkpoint (60–180 s on CPU). Subsequent runs are faster.

### Terminal 2 — MSA UI

```bash
python3.14 -m uv run quran-muaalem-msa-ui
```

Wait for:

```
Running on local URL:  http://127.0.0.1:7870
```

### Health checks

| URL | Expected |
|---|---|
| http://localhost:8010/health | `{"status":"ok","model_path":"…","device":"cpu"}` |
| http://localhost:8010/docs | FastAPI interactive docs |
| http://localhost:7870 | MSA Gradio UI (single page, all features) |

---

## 6. Using the System

### API endpoints

| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/health` | — | `{"status":"ok","model_path":"…","device":"…"}` |
| POST | `/transcribe` | `audio` (file) | `{"phonemes": "..."}` |
| POST | `/align` | `audio` (file) | phonemes + per-phoneme `start`/`end`/`confidence` |
| POST | `/compare` | `audio` (file), `expected_text` (form) | full diff with PER, substitutions, inserts, deletes |
| POST | `/debug` | `audio` (file) | `blank_ratio` + top-3 phonemes per frame for the first 10 frames |

`POST /debug` is the diagnostic for "why am I getting an empty transcription?" — a `blank_ratio` close to `1.0` means the model is mostly emitting CTC blank, which usually means the checkpoint hasn't trained long enough yet (or, historically, was trained with the label-truncation bug — see [TRAINING.md](TRAINING.md)).

### Via the Gradio UI

The UI is a **single page**: audio in (mic or upload) on the left, optional Arabic expected-text on the right, one **Analyze** button. Output panels show predicted phonemes, the alignment table, comparison summary, and per-position diff. With expected text the UI calls `/compare`; without it, `/align`.

The UI uses Gradio's `type="filepath"` mode and ships the raw bytes to the API, so it does **not** depend on `ffmpeg` for the round-trip. Microphone recordings come out as WAV, which librosa decodes natively. Uploading MP3/M4A/WebM still requires `ffmpeg` somewhere on the system (the API falls back to an ffmpeg subprocess for compressed formats).

Phonemization for `/compare` follows the project's training-time mapping, which **drops alif `ا` and alif maksura `ى`** so predicted and expected sequences are directly comparable. See [src/quran_muaalem/msa/phonemize.py](src/quran_muaalem/msa/phonemize.py) for the exact mapping.

### Via the REST API directly

Interactive docs: http://localhost:8010/docs.

```bash
# Raw audio -> phonemes
curl -X POST "http://localhost:8010/transcribe" \
     -F "audio=@my_clip.wav"

# Compare a recitation against expected text
curl -X POST "http://localhost:8010/compare" \
     -F "audio=@my_clip.wav" \
     -F "expected_text=درس"
```

---

## 7. Stopping the Services

`Ctrl+C` in each terminal. Each process shuts down independently:

```
INFO:     Shutting down
INFO:     Shutdown complete
```

If a port is stuck in use afterwards (Windows often holds onto sockets briefly):

```powershell
# Find which PID is on the port
netstat -ano | findstr :8010

# Kill it
taskkill /PID <PID> /F
```

---

## 8. Common Errors

| Error | Why | Fix |
|---|---|---|
| `ModuleNotFoundError: No module named 'torch'` | Dependencies not installed. | `python3.14 -m uv sync --extra engine --extra ui` |
| `Address already in use` on 8010 / 7870 | A previous run is still bound. | Kill the old PID (see §7), or change the port via env (`MSA_API_PORT` / `MSA_UI_PORT`). |
| `CUDA GPUs are not available` | No GPU / no driver. | `MSAInference` auto-falls back to CPU; or set `MSA_DEVICE=cpu`. |
| MSA UI: "could not reach API at http://127.0.0.1:8010" | The API isn't running yet. | Start `quran-muaalem-msa-api` first and wait for "Application startup complete." |
| `could not decode audio: ffmpeg is not installed` when uploading MP3 | The API's fallback decode needs `ffmpeg` for compressed formats. | Install ffmpeg system-wide (`winget install ffmpeg`), or upload WAV. Microphone recordings are already WAV. |
| `FileNotFoundError: … preprocessor_config.json is missing` | Pointing at a checkpoint dir that's missing the feature extractor. | Re-save the checkpoint with the current trainer (which writes it on every save), or copy `preprocessor_config.json` from `obadx/muaalem-model-v3_2`. |
| `FileNotFoundError: MSA checkpoint not found` | `MSA_MODEL_PATH` points at a directory that doesn't exist. | Re-run `adapt_model_for_msa()` for the adapted base, or train to produce `checkpoints/msa_model_v1/best_model/`. |
| `/transcribe` returns no phonemes | Checkpoint under-trained (high `blank_ratio`), or head size doesn't match the active vocab. | Use `POST /debug` to inspect `blank_ratio`; train more epochs, or re-run the adapter + retrain if the vocab changed. |

---

## 9. Project Layout (Runtime Side)

```
Model/
├── src/quran_muaalem/
│   ├── msa/                 # MSA serving stack
│   │   ├── api.py           # quran-muaalem-msa-api entry point (port 8010)
│   │   ├── ui.py            # quran-muaalem-msa-ui entry point (port 7870)
│   │   ├── inference.py     # MSAInference: transcribe / align / diagnostics
│   │   ├── compare.py       # phoneme diff + PER
│   │   ├── phonemize.py     # Arabic text -> MSA phonemes (for /compare)
│   │   └── settings.py      # MSASettings (env-driven, MSA_ prefix)
│   └── modeling/            # base model class + MSA adapters
├── pyproject.toml           # dependencies + console scripts
└── .env                     # runtime configuration
```

---

## 10. Quick Reference

```bash
# Install
python3.14 -m uv sync --extra engine --extra ui

# MSA stack (2 terminals)
python3.14 -m uv run quran-muaalem-msa-api   # :8010  (start first)
python3.14 -m uv run quran-muaalem-msa-ui    # :7870

# Open
http://localhost:7870      # MSA UI
http://localhost:8010/docs # MSA API docs
```
