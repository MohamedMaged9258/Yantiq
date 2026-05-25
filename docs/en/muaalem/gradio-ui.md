# Gradio UI

The Gradio entry point is `src/quran_muaalem/gradio_app.py` and is exposed as a CLI script `quran-muaalem-ui` in `pyproject.toml`.

## What the UI does

Key functions in `src/quran_muaalem/gradio_app.py`:

- `process_audio(...)`
  - Loads audio via `librosa.load`.
  - Builds a reference phonetic script using `quran_phonetizer`.
  - Runs `Muaalem` inference and returns HTML output.
- `update_uthmani_ref(...)`
  - Retrieves the Uthmani reference text via `quran_transcript.Aya`.
- `create_gradio_input_for_field(...)`
  - Builds UI inputs from `MoshafAttributes.model_fields`.

## Typical workflow (UI)

1. Choose **Sura** and **Ayah**.
2. Select the **start word index** and **number of words**.
3. Upload or record audio (16 kHz preferred).
4. Click “Analyze” to get phoneme + sifat comparison.

If the word span cuts a Uthmani word, the UI warns with `PartOfUthmaniWord` and asks you to adjust the span.

## How the UI is launched

```python
app.launch(server_name="0.0.0.0", share=True)
```

- To disable public share links, set `share=False` in `main()`.
- To bind a different port or interface, edit the `app.launch(...)` call.

## Run the UI locally

```bash
pip install "quran-muaalem[ui]"
quran-muaalem-ui
```

The CLI points to `quran_muaalem.gradio_app:main` (see `pyproject.toml`).

## Known limitations

- The UI performs **non‑streaming inference** (full audio at once).
- Performance depends on GPU availability and audio length.
- If you need batch processing, use the Python API instead.
