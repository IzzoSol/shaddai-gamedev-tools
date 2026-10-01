"""Point-cloud files (.ply) — read, validate and write, standard library only.

A point cloud is the middle stage of text/image → points → mesh pipelines, so it gets the same
treatment as a finished model: it is checked, hashed and recorded. Supports binary little-endian
and ASCII PLY with float/double x,y,z and optional 8-bit red,green,blue.
"""
from __future__ import annotations

import math
import struct
from dataclasses import dataclass
from pathlib import Path


class PlyError(ValueError):
    pass


@dataclass(frozen=True)
class PlyStats:
    points: int
    bounds_min: tuple[float, float, float]
    bounds_max: tuple[float, float, float]
    has_color: bool
    bytes: int

    def as_dict(self) -> dict:
        return {"points": self.points, "bounds_min": list(self.bounds_min),
                "bounds_max": list(self.bounds_max), "has_color": self.has_color, "bytes": self.bytes}


_FMT = {"float": "f", "float32": "f", "double": "d", "float64": "d", "uchar": "B", "uint8": "B",
        "char": "b", "int8": "b", "ushort": "H", "uint16": "H", "short": "h", "int16": "h",
        "uint": "I", "uint32": "I", "int": "i", "int32": "i"}


def _parse_header(data: bytes):
    end = data.find(b"end_header")
    if not data.startswith(b"ply") or end < 0:
        raise PlyError("not a PLY file")
    nl = data.find(b"\n", end)
    if nl < 0:
        raise PlyError("header is not terminated")
    lines = data[:nl].decode("ascii", "replace").replace("\r", "").split("\n")
    fmt, count, props, in_vertex = None, None, [], False
    for line in lines[1:]:
        parts = line.split()
        if not parts:
            continue
        if parts[0] == "format":
            fmt = parts[1]
        elif parts[0] == "element":
            in_vertex = parts[1] == "vertex"
            if in_vertex:
                count = int(parts[2])
        elif parts[0] == "property" and in_vertex:
            if parts[1] == "list":
                raise PlyError("list properties on vertices are not supported")
            if parts[1] not in _FMT:
                raise PlyError(f"unsupported property type {parts[1]}")
            props.append((parts[2], parts[1]))
    if fmt not in ("binary_little_endian", "ascii"):
        raise PlyError(f"unsupported PLY format {fmt!r}")
    if count is None or count <= 0:
        raise PlyError("file has no vertices")
    names = [n for n, _ in props]
    if not {"x", "y", "z"} <= set(names):
        raise PlyError("vertices need x, y and z")
    return fmt, count, props, nl + 1


def inspect_ply(data: bytes) -> PlyStats:
    fmt, count, props, start = _parse_header(data)
    names = [n for n, _ in props]
    xi, yi, zi = names.index("x"), names.index("y"), names.index("z")
    lo, hi = [math.inf] * 3, [-math.inf] * 3

    def take(row):
        for axis, idx in enumerate((xi, yi, zi)):
            v = float(row[idx])
            if not math.isfinite(v):
                raise PlyError("point cloud contains NaN or infinity")
            lo[axis] = min(lo[axis], v)
            hi[axis] = max(hi[axis], v)

    if fmt == "ascii":
        rows = data[start:].decode("ascii", "replace").split("\n")
        rows = [r.split() for r in rows if r.strip()]
        if len(rows) < count:
            raise PlyError("fewer points than the header declares")
        for r in rows[:count]:
            take(r)
    else:
        record = struct.Struct("<" + "".join(_FMT[t] for _, t in props))
        if len(data) - start < count * record.size:
            raise PlyError("file is truncated")
        for row in record.iter_unpack(data[start:start + count * record.size]):
            take(row)
    if lo == hi:
        raise PlyError("every point is in the same place")
    return PlyStats(count, tuple(lo), tuple(hi), {"red", "green", "blue"} <= set(names), len(data))


def inspect_file(path: str | Path) -> PlyStats:
    return inspect_ply(Path(path).read_bytes())


def write_ply(path: str | Path, points: list[tuple[float, float, float]],
              colors: list[tuple[int, int, int]] | None = None) -> None:
    if colors is not None and len(colors) != len(points):
        raise ValueError("colors and points must be the same length")
    props = "property float x\nproperty float y\nproperty float z\n"
    if colors is not None:
        props += "property uchar red\nproperty uchar green\nproperty uchar blue\n"
    header = f"ply\nformat binary_little_endian 1.0\nelement vertex {len(points)}\n{props}end_header\n"
    rec = struct.Struct("<fffBBB" if colors is not None else "<fff")
    body = b"".join(rec.pack(*p, *c) if colors is not None else rec.pack(*p)
                    for p, c in zip(points, colors or points))
    Path(path).write_bytes(header.encode("ascii") + body)
