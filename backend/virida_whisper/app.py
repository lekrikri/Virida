#!/usr/bin/env python3
"""
virida-whisper - Service de transcription vocale pour l'IHM tactile Virida
Architecture : le backend enregistre directement depuis le micro ALSA (comme whisper_hotkey.py)
Port: 5001
"""

import os
import threading
import logging
import numpy as np
import sounddevice as sd
from scipy.signal import resample_poly
from math import gcd
from flask import Flask, request, jsonify
from flask_cors import CORS
from faster_whisper import WhisperModel

logging.basicConfig(level=logging.INFO, format="%(asctime)s [Whisper] %(message)s")
log = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

WHISPER_RATE = 16000          # Whisper attend du 16000 Hz
SAMPLE_RATE = 44100           # Sample rate natif du micro USB
ALSA_DEVICE = "plughw:2,0"   # Micro USB
MAX_SECONDS = 15              # Sécurité auto-stop

MODEL_SIZE = os.environ.get("WHISPER_MODEL", "base")
log.info(f"Chargement du modèle faster-whisper '{MODEL_SIZE}'...")
model = WhisperModel(MODEL_SIZE, device="cpu", compute_type="int8")
log.info(f"Modèle '{MODEL_SIZE}' chargé et prêt !")

# État de l'enregistrement
_recording = False
_audio_chunks = []
_stream = None
_auto_stop_timer = None
_lock = threading.Lock()


def _audio_callback(indata, frames, time_info, status):
    if _recording:
        _audio_chunks.append(indata.copy())


def _start_stream():
    global _stream
    try:
        device_idx = None
        for i, d in enumerate(sd.query_devices()):
            if "USB Audio" in d["name"] and d["max_input_channels"] > 0:
                device_idx = i
                log.info(f"Device audio trouvé : [{i}] {d['name']}")
                break
        _stream = sd.InputStream(
            device=device_idx,
            samplerate=SAMPLE_RATE,
            channels=1,
            dtype=np.float32,
            callback=_audio_callback,
        )
        _stream.start()
    except Exception as e:
        log.error(f"Erreur ouverture stream: {e}")
        raise


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "model": MODEL_SIZE, "recording": _recording})


@app.route("/record/start", methods=["POST"])
def record_start():
    global _recording, _audio_chunks, _stream, _auto_stop_timer

    with _lock:
        if _recording:
            return jsonify({"status": "already_recording"}), 400

        _audio_chunks = []
        _recording = True
        try:
            _start_stream()
        except Exception as e:
            _recording = False
            return jsonify({"error": str(e)}), 500

        # Auto-stop de sécurité
        def auto_stop():
            log.info("[Auto-stop] Durée max atteinte")
            _do_stop_and_transcribe()

        _auto_stop_timer = threading.Timer(MAX_SECONDS, auto_stop)
        _auto_stop_timer.start()

    log.info("Enregistrement démarré")
    return jsonify({"status": "recording"})


@app.route("/record/stop", methods=["POST"])
def record_stop():
    result = _do_stop_and_transcribe()
    return jsonify(result)


def _do_stop_and_transcribe():
    global _recording, _stream, _auto_stop_timer

    with _lock:
        if not _recording:
            return {"error": "Pas d'enregistrement en cours"}

        _recording = False

        if _auto_stop_timer:
            _auto_stop_timer.cancel()
            _auto_stop_timer = None

        if _stream:
            try:
                _stream.stop()
                _stream.close()
            except Exception:
                pass
            _stream = None

        if not _audio_chunks:
            return {"text": "", "duration": 0}

        audio = np.concatenate(_audio_chunks, axis=0).flatten().astype(np.float32)
        duration = round(len(audio) / SAMPLE_RATE, 2)
        rms = float(np.sqrt(np.mean(audio ** 2)))
        log.info(f"Audio capturé : {duration}s, RMS={rms:.6f}")

        # Normaliser si signal trop faible (micro éloigné, gain insuffisant)
        if rms > 1e-6:
            target_rms = 0.05
            audio = audio * (target_rms / rms)
            log.info(f"Normalisé : gain x{target_rms/rms:.1f}, RMS→{target_rms}")

        # Rééchantillonner 44100 Hz → 16000 Hz pour Whisper
        g = gcd(WHISPER_RATE, SAMPLE_RATE)
        audio = resample_poly(audio, WHISPER_RATE // g, SAMPLE_RATE // g).astype(np.float32)
        log.info(f"Resample {SAMPLE_RATE}→{WHISPER_RATE} Hz : {len(audio)} samples")

    # Transcription (hors du lock)
    log.info("Transcription Whisper...")
    try:
        segments, _ = model.transcribe(
            audio,
            language="fr",
            beam_size=5,
            vad_filter=False,
            no_speech_threshold=0.9,
            initial_prompt="Bonjour, voici une transcription en français pour l'application Virida.",
        )
        text = " ".join(seg.text for seg in segments).strip()
        log.info(f"Transcrit ({duration}s) : '{text}'")
        return {"text": text, "duration": duration}
    except Exception as e:
        log.error(f"Erreur transcription: {e}")
        return {"error": str(e)}


if __name__ == "__main__":
    port = int(os.environ.get("WHISPER_PORT", 5001))
    log.info(f"Service Whisper démarré sur port {port} — micro: USB Audio Device")
    app.run(host="0.0.0.0", port=port, debug=False)
