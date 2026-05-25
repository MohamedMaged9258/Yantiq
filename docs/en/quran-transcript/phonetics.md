# Phonetics

The phonetic layer lives under `quran-transcript/src/quran_transcript/phonetics/`.

Key pieces:

- `SifaOutput` and `chunck_phonemes` in `phonetics/sifa.py`.
- `quran_phonetizer` in `phonetics/phonetizer.py`.
- A large set of transformation operations in `phonetics/operations.py`.

## Sifa Output

`SifaOutput` is a `pydantic.BaseModel` with phoneme groups and categorical attributes such as `hams_or_jahr`, `shidda_or_rakhawa`, `tafkheem_or_taqeeq`, and others. This is the reference structure that Quran Muaalem compares against.

## Chunking Phonemes

`chunck_phonemes(phonetic_script)` splits a phonetic script string into grouped phonemes. Quran Muaalem uses this same chunking to align predicted outputs with the reference (see `src/quran_muaalem/inference.py`).

## Transcription Scheme (from `quran-transcript/README.md`)

### Phonemes (43)

| Phoneme Name | Symbol | Arabic |
| --- | --- | --- |
| hamza | ء | همزة |
| baa | ب | باء |
| taa | ت | تاء |
| thaa | ث | ثاء |
| jeem | ج | جيم |
| haa_mohmala | ح | حاء |
| khaa | خ | خاء |
| daal | د | دال |
| thaal | ذ | ذال |
| raa | ر | راء |
| zay | ز | زاي |
| seen | س | سين |
| sheen | ش | شين |
| saad | ص | صاد |
| daad | ض | ضاد |
| taa_mofakhama | ط | طاء |
| zaa_mofakhama | ظ | ظاء |
| ayn | ع | عين |
| ghyn | غ | غين |
| faa | ف | فاء |
| qaf | ق | قاف |
| kaf | ك | كاف |
| lam | ل | لام |
| meem | م | ميم |
| noon | ن | نون |
| haa | ه | هاء |
| waw | و | واو |
| yaa | ي | ياء |
| alif | ا | نصف مد ألف |
| yaa_madd | ۦ | نصف مد ياء |
| waw_madd | ۥ | نصف مد واوا |
| fatha | َ | فتحة |
| dama | ُ | ضمة |
| kasra | ِ | كسرة |
| fatha_momala | ۪ | فتحة ممالة |
| alif_momala | ـ | ألف ممالة |
| hamza_mosahala | ٲ | همزة مسهلة |
| qlqla | ڇ | قلقة |
| noon_mokhfah | ں | نون مخفاة |
| meem_mokhfah | ۾ | ميم مخفاة |
| sakt | ۜ | سكت |
| dama_mokhtalasa | ؙ | ضمة مختلسة (عند الروم في تأمنا) |

### Sifat (10)

| Sifat (English) | Sifat (Arabic) | Attributes (English) | Attributes (Arabic) |
| --- | --- | --- | --- |
| hams_or_jahr | الهمس أو الجهر | hams, jahr | همس, جهر |
| shidda_or_rakhawa | الشدة أو الرخاوة | shadeed, between, rikhw | شديد, بين بين, رخو |
| tafkheem_or_taqeeq | التفخيم أو الترقيق | mofakham, moraqaq, low_mofakham | مفخم, مرقق, أدنى المفخم |
| itbaq | الإطباق | monfateh, motbaq | منفتح, مطبق |
| safeer | الصفير | safeer, no_safeer | صفير, لا صفير |
| qalqla | القلقلة | moqalqal, not_moqalqal | مقلقل, غير مقلقل |
| tikraar | التكرار | mokarar, not_mokarar | مكرر, غير مكرر |
| tafashie | التفشي | motafashie, not_motafashie | متفشي, غير متفشي |
| istitala | الاستطالة | mostateel, not_mostateel | مستطيل, غير مستطيل |
| ghonna | الغنة | maghnoon, not_maghnoon | مغنون, غير مغنون |
