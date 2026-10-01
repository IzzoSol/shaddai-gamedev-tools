"""The flows that matter: image, text or point cloud in — verified output plus provenance record out."""
from __future__ import annotations

import hashlib
import re
import shutil
import tempfile
import time
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable

from . import provenance
from .backends import Backend, BackendError
from .finish import decimate
from .glbcheck import GlbError, inspect_file as inspect_glb
from .licenses import terms_for, warnings as license_warnings
from .ply import PlyError, inspect_file as inspect_ply

ALLOWED_IMAGES = {".png", ".jpg", ".jpeg", ".webp"}
MAX_IMAGE_BYTES = 25 * 1024 * 1024
MAX_PROMPT_CHARS = 2000


class PipelineError(RuntimeError):
    pass


@dataclass
class Result:
    model: Path
    record: Path
    stats: dict
    warnings: list[str] = field(default_factory=list)


def _check_image(image: Path) -> None:
    if not image.is_file():
        raise PipelineError(f"image not found: {image}")
    if image.suffix.lower() not in ALLOWED_IMAGES:
        raise PipelineError(f"unsupported image type {image.suffix!r}; use one of {sorted(ALLOWED_IMAGES)}")
    if image.stat().st_size > MAX_IMAGE_BYTES:
        raise PipelineError("image is larger than 25 MB")


def _slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")[:40] or "model"


def _execute(*, backend: Backend, source: Path, input_meta: dict, stem: str, out_dir: Path, params: dict,
             commercial_use: bool, max_faces: int | None, want: str, clock: Callable[[], float]) -> Result:
    """Shared engine. `want` is 'mesh' (a .glb) or 'cloud' (a .ply point cloud)."""
    out_dir.mkdir(parents=True, exist_ok=True)
    started = clock()
    ext = ".glb" if want == "mesh" else ".ply"
    inspect = inspect_glb if want == "mesh" else inspect_ply
    bad = GlbError if want == "mesh" else PlyError

    with tempfile.TemporaryDirectory(prefix="atelier3d-") as tmp:
        raw = Path(tmp) / ("raw" + ext)
        try:
            backend.generate(source, raw, params)
        except BackendError as exc:
            raise PipelineError(str(exc)) from exc
        if not raw.is_file() or raw.stat().st_size == 0:
            raise PipelineError(f"{backend.name} reported success but produced no file")
        try:
            inspect(raw)
        except bad as exc:
            raise PipelineError(f"{backend.name} produced an unusable {want}: {exc}") from exc

        steps: list[str] = []
        final_src = raw
        if max_faces and want == "mesh":
            slim = Path(tmp) / "slim.glb"
            steps.append(decimate(raw, slim, max_faces))
            final_src = slim

        stats = inspect(final_src).as_dict()
        model = out_dir / f"{stem}-{provenance.sha256_file(final_src)[:10]}{ext}"
        shutil.copyfile(final_src, model)

    terms = terms_for(backend.license_id)
    notes = license_warnings(backend.license_id, commercial_use)
    record = provenance.build(
        input_meta=input_meta, model=model, backend={"name": backend.name, "version": backend.version},
        params=params, license_id=terms.id, license_name=terms.name, commercial_use=commercial_use,
        warnings=notes, stats=stats, started=started, finished=clock(), finish_steps=steps)
    return Result(model, provenance.write(record, model), stats, notes)


def run(image: str | Path, backend: Backend, out_dir: str | Path, *, params: dict | None = None,
        commercial_use: bool = False, max_faces: int | None = None, want: str = "mesh",
        clock: Callable[[], float] = time.time) -> Result:
    """Image → mesh (or → point cloud with want='cloud')."""
    image = Path(image)
    _check_image(image)
    meta = {"kind": "image", "name": image.name, "sha256": provenance.sha256_file(image)}
    return _execute(backend=backend, source=image, input_meta=meta, stem=image.stem, out_dir=Path(out_dir),
                    params={**(params or {}), "mode": "image"}, commercial_use=commercial_use,
                    max_faces=max_faces, want=want, clock=clock)


def run_text(prompt: str, backend: Backend, out_dir: str | Path, *, params: dict | None = None,
             commercial_use: bool = False, max_faces: int | None = None, want: str = "mesh",
             clock: Callable[[], float] = time.time) -> Result:
    """Text prompt → mesh (or → point cloud). The prompt is hashed and stored in the record."""
    prompt = prompt.strip()
    if not prompt:
        raise PipelineError("prompt is empty")
    if len(prompt) > MAX_PROMPT_CHARS:
        raise PipelineError(f"prompt is longer than {MAX_PROMPT_CHARS} characters")
    meta = {"kind": "text", "sha256": hashlib.sha256(prompt.encode()).hexdigest(), "prompt": prompt}
    with tempfile.TemporaryDirectory(prefix="atelier3d-prompt-") as tmp:
        src = Path(tmp) / "prompt.txt"
        src.write_text(prompt, encoding="utf-8")
        return _execute(backend=backend, source=src, input_meta=meta, stem=_slug(prompt), out_dir=Path(out_dir),
                        params={**(params or {}), "mode": "text", "prompt": prompt},
                        commercial_use=commercial_use, max_faces=max_faces, want=want, clock=clock)


def run_from_cloud(cloud: str | Path, backend: Backend, out_dir: str | Path, *, params: dict | None = None,
                   commercial_use: bool = False, max_faces: int | None = None,
                   clock: Callable[[], float] = time.time) -> Result:
    """Point cloud → mesh. The cloud's record digest is stored as the parent, so lineage is traceable."""
    cloud = Path(cloud)
    if not cloud.is_file():
        raise PipelineError(f"point cloud not found: {cloud}")
    try:
        inspect_ply(cloud)
    except PlyError as exc:
        raise PipelineError(f"point cloud is unusable: {exc}") from exc
    meta = {"kind": "pointcloud", "name": cloud.name, "sha256": provenance.sha256_file(cloud)}
    parent = provenance.sidecar_path(cloud)
    if parent.exists():
        meta["parent_record_digest"] = provenance.load_digest(parent)
    return _execute(backend=backend, source=cloud, input_meta=meta, stem=cloud.stem, out_dir=Path(out_dir),
                    params={**(params or {}), "mode": "cloud-to-mesh"}, commercial_use=commercial_use,
                    max_faces=max_faces, want="mesh", clock=clock)
