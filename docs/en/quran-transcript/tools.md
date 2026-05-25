# Tools

The `quran-transcript` subproject includes a few helper apps for annotation and inspection.

## FastAPI Server

`quran-transcript/server.py` exposes endpoints such as:

- `/get/` and `/step_ayat/` for Aya navigation
- `/get_suar_names/`
- `/save_rasm_map/` and `/save_quran_dict/` for rasm map edits

These endpoints are used by the Streamlit UI in `quran-transcript/streamlit_app.py`.

## Streamlit Annotation UI

`quran-transcript/streamlit_app.py` launches a UI that calls helpers in `quran-transcript/app/utils.py`. The UI is built around editing rasm maps between Uthmani and Imlaey scripts and saving updates through the API layer in `quran-transcript/app/api_utils.py`.
