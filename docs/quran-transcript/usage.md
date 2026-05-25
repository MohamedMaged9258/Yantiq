# الاستخدام

أهم الكائنات والدوال موجودة في `quran_transcript` (راجع `quran-transcript/src/quran_transcript/__init__.py`).

## كائن Aya

```python
from quran_transcript import Aya

aya = Aya(1, 1)
info = aya.get()
```

`Aya` معرف في `quran-transcript/src/quran_transcript/utils.py` ويدعم:

- `get()` لقراءة بيانات الآية
- `get_ayat_after()` للتنقل للأمام
- `get_by_imlaey_words(...)` لاختيار نطاق من الكلمات

## البحث بالرسم الإملائي

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

الدالة `search` موجودة في `quran-transcript/src/quran_transcript/utils.py`.

## الرسم الصوتي

```python
from quran_transcript import Aya, quran_phonetizer, MoshafAttributes

uthmani_ref = Aya(1, 1).get().uthmani
moshaf = MoshafAttributes(rewaya="hafs", madd_monfasel_len=4, madd_mottasel_len=4, madd_mottasel_waqf=4, madd_aared_len=4)
phonetic = quran_phonetizer(uthmani_ref, moshaf, remove_spaces=True)
```

`quran_phonetizer` موجودة في `quran-transcript/src/quran_transcript/phonetics/phonetizer.py`.
