/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicVolume = 0.6;
  private sfxVolume = 0.8;

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    } catch (e) {
      console.warn('Web Audio API not supported', e);
    }
  }

  setVolumes(music: number, sfx: number) {
    this.musicVolume = music / 100;
    this.sfxVolume = sfx / 100;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
    }
  }

  playClick() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    
    // Quick metallic high click
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(1400, now);
    osc.frequency.exponentialRampToValueAtTime(300, now + 0.05);
    
    gain.gain.setValueAtTime(0.06, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start(now);
    osc.stop(now + 0.06);
  }

  playWeaponShoot(isSilenced = false, isSniper = false) {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Buffer noise for explosion
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = isSilenced ? 'lowpass' : 'bandpass';
    filter.frequency.setValueAtTime(isSilenced ? 280 : isSniper ? 450 : 650, now);
    filter.Q.value = 4.0;

    const gain = this.ctx.createGain();
    const dur = isSniper ? 0.38 : isSilenced ? 0.15 : 0.22;
    const peak = isSniper ? 0.7 : isSilenced ? 0.2 : 0.45;

    gain.gain.setValueAtTime(peak, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

    // Crackle Oscillator
    const osc = this.ctx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(isSniper ? 60 : 110, now);
    osc.frequency.linearRampToValueAtTime(20, now + 0.1);

    const oscGain = this.ctx.createGain();
    oscGain.gain.setValueAtTime(0.35, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + dur);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  playReload() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Dual rack-clicks (unlatch, push in, dry slide release)
    const playRack = (delay: number, freq: number, dur: number) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + delay);
      osc.frequency.exponentialRampToValueAtTime(100, now + delay + dur);

      gain.gain.setValueAtTime(0.12, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now + delay);
      osc.stop(now + delay + dur);
    };

    playRack(0.0, 400, 0.12);    // mag pull out
    playRack(0.28, 500, 0.1);   // slap new clip in
    playRack(0.6, 900, 0.15);   // release charging handle
  }

  playTargetHit() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Bright metallic double bell chime
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.frequency.setValueAtTime(1200, now);
    osc2.frequency.setValueAtTime(1650, now);

    osc1.type = 'sine';
    osc2.type = 'sine';

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.masterGain);

    osc1.start(now);
    osc1.stop(now + 0.2);
    osc2.start(now);
    osc2.stop(now + 0.2);
  }

  playMatchFound() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;

    // Low threat frequency swell
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(45, now);
    osc.frequency.linearRampToValueAtTime(95, now + 1.2);

    gain.gain.setValueAtTime(0.01, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 1.3);
  }
}

export const audio = new AudioEngine();
