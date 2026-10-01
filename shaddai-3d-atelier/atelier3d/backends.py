"""Backends turn one image into one .glb. Two kinds ship here:

* CommandBackend — runs any local program (a model on your GPU, a script) without a shell.
* JobBackend     — talks to a hosted service that works as submit → poll → download.

Both are described in a JSON config so adding a service never means editing code:

    {"backends": {
       "local-gpu": {"kind": "command", "command": ["python", "run.py", "{image}", "{out}"],
                      "license": "hunyuan-community", "version": "2.1", "timeout": 1800},
       "hosted":    {"kind": "job", "submit_url": "https://api.example/v1/jobs",
                      "status_url": "https://api.example/v1/jobs/{id}", "token_env": "MY_API_KEY",
                      "license": "service-terms"}}}
"""
from __future__ import annotations

import base64
import json
import os
import subprocess
import time
import urllib.request
from dataclasses import dataclass, field
from pathlib import Path
from typing import Callable, Protocol


class BackendError(RuntimeError):
    pass


class Backend(Protocol):
    name: str
    license_id: str
    version: str

    def generate(self, image: Path, out: Path, params: dict) -> None: ...


@dataclass
class CommandBackend:
    name: str
    command: list[str]
    license_id: str = "unknown"
    version: str = ""
    timeout: int = 1800

    def generate(self, image: Path, out: Path, params: dict) -> None:
        values = {**{k: str(v) for k, v in params.items()}, "image": str(image), "input": str(image), "out": str(out)}
        argv = [part.format(**values) for part in self.command]
        try:
            done = subprocess.run(argv, capture_output=True, text=True, timeout=self.timeout, check=False)
        except FileNotFoundError as exc:
            raise BackendError(f"{self.name}: program not found: {argv[0]}") from exc
        except subprocess.TimeoutExpired as exc:
            raise BackendError(f"{self.name}: timed out after {self.timeout}s") from exc
        if done.returncode != 0:
            tail = (done.stderr or done.stdout or "").strip().splitlines()[-3:]
            raise BackendError(f"{self.name}: exited {done.returncode}: {' | '.join(tail)}")


def _http(method: str, url: str, headers: dict, body: bytes | None) -> tuple[int, bytes]:
    req = urllib.request.Request(url, data=body, method=method, headers=headers)
    with urllib.request.urlopen(req, timeout=120) as resp:      # noqa: S310 — URL comes from your own config
        return resp.status, resp.read()


@dataclass
class JobBackend:
    name: str
    submit_url: str
    status_url: str                      # contains {id}
    license_id: str = "service-terms"
    version: str = ""
    token_env: str = ""
    poll_seconds: float = 3.0
    max_wait: float = 900.0
    transport: Callable[[str, str, dict, bytes | None], tuple[int, bytes]] = field(default=_http, repr=False)
    sleep: Callable[[float], None] = field(default=time.sleep, repr=False)

    def _headers(self) -> dict:
        h = {"Content-Type": "application/json"}
        if self.token_env:
            token = os.environ.get(self.token_env)
            if not token:
                raise BackendError(f"{self.name}: environment variable {self.token_env} is not set")
            h["Authorization"] = f"Bearer {token}"
        return h

    def generate(self, image: Path, out: Path, params: dict) -> None:
        if params.get("mode") == "text":
            payload = {"prompt": params.get("prompt", ""), "params": {k: v for k, v in params.items() if k != "prompt"}}
        else:
            payload = {"image_base64": base64.b64encode(image.read_bytes()).decode(), "params": params}
        status, body = self.transport("POST", self.submit_url, self._headers(), json.dumps(payload).encode())
        if status >= 300:
            raise BackendError(f"{self.name}: submit failed with HTTP {status}")
        job = json.loads(body).get("id")
        if not job:
            raise BackendError(f"{self.name}: submit response had no job id")
        waited = 0.0
        while waited <= self.max_wait:
            status, body = self.transport("GET", self.status_url.format(id=job), self._headers(), None)
            info = json.loads(body)
            state = info.get("status")
            if state == "done":
                url = info.get("result_url")
                if not url:
                    raise BackendError(f"{self.name}: finished without a result_url")
                _, data = self.transport("GET", url, {}, None)
                out.write_bytes(data)
                return
            if state == "failed":
                raise BackendError(f"{self.name}: job failed: {info.get('error', 'no detail')}")
            self.sleep(self.poll_seconds)
            waited += self.poll_seconds
        raise BackendError(f"{self.name}: gave up after {self.max_wait:.0f}s")


def load_config(path: str | Path) -> dict[str, Backend]:
    spec = json.loads(Path(path).read_text(encoding="utf-8")).get("backends", {})
    found: dict[str, Backend] = {}
    for name, cfg in spec.items():
        kind = cfg.get("kind")
        common = {"license_id": cfg.get("license", "unknown"), "version": str(cfg.get("version", ""))}
        if kind == "command":
            found[name] = CommandBackend(name, list(cfg["command"]), timeout=int(cfg.get("timeout", 1800)), **common)
        elif kind == "job":
            found[name] = JobBackend(name, cfg["submit_url"], cfg["status_url"], token_env=cfg.get("token_env", ""),
                                     poll_seconds=float(cfg.get("poll_seconds", 3)), **common)
        else:
            raise BackendError(f"backend {name!r}: unknown kind {kind!r}")
    return found
