"""Local, optional SEA-G2P HTTP adapter. No remote access by default."""
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
from sea_g2p import SEAPipeline
from threading import Lock
pipeline = SEAPipeline(lang="vi")
lock = Lock()
class Handler(BaseHTTPRequestHandler):
    def do_POST(self):
        if self.path != "/phonemize":
            self.send_error(404); return
        try:
            size = int(self.headers.get("Content-Length", "0"))
            if not 0 < size <= 65536: raise ValueError("Invalid length")
            data = json.loads(self.rfile.read(size))
            text = data["text"]
            if not isinstance(text, str) or not text.strip(): raise ValueError("Invalid text")
            with lock: phones = pipeline.run(text)
            body = json.dumps({"phonemes": phones}, ensure_ascii=False).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
        except (ValueError, KeyError, TypeError):
            self.send_error(400, "Invalid input")
if __name__ == "__main__":
    ThreadingHTTPServer(("127.0.0.1", 8765), Handler).serve_forever()
