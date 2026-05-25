# واجهة Gradio

مدخل الواجهة موجود في `src/quran_muaalem/gradio_app.py` ويُعرّف كسكربت طرفي باسم `quran-muaalem-ui` في `pyproject.toml`.

## ماذا تفعل الواجهة؟

أهم الدوال في `src/quran_muaalem/gradio_app.py`:

- `process_audio(...)`
  - تحميل الصوت عبر `librosa.load`.
  - بناء مرجع صوتي عبر `quran_phonetizer`.
  - تشغيل `Muaalem` وإرجاع HTML.
- `update_uthmani_ref(...)`
  - جلب نص الرسم العثماني عبر `quran_transcript.Aya`.
- `create_gradio_input_for_field(...)`
  - بناء عناصر الإدخال من `MoshafAttributes.model_fields`.

## مسار الاستخدام في الواجهة

1. اختيار **السورة** و **الآية**.
2. تحديد **رقم الكلمة** و **عدد الكلمات**.
3. رفع الصوت أو التسجيل.
4. الضغط على زر التحليل لإظهار المقارنة.

إذا كان مدى الكلمات يقطع كلمة عثمانية، ستظهر رسالة تحذير مرتبطة بـ `PartOfUthmaniWord`.

## تشغيل الواجهة

```python
app.launch(server_name="0.0.0.0", share=True)
```

- لتعطيل المشاركة العامة: عدّل `share=False` في `main()`.
- لتغيير المنفذ أو الواجهة: عدّل استدعاء `app.launch(...)`.

## تشغيل الواجهة محليًا

```bash
pip install "quran-muaalem[ui]"
quran-muaalem-ui
```

السكربت `quran-muaalem-ui` يشير إلى `quran_muaalem.gradio_app:main`.

## قيود معروفة

- الواجهة تعمل بأسلوب **غير متدفق** (تعالج الصوت كاملًا دفعة واحدة).
- الأداء يعتمد على طول الصوت وتوفر GPU.
- للمعالجة الدُفعية يُفضّل استخدام واجهة بايثون.
