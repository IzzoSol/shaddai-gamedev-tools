"""Command line:  python -m atelier3d <command>

  image  IMAGE  --config C --backend B [--out DIR] [--faces N] [--commercial] [--cloud] [--param K=V]
  text   "a stone lantern" --config C --backend B [...same options]
  cloud  CLOUD.ply --config C --backend B [--out DIR] [--faces N]     point cloud -> mesh
  manifest FILE.json --config C                                        repeat a recorded run
  compare A.glb B.glb
  verify MODEL                                                         check a model/cloud against its record
  backends --config C
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

from . import provenance
from .backends import load_config
from .compare import compare
from .licenses import terms_for
from .pipeline import PipelineError, run, run_from_cloud, run_text


def _common(p: argparse.ArgumentParser) -> None:
    p.add_argument("--config", required=True)
    p.add_argument("--backend", required=True)
    p.add_argument("--out", default="out")
    p.add_argument("--faces", type=int, help="decimate meshes to at most this many faces")
    p.add_argument("--commercial", action="store_true", help="you intend to use the result commercially")
    p.add_argument("--param", action="append", default=[], metavar="KEY=VALUE")


def _params(items: list[str]) -> dict:
    return dict(p.split("=", 1) for p in items if "=" in p)


def _report(res) -> int:
    print(json.dumps({"model": str(res.model), "record": str(res.record), "stats": res.stats}, indent=2))
    for w in res.warnings:
        print("LICENCE NOTE:", w, file=sys.stderr)
    return 0


def _execute(kind: str, source: str, backend, *, out, params, commercial, faces, cloud=False):
    if kind == "image":
        return run(source, backend, out, params=params, commercial_use=commercial, max_faces=faces,
                   want="cloud" if cloud else "mesh")
    if kind == "text":
        return run_text(source, backend, out, params=params, commercial_use=commercial, max_faces=faces,
                        want="cloud" if cloud else "mesh")
    return run_from_cloud(source, backend, out, params=params, commercial_use=commercial, max_faces=faces)


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="atelier3d", description="Image or text to 3D with a verifiable provenance record.")
    sub = ap.add_subparsers(dest="cmd", required=True)
    for name, help_ in (("image", "image -> model"), ("text", "text prompt -> model"), ("cloud", "point cloud -> model")):
        p = sub.add_parser(name, help=help_)
        p.add_argument("source")
        _common(p)
        if name != "cloud":
            p.add_argument("--cloud", action="store_true", help="stop at the point-cloud stage (.ply)")
    m = sub.add_parser("manifest", help="repeat a run described in a JSON file")
    m.add_argument("file")
    m.add_argument("--config", required=True)
    c = sub.add_parser("compare", help="compare two models")
    c.add_argument("a"); c.add_argument("b")
    v = sub.add_parser("verify", help="check a file against its provenance record")
    v.add_argument("model")
    b = sub.add_parser("backends", help="list configured backends and their licences")
    b.add_argument("--config", required=True)
    args = ap.parse_args(argv)

    if args.cmd == "verify":
        problems = provenance.verify(args.model)
        print("OK — file matches its provenance record" if not problems else "\n".join("PROBLEM: " + p for p in problems))
        return 0 if not problems else 1
    if args.cmd == "compare":
        try:
            print(json.dumps(compare(args.a, args.b), indent=2))
        except (OSError, ValueError) as exc:
            print(f"error: {exc}", file=sys.stderr)
            return 1
        return 0

    backends = load_config(args.config)
    if args.cmd == "backends":
        for name, be in backends.items():
            t = terms_for(be.license_id)
            print(f"{name:20} {t.name} (commercial: {t.commercial})")
        return 0

    if args.cmd == "manifest":
        spec = json.loads(Path(args.file).read_text(encoding="utf-8"))
        kind = next((k for k in ("image", "text", "cloud") if k in spec.get("input", {})), None)
        if kind is None or spec.get("backend") not in backends:
            print("error: manifest needs input.image|text|cloud and a configured backend", file=sys.stderr)
            return 2
        try:
            return _report(_execute(kind, spec["input"][kind], backends[spec["backend"]], out=spec.get("out", "out"),
                                    params=spec.get("params", {}), commercial=bool(spec.get("commercial")),
                                    faces=spec.get("faces"), cloud=bool(spec.get("stop_at_cloud"))))
        except PipelineError as exc:
            print(f"error: {exc}", file=sys.stderr)
            return 1

    if args.backend not in backends:
        print(f"unknown backend {args.backend!r}; configured: {', '.join(backends) or 'none'}", file=sys.stderr)
        return 2
    try:
        return _report(_execute(args.cmd, args.source, backends[args.backend], out=args.out, params=_params(args.param),
                                commercial=args.commercial, faces=args.faces, cloud=getattr(args, "cloud", False)))
    except PipelineError as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
