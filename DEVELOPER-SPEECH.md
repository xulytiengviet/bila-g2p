# Bila-G2P developer integration
Core SEA-G2P / CVNSS4.0 remains unchanged. Browser WASM produces real phonemes; F0 and action sandbox are explicitly educational. Audio file decoding and FFT are local measurements, not speech recognition or forced alignment.
## TTS
Use the existing BilaG2P process API, then supply CQN or phonemes according to the target model tokenizer. Do not substitute CVNSS tokens into a pretrained model without retraining. F5-TTS, VieNeu-TTS and Piper require independent adapters.
## STT
Use VAD and Whisper or Zipformer, preserve raw transcript and confidence, normalize CQN and run prepare() to obtain CVNSS. G2P is not ASR.
## Training
Split by speaker before training. Store WAV path, sample rate, transcript, normalized CQN, CVNSS, actual phonemes, model version, license and optional forced-alignment timestamps. Evaluate CER/WER/PER, tone errors, RTF and peak RAM. Keep simulation out of training labels.
## Signal and action
DSP and classification produce typed Event IR. ASR/KWS and intent parsing produce proposed Task IR. World grounding and independent safety controller validate before execution. Real execution feedback produces state IR and optional TTS. The demo never executes hardware.
## IR
docs/sdk/research.js exports irV2(), spectrum(), trits(), taskDemo(). IR v2 preserves original v1 as legacy; missing alignment, audio and codec are null. Base27 alphabet shown is illustrative only. No model training or external adapters bundled.
## Deployment
GitHub Pages and Cloudflare use docs/; no backend needed for WASM. The first runtime download requires internet and the CI-published dictionary. Native Wheel 1.0.0 remains separate.
