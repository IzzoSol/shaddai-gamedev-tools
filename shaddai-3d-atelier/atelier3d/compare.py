"""Side-by-side comparison of two generated models: size, geometry, and where each came from."""
from __future__ import annotations

import json
from pathlib import Path

from .glbcheck import inspect_file
from .provenance import sidecar_path


def _record(model: Path) -> dict:
    side = sidecar_path(model)
    try:
        return json.loads(side.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return {}


def compare(a: str | Path, b: str | Path) -> dict:
    """Return per-field values and the ratio b/a for the numeric ones."""
    a, b = Path(a), Path(b)
    sa, sb = inspect_file(a).as_dict(), inspect_file(b).as_dict()
    fields = {}
    for key in sa:
        va, vb = sa[key], sb[key]
        fields[key] = {"a": va, "b": vb, "ratio": round(vb / va, 3) if va else None}
    ra, rb = _record(a), _record(b)
    return {
        "fields": fields,
        "backend": {"a": ra.get("backend", {}).get("name"), "b": rb.get("backend", {}).get("name")},
        "licence": {"a": ra.get("licence", {}).get("id"), "b": rb.get("licence", {}).get("id")},
        "lighter": "a" if sa["bytes"] < sb["bytes"] else "b" if sb["bytes"] < sa["bytes"] else "same",
    }
