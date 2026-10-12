/**
 * Audio synthesizer using Web Audio API for snappy, lag-free sound effects
 */
class SoundManager {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public playTick(pitch: number = 800) {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(pitch, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(pitch * 0.5, this.ctx.currentTime + 0.04);
      
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.04);
    } catch {
      // Audio might be blocked before first user click
    }
  }

  public playSpinStart() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(520, this.ctx.currentTime + 0.35);
      
      gain.gain.setValueAtTime(0.07, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    } catch {}
  }

  public playStopDing() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      
      // Chime chord
      [587.33, 880, 1174.66].forEach((freq) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.9);
      });
    } catch {}
  }

  public playSuccess() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C E G C
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const startTime = this.ctx.currentTime + idx * 0.08;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.25);
        
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(startTime);
        osc.stop(startTime + 0.25);
      });
    } catch {}
  }

  public playEpicVictory() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      // Fanfare arpeggios & chords: C -> F -> G -> High C Chord with rich harmonics
      const steps = [
        { time: 0.00, notes: [261.63, 329.63, 392.00], duration: 0.18, type: 'triangle' as OscillatorType, gain: 0.14 }, // C major
        { time: 0.16, notes: [329.63, 392.00, 523.25], duration: 0.18, type: 'triangle' as OscillatorType, gain: 0.15 }, // E G C
        { time: 0.32, notes: [349.23, 440.00, 523.25], duration: 0.22, type: 'triangle' as OscillatorType, gain: 0.16 }, // F major
        { time: 0.52, notes: [392.00, 493.88, 587.33], duration: 0.22, type: 'sawtooth' as OscillatorType, gain: 0.14 }, // G major
        // Grand finale chord
        { time: 0.74, notes: [523.25, 659.25, 783.99, 1046.50], duration: 1.20, type: 'triangle' as OscillatorType, gain: 0.20 }, // High C Major
        { time: 0.74, notes: [261.63, 130.81], duration: 1.0, type: 'sine' as OscillatorType, gain: 0.22 }, // Sub-bass boom
      ];

      steps.forEach((step) => {
        step.notes.forEach((freq) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gainNode = this.ctx.createGain();
          const start = now + step.time;

          osc.type = step.type;
          osc.frequency.setValueAtTime(freq, start);

          gainNode.gain.setValueAtTime(0.001, start);
          gainNode.gain.linearRampToValueAtTime(step.gain, start + 0.03);
          gainNode.gain.exponentialRampToValueAtTime(0.0001, start + step.duration);

          osc.connect(gainNode);
          gainNode.connect(this.ctx.destination);

          osc.start(start);
          osc.stop(start + step.duration);
        });
      });

      // Shimmering chimes trail
      [1318.51, 1567.98, 2093.00].forEach((freq, idx) => {
        if (!this.ctx) return;
        const chimeOsc = this.ctx.createOscillator();
        const chimeGain = this.ctx.createGain();
        const start = now + 0.85 + idx * 0.09;

        chimeOsc.type = 'sine';
        chimeOsc.frequency.setValueAtTime(freq, start);

        chimeGain.gain.setValueAtTime(0.08, start);
        chimeGain.gain.exponentialRampToValueAtTime(0.0001, start + 0.7);

        chimeOsc.connect(chimeGain);
        chimeGain.connect(this.ctx.destination);

        chimeOsc.start(start);
        chimeOsc.stop(start + 0.7);
      });
    } catch {}
  }

  public playDrinkShot() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(160, this.ctx.currentTime + 0.2);
      
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    } catch {}
  }

  public vibrate(pattern: number | number[] = 40) {
    if (typeof window !== 'undefined' && 'navigator' in window && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch {}
    }
  }
}

export const sound = new SoundManager();
