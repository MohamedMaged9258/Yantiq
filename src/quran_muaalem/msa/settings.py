"""Pydantic settings for the MSA service (API + UI)."""

from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings


class MSASettings(BaseSettings):
    """Configuration for the MSA inference service.

    Reads from environment variables with the `MSA_` prefix, e.g.
    `MSA_MODEL_PATH=checkpoints/msa_model_v1/best_model`.
    """

    # `protected_namespaces=()` silences the Pydantic v2 warning about
    # `model_*` field names (Pydantic reserves the `model_` prefix; we want
    # `model_path` because it's the natural name for the user-facing setting).
    model_config = {"env_prefix": "MSA_", "protected_namespaces": ()}

    model_path: str = Field(
        default="checkpoints/msa_model_v1/best_model",
        description=(
            "Path to a local MSA checkpoint. Defaults to the trained best_model. "
            "Override with MSA_MODEL_PATH if you want to serve a specific epoch."
        ),
    )
    device: Literal["cpu", "cuda"] = Field(
        default="cuda",
        description="Inference device. Falls back to CPU automatically if CUDA is unavailable.",
    )
    sample_rate: int = Field(default=16000, description="Audio sample rate (must be 16000).")
    api_host: str = Field(
        default="0.0.0.0",
        description="MSA API bind address. 0.0.0.0 listens on all interfaces (LAN-accessible).",
    )
    api_port: int = Field(default=8010, description="MSA API port (separate from upstream 8000/8001).")
    api_url: str = Field(
        default="http://127.0.0.1:8010",
        description="Where the UI looks for the API (same machine, so loopback is fine).",
    )
    ui_host: str = Field(
        default="0.0.0.0",
        description="MSA UI bind address. 0.0.0.0 listens on all interfaces (LAN-accessible).",
    )
    ui_port: int = Field(default=7870, description="MSA UI port (separate from upstream 7860).")
