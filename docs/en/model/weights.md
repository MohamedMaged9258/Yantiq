# Weights and Dtype

Defaults are defined in `src/quran_muaalem/inference.py`:

- `model_name_or_path = "obadx/muaalem-model-v3_2"`
- `dtype = torch.bfloat16`

The Gradio app also hardcodes the same model id in `src/quran_muaalem/gradio_app.py`:

```python
model_id = "obadx/muaalem-model-v3_2"
```

If you need a different checkpoint, pass `model_name_or_path` to `Muaalem(...)`.
