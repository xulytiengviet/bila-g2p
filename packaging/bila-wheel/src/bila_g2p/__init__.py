"""Bila-G2P Python phoneme adapter (CVNSS conversion is provided by Studio JS)."""
from sea_g2p import SEAPipeline
__version__ = "1.0.0"

class BilaG2P:
    def __init__(self):
        self.pipeline = SEAPipeline(lang="vi")

    def process(self, text):
        import unicodedata
        if not isinstance(text, str) or not text.strip():
            raise ValueError("Expected nonempty Vietnamese CQN text")
        text = unicodedata.normalize("NFC", text)
        return {"schema": "bila.phoneme.v1", "language": "vi", "cqn": text,
                "phonemes": self.pipeline.run(text)}
