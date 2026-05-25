# Data Sources

This project references external tools and datasets in `README.md`. The main sources used in the pipeline are:

- **Recitation collection**: https://github.com/obadx/prepare-quran-dataset
- **Segmentation by pauses**: https://github.com/obadx/recitations-segmenter
- **Quran‑tuned Whisper model**: https://huggingface.co/tarteel-ai/whisper-base-ar-quran
- **Correction + script conversion**: https://github.com/obadx/quran-transcript

## How these sources fit together

1. **Raw audio** is collected and curated.
2. **Segments** are created using pause‑based splitting.
3. **Automatic transcription** provides initial Imlaey text.
4. **Tasmeea correction** improves transcription fidelity.
5. **Script conversion** yields Uthmani text.
6. **Phonetizer** generates phoneme + sifat labels.

## Recommended metadata to track

For reproducibility, record these fields per segment:

- Reciter id / source
- Recitation style (murattal/mujawad/hadr)
- Audio format (sample rate, bitrate)
- Segment boundaries (start/end timestamps)
- Reference sura/ayah and word span
- Moshaf attributes used

## Licensing note

Each external dataset or model has its own license. Record and cite the original source licenses in your dataset documentation.
