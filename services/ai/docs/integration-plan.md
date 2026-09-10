# Separate AI service implementation plan

## Existing versus proposed

Repository currently contains Python model/comparison code in services/ai. Existing /compare produces phoneme lists, alignment/edit counts and phoneme_error_rate, not the proposed score/result API. Preparing this plan did not run the model, so it provides no evidence of GPU latency or pronunciation accuracy.

Existing text-to-phoneme mapping is incomplete for the product scope: the inspected implementation deliberately omits alif/alif-maqsura from its token mapping and has gaps requiring review for diacritics/hamza-related cases. An isolated target can produce no phonemes. Existing alignment uses SequenceMatcher rather than a guaranteed minimum-edit-distance algorithm. Audit these before interpreting the reported rate as standardized phoneme error rate.

## Ownership contract

AI owner implements /v1/evaluations and service health under the supplied OpenAPI. Backend owner consumes it through AIEvaluator. AI returns evidence and a versioned 0–100 pronunciation_score; backend applies curriculum threshold. Nullable confidence means “not available/calibrated,” never implicit confidence=1.

Inputs contain no guardian/child profile identity. request_id is a correlation UUID only. Do not accept client-provided pass_score or return progression/stars. No database credential in AI container.

## Internal pipeline

Validate credential → validate multipart/resource envelope → decode and normalize → reject silence/unscorable input → derive reviewed expected phonemes → infer observed phonemes → align under documented algorithm → compute calibrated score → map neutral feedback codes → return schema-valid response → delete temp artifacts.

All decoder/subprocess/runtime work has a bounded execution budget after O01/O02 approval. Avoid unconstrained ffmpeg processes or unbounded async endpoint CPU work. Model readiness must be false until weights/device are ready. Expose safe model identifiers, not local checkpoint paths or environment values.

## Mock-first development

Provide deterministic synthetic fixtures including success, lower score, improvement, equal, silence, unsupported target, unavailable, timeout and malformed response. mode=mock is mandatory. The backend demo/test dataset must be isolated from real progress. A fixture score demonstrates integration only; no mock quality metric belongs in evaluation reports.

## Real-model gates

- Review representable targets in all four levels, including isolated letters and diacritics.
- Record unsupported targets explicitly and reject them with TARGET_UNSUPPORTED.
- Define token normalization, insertion/deletion handling and score mapping; PER can exceed 1 and is not itself a percentage score.
- Calibrate thresholds against representative MSA child speech with consent and held-out speakers.
- Preserve general-MSA evaluation domain; Quranic recitation alone does not establish fitness.
- Record checkpoint/license, preprocessing version, device/runtime, dataset split and uncertainty.
- Bump scoring_version whenever score comparability changes, including model changes that alter its meaning.
- Keep confidence null until a defensible calibration exists; do not invent confidence values.

## Laptop integration

Hardware/OS/VRAM remain unknown. Validate actual CUDA-capable runtime separately; the current Python package and runtime documentation must not be assumed to select a compatible NVIDIA build automatically. Expose only private tailnet endpoint and restrict caller. Test laptop asleep/offline, cold model load, memory pressure and one/multiple calls. Queue/capacity settings follow measurements; no always-on availability is promised.

## Handoff to backend

Provide versioned OpenAPI, conformance fixture results, supported-format/target matrix, measured latency/memory report, error mapping, startup/readiness procedure, secret rotation procedure and quality/calibration report. A working Python script is not sufficient evidence of a production-compatible service boundary.
