# واجهة برمجة التطبيقات (API)

## المتطلبات

تثبيت الحزمة مع إضافة `engine`:

```bash
uv add quran-muaalem[engine]
```

## تشغيل الخوادم

### 1. تشغيل المحرك (Engine)

المحرك يشغّل نموذج Wav2Vec2-BERT للترجمة الصوتية إلى فونيمات:

```bash
uv run quran-muaalem-engine
```

ينشغل على `http://0.0.0.0:8000` ويوفر:
- `/predict` — تحويل الصوت إلى فونيمات
- `/docs` — وثائق OpenAPI

### 2. تشغيل التطبيق (App)

التطبيق يوفر واجهات البحث والتصحيح:

```bash
uv run quran-muaalem-app
```

ينشغل على `http://0.0.0.0:8001` ويوفر:
- `/search` — بحث في القرآن بالصوت أو النص الصوتي
- `/correct-recitation` — تحليل التلاوة واكتشاف الأخطاء
- `/transcript` — نسخ الصوت إلى نص صوتي
- `/health` — فحص حالة النظام
- `/docs` — وثائق OpenAPI

## إعدادات التطبيق (AppSettings)

الإعدادات في `src/quran_muaalem/app/settings.py`:

| المتغير | الوصف | القيمة الافتراضية |
|---------|--------|-------------------|
| `engine_url` | رابط نقطة `/predict` في المحرك | `http://0.0.0.0:8000/predict` |
| `host` | عنوان绑定 الخادم | `0.0.0.0` |
| `port` | منفذ الخادم | `8001` |
| `error_ratio` | نسبة الخطأ المسموحة للبحث (0.0-1.0) | `0.1` |
| `max_workers_phonetic_search` | عدد عمليات البحث الصوتية المتزامنة | `cpu_count // 2` |
| `max_workers_phonetization` | عدد عمليات الفونتة المتزامنة | `cpu_count // 2` |

## نقاط النهاية

### 1. `/health` — فحص الحالة

فحص حالة التطبيق والاتصال بالمحرك:

```bash
curl http://localhost:8001/health
```

**الاستجابة:**
```json
{
  "status": "healthy",
  "engine_status": "connected"
}
```

### 2. `/search` — بحث في القرآن

البحث في القرآن بالصوت أو النص الصوتي:

```bash
# بالملف الصوتي
curl -X POST "http://localhost:8001/search?error_ratio=0.1" \
  -F "file=@audio.wav"

# بالنص الصوتي
curl -X POST "http://localhost:8001/search?phonetic_text=bismi&error_ratio=0.1"
```

**المعاملات:**
- `file` — ملف صوتي (WAV)
- `phonetic_text` — نص صوتي مباشر
- `error_ratio` — نسبة الخطأ (0.0-1.0)

### 3. `/correct-recitation` — تصحيح التلاوة

تحليل التلاوة واكتشاف أخطاء التجويد:

```bash
curl -X POST "http://localhost:8001/correct-recitation" \
  -F "file=@recitation.wav" \
  -F "rewaya=hafs" \
  -F "recitation_speed=murattal" \
  -F "madd_monfasel_len=4"
```

**المعاملات:**
- `file` — ملف صوتي (WAV)
- `phonetic_text` — نص صوتي مباشر (اختياري)
- `error_ratio` — نسبة الخطأ للبحث
- `moshaf` — حقول مصحف متعددة (انظر جدول الخصائص)

### 4. `/transcript` — نسخ الصوت

نسخ الصوت إلى نص صوتي (وكيل للمحرك):

```bash
curl -X POST "http://localhost:8001/transcript" \
  -F "file=@recitation.wav"
```

## خصائص المصحف (MoshafAttributes)

هذه الخصائص تُعرّف قواعد التلاوة لقراءة حفص. جميع الحقول اختيارية:

| الخاصية | العربية | القيم | القيمة الافتراضية | الوصف |
|---------|---------|-------|-------------------|-------|
| `rewaya` | الرواية | `hafs` (حفص) | `hafs` | نوع قراءة القرآن |
| `recitation_speed` | سرعة التلاوة | `mujawad` (مجود), `above_murattal` (فويق المرتل), `murattal` (مرتل), `hadr` (حدر) | `murattal` | سرعة التلاوة من الأبطأ للأسرع |
| `takbeer` | التكبير | `no_takbeer` (لا تكبير), `beginning_of_sharh` (التكبير من أول الشرح), `end_of_doha` (التكبير من آخر الضحى), `general_takbeer` (التكبير أول كل سورة إلا التوبة) | `no_takbeer` | طرق إضافة التكبير بعد الاستعاذة وبين السور |
| `madd_monfasel_len` | مد المنفصل | `2`, `3`, `4`, `5` | `4` | مقدار مد النفصل لقراءة حفص |
| `madd_mottasel_len` | مقدار المد المتصل | `4`, `5`, `6` | `4` | مقدار المد المتصل لقراءة حفص |
| `madd_mottasel_waqf` | مقدار المد المتصل وقفا | `4`, `5`, `6` | `4` | مقدار المد المتصل عند الوقف لقراءة حفص |
| `madd_aared_len` | مقدار المد العارض | `2`, `4`, `6` | `4` | مقدار مد العارض للسكون |
| `madd_alleen_len` | مقدار مد اللين | `2`, `4`, `6` | `None` | مقدار مد اللين عند الوقف (يختصر إلى madd_aared_len) |
| `ghonna_lam_and_raa` | غنة اللام و الراء | `ghonna` (غنة), `no_ghonna` (لا غنة) | `no_غنة` | الغنة في إدغام النون مع اللام والراء |
| `meem_aal_imran` | ميم آل عمران | `waqf` (وقف), `wasl_2` (فتح الميم ومدها حركتين), `wasl_6` (فتح الميم ومدها ستة حركات) | `waqf` | طريقة قراءة {الم الله} في حالة الوصل |
| `madd_yaa_alayn_alharfy` | مقدار المد اللازم الحرفي للعين | `2`, `4`, `6` | `6` | مقدار المد الحرفي اللازم لحرف العين |
| `saken_before_hamz` | الساكن قبل الهمز | `tahqeek` (تحقيق), `general_sakt` (سكت عام), `local_sakt` (سكت خاص) | `tahqeek` | كيفية قراءة الساكن قبل الهمز |
| `sakt_iwaja` | السكت عند عوجا في الكهف | `sakt` (سكت), `waqf` (وقف), `idraj` (إدراج) | `waqf` | كيفية قراءة عوجا في سورة الكهف |
| `sakt_marqdena` | السكت عند مرقدنا في يس | `sakt` (سكت), `waqf` (وقف), `idraj` (إدراج) | `waqf` | كيفية قراءة مرقدنا في سورة يس |
| `sakt_man_raq` | السكت عند من راق في القيامة | `sakt` (سكت), `waqf` (وقف), `idraj` (إدراج) | `sakt` | كيفية قراءة من راق في سورة القيامة |
| `sakt_bal_ran` | السكت عند بل ران في المطففين | `sakt` (سكت), `waqf` (وقف), `idraj` (إدراج) | `sakt` | كيفية قراءة بل ران في سورة المطففين |
| `sakt_maleeyah` | وجه قوله {ماليه هلك} بالحاقة | `sakt` (سكت), `waqf` (وقف), `idgham` (إدغام) | `waqf` | كيفية قراءة ماليه هلك في سورة الحاقة |
| `between_anfal_and_tawba` | وجه بين الأنفال والتوبة | `waqf` (وقف), `sakt` (سكت), `wasl` (وصل) | `waqf` | كيفية قراءة نهاية الأنفال وبداية التوبة |
| `noon_and_yaseen` | الإظهار في النون | `izhar` (إظهار), `idgham` (إدغام) | `izhar` | إدغام النون في يس ون والقلم |
| `yaa_athan` | إثبات الياء وحذفها وقفا | `wasl` (وصل), `hadhf` (حذف), `ithbat` (إثبات) | `wasl` | إثبات أو حذف الياء في {آتاني} بالنمل |
| `start_with_ism` | وجه البدأ بكلمة {الاسم} | `wasl` (وصل), `lism` (لسم), `alism` (ألسم) | `wasl` | حكم البدأ بكلمة الاسم في الحجرات |
| `yabsut` | السين والصاد في {يقبض ويبسط} | `seen` (سين), `saad` (صاد) | `seen` | النطق في سورة البقرة |
| `bastah` | السين والصاد في {بسطة} | `seen` (سين), `saad` (صاد) | `seen` | النطق في سورة الأعراف |
| `almusaytirun` | السين والصاد في {المصيطرون} | `seen` (سين), `saad` (صاد) | `saad` | النطق في سورة الطور |
| `bimusaytir` | السين والصاد في {بمصيطر} | `seen` (سين), `saad` (صاد) | `saad` | النطق في سورة الغاشية |
| `tasheel_or_madd` | همزة الوصل | `tasheel` (تسهيل), `madd` (مد) | `madd` | تسهيل أو مد همزة الوصل في {آلذكرين} |
| `yalhath_dhalik` | الإدغام في {يلهث ذلك} | `izhar` (إظهار), `idgham` (إدغام), `waqf` (وقف) | `idgham` | الإدغام في سورة الأعراف |
| `irkab_maana` | الإدغام في {اركب معنا} | `izhar` (إظهار), `idgham` (إدغام), `waqf` (وقف) | `idgham` | الإدغام في سورة هود |
| `noon_tamnna` | الإشمام والروم في {تأمنا} | `ishmam` (إشمام), `rawm` (روم) | `ishmam` | الإشمام والروم في سورة يوسف |
| `harakat_daaf` | حركة الضاد في {ضعف} | `fath` (فتح), `dam` (ضم) | `fath` | حركة الضاد في سورة الروم |
| `alif_salasila` | الألف في {سلاسلا} | `hadhf` (حذف), `ithbat` (إثبات), `wasl` (وصل) | `wasl` | إثبات أو حذف الألف في سورة الإنسان |
| `idgham_nakhluqkum` | إدغام القاف في الكاف | `idgham_kamil` (إدغام كامل), `idgham_naqis` (إدغام ناقص) | `idgham_kamil` | إدغام القاف في الكاف في المرسلات |
| `raa_firq` | راء {فرق} في الشعراء | `waqf` (وقف), `tafkheem` (تفخيم), `tarqeeq` (ترقيق) | `tafkheem` | تفخيم وترقيق الراء في سورة الشعراء |
| `raa_alqitr` | راء {القطر} في سبأ | `wasl` (وصل), `tafkheem` (تفخيم), `tarqeeq` (ترقيق) | `wasl` | تفخيم وترقيق الراء في سورة سبأ |
| `raa_misr` | راء {مصر} في يونس | `wasl` (وصل), `tafkheem` (تفخيم), `tarqeeq` (ترقيق) | `wasl` | تفخيم وترقيق الراء في سورة يونس |
| `raa_nudhur` | راء {نذر} في القمر | `wasl` (وصل), `tafkheem` (تفخيم), `tarqeeq` (ترقيق) | `tafkheem` | تفخيم وترقيق الراء في سورة القمر |
| `raa_yasr` | راء {يسر} بالفجر | `wasl` (وصل), `tafkheem` (تفخيم), `tarqeeq` (ترقيق) | `tarqeeq` | تفخيم وترقيق الراء في سورة الفجر |
| `meem_mokhfah` | هل الميم مخفاة أو مدغمة | `meem` (ميم), `ikhfaa` (إخفاء) | `ikhfaa` | إخفاء أو إدغام الميم |

## وثائق OpenAPI

الوثائق التفاعلية متاحة في:
- **التطبيق**: http://localhost:8001/docs
- **المحرك**: http://localhost:8000/docs

## مثال كامل

```bash
# 1. تشغيل المحرك (في الطرفية الأولى)
uv run quran-muaalem-engine

# 2. تشغيل التطبيق (في الطرفية الثانية)
uv run quran-muaalem-app

# 3. فحص الحالة
curl http://localhost:8001/health

# 4. تصحيح تلاوة
curl -X POST "http://localhost:8001/correct-recitation" \
  -F "file=@recitation.wav" \
  -F "rewaya=hafs" \
  -F "recitation_speed=murattal" \
  -F "madd_monfasel_len=4" \
  -F "madd_mottasel_len=4" \
  -F "error_ratio=0.1"
```
