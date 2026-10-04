// Synthesised sound effects for the Headliner design. Everything is generated
// with the Web Audio API, so there are no files to download. Browsers only
// allow audio after the visitor's first tap or key press: until `unlock()` has
// run inside such a gesture, every effect is silently skipped.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let noise: AudioBuffer | null = null;
let enabled = true;
let lastTick = 0;

function audio() {
  if (typeof window === "undefined" || !enabled) return null;
  if (!ctx) {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -12;
    limiter.ratio.value = 8;
    master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(limiter).connect(ctx.destination);
  }
  return ctx.state === "running" ? ctx : null;
}

function noiseBuffer(ac: AudioContext) {
  if (!noise) {
    noise = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
    const data = noise.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  }
  return noise;
}

/** A gain node that rises to `peak` in `attack` s, then decays to silence by `end` s. */
function envelope(ac: AudioContext, start: number, peak: number, attack: number, end: number) {
  const g = ac.createGain();
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(peak, start + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, start + end);
  g.connect(master!);
  return g;
}

function tone(ac: AudioContext, type: OscillatorType, from: number, to: number, start: number, dur: number, out: AudioNode) {
  const osc = ac.createOscillator();
  osc.type = type;
  osc.frequency.setValueAtTime(from, start);
  if (to !== from) osc.frequency.exponentialRampToValueAtTime(to, start + dur);
  osc.connect(out);
  osc.start(start);
  osc.stop(start + dur + 0.05);
}

function burst(ac: AudioContext, start: number, dur: number, filter: BiquadFilterType, freq: number, out: AudioNode) {
  const src = ac.createBufferSource();
  src.buffer = noiseBuffer(ac);
  const f = ac.createBiquadFilter();
  f.type = filter;
  f.frequency.value = freq;
  src.connect(f).connect(out);
  src.start(start, Math.random() * 0.5);
  src.stop(start + dur);
  return f;
}

export const sfx = {
  setEnabled(on: boolean) {
    enabled = on;
    if (!on) ctx?.suspend().catch(() => {});
    else ctx?.resume().catch(() => {});
  },

  /** Call from inside a tap/keypress so later effects are allowed to play. */
  unlock() {
    if (!enabled) return;
    audio();
    ctx?.resume().catch(() => {});
  },

  /** Tiny high click when the pointer lands on something clickable. */
  tick() {
    const ac = audio();
    if (!ac || ac.currentTime - lastTick < 0.05) return;
    lastTick = ac.currentTime;
    const t = ac.currentTime;
    tone(ac, "square", 2600, 2600, t, 0.02, envelope(ac, t, 0.025, 0.002, 0.03));
  },

  /** Punchy tap: a low thump with a bright transient. */
  tap() {
    const ac = audio();
    if (!ac) return;
    const t = ac.currentTime;
    tone(ac, "sine", 150, 48, t, 0.14, envelope(ac, t, 0.5, 0.004, 0.16));
    burst(ac, t, 0.03, "highpass", 2500, envelope(ac, t, 0.12, 0.001, 0.03));
  },

  /** Air sweep for things opening and closing. */
  whoosh(up = true) {
    const ac = audio();
    if (!ac) return;
    const t = ac.currentTime;
    const f = burst(ac, t, 0.55, "bandpass", 400, envelope(ac, t, 0.35, 0.18, 0.55));
    f.Q.value = 1.4;
    f.frequency.setValueAtTime(up ? 300 : 3200, t);
    f.frequency.exponentialRampToValueAtTime(up ? 3200 : 300, t + 0.45);
  },

  /** Camera shutter: two quick mechanical clicks. */
  shutter() {
    const ac = audio();
    if (!ac) return;
    const t = ac.currentTime;
    burst(ac, t, 0.025, "bandpass", 3200, envelope(ac, t, 0.4, 0.001, 0.03));
    burst(ac, t + 0.07, 0.04, "bandpass", 2200, envelope(ac, t + 0.07, 0.3, 0.001, 0.05));
    tone(ac, "sine", 90, 60, t + 0.07, 0.06, envelope(ac, t + 0.07, 0.25, 0.002, 0.08));
  },

  /** Bright two-note "added" chime. */
  select(on = true) {
    const ac = audio();
    if (!ac) return;
    const t = ac.currentTime;
    const [a, b] = on ? [880, 1318.5] : [1318.5, 880];
    tone(ac, "triangle", a, a, t, 0.09, envelope(ac, t, 0.18, 0.004, 0.1));
    tone(ac, "triangle", b, b, t + 0.08, 0.16, envelope(ac, t + 0.08, 0.18, 0.004, 0.2));
  },

  /** Film-leader countdown beep. */
  beep() {
    const ac = audio();
    if (!ac) return;
    const t = ac.currentTime;
    tone(ac, "sine", 1000, 1000, t, 0.12, envelope(ac, t, 0.16, 0.004, 0.13));
  },

  /** The big cinematic "braam": detuned saws through an opening filter. */
  braam() {
    const ac = audio();
    if (!ac) return;
    const t = ac.currentTime;
    const out = envelope(ac, t, 0.32, 0.06, 2.4);
    const lp = ac.createBiquadFilter();
    lp.type = "lowpass";
    lp.Q.value = 6;
    lp.frequency.setValueAtTime(140, t);
    lp.frequency.exponentialRampToValueAtTime(1600, t + 0.35);
    lp.frequency.exponentialRampToValueAtTime(220, t + 2.2);
    lp.connect(out);
    for (const f of [55, 55.6, 82.4, 110.3]) tone(ac, "sawtooth", f, f * 0.985, t, 2.3, lp);
    tone(ac, "sine", 41, 36, t, 2.2, envelope(ac, t, 0.5, 0.03, 2.2));
  },
};
