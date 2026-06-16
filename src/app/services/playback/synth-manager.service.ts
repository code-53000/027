import { Injectable } from '@angular/core';
import {
  Transport,
  start as toneStart,
  Ticks,
  Frequency,
  PolySynth,
  Synth as SynthCtor,
  AMSynth as AMSynthCtor,
  FMSynth as FMSynthCtor,
  Volume,
  Panner,
} from 'tone';
import { SynthType } from '@app/app/models/track.model';

@Injectable({ providedIn: 'root' })
export class SynthManagerService {
  private synths: Map<string, PolySynth> = new Map();

  private volumeToDb(volume: number): number {
    if (volume <= 0) return -60;
    return 20 * Math.log10(volume / 100) * 0.6;
  }

  getOrCreateSynth(trackId: string, synthType: SynthType, volume: number, pan: number): PolySynth {
    const existing = this.synths.get(trackId);
    if (existing) {
      existing.dispose();
      this.synths.delete(trackId);
    }
    let synth: PolySynth;
    switch (synthType) {
      case 'AMSynth':
        synth = new PolySynth(AMSynthCtor);
        break;
      case 'FMSynth':
        synth = new PolySynth(FMSynthCtor);
        break;
      default:
        synth = new PolySynth(SynthCtor);
        break;
    }
    const vol = new Volume(this.volumeToDb(volume));
    const panner = new Panner(pan);
    synth.connect(panner);
    panner.connect(vol);
    vol.toDestination();
    this.synths.set(trackId, synth);
    return synth;
  }

  getSynth(trackId: string): PolySynth | undefined {
    return this.synths.get(trackId);
  }

  releaseAll(): void {
    this.synths.forEach(s => { try { s.releaseAll(); } catch(_e) {} });
  }

  disposeAll(): void {
    this.synths.forEach(s => s.dispose());
    this.synths.clear();
  }
}
