# الأسئلة الشائعة

## لماذا تظهر مشكلة معدل العينة؟

الدالة `Muaalem.__call__` تشترط `sampling_rate == 16000` في `src/quran_muaalem/inference.py`. تأكد من إعادة أخذ العينات إلى 16 kHz.

## واجهة المستخدم لا تقرأ ملفات الصوت

ثبّت اعتماديات الصوت النظامية (حسب `README.md`):

```bash
sudo apt-get install -y ffmpeg libsndfile1 portaudio19-dev
```

## كيف أغير نقطة تحميل النموذج؟

مرّر `model_name_or_path` عند إنشاء `Muaalem` أو عدّل `model_id` في `src/quran_muaalem/gradio_app.py`.
