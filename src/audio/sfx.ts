import { Howl, Howler } from 'howler';
import { useGameStore } from '../store/useGameStore';

export const sounds = {
  // Temporary synthetic sounds using Web Audio API or placeholders, 
  // since we can't bundle actual audio files easily without base64 or external URLs.
  // We'll map them to blank howls to prevent crashes, but ideally you load real MP3/OGG files here.
};

// Instead of real files, let's create a minimal web audio synthesizer for basic SFX to make it feel alive!

class SynthSFX {
  private ctx: AudioContext | null = null;
  
  private getContext() {
     if (!this.ctx) {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
     }
     if (this.ctx.state === 'suspended') {
        this.ctx.resume();
     }
     return this.ctx;
  }

  public playBark() {
     const ctx = this.getContext();
     const osc1 = ctx.createOscillator();
     const osc2 = ctx.createOscillator();
     const filter = ctx.createBiquadFilter();
     const gain = ctx.createGain();
     
     // Thicker dog bark using two oscillators and a lowpass filter
     osc1.type = 'sawtooth';
     osc1.frequency.setValueAtTime(300, ctx.currentTime);
     osc1.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.15);

     osc2.type = 'square';
     osc2.frequency.setValueAtTime(280, ctx.currentTime);
     osc2.frequency.exponentialRampToValueAtTime(120, ctx.currentTime + 0.15);
     
     filter.type = 'lowpass';
     filter.frequency.setValueAtTime(1200, ctx.currentTime);
     filter.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.1);

     const masterVolume = useGameStore.getState().settings.sfxVolume;
     
     gain.gain.setValueAtTime(0, ctx.currentTime);
     gain.gain.linearRampToValueAtTime(0.4 * masterVolume, ctx.currentTime + 0.02);
     gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.18);
     
     osc1.connect(filter);
     osc2.connect(filter);
     filter.connect(gain);
     gain.connect(ctx.destination);
     
     osc1.start();
     osc2.start();
     osc1.stop(ctx.currentTime + 0.18);
     osc2.stop(ctx.currentTime + 0.18);
  }

  public playFootstep() {
     const ctx = this.getContext();
     const osc = ctx.createOscillator();
     const filter = ctx.createBiquadFilter();
     const gain = ctx.createGain();

     // Plucky soft noise for steps
     osc.type = 'triangle';
     osc.frequency.setValueAtTime(100, ctx.currentTime);
     osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.05);

     filter.type = 'lowpass';
     filter.frequency.value = 600;
     
     const masterVolume = useGameStore.getState().settings.sfxVolume;

     gain.gain.setValueAtTime(0, ctx.currentTime);
     gain.gain.linearRampToValueAtTime(0.15 * masterVolume, ctx.currentTime + 0.01);
     gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
     
     osc.connect(filter);
     filter.connect(gain);
     gain.connect(ctx.destination);
     
     osc.start();
     osc.stop(ctx.currentTime + 0.06);
  }

  public playPop() {
     const ctx = this.getContext();
     const osc = ctx.createOscillator();
     const gain = ctx.createGain();
     
     osc.type = 'sine';
     osc.frequency.setValueAtTime(600, ctx.currentTime);
     osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.05);
     
     const masterVolume = useGameStore.getState().settings.sfxVolume;

     gain.gain.setValueAtTime(0, ctx.currentTime);
     gain.gain.linearRampToValueAtTime(0.3 * masterVolume, ctx.currentTime + 0.01);
     gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
     
     osc.connect(gain);
     gain.connect(ctx.destination);
     
     osc.start();
     osc.stop(ctx.currentTime + 0.1);
  }

  public playBell() {
     const ctx = this.getContext();
     const osc = ctx.createOscillator();
     const gain = ctx.createGain();
     
     osc.type = 'sine';
     osc.frequency.setValueAtTime(800, ctx.currentTime);
     osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 1.0);
     
     const masterVolume = useGameStore.getState().settings.sfxVolume;

     gain.gain.setValueAtTime(0, ctx.currentTime);
     gain.gain.linearRampToValueAtTime(0.5 * masterVolume, ctx.currentTime + 0.05);
     gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.0);
     
     osc.connect(gain);
     gain.connect(ctx.destination);
     
     osc.start();
     osc.stop(ctx.currentTime + 1.0);
  }
}

export const sfx = new SynthSFX();
