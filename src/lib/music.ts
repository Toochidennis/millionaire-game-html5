/**
 * Ambient background music using Web Audio API — no asset files required.
 * A C-minor pentatonic pad chord progression loops continuously.
 * Starts only after the first user gesture (browser autoplay policy).
 */

let _ctx: AudioContext | null = null;
let _master: GainNode | null = null;
let _playing = false;
let _gestured = false;
let _volume = 0.5;
let _loopTimer: ReturnType<typeof setTimeout> | null = null;

// C minor pentatonic — calm, unobtrusive quiz-show atmosphere
const CHORDS: number[][] = [
  [130.81, 196.00, 261.63], // C3  G3  C4
  [155.56, 233.08, 311.13], // Eb3 Bb3 Eb4
  [174.61, 261.63, 349.23], // F3  C4  F4
  [155.56, 233.08, 392.00], // Eb3 Bb3 G4
];
const CHORD_DUR = 6; // seconds per chord

function getCtx(): AudioContext {
  if (!_ctx) {
    _ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    _master = _ctx.createGain();
    _master.gain.value = 0;
    const comp = _ctx.createDynamicsCompressor();
    comp.threshold.value = -18;
    comp.ratio.value = 4;
    _master.connect(comp);
    comp.connect(_ctx.destination);
  }
  return _ctx;
}

function noteOn(
  freq: number, startAt: number, dur: number, noteGain: number, ac: AudioContext,
) {
  const osc = ac.createOscillator();
  const g = ac.createGain();
  const filt = ac.createBiquadFilter();

  osc.type = "sine";
  osc.frequency.value = freq;
  filt.type = "lowpass";
  filt.frequency.value = 900;
  filt.Q.value = 0.6;

  g.gain.setValueAtTime(0, startAt);
  g.gain.linearRampToValueAtTime(noteGain, startAt + 1.4);
  g.gain.setValueAtTime(noteGain, startAt + dur - 1.4);
  g.gain.linearRampToValueAtTime(0, startAt + dur);

  osc.connect(filt);
  filt.connect(g);
  g.connect(_master!);
  osc.start(startAt);
  osc.stop(startAt + dur);
}

function scheduleLoop(ac: AudioContext) {
  if (!_playing) return;
  const now = ac.currentTime + 0.05;
  CHORDS.forEach((chord, i) => {
    chord.forEach((freq, j) =>
      noteOn(freq, now + i * CHORD_DUR, CHORD_DUR + 0.6, 0.18 / (j + 1), ac),
    );
  });
  // Re-schedule slightly before the loop ends for seamless looping
  _loopTimer = setTimeout(
    () => scheduleLoop(ac),
    (CHORDS.length * CHORD_DUR - 1) * 1000,
  );
}

function doStart() {
  if (_playing || _volume === 0) return;
  try {
    const ac = getCtx();
    if (ac.state === "suspended") ac.resume();
    _playing = true;
    _master!.gain.setTargetAtTime(_volume * 0.1, ac.currentTime, 0.6);
    scheduleLoop(ac);
  } catch { /* blocked by browser policy */ }
}

function doStop() {
  _playing = false;
  if (_loopTimer) { clearTimeout(_loopTimer); _loopTimer = null; }
  if (_master && _ctx) _master.gain.setTargetAtTime(0, _ctx.currentTime, 0.5);
}

/** Call once on the first user pointer/key event so the AudioContext can resume. */
export function onUserGesture() {
  if (_gestured) return;
  _gestured = true;
  if (_volume > 0) doStart();
}

/** Called by SettingsSync whenever the music slider changes. */
export function setMusicVolume(v: number) {
  _volume = Math.max(0, Math.min(1, v));
  if (_master && _ctx) {
    _master.gain.setTargetAtTime(_volume * 0.1, _ctx.currentTime, 0.15);
  }
  if (_volume === 0 && _playing) doStop();
  else if (_volume > 0 && !_playing && _gestured) doStart();
}
