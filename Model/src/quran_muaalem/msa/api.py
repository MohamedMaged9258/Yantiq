"""FastAPI service for the fine-tuned MSA model."""

from dataclasses import asdict
from pathlib import Path
import io
import os
import subprocess
import tempfile

import librosa
import numpy as np
from fastapi import FastAPI, File, Form, HTTPException, UploadFile


def _ffmpeg_decode(raw: bytes, suffix: str, sample_rate: int) -> np.ndarray:
    """Decode any ffmpeg-supported format (mp3/m4a/webm/opus/...) to mono
    float32 PCM at `sample_rate`. Used as the fallback when libsndfile can't
    read the upload — replaces librosa's deprecated audioread path."""
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=suffix or ".audio", delete=False) as tmp:
            tmp.write(raw)
            tmp_path = tmp.name
        proc = subprocess.run(
            ["ffmpeg", "-nostdin", "-v", "error", "-i", tmp_path,
             "-f", "f32le", "-ac", "1", "-ar", str(sample_rate), "pipe:1"],
            capture_output=True,
        )
        if proc.returncode != 0:
            err = proc.stderr.decode("utf-8", "ignore").strip()[-500:]
            raise RuntimeError(err or "ffmpeg failed")
        return np.frombuffer(proc.stdout, dtype=np.float32).copy()
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.unlink(tmp_path)

from .compare import compare_phonemes
from .inference import MSAInference
from .phonemize import text_to_phonemes
from .settings import MSASettings


def create_app(settings: MSASettings | None = None) -> FastAPI:
    settings = settings or MSASettings()
    inference = MSAInference(
        model_path=settings.model_path,
        device=settings.device,
        sample_rate=settings.sample_rate,
    )

    app = FastAPI(
        title="Quran Muaalem MSA API",
        description="Modern Standard Arabic phoneme recognition, alignment, and comparison.",
        version="0.1.0",
    )

    async def _load_audio(upload: UploadFile) -> np.ndarray:
        if upload is None:
            raise HTTPException(status_code=400, detail="audio file is required")
        raw = await upload.read()
        if not raw:
            raise HTTPException(status_code=400, detail="audio file is empty")
        # soundfile (via BytesIO) decodes WAV/FLAC/OGG directly. Compressed
        # formats from browsers/phones (webm/opus, mp3, m4a) aren't libsndfile
        # formats, so on failure transcode with ffmpeg.
        try:
            audio, _ = librosa.load(
                io.BytesIO(raw), sr=settings.sample_rate, mono=True
            )
        except Exception:
            try:
                audio = _ffmpeg_decode(
                    raw, Path(upload.filename or "").suffix, settings.sample_rate
                )
            except FileNotFoundError:
                raise HTTPException(
                    status_code=400,
                    detail=(
                        "could not decode audio: ffmpeg is not installed. "
                        "Compressed formats (mp3/m4a/webm) require ffmpeg on the server."
                    ),
                )
            except Exception as exc:
                raise HTTPException(status_code=400, detail=f"could not decode audio: {exc}")
        return audio.astype(np.float32, copy=False)

    @app.get("/health")
    def health() -> dict:
        return {
            "status": "ok",
            "model_path": settings.model_path,
            "device": str(inference.device),
        }

    @app.post("/debug")
    async def debug(audio: UploadFile = File(...)) -> dict:
        """Diagnostic endpoint: blank ratio + top-3 phonemes for the first 10 frames.
        A blank_ratio near 1.0 means the model is mostly emitting silence — normal
        for checkpoints trained <5 epochs, or a sign that label lengths were
        truncated during training."""
        wav = await _load_audio(audio)
        return inference.diagnostics(wav)

    @app.post("/transcribe")
    async def transcribe(audio: UploadFile = File(...)) -> dict:
        wav = await _load_audio(audio)
        return {"phonemes": inference.transcribe(wav)}

    @app.post("/align")
    async def align(audio: UploadFile = File(...)) -> dict:
        wav = await _load_audio(audio)
        alignments = inference.align(wav)
        return {
            "phonemes": " ".join(a.phoneme for a in alignments),
            "alignments": [asdict(a) for a in alignments],
        }

    @app.post("/compare")
    async def compare(
        audio: UploadFile = File(...),
        expected_text: str = Form(...),
    ) -> dict:
        wav = await _load_audio(audio)
        alignments = inference.align(wav)
        predicted_phonemes = [a.phoneme for a in alignments]
        expected_phonemes = text_to_phonemes(expected_text)
        if not expected_phonemes:
            raise HTTPException(
                status_code=400,
                detail="expected_text contained no recognizable Arabic letters",
            )
        result = compare_phonemes(expected_phonemes, predicted_phonemes)
        return {
            "alignments": [asdict(a) for a in alignments],
            "expected_phonemes": result.expected_phonemes,
            "predicted_phonemes": result.predicted_phonemes,
            "ops": [asdict(op) for op in result.ops],
            "matches": result.matches,
            "substitutions": result.substitutions,
            "insertions": result.insertions,
            "deletions": result.deletions,
            "phoneme_error_rate": result.phoneme_error_rate,
        }

    return app


def main() -> None:
    """Console-script entry point: `quran-muaalem-msa-api`."""
    import uvicorn

    settings = MSASettings()
    uvicorn.run(create_app(settings), host=settings.api_host, port=settings.api_port)


if __name__ == "__main__":
    main()
