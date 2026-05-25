# Tests

There are two test locations:

- Quran Muaalem: `tests/`
- Quran Transcript: `quran-transcript/tests/`

## Pytest runs

From repo root:

```bash
pytest
```

Optional flag (see `tests/conftest.py`):

```bash
pytest --skip-slow
```

From the `quran-transcript` folder:

```bash
cd quran-transcript
pytest
```

## Note on script‑style tests

Some files under both `tests/` directories are **manual scripts** (they run only under `__main__`). These are useful for exploratory evaluation but are not collected by pytest. If you want them as automated tests, convert them into pytest functions and add fixtures.
