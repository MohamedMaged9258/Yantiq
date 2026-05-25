# الأدوات

مشروع `quran-transcript` يتضمن تطبيقات مساعدة للتوسيم والفحص.

## خادم FastAPI

الملف `quran-transcript/server.py` يعرّف نقاط نهاية مثل:

- `/get/` و `/step_ayat/` للتنقل بين الآيات
- `/get_suar_names/`
- `/save_rasm_map/` و `/save_quran_dict/` لحفظ خرائط الرسم

هذه النقاط تُستخدم داخل واجهة Streamlit في `quran-transcript/streamlit_app.py`.

## واجهة Streamlit للتوسيم

`quran-transcript/streamlit_app.py` يشغل واجهة تستدعي أدوات من `quran-transcript/app/utils.py`. هذه الواجهة مبنية لتعديل خرائط الرسم بين العثماني والإملائي وحفظها عبر طبقة API في `quran-transcript/app/api_utils.py`.
