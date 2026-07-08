"""Data loading and preparation modules."""

# MSAPhonemeDataset pulls in the full training stack (torch/transformers/numpy).
# The data-prep scripts (prepare_recitations / prepare_common_voice) only need
# soundfile/librosa/datasets, so importing this package must NOT hard-require the
# ML stack — otherwise `python -m quran_muaalem.data.prepare_recitations` fails on a
# prep-only install. Degrade gracefully when the heavy deps are absent.
try:
    from .msa_dataset import MSAPhonemeDataset, get_data_loaders

    __all__ = ["MSAPhonemeDataset", "get_data_loaders"]
except ImportError:  # torch/transformers/numpy not installed (prep-only environment)
    __all__ = []
