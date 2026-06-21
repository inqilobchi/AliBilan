// Offline audio: tries optional mp3s from /audio/<name>.mp3, otherwise
// synthesizes friendly tones via Web Audio API. Drop your own mp3s into
// `public/audio/` with these names to override:
//   click.mp3, correct.mp3, wrong.mp3, win.mp3, hello.mp3, bye.mp3,
//   star.mp3, tick.mp3, note-c.mp3..note-b.mp3

const MP3_DIR = "/audio";
const cache = new Map<string, HTMLAudioElement | null>();
let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

async function tryMp3(name: string): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (cache.has(name)) {
    const el = cache.get(name);
    if (el) { el.currentTime = 0; void el.play().catch(() => {}); return true; }
    return false;
  }
  try {
    const res = await fetch(`${MP3_DIR}/${name}.mp3`, { method: "HEAD" });
    if (!res.ok) { cache.set(name, null); return false; }
    const audio = new Audio(`${MP3_DIR}/${name}.mp3`);
    audio.preload = "auto";
    cache.set(name, audio);
    void audio.play().catch(() => {});
    return true;
  } catch {
    cache.set(name, null);
    return false;
  }
}

function tone(freq: number, dur = 0.15, type: OscillatorType = "sine", gain = 0.15, when = 0) {
  const ac = getCtx();
  if (!ac) return;
  const t0 = ac.currentTime + when;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

const NOTE_FREQ: Record<string, number> = {
  C: 261.63, D: 293.66, E: 329.63, F: 349.23, G: 392.00, A: 440.00, B: 493.88, C2: 523.25,
};

function synth(name: string) {
  switch (name) {
    case "click":   return tone(660, 0.06, "square", 0.08);
    case "tick":    return tone(880, 0.04, "square", 0.06);
    case "correct": tone(523, 0.1, "triangle", 0.18); tone(784, 0.18, "triangle", 0.18, 0.1); return;
    case "star":    tone(880, 0.08, "triangle", 0.15); tone(1175, 0.12, "triangle", 0.15, 0.08); return;
    case "wrong":   tone(220, 0.18, "sawtooth", 0.12); tone(180, 0.18, "sawtooth", 0.12, 0.1); return;
    case "win":
      [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.18, "triangle", 0.2, i * 0.12));
      return;
    case "hello":   tone(523, 0.12, "sine", 0.18); tone(784, 0.16, "sine", 0.18, 0.12); return;
    case "bye":     tone(784, 0.12, "sine", 0.18); tone(523, 0.16, "sine", 0.18, 0.12); return;
    default:
      if (name.startsWith("note-")) {
        const key = name.slice(5).toUpperCase();
        const f = NOTE_FREQ[key];
        if (f) tone(f, 0.4, "sine", 0.2);
      }
  }
}

export function playSound(name: string) {
  if (typeof window === "undefined") return;
  // Fire-and-forget; if mp3 exists it plays, otherwise synth fallback.
  tryMp3(name).then((ok) => { if (!ok) synth(name); });
}

export function playNote(note: keyof typeof NOTE_FREQ, dur = 0.4) {
  const f = NOTE_FREQ[note];
  if (f) tone(f, dur, "sine", 0.22);
}

export const NOTES = Object.keys(NOTE_FREQ) as (keyof typeof NOTE_FREQ)[];
