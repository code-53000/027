import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { newProject } from './store/project.actions';
import { selectProject } from './store/project.selectors';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { TrackPanelComponent } from './components/track-panel/track-panel.component';
import { TransportBarComponent } from './components/transport-bar/transport-bar.component';
import { PianoRollCanvasComponent } from './components/piano-roll-canvas/piano-roll-canvas.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, ToolbarComponent, TrackPanelComponent, TransportBarComponent, PianoRollCanvasComponent],
  template: `
    <div class="flex flex-col h-screen w-screen overflow-hidden bg-bg">
      <app-toolbar></app-toolbar>
      <div class="flex flex-1 overflow-hidden">
        <app-track-panel></app-track-panel>
        <div class="flex-1 relative overflow-hidden">
          <app-piano-roll-canvas></app-piano-roll-canvas>
        </div>
      </div>
      <app-transport-bar></app-transport-bar>
    </div>
    <div *ngIf="!(project$ | async)" class="fixed inset-0 bg-bg/90 flex items-center justify-center z-50"
      (click)="onCreateProject()">
      <div class="text-center cursor-pointer group">
        <div class="w-20 h-20 mx-auto mb-4 rounded-2xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-all">
          <span class="text-4xl text-accent">&#9835;</span>
        </div>
        <h1 class="text-2xl font-mono font-bold text-gray-200 mb-2">Piano Roll Editor</h1>
        <p class="text-sm text-gray-500 font-sans">点击任意位置开始创作</p>
      </div>
    </div>
  `,
})
export class AppComponent {
  project$ = this.store.select(selectProject);

  constructor(private store: Store) {}

  onCreateProject(): void {
    this.store.dispatch(newProject({}));
  }
}
