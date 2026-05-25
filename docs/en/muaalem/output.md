# Outputs and Explanations

The inference output is a list of `MuaalemOutput` objects (`src/quran_muaalem/muaalem_typing.py`). Each item contains:

- `phonemes`: a `Unit` with decoded phoneme text, probabilities, and ids.
- `sifat`: a list of `Sifa` entries (one per phoneme group), each with optional phonetic attributes.

## Output schema (conceptual)

```text
MuaalemOutput
  phonemes: Unit
  sifat: list[Sifa]

Unit
  text: str
  probs: Tensor | list[float]
  ids: Tensor | list[int]

Sifa
  phonemes_group: str
  hams_or_jahr: SingleUnit | None
  shidda_or_rakhawa: SingleUnit | None
  tafkheem_or_taqeeq: SingleUnit | None
  itbaq: SingleUnit | None
  safeer: SingleUnit | None
  qalqla: SingleUnit | None
  tikraar: SingleUnit | None
  tafashie: SingleUnit | None
  istitala: SingleUnit | None
  ghonna: SingleUnit | None

SingleUnit
  text: str
  prob: float
  idx: int
```

## Example (abridged)

```json
{
  "phonemes": {
    "text": "بِسْمِٱللَّهِ...",
    "probs": [0.98, 0.93, 0.87],
    "ids": [12, 7, 31]
  },
  "sifat": [
    {
      "phonemes_group": "بِ",
      "hams_or_jahr": {"text": "jahr", "prob": 0.99, "idx": 1},
      "shidda_or_rakhawa": {"text": "shadeed", "prob": 0.95, "idx": 2},
      "tafkheem_or_taqeeq": {"text": "moraqaq", "prob": 0.94, "idx": 1},
      "itbaq": {"text": "monfateh", "prob": 0.92, "idx": 1},
      "safeer": {"text": "no_safeer", "prob": 0.99, "idx": 0},
      "qalqla": {"text": "not_moqalqal", "prob": 0.99, "idx": 0},
      "tikraar": {"text": "not_mokarar", "prob": 0.99, "idx": 0},
      "tafashie": {"text": "not_motafashie", "prob": 0.99, "idx": 0},
      "istitala": {"text": "not_mostateel", "prob": 0.99, "idx": 0},
      "ghonna": {"text": "not_maghnoon", "prob": 0.99, "idx": 0}
    }
  ]
}
```

> Notes:
> - `probs` are derived from the CTC softmax; they are not calibrated.
> - Some `Sifa` fields may be `None` if alignment length mismatches occur.

## Comparing predictions to reference

Two helper modules format the outputs for humans:

- `src/quran_muaalem/explain.py` renders a terminal table using `rich`.
  - `explain_for_terminal(...)` builds a diff between predicted phonemes and the reference, then prints a table.
- `src/quran_muaalem/explain_gradio.py` renders HTML for the Gradio UI.
  - `explain_for_gradio(...)` shows a colorized phoneme diff and a table of attributes.

Both use `diff-match-patch` to segment insertions, deletions, and partial matches between the predicted phonemes and the reference phoneme string.

## Field list (Sifa)

- `hams_or_jahr`
- `shidda_or_rakhawa`
- `tafkheem_or_taqeeq`
- `itbaq`
- `safeer`
- `qalqla`
- `tikraar`
- `tafashie`
- `istitala`
- `ghonna`
