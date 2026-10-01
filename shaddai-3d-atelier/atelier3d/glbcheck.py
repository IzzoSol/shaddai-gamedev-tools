"""Read-only inspection of binary glTF (.glb) files using only the standard library.

A generated model is worthless if it is truncated or empty, so every output passes
through `inspect_glb` before it is accepted.
"""
from __future__ import annotations

import json
import struct
from dataclasses import dataclass
from pathlib import Path

_MAGIC = 0x46546C67          # "glTF"
_CHUNK_JSON = 0x4E4F534A     # "JSON"
_CHUNK_BIN = 0x004E4942      # "BIN\0"
_TRIANGLES = 4               # glTF primitive mode for a plain triangle list


class GlbError(ValueError):
    """The file is not a usable binary glTF."""


@dataclass(frozen=True)
class GlbStats:
    meshes: int
    materials: int
    images: int
    triangles: int
    bytes: int

    def as_dict(self) -> dict:
        return {"meshes": self.meshes, "materials": self.materials, "images": self.images,
                "triangles": self.triangles, "bytes": self.bytes}


def inspect_glb(data: bytes) -> GlbStats:
    if len(data) < 20:
        raise GlbError("file too small to be a GLB")
    magic, version, total = struct.unpack_from("<III", data, 0)
    if magic != _MAGIC:
        raise GlbError("missing glTF magic header")
    if version != 2:
        raise GlbError(f"unsupported glTF version {version}")
    if total != len(data):
        raise GlbError(f"declared length {total} does not match actual {len(data)} (truncated?)")

    doc, pos = None, 12
    while pos + 8 <= len(data):
        size, kind = struct.unpack_from("<II", data, pos)
        pos += 8
        chunk = data[pos:pos + size]
        if len(chunk) != size:
            raise GlbError("chunk runs past end of file")
        if kind == _CHUNK_JSON and doc is None:
            try:
                doc = json.loads(chunk.decode("utf-8").rstrip(" \x00"))
            except (UnicodeDecodeError, json.JSONDecodeError) as exc:
                raise GlbError(f"unreadable JSON chunk: {exc}") from exc
        pos += size
    if doc is None:
        raise GlbError("no JSON chunk")

    meshes = doc.get("meshes", [])
    if not meshes:
        raise GlbError("model contains no meshes")
    accessors = doc.get("accessors", [])
    triangles = 0
    for mesh in meshes:
        for prim in mesh.get("primitives", []):
            if prim.get("mode", _TRIANGLES) != _TRIANGLES:
                continue
            ref = prim.get("indices")
            if ref is None:
                ref = prim.get("attributes", {}).get("POSITION")
            if ref is None or ref >= len(accessors):
                raise GlbError("primitive references a missing accessor")
            triangles += accessors[ref].get("count", 0) // 3
    if triangles == 0:
        raise GlbError("model has zero triangles")
    return GlbStats(len(meshes), len(doc.get("materials", [])), len(doc.get("images", [])),
                    triangles, len(data))


def inspect_file(path: str | Path) -> GlbStats:
    return inspect_glb(Path(path).read_bytes())
