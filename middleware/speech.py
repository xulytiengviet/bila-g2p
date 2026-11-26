"""Optional local speech engines. No download or model initialization at import."""
from pathlib import Path
import threading

class Speech:
    def __init__(self, model_dir=None, enable_tts=False):
        self.model_dir = Path(model_dir) if model_dir else None
        self.enable_tts = enable_tts
        self.rec = self.tts = None
        self.lock = threading.Lock()

    def recognize_wav(self, raw):
        import io, wave
        import numpy as np
        import sherpa_onnx
        if self.model_dir is None:
            raise RuntimeError("Configure VietNote model directory")
        with wave.open(io.BytesIO(raw), "rb") as f:
            if f.getnchannels()!=1 or f.getsampwidth()!=2 or f.getframerate()!=16000 or not 0<f.getnframes()<=16000*60:
                raise ValueError("Require mono PCM16 16 kHz WAV, maximum 60 seconds")
            samples=np.frombuffer(f.readframes(f.getnframes()),dtype="<i2").astype(np.float32)/32768
        with self.lock:
            if self.rec is None:
                d=self.model_dir
                self.rec=sherpa_onnx.OnlineRecognizer.from_transducer(
                    encoder=str(d/"encoder.int8.onnx"),decoder=str(d/"decoder.int8.onnx"),
                    joiner=str(d/"joiner.int8.onnx"),tokens=str(d/"tokens.txt"),
                    num_threads=2,decoding_method="modified_beam_search",max_active_paths=4)
            s=self.rec.create_stream()
            for i in range(0,len(samples),1600):
                s.accept_waveform(16000,samples[i:i+1600])
                while self.rec.is_ready(s):
                    self.rec.decode_stream(s)
            s.input_finished()
            while self.rec.is_ready(s):
                self.rec.decode_stream(s)
            return self.rec.get_result(s)

    def synthesize_wav(self,text):
        import io,wave
        import numpy as np
        if not self.enable_tts:
            raise RuntimeError("TTS disabled")
        if not isinstance(text,str) or not 0<len(text.strip())<=500:
            raise ValueError("Invalid TTS text")
        with self.lock:
            if self.tts is None:
                from vieneu import Vieneu
                self.tts=Vieneu(mode="v3turbo")
            audio=np.asarray(self.tts.infer(text),dtype=np.float32).reshape(-1)
        if not np.isfinite(audio).all():
            raise RuntimeError("Invalid audio")
        out=io.BytesIO()
        with wave.open(out,"wb") as f:
            f.setnchannels(1);f.setsampwidth(2);f.setframerate(48000)
            f.writeframes((np.clip(audio,-1,1)*32767).astype("<i2").tobytes())
        return out.getvalue()
