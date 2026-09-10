# `contracts/tools` — contract validation

`validate-contracts.py` checks that the two proposed OpenAPI documents and their fixtures
are internally consistent. It reads files only; it never starts a service or touches a
database.

## Running it

From the repository root, in an isolated environment:

```bash
python -m venv .venv-validate
.venv-validate/Scripts/pip install -r contracts/tools/requirements-validation.txt   # POSIX: .venv-validate/bin/pip
.venv-validate/Scripts/python contracts/tools/validate-contracts.py
```

It prints a JSON summary and exits non-zero on the first failure.

## What it checks

- Both documents validate as OpenAPI 3.1, and every schema under `components.schemas`
  is a valid JSON Schema 2020-12 document.
- Every fixture in `contracts/application-api/examples/` validates against the schema its
  filename implies — `application-*` against `EvaluationOutcome`, `error-*` against
  `Error`, `catalog.mock.json` against `Catalog`.
- Every fixture in `contracts/ai-api/examples/` validates against `EvaluationEvidence`.
- `docs/database/reference-schema.sql` parses as PostgreSQL syntax.

Adding a fixture to either `examples/` directory puts it in scope automatically. An
application fixture whose name matches none of the three prefixes is a hard error rather
than a silent skip.

## What it does not check

SQL execution, migrations, a running API, device or GPU behaviour, generated client
compilation, and the semantic invariants across the fixture sequence (that is what
`contracts/shared/integration-cases.json` documents for a human reader). Those belong in
the implementation environment.
