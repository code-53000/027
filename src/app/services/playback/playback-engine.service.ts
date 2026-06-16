import { Injectable } from '@angular/core';
import {
  Transport,
  start as toneStart,
  Ticks,
  Frequency,
} from 'tone';
import { Note } from '@app/app/models/note.model';
import { Track } from '@app/app/models/track.model';
import { PPQ } from '@app/app/models/constants';
import { SynthManagerService } from './synth-manager.service';

@Injectable({ providedIn: 'root' })
export class PlaybackEngineService {
  private scheduledEvents: number[] = [];
  private playheadCallback: ((tick: number) => void) | null = null;
  private playheadEventId: number | null = null;

  constructor(private synthManager: SynthManagerService) {
    Transport.PPQ = PPQ;
  }

  async start(bpm: number, tracks: Track[], notes: Note[], startTick: number = 0, loop: boolean = false): Promise<void> {
    await toneStart();
    Transport.cancel();
    this.clearScheduled();
    Transport.bpm.value = bpm;
    this.synthManager.disposeAll();
    for (const track of tracks) {
      if (track.muted) continue;
      const hasSolo = tracks.some(t => t.solo);
      if (hasSolo && !track.solo) continue;
      const synth = this.synthManager.getOrCreateSynth(track.id, track.synthType, track.volume, track.pan);
      const trackNotes = notes.filter(n => n.trackId === track.id);
      for (const note of trackNotes) {
        const time = Ticks(note.startTick).toSeconds();
        const duration = Ticks(note.durationTicks).toSeconds();
        const freq = Frequency(note.pitch, 'midi').toFrequency();
        const velocity = note.velocity / 127;
        const eventId = Transport.schedule((t) => {
          synth.triggerAttackRelease(freq, duration, t, velocity);
        }, time);
        this.scheduledEvents.push(eventId);
      }
    }
    if (loop) {
      const totalTicks = this.calculateTotalTicks(notes);
      Transport.loop = true;
      Transport.loopStart = 0;
      Transport.loopEnd = Ticks(totalTicks).toSeconds();
    } else {
      Transport.loop = false;
    }
    const startSeconds = Ticks(startTick).toSeconds();
    Transport.start(undefined, startSeconds);
    this.startPlayheadUpdates();
  }

  private calculateTotalTicks(notes: Note[]): number {
    if (notes.length === 0) return PPQ * 4 * 32;
    let maxTick = 0;
    for (const note of notes) {
      const end = note.startTick + note.durationTicks;
      if (end > maxTick) maxTick = end;
    }
    const beats = Math.ceil(maxTick / PPQ);
    return beats * PPQ;
  }

  private startPlayheadUpdates(): void {
    if (this.playheadEventId !== null) {
      Transport.clear(this.playheadEventId);
    }
    this.playheadEventId = Transport.scheduleRepeat(() => {
      const ticks = Transport.ticks;
      if (this.playheadCallback) {
        this.playheadCallback(ticks);
      }
    }, 0.025);
  }

  onPlayheadUpdate(callback: (tick: number) => void): void {
    this.playheadCallback = callback;
  }

  async pause(): Promise<void> {
    Transport.pause();
    this.stopPlayheadUpdates();
  }

  async stop(): Promise<void> {
    Transport.stop();
    Transport.cancel();
    this.clearScheduled();
    this.stopPlayheadUpdates();
    this.synthManager.releaseAll();
  }

  setBpm(bpm: number): void {
    Transport.bpm.value = bpm;
  }

  getPlayheadTick(): number {
    return Transport.ticks;
  }

  private clearScheduled(): void {
    for (const id of this.scheduledEvents) {
      Transport.clear(id);
    }
    this.scheduledEvents = [];
  }

  private stopPlayheadUpdates(): void {
    if (this.playheadEventId !== null) {
      Transport.clear(this.playheadEventId);
      this.playheadEventId = null;
    }
  }
}
