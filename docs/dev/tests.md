# الاختبارات

هناك موقعان للاختبارات:

- المعلّم القرآني: `tests/`
- Quran Transcript: `quran-transcript/tests/`

## تشغيل pytest

من جذر المستودع:

```bash
pytest
```

خيار إضافي (انظر `tests/conftest.py`):

```bash
pytest --skip-slow
```

ولمشروع `quran-transcript` يمكن التشغيل من مجلده:

```bash
cd quran-transcript
pytest
```

## ملاحظة حول سكربتات الاختبار

بعض الملفات في كلا المجلدين عبارة عن سكربتات يدوية تعمل فقط تحت `__main__`. هذه مفيدة للاستكشاف لكنها لا تُنفّذ تلقائيًا عبر pytest. إذا أردتها اختبارات آلية، حوّلها إلى دوال pytest وأضف Fixtures مناسبة.
