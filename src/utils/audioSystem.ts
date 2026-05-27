/**
 * Web Audio API Synth Engine for premium cinematic, zero-asset auditory feedback.
 * Synthesizes deep space resonating atmosphere, sleek interface beeps, and rich inspection chimes.
 */
class CosmicAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private humOsc: OscillatorNode | null = null;
  private humLFO: OscillatorNode | null = null;
  private isMuted: boolean = true;

  constructor() {
    // Lazy initialized to respect modern browser user-gesture restrictions
  }

  public init() {
    if (this.ctx) return;

    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Start Ambient Deep Space Hum Synthesis
      this.startAmbientSpaceHum();
      this.isMuted = false;
      this.setVolume(0.4); // Serene default atmospheric volume
    } catch (err) {
      console.error("Audio Context initialization failed:", err);
    }
  }

  private startAmbientSpaceHum() {
    if (!this.ctx || !this.masterGain) return;

    // Resonant low-frequency space rumble
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(55, this.ctx.currentTime); // Low A

    lfo.type = "sine";
    lfo.frequency.setValueAtTime(0.2, this.ctx.currentTime); // 0.2Hz pulsation
    lfoGain.gain.setValueAtTime(2.5, this.ctx.currentTime); // 2.5Hz pitch bend range

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(140, this.ctx.currentTime); // Muffled space acoustics
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    // Patch LFO -> Pitch bend -> filter -> master
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    osc.connect(filter);
    filter.connect(this.masterGain);

    osc.start();
    lfo.start();

    this.humOsc = osc;
    this.humLFO = lfo;
  }

  public setVolume(volume: number) {
    if (!this.ctx || !this.masterGain) return;
    const targetVal = this.isMuted ? 0 : volume;
    this.masterGain.gain.linearRampToValueAtTime(targetVal, this.ctx.currentTime + 0.1);
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    this.setVolume(this.isMuted ? 0 : 0.45);
    return this.isMuted;
  }

  public getMuteState(): boolean {
    return this.isMuted;
  }

  /**
   * Synthesizes a modern, clean digital click or beep
   */
  public playInterfaceBeep() {
    if (!this.ctx || this.isMuted || !this.masterGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(1200, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.08);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.09);
  }

  /**
   * Synthesizes a majestic harmonic chime inspired by Interstellar's pipes
   */
  public playPlanetInspectionChime() {
    if (!this.ctx || this.isMuted || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const baseFreq = 261.63; // C4 chord frequencies
    const harmonics = [1.0, 1.5, 2.0, 2.5, 3.1]; // Major triad overtones

    harmonics.forEach((ratio, idx) => {
      if (!this.ctx || !this.masterGain) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = idx % 2 === 0 ? "sine" : "triangle";
      // Rich overtone spectrum
      osc.frequency.setValueAtTime(baseFreq * ratio, now);

      // Settle duration of the chime tail
      const decay = 2.4 - idx * 0.3;
      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.12 - idx * 0.02, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + decay);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + decay + 0.1);
    });
  }

  /**
   * Synthesizes a beautiful ascending atmospheric swell for a dramatic portal entry scene.
   */
  public playCinematicStartupSwell() {
    if (!this.ctx || this.isMuted || !this.masterGain) return;

    const now = this.ctx.currentTime;
    
    // Low rumble sliding upwards
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gainNode = this.ctx.createGain();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(45, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 1.2);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(80, now);
    filter.frequency.exponentialRampToValueAtTime(850, now + 1.2);
    filter.Q.setValueAtTime(4, now);

    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.25, now + 0.3);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 1.5);

    // Play an elegant chime cascade at the absolute climax (0.8s into warp)
    setTimeout(() => {
      if (!this.ctx || this.isMuted) return;
      this.playPlanetInspectionChime();
    }, 850);
  }

  public stopAll() {
    try {
      this.humOsc?.stop();
      this.humLFO?.stop();
      this.ctx?.close();
    } catch (e) {
      // safe omit
    }
  }
}

export const audioSystem = new CosmicAudioEngine();
export default audioSystem;
