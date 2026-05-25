# FAQ

## Why do I get a sampling rate error?

`Muaalem.__call__` enforces `sampling_rate == 16000` in `src/quran_muaalem/inference.py`. Make sure your audio is resampled to 16 kHz.

## The UI fails to load audio files

Install system audio dependencies (see `README.md`):

```bash
sudo apt-get install -y ffmpeg libsndfile1 portaudio19-dev
```

## How do I change the model checkpoint?

Pass `model_name_or_path` when constructing `Muaalem` or update `model_id` in `src/quran_muaalem/gradio_app.py`.
