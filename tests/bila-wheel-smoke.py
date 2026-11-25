import json
import subprocess
import sys
import time
import urllib.request

from bila_g2p import BilaG2P
assert BilaG2P().process("Tôi yêu tiếng Việt")["phonemes"]
p = subprocess.Popen([sys.executable, "-m", "bila_g2p", "studio", "--port", "18769"])
try:
    base = "http://127.0.0.1:18769"
    for _ in range(60):
        try:
            with urllib.request.urlopen(base + "/health", timeout=2) as r:
                assert json.load(r)["service"] == "bila-g2p"
            break
        except OSError:
            if p.poll() is not None:
                raise RuntimeError("server exited")
            time.sleep(1)
    else:
        raise RuntimeError("server not ready")
    for path in ["/", "/studio.css", "/studio.js", "/sdk/converter.js", "/assets/icon.svg"]:
        with urllib.request.urlopen(base + path) as r:
            assert r.status == 200 and r.read()
    req = urllib.request.Request(base + "/phonemize", data=json.dumps({"text": "Tôi yêu tiếng Việt"}).encode(), headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as r:
        assert json.load(r)["phonemes"]
finally:
    p.terminate()
    p.wait(timeout=10)
