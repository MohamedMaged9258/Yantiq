# واجهة بايثون

الفئة الأساسية للاستدلال هي `Muaalem` في `src/quran_muaalem/inference.py`. هذه الفئة تشغّل نموذج CTC متعدد المستويات وتعيد نواتج الفونيمات وصفات الحروف.

## توقيع الفئة

```python
class Muaalem:
    def __init__(
        self,
        model_name_or_path: str = "obadx/muaalem-model-v3_2",
        device: str = "cpu",
        dtype=torch.bfloat16,
    ):
        ...

    @torch.no_grad()
    def __call__(
        self,
        waves: list[list[float] | torch.FloatTensor | NDArray],
        ref_quran_phonetic_script_list: list[QuranPhoneticScriptOutput],
        sampling_rate: int,
    ) -> list[MuaalemOutput]:
        ...
```

## المدخلات

### 1) الصوت (`waves`)
- قائمة من الموجات (batch).
- كل موجة يمكن أن تكون:
  - `list[float]`
  - `torch.FloatTensor`
  - `numpy.ndarray`
- **معدل العينة المطلوب:** `16000 Hz`. التنفيذ يرفع `ValueError` إن لم يكن كذلك.

### 2) المرجع الصوتي (`ref_quran_phonetic_script_list`)
- قائمة من كائنات `QuranPhoneticScriptOutput`.
- يتم توليدها عبر `quran_transcript.quran_phonetizer(..., remove_spaces=True)` لضمان تطابق المحاذاة.

مثال توليد المرجع:

```python
from quran_transcript import Aya, quran_phonetizer, MoshafAttributes

uthmani_ref = Aya(8, 75).get_by_imlaey_words(17, 9).uthmani
moshaf = MoshafAttributes(
    rewaya="hafs",
    madd_monfasel_len=4,
    madd_mottasel_len=4,
    madd_mottasel_waqf=4,
    madd_aared_len=4,
)
ref = quran_phonetizer(uthmani_ref, moshaf, remove_spaces=True)
```

## المخرجات

الإرجاع يكون `list[MuaalemOutput]` (عنصر لكل موجة). راجع `src/quran_muaalem/muaalem_typing.py`:

- `Unit`: تسلسل مفكوك مع `text` و `probs` و `ids`.
- `Sifa`: خصائص لكل مجموعة فونيمات (قيمة `SingleUnit` أو `None`).
- `MuaalemOutput`: حاوية تضم `phonemes` و `sifat`.

للتفاصيل والمثال العملي راجع صفحة **المخرجات**.

## مثال سريع

```python
from librosa.core import load
import torch
from quran_transcript import Aya, quran_phonetizer, MoshafAttributes
from quran_muaalem import Muaalem

sampling_rate = 16000
wave, _ = load("./assets/test.wav", sr=sampling_rate, mono=True)

uthmani_ref = Aya(8, 75).get_by_imlaey_words(17, 9).uthmani
moshaf = MoshafAttributes(
    rewaya="hafs",
    madd_monfasel_len=4,
    madd_mottasel_len=4,
    madd_mottasel_waqf=4,
    madd_aared_len=4,
)
ref = quran_phonetizer(uthmani_ref, moshaf, remove_spaces=True)

model = Muaalem(device="cuda" if torch.cuda.is_available() else "cpu")
outs = model([wave], [ref], sampling_rate=sampling_rate)
print(outs[0].phonemes.text)
```

## ملاحظات عن الأخطاء والحالات الطرفية

- إذا كان `sampling_rate` لا يساوي 16000 يتم رفع `ValueError`.
- عند اختلاف أطوال المحاذاة قد تُضاف رموز حشو، وقد تكون بعض صفات `Sifa` بقيمة `None`.
- النموذج يعمل دائمًا في وضع الاستدلال (`torch.no_grad()`).

## الأداء

- القيمة الافتراضية لـ `dtype` هي `torch.bfloat16`. يمكن تغييرها إلى `torch.float16` إذا كانت بطاقة الرسوم لا تدعم BF16.
- يفضل إعادة استخدام نفس كائن `Muaalem` لتجنب تكلفة إعادة تحميل النموذج.
