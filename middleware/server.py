"""Loopback-only Bila-G2P API and same-origin Studio."""
import argparse
import json
from functools import partial
from pathlib import Path
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from threading import Lock
from sea_g2p import SEAPipeline
from speech import Speech
speech = Speech()

pipeline = SEAPipeline(lang="vi")
lock = Lock()
SERVICE = "bila-g2p"
ROOT = Path(__file__).resolve().parents[1] / "docs"

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

    def handle_speech(self):
        try:
            if self.headers.get("Origin") not in (None, f"http://127.0.0.1:{self.server.server_port}", f"http://localhost:{self.server.server_port}"):
                self.reply(403, {"error":"Origin rejected"}); return
            size=int(self.headers.get("Content-Length","0"))
            limit=2_000_000 if self.path=="/asr" else 8192
            if not 0<size<=limit:
                raise ValueError("Invalid length")
            if self.path=="/asr":
                if self.headers.get_content_type()!="audio/wav":
                    self.reply(415, {"error":"Expected audio/wav"}); return
                self.reply(200, {"text":speech.recognize_wav(self.rfile.read(size))})
            else:
                if self.headers.get_content_type()!="application/json":
                    self.reply(415, {"error":"Expected JSON"}); return
                data=json.loads(self.rfile.read(size))
                raw=speech.synthesize_wav(data["text"])
                self.send_response(200)
                self.send_header("Content-Type","audio/wav")
                self.send_header("Content-Length",str(len(raw)))
                self.send_header("Cache-Control","no-store")
                self.end_headers()
                self.wfile.write(raw)
        except (ValueError,TypeError,KeyError,EOFError):
            self.reply(400,{"error":"Invalid speech input"})
        except Exception:
            self.reply(503,{"error":"Speech backend unavailable; check local configuration"})

    def do_POST(self):
        if self.path in ("/asr", "/tts"):
            self.handle_speech(); return
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

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=18765)
    parser.add_argument("--asr-model-dir")
    parser.add_argument("--enable-tts", action="store_true")
    args = parser.parse_args()
    speech = Speech(args.asr_model_dir, args.enable_tts)
    try:
        with ThreadingHTTPServer(("127.0.0.1", args.port), partial(Handler, directory=str(ROOT))) as httpd:
            print(f"Bila-G2P Studio: http://127.0.0.1:{args.port}/", flush=True)
            httpd.serve_forever()
    except OSError as exc:
        raise SystemExit(f"Cannot bind loopback port {args.port}: {exc}. Choose --port 18766.")
