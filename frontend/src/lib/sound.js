/**
 * Synthesized Web Audio RPG Sound Effects Engine
 * Pure native Web Audio API — 0 external audio files, 0 network latency, works offline.
 */

let audioCtx = null;
let soundEnabled = true;

// Initialize sound setting from localStorage
try {
  const saved = localStorage.getItem("liferpg_sound_enabled");
  if (saved !== null) soundEnabled = saved === "true";
} catch {
  soundEnabled = true;
}

function getAudioContext() {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    audioCtx.resume();
  }
  return audioCtx;
}

export function isSoundEnabled() {
  return soundEnabled;
}

export function setSoundEnabled(enabled) {
  soundEnabled = Boolean(enabled);
  try {
    localStorage.setItem("liferpg_sound_enabled", String(soundEnabled));
  } catch {}
}

export function toggleSound() {
  const next = !soundEnabled;
  setSoundEnabled(next);
  if (next) {
    playClick();
  }
  return next;
}

// Tone generator helper
function playTone({ freq, type = "sine", duration = 0.15, startTime = 0, gain = 0.1, decay = true }) {
  if (!soundEnabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime + startTime;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);

  gainNode.gain.setValueAtTime(gain, now);
  if (decay) {
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  } else {
    gainNode.gain.setValueAtTime(gain, now + duration * 0.8);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  }

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration);
}

// 1. Quest Completion Chord (Glorious rising chime: C5 -> E5 -> G5 -> C6)
export function playQuestComplete() {
  if (!soundEnabled) return;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  notes.forEach((freq, idx) => {
    playTone({
      freq,
      type: "triangle",
      duration: 0.35,
      startTime: idx * 0.08,
      gain: 0.12,
    });
  });
}

// 2. Level Up Victory Fanfare (Regal celebratory arpeggio)
export function playLevelUp() {
  if (!soundEnabled) return;
  const fanfare = [
    { freq: 392.0, start: 0.0, dur: 0.14 }, // G4
    { freq: 523.25, start: 0.12, dur: 0.14 }, // C5
    { freq: 659.25, start: 0.24, dur: 0.14 }, // E5
    { freq: 783.99, start: 0.36, dur: 0.18 }, // G5
    { freq: 1046.5, start: 0.52, dur: 0.6 }, // C6 (long sustained)
    { freq: 1318.5, start: 0.52, dur: 0.6 }, // E6 harmonic
  ];
  fanfare.forEach((n) => {
    playTone({
      freq: n.freq,
      type: "triangle",
      duration: n.dur,
      startTime: n.start,
      gain: 0.14,
    });
  });
}

// 3. Gold Coin Clink (High-pitch metallic double-ting)
export function playCoinClink() {
  if (!soundEnabled) return;
  playTone({ freq: 2489.02, type: "sine", duration: 0.08, startTime: 0, gain: 0.12 });
  playTone({ freq: 3135.96, type: "sine", duration: 0.18, startTime: 0.07, gain: 0.14 });
}

// 4. Quest Inscription Quill Stamp
export function playInscribeQuest() {
  if (!soundEnabled) return;
  playTone({ freq: 180, type: "sine", duration: 0.12, startTime: 0, gain: 0.15 });
  playTone({ freq: 440, type: "triangle", duration: 0.2, startTime: 0.04, gain: 0.1 });
  playTone({ freq: 880, type: "sine", duration: 0.25, startTime: 0.1, gain: 0.08 });
}

// 5. Tactical Click / Toggle
export function playClick() {
  if (!soundEnabled) return;
  playTone({ freq: 800, type: "sine", duration: 0.03, startTime: 0, gain: 0.08 });
}

// 6. Magic Theme Equip Whoosh
export function playEquipTheme() {
  if (!soundEnabled) return;
  const shimmer = [587.33, 739.99, 880.0, 1174.66];
  shimmer.forEach((f, idx) => {
    playTone({ freq: f, type: "sine", duration: 0.25, startTime: idx * 0.06, gain: 0.09 });
  });
}

// 7. Anti-Cheat Warning Alert (Dissonant two-tone warning chime)
export function playWarningAlert() {
  if (!soundEnabled) return;
  playTone({ freq: 330, type: "sawtooth", duration: 0.18, startTime: 0, gain: 0.15 });
  playTone({ freq: 220, type: "sawtooth", duration: 0.28, startTime: 0.12, gain: 0.18 });
}

// 8. Account Lockout Siren
export function playAccountLocked() {
  if (!soundEnabled) return;
  const tones = [220, 165, 146.8, 110];
  tones.forEach((f, idx) => {
    playTone({ freq: f, type: "sawtooth", duration: 0.35, startTime: idx * 0.12, gain: 0.2 });
  });
}


/* commit_stage_48_xzen */
