/** Tiny Web-Audio SFX engine (no asset downloads needed). */
let _ctx: AudioContext | null = null;
let _sfxVol = 0.7;

const ensure = () => (_ctx ??= new (window.AudioContext || (window as any).webkitAudioContext)());

export function setSfxVolume(v: number) { _sfxVol = Math.max(0, Math.min(1, v)); }

function blip(freq: number, dur = 0.12, type: OscillatorType = "sine", gain = 0.06) {
  if (_sfxVol === 0) return;
  try {
    const ac = ensure();
    const o = ac.createOscillator(); const g = ac.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.value = gain * _sfxVol;
    o.connect(g); g.connect(ac.destination);
    o.start(); g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
    o.stop(ac.currentTime + dur);
  } catch { /* audio blocked until user gesture */ }
}

export const sfx = {
  select:  () => blip(440, 0.08, "triangle"),
  lock:    () => blip(220, 0.18, "sawtooth"),
  correct: () => { blip(660, 0.12); setTimeout(() => blip(880, 0.16), 90); },
  wrong:   () => blip(120, 0.3, "square"),
  win:     () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => blip(f, 0.2, "triangle", 0.08), i * 120)),
};
