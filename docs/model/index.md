# نظرة عامة على النموذج

نموذج المعلم القرآني مبني على **CTC متعدد المستويات** فوق Wav2Vec2BERT. ينتج:

- تسلسل فونيمات (المستوى الأساسي)
- صفات تجويدية (مستويات ثانوية)

## أين يوجد النموذج؟

- التغليف والاستدلال: `src/quran_muaalem/inference.py`
- المعمارية: `src/quran_muaalem/modeling/modeling_multi_level_ctc.py`
- الإعدادات: `src/quran_muaalem/modeling/configuration_multi_level_ctc.py`
- الترميز: `src/quran_muaalem/modeling/multi_level_tokenizer.py`

## الإعدادات الأساسية وقت التشغيل

- `model_name_or_path` (الافتراضي: `obadx/muaalem-model-v3_2`)
- `dtype` (الافتراضي: `torch.bfloat16`)
- `device` (CPU أو CUDA)

## تفسير المخرجات

المخرجات تُجمّع ضمن `MuaalemOutput` وتتضمن فونيمات وصفات. راجع صفحة **المخرجات** للمخطط والأمثلة.

## للباحثين

عند نشر نتائجك، اذكر:

- نسخة النموذج
- نسخة القاموس/الترميز
- أوزان الخسائر لكل مستوى
- مقاييس التقييم (PER، ‏F1 للصفات، دقة المحاذاة)
