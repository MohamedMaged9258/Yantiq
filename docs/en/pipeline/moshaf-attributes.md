# Moshaf Attributes

The phonetic conversion is controlled by `MoshafAttributes` in `quran-transcript/src/quran_transcript/phonetics/moshaf_attributes.py`. It is a `pydantic.BaseModel` containing Quran‑specific recitation options (madd lengths, takbeer, sakt, etc.).

## Why it matters

The same Uthmani text can be realized in different phonetic forms depending on the recitation settings. `MoshafAttributes` defines those choices and directly affects:

- the generated **phoneme sequence**
- the derived **sifat labels**

Researchers should record the attribute configuration with each experiment.

## How the UI uses it

In `src/quran_muaalem/gradio_app.py`:

- `REQUIRED_MOSHAF_FIELDS` enumerates the attributes exposed in the UI.
- `create_gradio_input_for_field(...)` introspects `MoshafAttributes.model_fields` and builds inputs.
- `get_arabic_name(...)` and `get_arabic_attributes(...)` provide label metadata.

## Programmatic docs

`MoshafAttributes` can render its own documentation table via:

```python
from quran_transcript.phonetics.moshaf_attributes import MoshafAttributes
print(MoshafAttributes.generate_docs())
```

This is useful for exporting attribute definitions into papers or datasets.

## Constraints to be aware of

- `madd_alleen_len` must be **<=** `madd_aared_len` (validated in the model).
- Some attributes affect special cases (e.g., sakt positions, raa tafkheem/tarqeeq rules).

## Exposing more fields in the UI

To show additional fields:

- Add the field name to `REQUIRED_MOSHAF_FIELDS` in `src/quran_muaalem/gradio_app.py`.
