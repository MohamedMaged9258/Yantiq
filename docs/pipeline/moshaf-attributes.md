# خصائص المصحف

التحويل الصوتي يتحكم به كائن `MoshafAttributes` الموجود في `quran-transcript/src/quran_transcript/phonetics/moshaf_attributes.py`. وهو `pydantic.BaseModel` يحتوي على خيارات قرائية عديدة (المدود، التكبير، السكت، وغيرها).

## لماذا هذا مهم؟

النص العثماني الواحد يمكن أن يُحوَّل إلى أشكال صوتية متعددة بحسب الإعدادات. لذلك خصائص المصحف تؤثر مباشرة على:

- **تسلسل الفونيمات** الناتج
- **وسوم الصفات** المشتقة

ويُنصح بتوثيق هذه الإعدادات مع كل تجربة بحثية.

## كيف تستخدمه الواجهة

في `src/quran_muaalem/gradio_app.py`:

- `REQUIRED_MOSHAF_FIELDS` يحدد الحقول الظاهرة في الواجهة.
- `create_gradio_input_for_field(...)` يبني عناصر الإدخال من `MoshafAttributes.model_fields`.
- `get_arabic_name(...)` و `get_arabic_attributes(...)` تضيفان تسميات عربية للحقول.

## توليد توثيق تلقائي

يمكن توليد جدول توثيقي مباشرة عبر:

```python
from quran_transcript.phonetics.moshaf_attributes import MoshafAttributes
print(MoshafAttributes.generate_docs())
```

هذا مفيد لإدراج تعريفات الصفات في الأوراق العلمية أو في بيانات التدريب.

## قيود مهمة

- يجب أن يكون `madd_alleen_len` **<=** `madd_aared_len` (يتم التحقق منها داخل النموذج).
- بعض الخصائص تتحكم في حالات خاصة (مثل مواضع السكت أو تفخيم/ترقيق الراء).

## إظهار حقول إضافية في الواجهة

أضف أسماء الحقول إلى `REQUIRED_MOSHAF_FIELDS` في `src/quran_muaalem/gradio_app.py`.
