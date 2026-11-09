// Soft music-box / piano rendition of Pachelbel's Canon in D (public domain),
// synthesised live with the Web Audio API — no audio file needed.

const CHORD_SEC = 1.9; // one chord = two slow beats
const STEP = CHORD_SEC / 8; // sixteenth-note arpeggio

// Bass roots (MIDI) and whether the chord is minor: D A Bm F#m G D G A
const CHORDS: [number, boolean][] = [
  [50, false], [45, false], [47, true], [42, true],
  [43, false], [38, false], [43, false], [45, false],
];
const MELODY_A = [78, 76, 74, 73, 71, 69, 71, 73];
const MELODY_B = [74, 73, 71, 69, 67, 66, 67, 64];

const freq = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

class WeddingMusic {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private timer: number | null = null;
  private nextTime = 0;
  private chordIndex = 0;
  private cycle = 0;
  playing = false;

  /** Call inside a user click so browsers allow audio later. */
  unlock() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new Ctx();
      this.master = this.ctx.createGain();
      this.master.gain.value = 0;

      const reverb = this.ctx.createConvolver();
      reverb.buffer = this.impulse(3.2);
      const wet = this.ctx.createGain();
      wet.gain.value = 0.45;
      this.master.connect(this.ctx.destination);
      this.master.connect(reverb).connect(wet).connect(this.ctx.destination);
    }
    this.ctx.resume();
  }

  start() {
    this.unlock();
    if (this.playing || !this.ctx) return;
    this.playing = true;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(0.55, now + 2.5);
    this.nextTime = now + 0.1;
    this.timer = window.setInterval(() => this.schedule(), 100);
  }

  stop() {
    if (!this.playing || !this.ctx) return;
    this.playing = false;
    const now = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(now);
    this.master.gain.setValueAtTime(this.master.gain.value, now);
    this.master.gain.linearRampToValueAtTime(0, now + 0.8);
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    // reset to the start of the piece for next time
    this.chordIndex = 0;
    this.cycle = 0;
  }

  toggle() {
    this.playing ? this.stop() : this.start();
    return this.playing;
  }

  private schedule() {
    const ctx = this.ctx!;
    while (this.nextTime < ctx.currentTime + 0.6) {
      this.playChord(this.nextTime);
      this.nextTime += CHORD_SEC;
      this.chordIndex = (this.chordIndex + 1) % CHORDS.length;
      if (this.chordIndex === 0) this.cycle++;
    }
  }

  private playChord(t: number) {
    const [root, minor] = CHORDS[this.chordIndex];
    const third = minor ? 3 : 4;

    // Deep, soft bass note
    this.note(root, t, CHORD_SEC * 1.4, 0.22, 'bass');

    // Flowing arpeggio
    const pattern = [0, 7, 12, 12 + third, 19, 12 + third, 12, 7];
    pattern.forEach((off, i) => {
      this.note(root + 12 + off, t + i * STEP, STEP * 4, 0.07, 'piano');
    });

    // Canon melody after the first intro cycle
    if (this.cycle > 0) {
      const line = this.cycle % 2 === 1 ? MELODY_A : MELODY_B;
      this.note(line[this.chordIndex], t, CHORD_SEC * 1.2, 0.13, 'bell');
      if (this.cycle >= 3) {
        // gentle echo harmony a third below on later cycles
        this.note(line[this.chordIndex] - (minor ? 3 : 4), t + CHORD_SEC / 2, CHORD_SEC, 0.05, 'bell');
      }
    }
  }

  private note(midi: number, t: number, dur: number, vol: number, kind: 'bass' | 'piano' | 'bell') {
    const ctx = this.ctx!;
    const f = freq(midi);
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, t);
    env.gain.linearRampToValueAtTime(vol, t + (kind === 'bass' ? 0.08 : 0.01));
    env.gain.exponentialRampToValueAtTime(0.0001, t + dur);

    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = kind === 'bass' ? 600 : 3200;
    env.connect(lp).connect(this.master);

    // Partials give a warm piano / music-box tone
    const partials: [number, number, OscillatorType][] =
      kind === 'bell'
        ? [[1, 1, 'sine'], [2, 0.35, 'sine'], [3, 0.12, 'sine'], [4.2, 0.05, 'sine']]
        : kind === 'piano'
        ? [[1, 1, 'triangle'], [2, 0.25, 'sine'], [3, 0.08, 'sine']]
        : [[1, 1, 'sine'], [2, 0.3, 'triangle']];

    partials.forEach(([mult, amp, type]) => {
      const osc = ctx.createOscillator();
      osc.type = type;
      osc.frequency.value = f * mult;
      const g = ctx.createGain();
      g.gain.value = amp;
      osc.connect(g).connect(env);
      osc.start(t);
      osc.stop(t + dur + 0.05);
    });
  }

  private impulse(seconds: number) {
    const ctx = this.ctx!;
    const len = Math.floor(ctx.sampleRate * seconds);
    const buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.5);
    }
    return buf;
  }
}

export const weddingMusic = new WeddingMusic();
