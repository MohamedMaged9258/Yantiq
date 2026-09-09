# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this
directory. It covers `services/ai` only — it does **not** auto-load for work elsewhere in
the monorepo. The root `CLAUDE.md` and [`../../docs/phase-0-baseline.md`](../../docs/phase-0-baseline.md)
cover the wider project; the baseline is authoritative wherever the two disagree.

[`../../docs/implementation/README.md`](../../docs/implementation/README.md) is the
implementation dashboard, and the same working loop applies here: open it before starting,
update it and the phase file before finishing.

The row of the plan that belongs to this subtree is **Phase 05 — Real AI contract, MSA
coverage and calibration**
([`phase-05-ai-adaptation.md`](../../docs/implementation/phases/phase-05-ai-adaptation.md)),
work packages `P05-01` capability audit, `P05-02` adapter, `P05-03` metric/scoring,
`P05-04` evaluation data, `P05-05` hardware and latency, `P05-06` quality gate, and
`P05-07` contract conformance. [`docs/integration-plan.md`](docs/integration-plan.md) is
this component's own plan for closing the gap to `POST /v1/evaluations`.

Two decisions gate the AI contract, and both are still **Open** in the dashboard's Blockers
table. **B-01**: the drafted OpenAPI uses `alignment[].op` with four error counters while
baseline §9.3 uses `alignment[].operation` with three — the baseline wins until Phase 00
resolves it. **O03**: score range, calibrated confidence, and who owns score mapping. Do not
build `P05-02` onward against an unfrozen contract; raise the blocker instead.

## What This Repo Is

This tree (`Yantiq/services/ai`, formerly `Yantiq/Model`) is the **MSA fine-tuning stack**:
it adapts a pre-trained Quranic phoneme model to recognize **Modern Standard Arabic**
phonemes (**35 classes** instead of the upstream 43 Quranic classes) using Common Voice
Arabic.

Within the Yantiq product it is the **AI service** of the architecture baseline: it returns
phoneme-level evaluation data, and it never decides whether a child passed. Thresholds,
stars, progression and child-facing wording all belong to `services/backend`. Keep that
boundary clean — see [README.md](README.md) and baseline §9.1.

It started life as the upstream `obadx/quran-muaalem` package (a Wav2Vec2-BERT +
Multi-Level CTC model for Quranic recitation), but the tree was **stripped down to the
MSA layer** (commit `916a166`, "refactor: strip project down to the MSA fine-tuning
stack"). The upstream serving stack — engine (LitServe), app (FastAPI), Quranic Gradio
UI, and `inference.py` — **is no longer present here**. What remains of upstream is only
the model *class* that MSA builds on:

- `modeling/modeling_multi_level_ctc.py` + `configuration_multi_level_ctc.py` — the
  `Wav2Vec2BertForMultilevelCTC` base class and its config. Treat these as read-only
  upstream code unless you have a specific reason to edit them.

Everything else is in-tree MSA work under `src/quran_muaalem/data/`,
`src/quran_muaalem/training/`, `src/quran_muaalem/modeling/msa_*` +
`adapt_model_for_msa.py`, and the serving stack at `src/quran_muaalem/msa/`.

The four project-level guides explain each layer in depth:
- [MODEL.md](MODEL.md) — architecture, the 35-token MSA inventory, the head-resize procedure
- [DATASET.md](DATASET.md) — Common Voice Arabic download, extraction, and manifest preparation
- [TRAINING.md](TRAINING.md) — fine-tuning pipeline (assumes the manifest is ready)
- [RUNNING.md](RUNNING.md) — install + serve the MSA runtime (API + UI)

When the user asks about training/serving/architecture, prefer pointing at (and editing)
these four files over creating new docs. Note that these guides predate the strip-down,
so some still describe the removed upstream services — trust the code over the prose when
they disagree, and fix the doc while you're there.

## Common Commands

All commands assume **`cwd = services/ai`** (the directory holding this file) and use `uv`
as the package manager.

**Use Python 3.13, via `-p 3.13`.** The launcher on this machine is `python3.14`, but the
dependency tree does not support 3.14: `librosa` requires `numba`, and numba 0.61.2 (the
pinned version) caps at `<3.14`. On 3.14 `uv sync` fails during the numba build with
`Cannot install on Python version 3.14.6; only versions >=3.10,<3.14 are supported` — for
every extra, since librosa is a base dependency. `pyproject.toml` says
`requires-python = ">=3.11,<3.15"`, which is more permissive than what actually resolves.

The cwd is load-bearing, not a convention: almost every path in this service —
`checkpoints/`, `datasets/`, the manifest's audio paths — is resolved against the current
working directory rather than against the package. Running from the repo root silently
looks in the wrong place. (Imports are unaffected: they are all relative, which is why the
`Model/` → `services/ai/` move needed no source edits.)

### Install

```bash
# Runtime serving (MSA API + MSA UI). `engine` supplies FastAPI/uvicorn for the API;
# `ui` supplies Gradio + httpx for the UI (msa/ui.py talks to the API over HTTP).
python3.14 -m uv sync -p 3.13 --extra engine --extra ui

# Add the training extras for MSA fine-tuning
python3.14 -m uv sync -p 3.13 --extra training

# For tests
python3.14 -m uv sync -p 3.13 --extra test
```

The `engine`/`ui` extra names are inherited from the upstream layout; there is no longer
a separate upstream engine to run — those extras now just carry the FastAPI/Gradio deps
the MSA stack needs.

### Run the MSA stack (two terminals)

```bash
python3.14 -m uv run -p 3.13 quran-muaalem-msa-api  # port 8010, FastAPI + fine-tuned model
python3.14 -m uv run -p 3.13 quran-muaalem-msa-ui   # port 7870, Gradio UI (single page)
```

The MSA UI expects the MSA API. Start the API first.

Configuration is by `MSA_`-prefixed environment variables, read by `MSASettings`
([src/quran_muaalem/msa/settings.py](src/quran_muaalem/msa/settings.py)).
[.env.example](.env.example) documents every variable and its default.

**A `.env` file is not read automatically — an earlier version of this document claimed it
was, and that was wrong.** `MSASettings` sets `env_prefix="MSA_"` but no `env_file`, and
nothing in the package calls `load_dotenv()`. So the variables have to reach the process
environment yourself:

```powershell
$env:MSA_DEVICE = "cpu"; $env:MSA_MODEL_PATH = "checkpoints/msa_model_v1/best_model"
```

The practical consequence: the effective device default is **`cuda`** (the `settings.py`
default), not the `cpu` a `.env` file appears to set. Adding `env_file` is a tracked
follow-up; until it lands, don't trust `.env` to do anything.

### Tests

```bash
# All tests
python3.14 -m uv run -p 3.13 pytest

# Skip the slow / model-loading tests
python3.14 -m uv run -p 3.13 pytest --skip-slow
```

`tests/` currently contains only `conftest.py`, which defines the custom `--skip-slow`
flag and the `slow` marker (for tests that exercise real model loading/inference). There
are no test modules yet — add them under `tests/` and mark model-loading tests
`@pytest.mark.slow`.

### MSA fine-tuning workflow

```bash
# 1. Prepare Common Voice Arabic into datasets/msa_speech/
python3.14 -m uv run -p 3.13 python -m quran_muaalem.data.prepare_common_voice

# 2. Resize phoneme head 43 -> 35 (one-shot, produces checkpoints/msa_model_adapted/)
python3.14 -m uv run -p 3.13 python -c "from src.quran_muaalem.modeling.adapt_model_for_msa import adapt_model_for_msa; adapt_model_for_msa()"

# 3. Quick CPU smoke test (~10-25 min)
python3.14 -m uv run -p 3.13 python train_msa_simple.py \
    --model_name checkpoints/msa_model_adapted \
    --device cpu --epochs 1 --batch_size 1 --max_samples 100

# 4. Full training (GPU recommended)
python3.14 -m uv run -p 3.13 python train_msa_simple.py \
    --model_name checkpoints/msa_model_adapted \
    --device cuda --epochs 20 --batch_size 4
```

Neither `checkpoints/` nor `datasets/` is checked in (both are gitignored and absent on a
fresh clone) — steps 1 and 2 generate them.

## High-Level Architecture

### Runtime: a single MSA stack

```
browser → Gradio UI :7870  →  MSA API (FastAPI) :8010
                              └─ MSAInference + fine-tuned checkpoint
```

- **MSA API** ([src/quran_muaalem/msa/api.py](src/quran_muaalem/msa/api.py)) — FastAPI service. Endpoints: `/health`, `/transcribe`, `/align`, `/compare`, `/debug`. Loads the fine-tuned 35-class checkpoint via `MSAInference`. Decodes uploads with librosa (WAV/FLAC/OGG) and falls back to an ffmpeg subprocess for compressed formats (mp3/m4a/webm/opus).
- **MSA UI** ([src/quran_muaalem/msa/ui.py](src/quran_muaalem/msa/ui.py)) — single-page Gradio UI that talks to the API over HTTP (httpx). Uses `type="filepath"` on `gr.Audio` and ships raw bytes to the API, so it does not need ffmpeg in the round-trip (microphone recordings come out as WAV; MP3 upload still requires ffmpeg system-wide for the API's fallback decode).

### The model: `Wav2Vec2BertForMultilevelCTC`

Defined in [src/quran_muaalem/modeling/modeling_multi_level_ctc.py](src/quran_muaalem/modeling/modeling_multi_level_ctc.py). The key shape is:

- A Wav2Vec2-BERT encoder produces hidden states `(batch, T_enc, 1024)` at ~50 Hz.
- A `nn.ModuleDict` called `level_to_lm_head` holds one `nn.Linear(1024, vocab_size)` per "level". Levels are configured in `config.level_to_vocab_size` (e.g. `phonemes: 43`, `tajweed: ...`, `sifat properties: ...`).
- `forward()` returns a `CausalLMOutput` whose `.logits` is **a dict** keyed by level name — not a tensor. Always index it as `outputs.logits["phonemes"]`.
- During training, CTC loss is applied per level (weighted by `config.level_to_loss_weight`).

The MSA extension (see [MODEL.md](MODEL.md)) replaces the `phonemes` head with a **35-class** layer (copying the first 35 weight rows from the original 43-class head as a warm start). The size is read from `MSA_PHONEME_COUNT` in [msa_vocab.py](src/quran_muaalem/modeling/msa_vocab.py), so adding/removing tokens automatically resizes the head when you re-run `adapt_model_for_msa()`.

At training time, [`load_model_for_msa`](src/quran_muaalem/training/train_msa.py) **enforces** the encoder freeze: every parameter is set to `requires_grad=False`, then only the phoneme head is re-enabled. AdamW is built from the trainable subset, so no optimizer state is allocated for the ~605 M frozen params (this is what makes 4 GB GPU training feasible). The other heads remain in place but are unused during MSA training.

### MSA phoneme inventory (35 tokens — current)

- **28 consonants**: the canonical Arabic alphabet, including the four emphatic / pharyngealized consonants `ص ض ط ظ`.
- **5 vowels / diacritics**: `َ` (fatha), `ُ` (damma), `ِ` (kasra), `ْ` (sukun), `ة` (ta marbuta).
- **2 special**: `[PAD]=0` (also the CTC blank), `[UNK]=1`.

`ا` (alif) and `ى` (alif maksura) are intentionally **dropped** during phonemization (both at training-data prep and at inference comparison time) so predicted and expected sequences are directly comparable. See [src/quran_muaalem/msa/phonemize.py](src/quran_muaalem/msa/phonemize.py).

### Multi-Level CTC + lengths gotcha

When computing CTC loss manually (as in `CTCTrainer` in [training/train_msa.py](src/quran_muaalem/training/train_msa.py)), `input_lengths` must match the **actual logits time dimension `T_enc`**, not the attention-mask sum from the feature extractor side. The encoder downsamples by ~2×, and `T_enc < attention_mask.sum()` is required for CTC to be valid. Reusing the attention-mask sum will raise `Expected input_lengths to have value at most N, but got M`.

### Dtype handling

The model is loaded in **`bfloat16` on CUDA, `float32` on CPU** (see `load_model_for_msa`). The trainer's `_forward_loss` casts inputs to `model.dtype` before the forward pass — without it, fp32 audio features hitting bf16 weights raises `RuntimeError: expected scalar type Float but found BFloat16`. CTC log-probs are explicitly upcast to fp32 because `nn.CTCLoss` doesn't support fp16/bf16. Don't add `torch.autocast` — it's redundant when model and inputs already share a dtype.

Note: serving (`MSAInference`) always loads the checkpoint in `float32` regardless of device.

### MSA fine-tuning data flow

```
Common Voice (mp3 + tsv)
    └── prepare_common_voice.py: resample to 16kHz WAV + char→phoneme map
        └── datasets/msa_speech/{train,val,test}/*.wav  +  manifest.json

manifest.json
    └── MSAPhonemeDataset (msa_dataset.py): pads features to fixed max_features,
        tokenizes phoneme strings via MSATokenizer, pads labels to length 256
        └── DataLoader → CTCTrainer (train_msa.py)
            └── checkpoints/msa_model_vN/{best_model,checkpoint_epoch_N}/
                └── MSAInference (msa/inference.py) loads best_model for serving
```

Any checkpoint we serve or train from MUST contain `preprocessor_config.json` (feature extractor) alongside `config.json` and `model.safetensors`, otherwise `AutoFeatureExtractor.from_pretrained(...)` fails. Both `adapt_model_for_msa.py` and `CTCTrainer._save_pretrained` save the feature extractor — if you change either, preserve that step. `MSAPhonemeDataset` and `MSAInference` both pre-validate the path and fail with a clear `FileNotFoundError` instead of letting transformers misinterpret a missing local dir as a HuggingFace repo id and surface a misleading 401.

The "looks local" heuristic in `MSAPhonemeDataset` checks for `\`, leading `.`, leading `/`, leading `checkpoints`, or a Windows drive letter — plain HF ids like `obadx/muaalem-model-v3_2` are passed through. Don't tighten the heuristic without verifying both code paths.

## Decisions Made and Why (for future sessions)

These are non-obvious calls that came out of past debugging — they're not derivable from the code alone, so future-you will want them.

- **Tree stripped down to MSA-only.** The upstream engine/app/Quranic-UI services were removed (commit `916a166`); only the `Wav2Vec2BertForMultilevelCTC` model class survives from upstream because MSA reuses it. Don't reintroduce the upstream services here or recreate root stubs (`gradio_app.py`, `client.py`) — they're gone on purpose. If a doc still describes them, the doc is stale, not the code.
- **35-class inventory, not 31.** The earlier 31-class version dropped `ص ض ط ظ`, which silently mapped them to `[UNK]` for ~10–15% of training labels. We expanded to 35 (28 + 5 + 2). Bumping the inventory invalidates any pre-existing `checkpoints/msa_model_adapted/` and `msa_model_v*/` — the head dimension changes, so they must be re-run. (Some code comments still said "31"; those were corrected to 35.)
- **Encoder always frozen.** It was pre-trained on 53k hours; fine-tuning it on ~17 h of MSA hurts more than it helps. Plus optimizer state for 605 M params doesn't fit on a 4 GB GPU. Don't unfreeze without a strong reason.
- **Inputs cast to `model.dtype` in `_forward_loss`.** The bf16/fp32 mismatch is silent in Python but blows up inside layer_norm. We deliberately do NOT use `torch.autocast` — it's redundant when model + inputs share a dtype, and it hid the dtype bug for a long time.
- **Label-length clip uses `shape[1]`.** `features["input_features"]` is `(batch=1, T_feat, 160)` *before* the `squeeze(0)` further down. An older bug used `shape[0]` (always 1), so `max_label_len = max(1, 0-5) = 1` and **every label was clipped to a single phoneme**. Symptom: empty greedy decode regardless of training duration. Old `msa_model_v1` and the in-flight `msa_model_v2` were both products of this bug — unsalvageable.
- **`MSA_MODEL_PATH` is the setting to keep current after each retrain.** The `settings.py` default is `checkpoints/msa_model_v1/best_model`; point it at whatever checkpoint dir actually exists rather than chasing the default. Set it in the environment — see the configuration note above about `.env` not being loaded.
- **The old `ACCELERATOR`/`DTYPE`/`ENGINE_URL` keys are dead.** They belonged to the removed upstream engine; nothing reads them. If they reappear, they're leftovers.
- **`.env` was untracked during the monorepo restructure** and replaced by `.env.example`. It held no secrets (only a model path and device), so no credential rotation was needed.
- **MSA UI uses `gr.Audio(type="filepath")`, not `"numpy"`.** `type="numpy"` runs Gradio's pydub/ffmpeg path; `type="filepath"` ships the raw upload to the API, which decodes via librosa. Lets the system work without ffmpeg as long as inputs are WAV (microphone records as WAV; MP3 upload still needs system ffmpeg for the API's fallback decode).
- **`MSAInference._logits` was promoted to a `diagnostics()` method.** The `/debug` endpoint uses it. Don't reach back into `_logits` from elsewhere — extend `diagnostics()` instead.
- **`MSASettings` uses `protected_namespaces=()`.** Pydantic v2 reserves `model_*` field names; the user-facing setting is `model_path`, so we silence the warning rather than rename to something less natural.
- **`pyproject.toml` `requires-python = ">=3.11,<3.15"`.** The user's launcher is `python3.14`. The earlier `<3.13` cap rejected installs on this machine.
- **`ui` extra includes `httpx`.** `msa/ui.py` calls the API over HTTP, so the UI extra alone has to be enough to launch the MSA UI. Don't drop it.
- **Empty greedy decode after few epochs is *partly* expected even on a clean run.** CTC starts with near-100% blank predictions and gradually commits to non-blank tokens. `POST /debug` returns `blank_ratio`; values close to 1.0 mean "still early in training," not "broken." But if `blank_ratio` is high *and* the model has trained for many epochs, suspect a vocab/dataset bug.

## Environment Notes

- **Shell**: PowerShell is the primary shell (a Bash tool is also available for POSIX scripts). Heavy PyTorch operations (loading the 2.3 GB MSA-adapted checkpoint, full CPU training) can segfault when invoked through the bash bridge in this environment. PowerShell is the more reliable shell for long-running training/inference. Reach for `python3.14 -m uv run -p 3.13 python <script>` from PowerShell when stability matters.
- **Path style**: prefer forward slashes in arguments (`checkpoints/msa_model_adapted`); both shells accept them.
- **Console encoding**: Windows `cp1252` will choke on Unicode emoji (✅, ❌) and arrows (`→`) in `print` statements. When adding stdout, use ASCII or call `sys.stdout.reconfigure(encoding='utf-8')`.
- **Module-level prints**: don't add them — `msa_vocab.py` used to `print()` on every import, which was noisy. Inventory introspection should be a `__main__` block, not a side effect.
- **First run downloads**: `adapt_model_for_msa()` and `MSAPhonemeDataset` download `obadx/muaalem-model-v3_2` (~660 MB) into the HF cache on first use. Subsequent runs are local.
- **CPU expectations**: model load is 60–180 s, first-batch warm-up is another 30–60 s, then ~5–15 s per batch. Don't conclude something is hung until you've waited at least 3 minutes after "Loading pre-trained model...".
- **Model size**: the adapted MSA checkpoint is ~2.3 GB on disk because it stores all multi-level heads (only `phonemes` was resized). RAM footprint at `float32` is ~3 GB.
- **Don't push large checkpoints**: `checkpoints/` is gitignored. If you accidentally commit one, use `git filter-branch` to strip it from unpushed commits — but be aware that filter-branch's internal `git reset --hard` will also remove tracked-then-untracked files from the working tree (this is how `msa_model_adapted/` disappeared once before; regeneration is via the adapter script).

## Project Layout (where to look)

| Concern | Path |
|---|---|
| Base model class (upstream, retained) | [src/quran_muaalem/modeling/modeling_multi_level_ctc.py](src/quran_muaalem/modeling/modeling_multi_level_ctc.py), [configuration_multi_level_ctc.py](src/quran_muaalem/modeling/configuration_multi_level_ctc.py) |
| MSA vocab / tokenizer | [src/quran_muaalem/modeling/msa_vocab.py](src/quran_muaalem/modeling/msa_vocab.py), [msa_tokenizer.py](src/quran_muaalem/modeling/msa_tokenizer.py) |
| MSA head resize | [src/quran_muaalem/modeling/adapt_model_for_msa.py](src/quran_muaalem/modeling/adapt_model_for_msa.py) |
| MSA dataset / data prep | [src/quran_muaalem/data/](src/quran_muaalem/data/) |
| MSA trainer | [src/quran_muaalem/training/train_msa.py](src/quran_muaalem/training/train_msa.py) |
| Train entry point | [train_msa_simple.py](train_msa_simple.py) |
| MSA serving (API + UI + helpers) | [src/quran_muaalem/msa/](src/quran_muaalem/msa/) |
| Pytest config | [tests/conftest.py](tests/conftest.py) |
| Runtime config | [.env.example](.env.example), [pyproject.toml](pyproject.toml) |
| Service overview / HTTP surface | [README.md](README.md) |
| Upstream project READMEs (attribution) | [docs/upstream-README.md](docs/upstream-README.md), [docs/upstream-README_EN.md](docs/upstream-README_EN.md) |
| Plan for the v1 evaluation contract | [docs/integration-plan.md](docs/integration-plan.md) — **proposed**, not approved; see the baseline-divergence note in [../../docs/implementation/README.md](../../docs/implementation/README.md) |
