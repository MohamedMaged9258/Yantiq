# Quran Transcript Overview

The `quran-transcript` subproject is a standalone toolkit for Quran text processing, script conversion, and phonetic transcription. In this repo it lives under `quran-transcript/` and is packaged as `quran-transcript` (see `quran-transcript/pyproject.toml`).

Quran Muaalem depends on this package for:

- `Aya` text selection
- `quran_phonetizer` to produce the reference phonetic script
- `MoshafAttributes` to control recitation settings

Key exports are defined in `quran-transcript/src/quran_transcript/__init__.py`.
