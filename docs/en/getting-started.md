# Getting Started

This project is a Python package with an optional Gradio UI. The core package lives in `src/quran_muaalem/` and depends on `quran-transcript` for phonetic reference generation.

## Requirements

From `README.md` and `pyproject.toml`:

- Python 3.10+
- System audio tools for common workflows:
  - `ffmpeg` for audio decoding
  - `libsndfile1` and `portaudio19-dev` if you work with audio I/O (see `README.md` install snippet)
- Optional GPU (CUDA) for faster inference; the code uses `torch.cuda.is_available()` in `src/quran_muaalem/gradio_app.py`.

## Install

Core package:

```bash
pip install quran-muaalem
```

UI extras (adds Gradio + audio tooling):

```bash
pip install "quran-muaalem[ui]"
```

If you use `uv`, the README documents an all‑in‑one command for the UI:

```bash
uvx --no-cache --from https://github.com/obadx/quran-muaalem.git[ui] quran-muaalem-ui
```

## Quick Start (Python API)

The main inference class is `Muaalem` in `src/quran_muaalem/inference.py`. It expects:

- audio at **16 kHz** (`sampling_rate=16000` is enforced)
- a reference phonetic script from `quran_transcript.quran_phonetizer`

Minimal flow based on `README.md`:

```python
from librosa.core import load
import torch
from quran_transcript import Aya, quran_phonetizer, MoshafAttributes
from quran_muaalem import Muaalem

sampling_rate = 16000
device = "cuda" if torch.cuda.is_available() else "cpu"

uthmani_ref = Aya(8, 75).get_by_imlaey_words(17, 9).uthmani
moshaf = MoshafAttributes(rewaya="hafs", madd_monfasel_len=2, madd_mottasel_len=4, madd_mottasel_waqf=4, madd_aared_len=2)
ref = quran_phonetizer(uthmani_ref, moshaf, remove_spaces=True)

muaalem = Muaalem(device=device)
wave, _ = load("./assets/test.wav", sr=sampling_rate, mono=True)
outs = muaalem([wave], [ref], sampling_rate=sampling_rate)
```

## Model download and cache

The model is pulled from Hugging Face on first use. Cache locations are controlled by environment variables such as:

- `HF_HOME`
- `HUGGINGFACE_HUB_CACHE`
- `TRANSFORMERS_CACHE`

(see `Dockerfile` for example defaults).

## Troubleshooting (common cases)

- **`ValueError: sampling_rate has to be 16000`** → resample your audio to 16 kHz.
- **Missing `ffmpeg`** → install it via your system package manager.
- **Slow inference on CPU** → use GPU or shorten audio segments.

For a full walkthrough, see the Quran Muaalem API page.
