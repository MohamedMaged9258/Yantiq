# Usage

Key API objects come from `quran_transcript` (see `quran-transcript/src/quran_transcript/__init__.py`).

## Aya Object

```python
from quran_transcript import Aya

aya = Aya(1, 1)
info = aya.get()
```

`Aya` is defined in `quran-transcript/src/quran_transcript/utils.py` and provides helpers like:

- `get()` for full metadata
- `get_ayat_after()` to iterate forward
- `get_by_imlaey_words(...)` to select word spans

## Search by Imlaey Script

```python
from quran_transcript import search, Aya

results = search(
    "some imlaey text",
    start_aya=Aya(2, 13),
    window=20,
    remove_tashkeel=True,
)
uthmani_script = results[0].uthmani_script
```

The `search` function is defined in `quran-transcript/src/quran_transcript/utils.py`.

## Phonetic Script

```python
from quran_transcript import Aya, quran_phonetizer, MoshafAttributes

uthmani_ref = Aya(1, 1).get().uthmani
moshaf = MoshafAttributes(rewaya="hafs", madd_monfasel_len=4, madd_mottasel_len=4, madd_mottasel_waqf=4, madd_aared_len=4)
phonetic = quran_phonetizer(uthmani_ref, moshaf, remove_spaces=True)
```

`quran_phonetizer` lives in `quran-transcript/src/quran_transcript/phonetics/phonetizer.py`.
