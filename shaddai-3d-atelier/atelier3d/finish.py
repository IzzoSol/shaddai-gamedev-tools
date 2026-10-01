"""Optional mesh finishing: cut a generated model down to a face budget for real-time use.

Needs `trimesh` and `fast_simplification` (pip install trimesh fast_simplification).
Without them the pipeline still works; it just cannot decimate.
"""
from __future__ import annotations

from pathlib import Path


class FinishUnavailable(RuntimeError):
    pass


def decimate(src: Path, dst: Path, target_faces: int) -> str:
    """Write a reduced copy of `src` to `dst`; return a short note for the provenance record."""
    try:
        import trimesh
    except ImportError as exc:
        raise FinishUnavailable("install trimesh and fast_simplification to use --faces") from exc
    scene = trimesh.load(str(src), force="scene")
    total = sum(len(g.faces) for g in scene.geometry.values() if hasattr(g, "faces"))
    if total <= target_faces:
        dst.write_bytes(src.read_bytes())
        return f"decimate: skipped ({total} faces already within {target_faces})"
    ratio = target_faces / total
    for name, geom in list(scene.geometry.items()):
        if hasattr(geom, "simplify_quadric_decimation"):
            want = max(4, int(len(geom.faces) * ratio))
            try:
                scene.geometry[name] = geom.simplify_quadric_decimation(face_count=want)
            except ModuleNotFoundError as exc:
                raise FinishUnavailable("install fast_simplification to use --faces") from exc
    scene.export(str(dst))
    kept = sum(len(g.faces) for g in scene.geometry.values() if hasattr(g, "faces"))
    return f"decimate: {total} -> {kept} faces (target {target_faces})"
