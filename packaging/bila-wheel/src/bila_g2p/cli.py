import argparse
import json
from pathlib import Path
from importlib.metadata import version

def main():
    parser = argparse.ArgumentParser(prog="bila-g2p")
    sub = parser.add_subparsers(dest="command", required=True)
    studio = sub.add_parser("studio")
    studio.add_argument("--port", type=int, default=18765)
    phoneme = sub.add_parser("phonemize")
    phoneme.add_argument("text")
    sub.add_parser("doctor")
    args = parser.parse_args()
    if args.command == "studio":
        from .server import serve
        serve(args.port)
    elif args.command == "phonemize":
        from . import BilaG2P
        print(json.dumps(BilaG2P().process(args.text), ensure_ascii=True))
    else:
        from . import BilaG2P
        result = BilaG2P().process("Xin chao Viet Nam")
        assets = Path(__file__).parent / "assets"
        assert (assets / "index.html").is_file()
        assert (assets / "sdk" / "converter.js").is_file()
        assert result["phonemes"]
        print(json.dumps({"status": "ok", "bila-g2p": version("bila-g2p"),
                          "sea-g2p": version("sea-g2p")}))
