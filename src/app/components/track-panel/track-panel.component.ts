import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { addTrack, removeTrack, setActiveTrack, toggleMute, toggleSolo, newProject, saveProject, setProjectName } from '@app/app/store/project.actions';
import { selectTracks, selectActiveTrackId, selectProject } from '@app/app/store/project.selectors';

@Component({
  selector: 'app-track-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  host: { class: 'block h-full' },
  template: `
    <div class="flex flex-col h-full bg-panel border-r border-border w-56 shrink-0">
      <div class="p-2 border-b border-border">
        <input [value]="(project$ | async)?.name || ''"
          (input)="onSetName($event)"
          class="w-full bg-surface border border-border rounded px-2 py-1 text-xs font-mono text-gray-200 focus:border-accent focus:outline-none"
          placeholder="Project name">
      </div>
      <div class="flex gap-1 p-2 border-b border-border">
        <button (click)="onNewProject()" class="flex-1 py-1 text-[10px] font-mono bg-surface rounded hover:bg-border text-gray-300 transition-all">New</button>
        <button (click)="onSaveProject()" class="flex-1 py-1 text-[10px] font-mono bg-accent/20 text-accent rounded hover:bg-accent/30 transition-all">Save</button>
      </div>
      <div class="flex-1 overflow-y-auto p-2 space-y-1.5">
        <div *ngFor="let track of tracks$ | async; let i = index"
          (click)="onSetActiveTrack(track.id)"
          class="flex items-center gap-1.5 p-1.5 rounded cursor-pointer transition-all"
          [class]="(activeTrackId$ | async) === track.id ? 'bg-accent/15 ring-1 ring-accent/40' : 'bg-surface hover:bg-border'">
          <div class="w-2 h-2 rounded-full shrink-0" [style.backgroundColor]="track.color"></div>
          <span class="text-[11px] font-mono text-gray-200 truncate flex-1">{{track.name}}</span>
          <button (click)="onToggleMute(track.id); $event.stopPropagation()"
            class="w-5 h-5 rounded text-[9px] font-mono font-bold transition-all"
            [class]="track.muted ? 'bg-red-500/30 text-red-400' : 'bg-surface text-gray-500 hover:bg-border'">M</button>
          <button (click)="onToggleSolo(track.id); $event.stopPropagation()"
            class="w-5 h-5 rounded text-[9px] font-mono font-bold transition-all"
            [class]="track.solo ? 'bg-yellow-500/30 text-yellow-400' : 'bg-surface text-gray-500 hover:bg-border'">S</button>
          <button (click)="onRemoveTrack(track.id); $event.stopPropagation()"
            class="w-5 h-5 rounded text-[9px] font-mono text-gray-500 hover:bg-red-500/20 hover:text-red-400 transition-all">x</button>
        </div>
        <button (click)="onAddTrack()"
          class="w-full py-1.5 text-[10px] font-mono bg-surface rounded hover:bg-accent/10 hover:text-accent text-gray-500 transition-all border border-dashed border-border">
          + Add Track
        </button>
      </div>
    </div>
  `,
})
export class TrackPanelComponent {
  tracks$ = this.store.select(selectTracks);
  activeTrackId$ = this.store.select(selectActiveTrackId);
  project$ = this.store.select(selectProject);

  constructor(private store: Store) {}

  onSetName(event: Event): void {
    this.store.dispatch(setProjectName({ name: (event.target as HTMLInputElement).value }));
  }

  onNewProject(): void {
    this.store.dispatch(newProject({}));
  }

  onSaveProject(): void {
    this.store.dispatch(saveProject());
  }

  onSetActiveTrack(trackId: string): void {
    this.store.dispatch(setActiveTrack({ trackId }));
  }

  onToggleMute(trackId: string): void {
    this.store.dispatch(toggleMute({ trackId }));
  }

  onToggleSolo(trackId: string): void {
    this.store.dispatch(toggleSolo({ trackId }));
  }

  onRemoveTrack(trackId: string): void {
    this.store.dispatch(removeTrack({ trackId }));
  }

  onAddTrack(): void {
    this.store.dispatch(addTrack({}));
  }
}
