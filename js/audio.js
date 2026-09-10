/**
 * ==============================================================================
 * JUICY SYNTHESIZED AUDIO ENGINE (js/audio.js)
 * ==============================================================================
 * สร้างเอฟเฟกต์เสียง SFX สไตล์เกมการศึกษา (Playful Game Audio) ด้วย Web Audio API
 * สดใส, สนุก, ละมุนหู ไม่รบกวนสมาธิ และไม่ใช้ไฟล์เสียงภายนอก (Zero Dependency)
 */

import { GameState } from './state.js';

export const AudioEngine = {
  ctx: null,

  /**
   * เริ่มต้น AudioContext เมื่อมีการกระทำแรกของผู้ใช้ (Touch/Click)
   */
  init() {
    try {
      window.AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!this.ctx) {
        this.ctx = new AudioContext();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch (e) {
      console.warn('Web Audio API not supported in this browser');
    }
  },

  /**
   * เสียงคลิกกดปุ่มเบา ๆ
   */
  playClick() {
    if (!GameState.isSoundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(750, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(450, this.ctx.currentTime + 0.035);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.035);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.035);
  },

  /**
   * เสียงดูดติดแม่เหล็ก (Bubbly Pop & Snap) สดใส หนึบหนับ
   */
  playSnap() {
    if (!GameState.isSoundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // โทนหลัก: เสียง Pop ป๊อก!
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.06);

    gain.gain.setValueAtTime(0.32, t);
    gain.gain.exponentialRampToValueAtTime(0.005, t + 0.08);

    // เสียง Harmonic เสริมความฉ่ำ
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(1200, t);
    osc2.frequency.exponentialRampToValueAtTime(1600, t + 0.04);
    gain2.gain.setValueAtTime(0.15, t);
    gain2.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);

    osc.start(t);
    osc2.start(t);
    osc.stop(t + 0.08);
    osc2.stop(t + 0.04);
  },

  /**
   * เสียงเหรียญ / สะสมคะแนน (Coin / Point Chime)
   */
  playCoin() {
    if (!GameState.isSoundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc2.type = 'sine';
    osc1.frequency.setValueAtTime(987.77, t); // B5
    osc2.frequency.setValueAtTime(1318.51, t + 0.07); // E6

    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc1.stop(t + 0.07);
    osc2.start(t + 0.07);
    osc2.stop(t + 0.28);
  },

  /**
   * เสียงชัยชนะผ่านด่าน (Joyful Victory Fanfare 5 โน้ต มาริมบา)
   */
  playSuccess() {
    if (!GameState.isSoundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.07);

      const noteStart = t + idx * 0.07;
      const noteDuration = idx === notes.length - 1 ? 0.45 : 0.22;

      gain.gain.setValueAtTime(0.25, noteStart);
      gain.gain.exponentialRampToValueAtTime(0.001, noteStart + noteDuration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(noteStart);
      osc.stop(noteStart + noteDuration);
    });
  },

  /**
   * เสียงดาวปรากฏทีละดวง (Star Sparkle Chime)
   * @param {number} starIndex - 0, 1, หรือ 2
   */
  playStar(starIndex = 0) {
    if (!GameState.isSoundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freqs = [1046.50, 1318.51, 1567.98]; // C6, E6, G6
    const baseFreq = freqs[starIndex % freqs.length];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.25, t + 0.15);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.22);
  },

  /**
   * เสียงไฟคอมโบ Streak ลุกโชน (Whoosh!)
   */
  playStreak() {
    if (!GameState.isSoundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(1100, t + 0.16);

    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.005, t + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.18);
  },

  /**
   * เสียงแมวร้องเหมียว 🐱 (Cute Meow Synth สำหรับด่าน 5 / Simulator)
   */
  playMeow() {
    if (!GameState.isSoundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(450, t);
    osc.frequency.linearRampToValueAtTime(750, t + 0.1);
    osc.frequency.exponentialRampToValueAtTime(500, t + 0.35);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.35);
  },

  /**
   * เสียงเตือนนุ่มนวลเมื่อเลือกบล็อกผิด (Gentle Oops Boing แทนเสียงกระดิ่งน่ากลัว)
   */
  playError() {
    if (!GameState.isSoundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(160, t + 0.15);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.005, t + 0.18);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.18);
  },

  /**
   * เสียงเปิดคำใบ้ (Chime คอร์ดสดใส)
   */
  playHint() {
    if (!GameState.isSoundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [554.37, 659.25, 830.61]; // C#5, E5, G#5
    notes.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = f;

      const st = t + i * 0.06;
      gain.gain.setValueAtTime(0.18, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(st);
      osc.stop(st + 0.2);
    });
  },

  /**
   * เสียงทิ้งบล็อกลงถังขยะ (Satisfying Trash / Whoosh)
   */
  playTrash() {
    if (!GameState.isSoundEnabled) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, t);
    osc.frequency.exponentialRampToValueAtTime(140, t + 0.12);

    gain.gain.setValueAtTime(0.24, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.12);
  }
};
