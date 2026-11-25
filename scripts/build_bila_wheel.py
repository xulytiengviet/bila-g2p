"""Stage only the lightweight Studio assets; no WASM dictionary or native source."""
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

root = Path(__file__).resolve().parents[1]
with tempfile.TemporaryDirectory() as temp:
    stage = Path(temp) / "wheel"
    shutil.copytree(root / "packaging/bila-wheel", stage, ignore=shutil.ignore_patterns("build", "*.egg-info", "__pycache__"))
    dest = stage / "src/bila_g2p/assets"
    shutil.copytree(root / "docs", dest, ignore=shutil.ignore_patterns("wasm", "*.wasm", "*.bin", "*.md", ".nojekyll"))
    shutil.copy2(root / "LICENSE", dest / "LICENSE-UPSTREAM.txt")
    subprocess.check_call([sys.executable, "-m", "build", "--wheel", "--outdir", str(root / "dist-bila"), str(stage)])
