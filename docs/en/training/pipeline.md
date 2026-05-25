# Pipeline Steps

This section expands the high‑level steps described in `README.md`. The goal is to make the **data and label flow explicit**, which is essential for research reproducibility.

## Step‑by‑step flow (conceptual)

| Step | Input | Output | Notes |
| --- | --- | --- | --- |
| 1. Collect recitations | Raw audio | Curated audio set | Prefer high‑quality reciters with metadata (reciter, style, speed). |
| 2. Segment by pauses | Raw audio | Segmented clips | Pause‑based segmentation is more stable than ayah‑level segmentation for training. |
| 3. Transcribe audio | Segmented clips | Imlaey text | A Quran‑tuned Whisper model is used for initial transcription. |
| 4. Correct transcripts | Imlaey text | Corrected Imlaey text | Use tasmeea alignment (`quran-transcript`) to fix mistakes. |
| 5. Convert scripts | Imlaey → Uthmani | Uthmani text | Mapping is handled by the Quran script map in `quran-transcript`. |
| 6. Phonetize | Uthmani text | Phoneme + sifat labels | `quran_transcript.quran_phonetizer` outputs phonemes and attributes. |
| 7. Train model | Audio + labels | Multi‑level CTC model | Wav2Vec2BERT + multiple CTC heads. |

## Artifacts you should save

For reproducibility, store these artifacts in your data pipeline:

- `segments.jsonl` – audio segment metadata (start/end, reciter, source).
- `transcripts_raw.jsonl` – initial transcription.
- `transcripts_fixed.jsonl` – corrected Imlaey text.
- `uthmani.jsonl` – converted Uthmani text per segment.
- `phonetic_labels.jsonl` – phoneme + sifat sequences.
- `train/valid/test` splits with fixed random seeds.

## Label generation details

The core label generator is:

```python
from quran_transcript import quran_phonetizer
```

It produces:
- `phonemes`: the phonetic script string
- `sifat`: per‑phoneme attribute labels

These are then tokenized per level by `MultiLevelTokenizer` during training.

## Known sensitivities

- **Segmentation errors** propagate to alignment and degrade sifat quality.
- **Transcription noise** in the Imlaey stage can cause mapping failures.
- **Recitation speed** changes the length distribution and may require curriculum or augmentation.

## Next step

See **Evaluation and Metrics** for recommended benchmarks and reporting.
