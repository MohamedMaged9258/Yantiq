# Evaluation and Metrics

This page defines **recommended evaluation metrics** for researchers. The goal is to make model comparisons consistent and reproducible.

## 1) Core metrics

### Phoneme Error Rate (PER)
- Compute edit distance between predicted phoneme sequence and reference phoneme sequence.
- Report **PER = (S + D + I) / N** where `S,D,I` are substitutions, deletions, insertions, and `N` is reference length.

### Sifat Accuracy / F1
- For each phoneme group, compare predicted sifat attributes to the reference.
- Report **macro‑F1** across attributes to avoid dominance by frequent classes.

### Alignment Quality
- Measure how often predicted phoneme groups align to the correct reference group.
- Use **alignment accuracy** or **IoU‑style overlap** if groups are expanded.

### Error Localization
- If you report error types, measure how often the model highlights the **correct phoneme group** for a mistake.

### Real‑Time Factor (RTF)
- **RTF = processing_time / audio_duration**.
- Report median and P90 RTF for realistic deployment expectations.


## 2) Recommended evaluation splits

Create evaluation sets by **recording condition** and **recitation style**:

- Clean studio recitations (reference baseline)
- Mobile device recordings
- Different speeds: `murattal` vs `hadr`
- Student/novice recitations (to measure error detection)

Keep a **fixed seed** for train/valid/test to ensure reproducibility.


## 3) Reporting template (suggested)

When publishing results, include:

- Dataset size (hours + number of segments)
- PER (mean + std)
- Sifat macro‑F1 per attribute
- Alignment accuracy
- RTF (median + P90)
- Hardware details (GPU model, dtype)


## 4) Notes on calibration

`Unit.probs` are raw CTC softmax outputs and are **not calibrated**. If you use confidence thresholds:

- Calibrate on a small validation set (temperature scaling is a good baseline).
- Report both **raw accuracy** and **calibrated accuracy**.


## 5) Common pitfalls

- Segment boundaries can dominate alignment errors.
- PER improves faster than sifat accuracy; report both.
- High RTF variance often correlates with long silent regions → consider VAD.
