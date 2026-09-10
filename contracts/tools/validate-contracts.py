#!/usr/bin/env python3
"""Standards validators for the proposed contracts; does not execute SQL or services."""
from pathlib import Path
import importlib.metadata
import json
from jsonschema import Draft202012Validator, FormatChecker
from openapi_spec_validator import validate
from pglast import parse_sql

ROOT = Path(__file__).resolve().parents[2]

def load(path):
    return json.loads(path.read_text(encoding="utf-8"))

def check_fixture(document, name, fixture):
    schema = {
        "$schema": "https://json-schema.org/draft/2020-12/schema",
        "$ref": "#/components/schemas/" + name,
        "components": document["components"],
    }
    Draft202012Validator.check_schema(schema)
    Draft202012Validator(schema, format_checker=FormatChecker()).validate(fixture)

def application_schema(name):
    if name.startswith("application-"):
        return "EvaluationOutcome"
    if name.startswith("error-"):
        return "Error"
    if name == "catalog.mock.json":
        return "Catalog"
    raise SystemExit("Unclassified application fixture: " + name)

def main():
    app = load(ROOT / "contracts/application-api/openapi.design.json")
    ai = load(ROOT / "contracts/ai-api/openapi.json")
    for document in (app, ai):
        validate(document)
        for schema in document["components"]["schemas"].values():
            Draft202012Validator.check_schema(schema)
    count = 0
    for file in sorted((ROOT / "contracts/application-api/examples").glob("*.json")):
        check_fixture(app, application_schema(file.name), load(file))
        count += 1
    for file in sorted((ROOT / "contracts/ai-api/examples").glob("*.json")):
        check_fixture(ai, "EvaluationEvidence", load(file))
        count += 1
    statements = parse_sql((ROOT / "docs/database/reference-schema.sql").read_text(encoding="utf-8"))
    print(json.dumps({
        "status": "PASS",
        "openapi_documents": 2,
        "json_schema_fixtures": count,
        "postgresql_statements_parsed": len(statements),
        "versions": {name: importlib.metadata.version(name)
                     for name in ("jsonschema", "openapi-spec-validator", "pglast")},
        "not_run": ["SQL execution and migrations", "live API/device/GPU tests", "generated client compilation"]
    }, indent=2))

if __name__ == "__main__":
    main()
