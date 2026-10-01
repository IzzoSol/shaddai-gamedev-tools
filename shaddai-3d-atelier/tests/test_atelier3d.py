import json
import struct
import sys
from pathlib import Path

import pytest

from atelier3d import provenance
from atelier3d.backends import BackendError, CommandBackend, JobBackend, load_config
from atelier3d.cli import main as cli_main
from atelier3d.glbcheck import GlbError, inspect_glb
from atelier3d.licenses import terms_for, warnings
from atelier3d.pipeline import PipelineError, run


def make_glb(triangles=2, meshes=1, truncate=0):
    doc = {"asset": {"version": "2.0"},
           "meshes": [{"primitives": [{"attributes": {"POSITION": 0}, "indices": 1}]} for _ in range(meshes)],
           "accessors": [{"count": triangles * 3}, {"count": triangles * 3}]}
    if meshes == 0:
        doc["meshes"] = []
    js = json.dumps(doc).encode()
    js += b" " * (-len(js) % 4)
    data = struct.pack("<III", 0x46546C67, 2, 12 + 8 + len(js)) + struct.pack("<II", len(js), 0x4E4F534A) + js
    return data[:-truncate] if truncate else data


class FakeBackend:
    name, license_id, version = "fake", "hunyuan-community", "1"

    def __init__(self, data=None):
        self.data = make_glb() if data is None else data

    def generate(self, image, out, params):
        out.write_bytes(self.data)


@pytest.fixture
def image(tmp_path):
    p = tmp_path / "hero.png"
    p.write_bytes(b"\x89PNG fake image bytes")
    return p


# ── glbcheck ────────────────────────────────────────────────────────────────
def test_glb_counts_triangles():
    s = inspect_glb(make_glb(triangles=12))
    assert (s.meshes, s.triangles) == (1, 12)


@pytest.mark.parametrize("data,why", [
    (b"nope", "too small"),
    (make_glb(truncate=3), "truncated"),
    (make_glb(meshes=0), "no meshes"),
    (b"\x00" * 24, "bad magic"),
])
def test_glb_rejects_bad_files(data, why):
    with pytest.raises(GlbError):
        inspect_glb(data)


# ── provenance ──────────────────────────────────────────────────────────────
def test_pipeline_writes_verifiable_record(image, tmp_path):
    res = run(image, FakeBackend(), tmp_path / "out", commercial_use=True)
    assert res.model.exists() and res.record.exists()
    assert provenance.verify(res.model) == []
    rec = json.loads(res.record.read_text())
    assert rec["backend"]["name"] == "fake"
    assert rec["licence"]["id"] == "hunyuan-community"
    assert rec["licence"]["warnings"], "commercial use of a conditional licence must warn"


def test_verify_detects_swapped_model_and_edited_record(image, tmp_path):
    res = run(image, FakeBackend(), tmp_path / "out")
    res.model.write_bytes(make_glb(triangles=99))
    assert any("does not match" in p for p in provenance.verify(res.model))

    res2 = run(image, FakeBackend(), tmp_path / "out2")
    rec = json.loads(res2.record.read_text())
    rec["backend"]["name"] = "someone-else"
    res2.record.write_text(json.dumps(rec))
    assert any("edited" in p for p in provenance.verify(res2.model))


def test_missing_record_reported(tmp_path):
    m = tmp_path / "x.glb"
    m.write_bytes(make_glb())
    assert "no provenance record" in provenance.verify(m)[0]


# ── pipeline guards ─────────────────────────────────────────────────────────
def test_rejects_wrong_image_type(tmp_path):
    bad = tmp_path / "notes.txt"
    bad.write_text("hi")
    with pytest.raises(PipelineError, match="unsupported image"):
        run(bad, FakeBackend(), tmp_path / "o")


def test_rejects_unusable_backend_output(image, tmp_path):
    with pytest.raises(PipelineError, match="unusable"):
        run(image, FakeBackend(data=make_glb(truncate=2)), tmp_path / "o")


def test_empty_output_is_an_error(image, tmp_path):
    with pytest.raises(PipelineError, match="no file"):
        run(image, FakeBackend(data=b""), tmp_path / "o")


# ── backends ────────────────────────────────────────────────────────────────
def test_command_backend_runs_without_shell(image, tmp_path):
    script = tmp_path / "gen.py"
    script.write_bytes(b"import sys; open(sys.argv[2],'wb').write(open(sys.argv[3],'rb').read())")
    src = tmp_path / "src.glb"
    src.write_bytes(make_glb())
    be = CommandBackend("cmd", [sys.executable, str(script), "{image}", "{out}", str(src)], license_id="own")
    res = run(image, be, tmp_path / "o")
    assert res.stats["triangles"] == 2
    assert res.warnings == []


def test_command_backend_failure_is_reported(image, tmp_path):
    be = CommandBackend("bad", [sys.executable, "-c", "import sys; sys.exit(3)"])
    with pytest.raises(PipelineError, match="exited 3"):
        run(image, be, tmp_path / "o")


def test_job_backend_polls_then_downloads(image, tmp_path, monkeypatch):
    monkeypatch.setenv("TOK", "secret")
    calls = []
    states = iter([{"status": "running"}, {"status": "done", "result_url": "http://x/result"}])

    def transport(method, url, headers, body):
        calls.append((method, url, headers.get("Authorization")))
        if method == "POST":
            return 200, json.dumps({"id": "j1"}).encode()
        if url.endswith("/result"):
            return 200, make_glb()
        return 200, json.dumps(next(states)).encode()

    be = JobBackend("hosted", "http://x/jobs", "http://x/jobs/{id}", token_env="TOK",
                    transport=transport, sleep=lambda s: None)
    res = run(image, be, tmp_path / "o")
    assert res.stats["triangles"] == 2
    assert calls[0][2] == "Bearer secret"


def test_job_backend_needs_token(image, tmp_path, monkeypatch):
    monkeypatch.delenv("TOK", raising=False)
    be = JobBackend("hosted", "http://x", "http://x/{id}", token_env="TOK", transport=lambda *a: (200, b"{}"))
    with pytest.raises(PipelineError, match="TOK"):
        run(image, be, tmp_path / "o")


def test_job_backend_reports_failure(image, tmp_path):
    def transport(method, url, headers, body):
        return 200, json.dumps({"id": "j"} if method == "POST" else {"status": "failed", "error": "bad image"}).encode()
    be = JobBackend("hosted", "http://x", "http://x/{id}", transport=transport, sleep=lambda s: None)
    with pytest.raises(PipelineError, match="bad image"):
        run(image, be, tmp_path / "o")


def test_config_loading(tmp_path):
    cfg = tmp_path / "b.json"
    cfg.write_text(json.dumps({"backends": {
        "a": {"kind": "command", "command": ["x"], "license": "own"},
        "b": {"kind": "job", "submit_url": "u", "status_url": "s/{id}"}}}))
    found = load_config(cfg)
    assert set(found) == {"a", "b"} and found["a"].license_id == "own"
    cfg.write_text(json.dumps({"backends": {"c": {"kind": "magic"}}}))
    with pytest.raises(BackendError):
        load_config(cfg)


# ── licences ────────────────────────────────────────────────────────────────
def test_license_warnings():
    assert warnings("own", True) == []
    assert warnings("hunyuan-community", False) == []
    assert warnings("hunyuan-community", True)
    assert warnings("never-heard-of-it", False)       # unknown licences always warn
    assert terms_for("stability-community").commercial == "conditional"


# ── cli ─────────────────────────────────────────────────────────────────────
class CloudBackend:
    name, license_id, version = "cloudgen", "own", "1"

    def generate(self, source, out, params):
        from atelier3d.ply import write_ply
        write_ply(out, [(0, 0, 0), (1, 0, 0), (0, 1, 1), (1, 1, 0.5)], [(255, 0, 0)] * 4)


class CloudToMesh:
    name, license_id, version = "mesher", "own", "1"
    seen = None

    def generate(self, source, out, params):
        CloudToMesh.seen = (source.suffix, params.get("mode"))
        out.write_bytes(make_glb(triangles=4))


def test_text_mode_records_prompt_and_reaches_backend(tmp_path):
    from atelier3d.pipeline import run_text
    got = {}

    class Spy(FakeBackend):
        def generate(self, image, out, params):
            got.update(params, text=image.read_text())
            super().generate(image, out, params)

    res = run_text("  a stone lantern  ", Spy(), tmp_path / "o")
    rec = json.loads(res.record.read_text())
    assert rec["input"]["kind"] == "text" and rec["input"]["prompt"] == "a stone lantern"
    assert got["mode"] == "text" and got["text"] == "a stone lantern"
    assert res.model.name.startswith("a-stone-lantern-")
    with pytest.raises(PipelineError, match="empty"):
        run_text("   ", Spy(), tmp_path / "o")


def test_point_cloud_stage_then_mesh_with_lineage(image, tmp_path):
    from atelier3d.pipeline import run_from_cloud
    cloud = run(image, CloudBackend(), tmp_path / "c", want="cloud")
    assert cloud.model.suffix == ".ply" and cloud.stats["points"] == 4 and cloud.stats["has_color"]
    assert provenance.verify(cloud.model) == []
    mesh = run_from_cloud(cloud.model, CloudToMesh(), tmp_path / "m")
    rec = json.loads(mesh.record.read_text())
    cloud_digest = json.loads(cloud.record.read_text())["record_digest"]
    assert rec["input"]["kind"] == "pointcloud" and rec["input"]["parent_record_digest"] == cloud_digest
    assert CloudToMesh.seen == (".ply", "cloud-to-mesh")


def test_ply_validation(tmp_path):
    from atelier3d.ply import PlyError, inspect_ply, write_ply
    good = tmp_path / "g.ply"
    write_ply(good, [(0, 0, 0), (2, 3, 4)])
    s = inspect_ply(good.read_bytes())
    assert s.points == 2 and s.bounds_max == (2.0, 3.0, 4.0) and not s.has_color
    same = tmp_path / "s.ply"
    write_ply(same, [(1, 1, 1), (1, 1, 1)])
    for data in (b"junk", same.read_bytes(), good.read_bytes()[:-4]):
        with pytest.raises(PlyError):
            inspect_ply(data)
    ascii_ply = b"ply\nformat ascii 1.0\nelement vertex 2\nproperty float x\nproperty float y\nproperty float z\nend_header\n0 0 0\n1 2 3\n"
    assert inspect_ply(ascii_ply).points == 2
    nan = b"ply\nformat ascii 1.0\nelement vertex 2\nproperty float x\nproperty float y\nproperty float z\nend_header\n0 0 0\nnan 1 1\n"
    with pytest.raises(PlyError, match="NaN"):
        inspect_ply(nan)


def test_compare_two_models(image, tmp_path):
    from atelier3d.compare import compare
    a = run(image, FakeBackend(data=make_glb(triangles=100)), tmp_path / "a")
    b = run(image, FakeBackend(data=make_glb(triangles=25)), tmp_path / "b")
    d = compare(a.model, b.model)
    assert d["fields"]["triangles"]["ratio"] == 0.25
    assert d["backend"] == {"a": "fake", "b": "fake"}
    assert d["lighter"] == "b"


def test_cli_text_manifest_compare(tmp_path, capsys):
    gen = tmp_path / "gen.py"
    src = tmp_path / "src.glb"
    src.write_bytes(make_glb())
    gen.write_text("import sys,shutil; shutil.copy(sys.argv[2], sys.argv[1])")
    cfg = tmp_path / "b.json"
    cfg.write_text(json.dumps({"backends": {"local": {
        "kind": "command", "command": [sys.executable, str(gen), "{out}", str(src)], "license": "own"}}}))
    assert cli_main(["text", "a lantern", "--config", str(cfg), "--backend", "local", "--out", str(tmp_path / "o")]) == 0
    first = json.loads(capsys.readouterr().out)["model"]
    manifest = tmp_path / "m.json"
    manifest.write_text(json.dumps({"input": {"text": "a lantern"}, "backend": "local", "out": str(tmp_path / "o2")}))
    assert cli_main(["manifest", str(manifest), "--config", str(cfg)]) == 0
    second = json.loads(capsys.readouterr().out)["model"]
    assert cli_main(["compare", first, second]) == 0
    assert json.loads(capsys.readouterr().out)["lighter"] == "same"
    bad = tmp_path / "bad.json"
    bad.write_text(json.dumps({"input": {}, "backend": "local"}))
    assert cli_main(["manifest", str(bad), "--config", str(cfg)]) == 2


def test_cli_run_and_verify(image, tmp_path, capsys):
    script = tmp_path / "gen.py"
    src = tmp_path / "src.glb"
    src.write_bytes(make_glb())
    script.write_text("import sys,shutil; shutil.copy(sys.argv[2], sys.argv[1])")
    cfg = tmp_path / "b.json"
    cfg.write_text(json.dumps({"backends": {"local": {
        "kind": "command", "command": [sys.executable, str(script), "{out}", str(src)], "license": "own"}}}))
    assert cli_main(["image", str(image), "--config", str(cfg), "--backend", "local", "--out", str(tmp_path / "o")]) == 0
    model = json.loads(capsys.readouterr().out)["model"]
    assert cli_main(["verify", model]) == 0
    Path(model).write_bytes(make_glb(triangles=7))
    assert cli_main(["verify", model]) == 1
    assert cli_main(["image", str(image), "--config", str(cfg), "--backend", "nope"]) == 2
