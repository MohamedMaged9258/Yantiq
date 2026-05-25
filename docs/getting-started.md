# البدء

هذا المشروع حزمة بايثون مع واجهة Gradio اختيارية. الحزمة الأساسية موجودة في `src/quran_muaalem/` وتعتمد على `quran-transcript` لإنشاء الرسم الصوتي المرجعي.

## المتطلبات

حسب `README.md` و `pyproject.toml`:

- بايثون 3.10+
- أدوات نظامية للصوت (حسب الاستخدام):
  - `ffmpeg` لفك ترميز الصوت
  - `libsndfile1` و `portaudio19-dev` عند التعامل مع إدخال/إخراج الصوت (مذكورة في `README.md`)
- بطاقة GPU اختيارية لتسريع الاستدلال؛ الواجهة تستخدم `torch.cuda.is_available()` في `src/quran_muaalem/gradio_app.py`.

## التثبيت

الحزمة الأساسية:

```bash
pip install quran-muaalem
```

إضافات الواجهة (تضيف Gradio وأدوات الصوت):

```bash
pip install "quran-muaalem[ui]"
```

إذا كنت تستخدم `uv` فهناك أمر واحد لتشغيل الواجهة كما في README:

```bash
uvx --no-cache --from https://github.com/obadx/quran-muaalem.git[ui] quran-muaalem-ui
```

## بداية سريعة (Python API)

الفئة الأساسية للاستدلال هي `Muaalem` في `src/quran_muaalem/inference.py`. تتوقع:

- صوتًا بمعدل **16 kHz** (`sampling_rate=16000` مطلوب)
- مرجعًا صوتيًا من `quran_transcript.quran_phonetizer`

مثال مختصر مأخوذ من `README.md`:

```python
from librosa.core import load
import torch
from quran_transcript import Aya, quran_phonetizer, MoshafAttributes
from quran_muaalem import Muaalem

sampling_rate = 16000
device = "cuda" if torch.cuda.is_available() else "cpu"

uthmani_ref = Aya(8, 75).get_by_imlaey_words(17, 9).uthmani
moshaf = MoshafAttributes(rewaya="hafs", madd_monfasel_len=2, madd_mottasel_len=4, madd_mottasel_waqf=4, madd_aared_len=2)
ref = quran_phonetizer(uthmani_ref, moshaf, remove_spaces=True)

muaalem = Muaalem(device=device)
wave, _ = load("./assets/test.wav", sr=sampling_rate, mono=True)
outs = muaalem([wave], [ref], sampling_rate=sampling_rate)
```

## تنزيل النموذج والتخزين المؤقت

يتم تحميل النموذج من Hugging Face عند أول تشغيل. يمكن التحكم بمسارات التخزين عبر متغيرات البيئة:

- `HF_HOME`
- `HUGGINGFACE_HUB_CACHE`
- `TRANSFORMERS_CACHE`

(انظر `Dockerfile` كمثال).

## استكشاف الأخطاء الشائعة

- **`ValueError: sampling_rate has to be 16000`** → أعد أخذ عينة الصوت إلى 16 kHz.
- **عدم وجود `ffmpeg`** → ثبته عبر مدير الحزم.
- **بطء الاستدلال على CPU** → استخدم GPU أو قلل طول المقطع الصوتي.

لشرح أوسع، انتقل إلى صفحة واجهة بايثون.
