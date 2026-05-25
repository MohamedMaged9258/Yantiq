# Architecture

This project uses a **multi‑level CTC** architecture on top of Wav2Vec2BERT. Each level predicts a different target sequence:

- **Phoneme sequence** (primary)
- **Sifat attributes** (secondary heads; one head per attribute)

The implementation lives in `src/quran_muaalem/modeling/`.

## High‑level flow

```
Audio (16 kHz)
  → Feature extractor (AutoFeatureExtractor)
  → Wav2Vec2BERT encoder
  → Multi‑level CTC heads
  → Greedy CTC decode + alignment
  → Phonemes + Sifat outputs
```

## Multi‑level CTC heads

`Wav2Vec2BertForMultilevelCTC` (in `modeling_multi_level_ctc.py`) creates a linear head per level:

- `phonemes`
- `hams_or_jahr`
- `shidda_or_rakhawa`
- `tafkheem_or_taqeeq`
- `itbaq`
- `safeer`
- `qalqla`
- `tikraar`
- `tafashie`
- `istitala`
- `ghonna`

Each head is trained with its own CTC loss. Loss weights are configurable via:

- `level_to_vocab_size`
- `level_to_loss_weight`

(see `configuration_multi_level_ctc.py`).

## Tokenization per level

`MultiLevelTokenizer` builds a tokenizer per level using `Wav2Vec2CTCTokenizer` and the model’s vocab files. Phoneme tokens are Arabic phoneme symbols; sifat tokens are bracketed Arabic labels mapped from `SifaOutput`.

## Decoding and alignment

At inference time:

1. The model outputs per‑level logits.
2. Each level is decoded with greedy CTC (`top‑1 + collapse + blank removal`).
3. The phoneme sequence is chunked into phoneme groups.
4. Sifat sequences are aligned to the phoneme groups and to the reference (if provided).

Alignment logic is implemented in `src/quran_muaalem/decode.py`.

## Practical implications for researchers

- **Primary signal:** phoneme head is the most reliable output.
- **Attribute heads** can be sensitive to alignment quality; evaluation should measure both raw accuracy and alignment robustness.
- **Loss weighting** affects attribute precision/recall significantly and should be tuned against a validation set.
