# Model Overview

The Quran Muaalem model is a **multi‑level CTC** system based on Wav2Vec2BERT. It predicts:

- A phoneme sequence (primary head)
- Sifat attributes (secondary heads)

## Where the model lives

- Wrapper + inference: `src/quran_muaalem/inference.py`
- Architecture: `src/quran_muaalem/modeling/modeling_multi_level_ctc.py`
- Config: `src/quran_muaalem/modeling/configuration_multi_level_ctc.py`
- Tokenization: `src/quran_muaalem/modeling/multi_level_tokenizer.py`

## Key runtime settings

- `model_name_or_path` (default: `obadx/muaalem-model-v3_2`)
- `dtype` (default: `torch.bfloat16`)
- `device` (CPU or CUDA)

## How to interpret outputs

Decoded outputs are assembled into `MuaalemOutput` objects with phonemes + sifat. See **Outputs** for schema and examples.

## For researchers

When reporting results, include:

- Model version
- Vocab / tokenizer version
- Loss weights per level
- Evaluation metrics (PER, Sifat F1, alignment accuracy)
