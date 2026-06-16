import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { play, pause, stop, toggleLoop, setBpm } from '@app/app/store/project.actions';
import { selectIsPlaying, selectIsLooping, selectPlayheadTick, selectProject } from '@app/app/store/project.selectors';
import { PPQ } from '@app/app/models/constants';

@Component({
  selector: 'app-transport-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  host: { class: 'block' },
  template: `
    <div class="flex items-center gap-3 px-4 h-10 bg-panel border-t border-border">
      <button (click)="onPlay()"
        class="w-7 h-7 rounded flex items-center justify-center transition-all"
        [class]="(isPlaying$ | async) ? 'bg-accent/20 text-accent' : 'bg-surface text-gray-400 hover:text-accent'">
        &#9654;
      </button>
      <button (click)="onPause()"
        class="w-7 h-7 rounded flex items-center justify-center bg-surface text-gray-400 hover:text-accent transition-all">
        &#9208;
      </button>
      <button (click)="onStop()"
        class="w-7 h-7 rounded flex items-center justify-center bg-surface text-gray-400 hover:text-accent transition-all">
        &#9209;
      </button>
      <button (click)="onToggleLoop()"
        class="w-7 h-7 rounded flex items-center justify-center text-[10px] font-mono font-bold transition-all"
        [class]="(isLooping$ | async) ? 'bg-accent/20 text-accent' : 'bg-surface text-gray-400 hover:text-accent'">
        &#8635;
      </button>
      <div class="w-px h-5 bg-border"></div>
      <div class="flex items-center gap-1.5">
        <span class="text-[10px] text-gray-500 font-mono">BPM</span>
        <input type="number" [value]="(project$ | async)?.bpm ?? 120" min="40" max="300"
          (change)="onSetBpm($event)"
          class="w-14 bg-surface border border-border rounded px-1.5 py-0.5 text-xs font-mono text-center text-gray-200 focus:border-accent focus:outline-none">
      </div>
      <div class="w-px h-5 bg-border"></div>
      <span class="text-[11px] font-mono text-gray-400">{{ tickToTime((playheadTick$ | async) ?? 0) }}</span>
    </div>
  `,
})
export class TransportBarComponent {
  isPlaying$ = this.store.select(selectIsPlaying);
  isLooping$ = this.store.select(selectIsLooping);
  playheadTick$ = this.store.select(selectPlayheadTick);
  project$ = this.store.select(selectProject);

  constructor(private store: Store) {}

  onPlay(): void {
    this.store.dispatch(play());
  }

  onPause(): void {
    this.store.dispatch(pause());
  }

  onStop(): void {
    this.store.dispatch(stop());
  }

  onToggleLoop(): void {
    this.store.dispatch(toggleLoop());
  }

  onSetBpm(event: Event): void {
    this.store.dispatch(setBpm({ bpm: +(event.target as HTMLInputElement).value }));
  }

  tickToTime(tick: number): string {
    const beat = tick / PPQ;
    const bar = Math.floor(beat / 4) + 1;
    const beatInBar = Math.floor(beat % 4) + 1;
    const subBeat = Math.floor((beat % 1) * 4) + 1;
    return `${bar}.${beatInBar}.${subBeat}`;
  }
}
