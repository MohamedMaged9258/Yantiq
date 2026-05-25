# الأوزان والصيغة

القيم الافتراضية مذكورة في `src/quran_muaalem/inference.py`:

- `model_name_or_path = "obadx/muaalem-model-v3_2"`
- `dtype = torch.bfloat16`

واجهة Gradio تستخدم نفس المعرّف في `src/quran_muaalem/gradio_app.py`:

```python
model_id = "obadx/muaalem-model-v3_2"
```

إذا أردت تغيير نقطة التحميل، مرّر `model_name_or_path` عند إنشاء `Muaalem`.
