import { getState } from "./store";

// Küçük, harici dosya gerektirmeyen ses efektleri (Web Audio)
let ctx: AudioContext | null = null;

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", gain = 0.08) {
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, ctx.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, ctx.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
  o.connect(g).connect(ctx.destination);
  o.start(ctx.currentTime + start);
  o.stop(ctx.currentTime + start + dur + 0.05);
}

export type Sfx = "dogru" | "ipucu" | "tik" | "odul" | "para";

export function play(sfx: Sfx) {
  if (!getState().settings.sound) return;
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx ??= new AC();
    if (ctx.state === "suspended") void ctx.resume();
    switch (sfx) {
      case "dogru":
        tone(660, 0, 0.12, "triangle");
        tone(880, 0.1, 0.18, "triangle");
        break;
      case "ipucu":
        tone(440, 0, 0.15, "sine", 0.06);
        tone(392, 0.12, 0.2, "sine", 0.05);
        break;
      case "tik":
        tone(520, 0, 0.05, "square", 0.03);
        break;
      case "para":
        tone(1046, 0, 0.08, "triangle", 0.06);
        tone(1318, 0.07, 0.12, "triangle", 0.06);
        break;
      case "odul":
        [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.1, 0.22, "triangle", 0.07));
        break;
    }
  } catch {
    /* ses desteklenmiyorsa sessizce devam */
  }
}
