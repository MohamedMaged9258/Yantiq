# Phonetic Pipeline

Quran Muaalem relies on `quran-transcript` to build a **phonetic reference** for each verse segment. Both the UI and API construct this reference before inference.

## Reference generation path

In `src/quran_muaalem/gradio_app.py`:

- `Aya(...).get_by_imlaey_words(...)` selects the requested verse segment.
- `quran_phonetizer(uthmani_ref, current_moshaf, remove_spaces=True)` converts it to a phonetic script.
- The phonetic script is passed to `Muaalem.__call__` alongside the audio.

This means **a reference phonetic script is required** for inference.

## Why this matters for researchers

The reference generation stage defines the **target labels** for evaluation. If the Moshaf settings change, the expected phoneme sequence and sifat labels change as well. Always log:

- The exact Uthmani text segment
- The `MoshafAttributes` configuration
- The `quran-transcript` version

## Next

- See **Moshaf Attributes** to understand how recitation settings affect labels.
- See **Training → Pipeline Steps** for the full data flow.
