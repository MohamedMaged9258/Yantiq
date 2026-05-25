# نظرة عامة على Quran Transcript

`quran-transcript` مشروع مستقل لمعالجة نص القرآن، والتحويل بين الرسوم، وإنشاء الرسم الصوتي. في هذا المستودع يوجد تحت `quran-transcript/` ويُعبأ كحزمة `quran-transcript` (راجع `quran-transcript/pyproject.toml`).

يعتمد المعلّم القرآني على هذه الحزمة من أجل:

- اختيار الآيات عبر `Aya`
- توليد المرجع الصوتي عبر `quran_phonetizer`
- إعدادات التلاوة عبر `MoshafAttributes`

التصديرات الأساسية مذكورة في `quran-transcript/src/quran_transcript/__init__.py`.
