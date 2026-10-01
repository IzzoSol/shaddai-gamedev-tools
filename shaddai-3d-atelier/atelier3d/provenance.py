"""Provenance sidecars: a small JSON record that travels with every generated model.

It records what went in, what made it, under which licence, and the hash of what came out.
`verify` recomputes the hashes, so a model that was swapped or a record that was edited by
hand is detected.
"""
from __future__ import annotations

import hashlib
import json
import os
from datetime import datetime, timezone
from pathlib import Path

SCHEMA = "atelier3d.provenance/1"


def sha256_file(path: str | Path) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for block in iter(lambda: fh.read(1 << 20), b""):
            h.update(block)
    return h.hexdigest()


def sidecar_path(model: str | Path) -> Path:
    return Path(f"{model}.provenance.json")


def _digest(record: dict) -> str:
    body = {k: v for k, v in record.items() if k != "record_digest"}
    return hashlib.sha256(json.dumps(body, sort_keys=True, separators=(",", ":")).encode()).hexdigest()


def build(*, input_meta: dict, model: Path, backend: dict, params: dict, license_id: str,
          license_name: str, commercial_use: bool, warnings: list[str], stats: dict,
          started: float, finished: float, finish_steps: list[str]) -> dict:
    iso = lambda t: datetime.fromtimestamp(t, timezone.utc).isoformat(timespec="seconds")
    record = {
        "schema": SCHEMA,
        "input": input_meta,
        "output": {"name": model.name, "sha256": sha256_file(model), "stats": stats},
        "backend": backend,
        "params": params,
        "licence": {"id": license_id, "name": license_name, "declared_commercial_use": commercial_use,
                    "warnings": warnings},
        "finish": finish_steps,
        "started": iso(started),
        "finished": iso(finished),
    }
    record["record_digest"] = _digest(record)
    return record


def write(record: dict, model: str | Path) -> Path:
    path = sidecar_path(model)
    tmp = path.with_suffix(".tmp")
    tmp.write_text(json.dumps(record, indent=2, sort_keys=True), encoding="utf-8")
    os.replace(tmp, path)            # atomic: readers never see half a file
    return path


def load_digest(record_path: str | Path) -> str | None:
    """The tamper-evidence digest of an existing record, used to link a child result to its parent."""
    try:
        return json.loads(Path(record_path).read_text(encoding="utf-8")).get("record_digest")
    except (OSError, json.JSONDecodeError):
        return None


def verify(model: str | Path) -> list[str]:
    """Return a list of problems; empty means the model and its record agree."""
    model = Path(model)
    side = sidecar_path(model)
    if not model.exists():
        return [f"model not found: {model}"]
    if not side.exists():
        return [f"no provenance record next to {model.name}"]
    try:
        record = json.loads(side.read_text(encoding="utf-8"))
    except json.JSONDecodeError as exc:
        return [f"provenance record is not valid JSON: {exc}"]
    problems = []
    if record.get("schema") != SCHEMA:
        problems.append(f"unknown schema {record.get('schema')!r}")
    if record.get("record_digest") != _digest(record):
        problems.append("record was edited after it was written")
    if record.get("output", {}).get("sha256") != sha256_file(model):
        problems.append("model file does not match the recorded hash")
    return problems
