"""Loopback-only Bila-G2P API and same-origin Studio."""
import argparse
import json
from functools import partial
from pathlib import Path
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Lock
from sea_g2p import SEAPipeline

pipeline = SEAPipeline(lang="vi")
lock = Lock()
SERVICE = "bila-g2p"
ROOT = Path(__file__).resolve().parent / "assets"

class Handler(SimpleHTTPRequestHandler):
    def reply(self, status, data, allow=None):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        if allow:
            self.send_header("Allow", allow)
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path == "/health":
            self.reply(200, {"service": SERVICE, "status": "ok", "schema": "bila.phoneme.v1"})
        elif self.path == "/phonemize":
            self.reply(405, {"service": SERVICE, "error": "Use POST with JSON text", "studio": "/", "health": "/health"}, "POST")
        else:
            super().do_GET()

    def do_POST(self):
        if self.path != "/phonemize":
            self.reply(404, {"error": "Not found"}); return
        if self.headers.get_content_type() != "application/json":
            self.reply(415, {"error": "Expected application/json"}); return
        try:
            size = int(self.headers.get("Content-Length", "0"))
            if not 0 < size <= 65536:
                raise ValueError("Invalid length")
            data = json.loads(self.rfile.read(size))
            text = data["text"]
            if not isinstance(text, str) or not text.strip():
                raise ValueError("Invalid text")
            with lock:
                phones = pipeline.run(text)
            self.reply(200, {"service": SERVICE, "phonemes": phones})
        except (ValueError, KeyError, TypeError):
            self.reply(400, {"error": "Invalid input"})
        except Exception:
            self.reply(500, {"error": "Phoneme engine failed"})

def serve(port=18765):
    try:
        with ThreadingHTTPServer(("127.0.0.1", port), partial(Handler, directory=str(ROOT))) as httpd:
            print(f"Bila-G2P Studio: http://127.0.0.1:{port}/", flush=True)
            httpd.serve_forever()
    except OSError as exc:
        raise SystemExit(f"Cannot bind loopback port {port}: {exc}")
