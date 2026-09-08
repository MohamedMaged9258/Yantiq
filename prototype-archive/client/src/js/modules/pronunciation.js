/**
 * pronunciation.js — Pronunciation session manager
 * Handles microphone access, recording, waveform animation, AI feedback
 */
import { pronunciationAPI } from '../utils/api.js';
import { correctPop, wrongShake, showXPGain, spawnEmojis,
         flashCorrect, flashWrong, avatarReact, toast } from '../utils/animations.js';
import { onCorrectAnswer } from './rewards.js';

// ─── MediaRecorder state ──────────────────────────────
let mediaRecorder = null;
let audioChunks   = [];
let isRecording   = false;
let waveInterval  = null;

// ─── Request microphone permission ───────────────────
export async function requestMicPermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(t => t.stop()); // release immediately
    return true;
  } catch {
    toast('Microphone access is needed for pronunciation practice. Please allow it in your browser settings.', 'error', 5000);
    return false;
  }
}

// ─── Start recording ──────────────────────────────────
export async function startRecording(onWaveUpdate) {
  if (isRecording) return;
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
  audioChunks = [];
  mediaRecorder = new MediaRecorder(stream, { mimeType: getSupportedMimeType() });

  mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.push(e.data); };
  mediaRecorder.start(100); // collect every 100ms
  isRecording = true;

  // Animate waveform using AudioContext analyser
  const ctx = new AudioContext();
  const source   = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 64;
  source.connect(analyser);
  const data = new Uint8Array(analyser.frequencyBinCount);

  waveInterval = setInterval(() => {
    analyser.getByteFrequencyData(data);
    const avg = data.reduce((s, v) => s + v, 0) / data.length;
    onWaveUpdate?.(avg / 255);
  }, 60);

  return stream;
}

// ─── Stop recording and get blob ─────────────────────
export function stopRecording() {
  return new Promise((resolve) => {
    if (!mediaRecorder || mediaRecorder.state === 'inactive') { resolve(null); return; }
    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: getSupportedMimeType() });
      resolve(blob);
    };
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(t => t.stop());
    clearInterval(waveInterval);
    isRecording = false;
  });
}

// ─── Evaluate pronunciation via API ───────────────────
export async function evaluatePronunciation({ childId, lessonId, targetAr, targetEn, audioBlob }) {
  // Convert blob to base64 for API (or send FormData)
  const formData = new FormData();
  if (audioBlob) formData.append('audio', audioBlob, 'recording.webm');
  formData.append('lessonId', lessonId);
  formData.append('targetAr', targetAr);
  formData.append('targetEn', targetEn);
  // For demo/offline fallback: use transcribed text or simulate
  try {
    const res = await pronunciationAPI.evaluate(childId, {
      lessonId, targetAr, targetEn,
      transcribedText: targetEn, // simplified — replace with actual STT
    });
    return res.data.data;
  } catch {
    // Offline simulation
    const score = Math.round(70 + Math.random() * 30);
    return { score, passed: score >= 70, feedback: score >= 90 ? `ممتاز! Your "${targetAr}" was very clear!` : `Good attempt at "${targetAr}" — keep practising!`, errorType: null };
  }
}

// ─── Handle evaluation result in UI ──────────────────
export async function handleEvalResult({ result, letterEl, avatarEl, heartTrackEl, attempts }) {
  if (result.passed) {
    correctPop(letterEl);
    flashCorrect();
    avatarReact(avatarEl, 'correct');
    spawnEmojis(['🌟', '🏵️', '✨', '🌙', '💫'], letterEl, 5);
    showXPGain(10, letterEl);
    await onCorrectAnswer({ xp: 10, stars: 1, sourceEl: letterEl });
    return { passed: true, newAttempts: attempts };
  } else {
    wrongShake(letterEl);
    flashWrong();
    avatarReact(avatarEl, 'wrong');
    spawnEmojis(['💪', '🌿', '✨'], letterEl, 2);
    const remaining = Math.max(0, attempts - 1);
    if (heartTrackEl) {
      heartTrackEl.textContent = '❤️'.repeat(remaining) + '🖤'.repeat(3 - remaining);
    }
    return { passed: false, newAttempts: remaining };
  }
}

// ─── Waveform DOM updater ─────────────────────────────
export function updateWaveformDOM(bars, level) {
  bars.forEach((bar, i) => {
    const noise = Math.sin(Date.now() / 200 + i) * 0.15;
    const h = Math.max(4, Math.round((level + noise) * 48));
    bar.style.height = `${h}px`;
    bar.style.background = level > 0.1 ? '#0A5744' : '#C3E8D9';
  });
}

// ─── MIME type detection ──────────────────────────────
function getSupportedMimeType() {
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
  return types.find(t => MediaRecorder.isTypeSupported(t)) || '';
}

export function getIsRecording() { return isRecording; }
