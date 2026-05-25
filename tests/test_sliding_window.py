from time import perf_counter
from dataclasses import dataclass


from quran_transcript import Aya, quran_phonetizer, MoshafAttributes
import numpy as np
import torch
from librosa.core import load
from transformers import AutoFeatureExtractor

from quran_muaalem.modeling.multi_level_tokenizer import MultiLevelTokenizer
from quran_muaalem.modeling.modeling_multi_level_ctc import Wav2Vec2BertForMultilevelCTC
from quran_muaalem.decode import ctc_decode

from display_lists_diff import print_colored_diff_summary


def count_frames(samples: int, window=400, hop_size=160, stride=2):
    return (samples - window) / (stride * hop_size)


def count_sampels_from_frames(
    num_frames: int, window=400, hop_size=160, stride=2
) -> int:
    return int(num_frames * stride * hop_size + window)


def fix_chunk_length(chunk_ms: float, sampling_rate=16000) -> float:
    """fix chunk length so the input of each frame to the model
    is complete not padded with zeros by the preprossor
    """
    num_frames = count_frames(int(chunk_ms * sampling_rate / 1000))
    fixed_sampels = count_sampels_from_frames(np.ceil(num_frames))
    return fixed_sampels / sampling_rate * 1000


@torch.no_grad()
def run_muaalem(
    wave,
    model: Wav2Vec2BertForMultilevelCTC,
    processor: AutoFeatureExtractor,
    device: str | torch.device,
    dtype: str | torch.dtype,
    sampling_rate=16000,
):
    features = processor(wave, return_tensors="pt", sampling_rate=sampling_rate)
    features = {k: v.to(device, dtype=dtype) for k, v in features.items()}
    level_to_logits = model(**features)[0]
    level_to_probs = {
        k: torch.softmax(v, dim=-1).to("cpu")[:, :, 0]
        for k, v in level_to_logits.items()
    }
    level_to_ids = {k: v.argmax(dim=-1).to("cpu") for k, v in level_to_logits.items()}
    return level_to_ids, level_to_probs


@dataclass
class MergeMatch:
    longest_match: int | None = None
    start_a_idx: int | None = None
    start_b_idx: int | None = None

    def update(self, match: "MergeMatch"):
        self.longest_match = match.longest_match
        self.start_a_idx = match.start_a_idx
        self.start_b_idx = match.start_b_idx


def merge_lists_with_overlap(A, B, max_B_offset=2):
    """
    Merge two lists by finding the maximum overlap between the end of A and beginning of B.

    * If there is not common sub sequence:
        delete last num_ignore of A and concatenate B

    Args:
        A: First list
        B: Second list
        max_B_offset: the starting point of comarison is shifted to the left by `max_B_offset`
        EX: A = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9], B = [5, 6, 7, 8]

        if max_B_offset = 0 then start point:
        A: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        B:                   [5, 6, 7, 8]

        if max_B_offset = 1 then start point:
        A: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        B:                [5, 6, 7, 8]

        if max_B_offset = 2 then start point:
        A: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
        B:             [5, 6, 7, 8]

        Then shifting B to the right step by step unitl we find a match


    Returns:
        Merged list with overlap handled optimally
    """

    a_orig_offset = max(len(A) - len(B) - max_B_offset, 0)
    b_span = min(len(A), len(B))
    print(f"A({len(A)}):\n{A}\nB({len(B)}):\n{B}")
    curr_match = MergeMatch()
    best_match = MergeMatch()
    for a_offset in range(a_orig_offset, len(A)):
        for ptr in range(b_span):
            a_idx = a_offset + ptr
            b_idx = ptr

            if A[a_idx] == B[b_idx]:
                if curr_match.longest_match is None:
                    curr_match.longest_match = 1
                    curr_match.start_a_idx = a_idx
                    curr_match.start_b_idx = b_idx
                else:
                    curr_match.longest_match += 1
            elif curr_match.longest_match is not None:
                if best_match.longest_match is None:
                    best_match.update(curr_match)
                elif curr_match.longest_match > best_match.longest_match:
                    best_match.update(curr_match)
                # reset longest_match
                curr_match.longest_match = None

        # Last check
        if curr_match.longest_match is not None:
            if best_match.longest_match is None:
                best_match.update(curr_match)
            elif curr_match.longest_match > best_match.longest_match:
                best_match.update(curr_match)

        # Reset step
        curr_match.longest_match = None
        if (a_offset + len(B)) >= len(A):
            b_span -= 1

    if best_match.longest_match is None:
        return A + B
    else:
        # Making B overwriting A
        # TODO: make this desicions with a margin min_distance
        assert best_match.start_a_idx is not None and best_match.start_b_idx is not None
        print(
            f"Start of A: {best_match.start_a_idx}, Start of B IDX: {best_match.start_b_idx}, Longest Match: {best_match.longest_match}"
        )
        return A[: best_match.start_a_idx] + B[best_match.start_b_idx :]


def sliding_window_inference(
    wave,
    model: Wav2Vec2BertForMultilevelCTC,
    processor: AutoFeatureExtractor,
    device: str | torch.device,
    dtype: str | torch.dtype,
    window_ms: int,
    chunk_ms: int,
    sampling_rate: int = 16000,
    zero_padd_len_ms=0,
):
    window_samples = int(window_ms / 1000 * sampling_rate)
    chunk_samples = int(chunk_ms / 1000 * sampling_rate)
    overlap_samples = window_samples - chunk_samples
    zero_pad_samples = int(zero_padd_len_ms / 1000 * sampling_rate)

    merged_ph_ids: list = []
    for start in range(0, len(wave) - window_samples, chunk_samples):
        end = start + window_samples
        print(
            f"Start MS: {start / sampling_rate * 1000}, End MS: {end / sampling_rate * 1000}"
        )
        # Golden Seqence
        level_to_ids, level_to_probs = run_muaalem(
            wave=np.pad(wave[start:end], zero_pad_samples, "constant"),
            model=model,
            processor=processor,
            device=device,
            dtype=dtype,
        )
        curr_ph_ids = level_to_ids["phonemes"]
        curr_ph_probs = level_to_probs["phonemes"]
        print(curr_ph_ids.tolist())
        curr_ph_ids = ctc_decode(curr_ph_ids, curr_ph_probs)[0].ids.tolist()
        if curr_ph_ids:
            if curr_ph_ids[-1] == 0:
                curr_ph_ids = curr_ph_ids[:-1]
        # print(curr_ph_ids)
        # merging ids
        if merged_ph_ids:
            merged_ph_ids = merge_lists_with_overlap(merged_ph_ids, curr_ph_ids)
        else:
            merged_ph_ids = curr_ph_ids
        # print(merged_ph_ids)
        print("-" * 40)
        print("\n\n\n")

    return merged_ph_ids


def decode_phonemes(ids: list, vocab):
    id_to_ph = {v: k for k, v in vocab["phonemes"].items()}
    out_str = ""
    for idx in ids:
        out_str += id_to_ph[idx]
    return out_str


if __name__ == "__main__":
    window_ms = 8000
    chunk_ms = 500
    padding_ms = 0
    window_ms = int(fix_chunk_length(window_ms))
    chunk_ms = int(fix_chunk_length(chunk_ms))
    padding_ms = int(fix_chunk_length(padding_ms))
    sampling_rate = 16000
    # audio_path = "./assets/test.wav"
    audio_path = "./assets/fatiha_long_track.wav"
    device = "cuda"
    model_id = "obadx/muaalem-model-v3_0"
    dtype = torch.bfloat16

    print(f"Window(ms): `{window_ms}`. Chunk(ms): `{chunk_ms}`")

    mulit_level_tokenizer = MultiLevelTokenizer(model_id)

    model = Wav2Vec2BertForMultilevelCTC.from_pretrained(model_id)
    model.to(device, dtype=dtype)
    processor = AutoFeatureExtractor.from_pretrained(
        model_id, sampling_rate=sampling_rate
    )

    uthmani_ref = Aya(8, 75).get_by_imlaey_words(17, 9).uthmani
    moshaf = MoshafAttributes(
        rewaya="hafs",
        madd_monfasel_len=2,
        madd_mottasel_len=4,
        madd_mottasel_waqf=4,
        madd_aared_len=2,
    )
    phonetizer_out = quran_phonetizer(uthmani_ref, moshaf, remove_spaces=True)

    wave, _ = load(audio_path, sr=sampling_rate, mono=True)

    # Golden Seqence
    golden_level_to_ids, golden_level_to_probs = run_muaalem(
        wave=wave,
        model=model,
        processor=processor,
        device=device,
        dtype=dtype,
    )
    golden_phonemes_ids = ctc_decode(
        batch_ids=golden_level_to_ids["phonemes"],
        batch_probs=golden_level_to_probs["phonemes"],
    )[0].ids.tolist()

    # Sliding window Algorithm
    sw_ph_ids = sliding_window_inference(
        wave=wave,
        model=model,
        processor=processor,
        dtype=dtype,
        device=device,
        window_ms=window_ms,
        chunk_ms=chunk_ms,
        sampling_rate=sampling_rate,
        zero_padd_len_ms=padding_ms,
    )
    print(golden_phonemes_ids)
    print(sw_ph_ids)
    print(f"len sw: {len(sw_ph_ids)}, len of golden: {len(golden_phonemes_ids)}")
    print(golden_phonemes_ids == sw_ph_ids)

    golden_ph_str = decode_phonemes(golden_phonemes_ids, mulit_level_tokenizer.vocab)
    sw_ph_str = decode_phonemes(sw_ph_ids, mulit_level_tokenizer.vocab)

    print_colored_diff_summary(golden_phonemes_ids, sw_ph_ids, "Phonmes ")

    print(golden_ph_str)
    print(sw_ph_str)
