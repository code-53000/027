import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { setTool, toggleSnap, setZoomX, setZoomY } from '@app/app/store/project.actions';
import { selectTool, selectSnapEnabled, selectZoomX, selectZoomY } from '@app/app/store/project.selectors';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex items-center gap-2 px-3 h-10 bg-panel border-b border-border">
      <button (click)="onSetTool('select')"
        class="px-2.5 py-1 rounded text-xs font-mono transition-all"
        [class]="(tool$ | async) === 'select' ? 'bg-accent text-bg' : 'bg-surface text-gray-300 hover:bg-border'">
        Select
      </button>
      <button (click)="onSetTool('draw')"
        class="px-2.5 py-1 rounded text-xs font-mono transition-all"
        [class]="(tool$ | async) === 'draw' ? 'bg-accent text-bg' : 'bg-surface text-gray-300 hover:bg-border'">
        Draw
      </button>
      <button (click)="onSetTool('erase')"
        class="px-2.5 py-1 rounded text-xs font-mono transition-all"
        [class]="(tool$ | async) === 'erase' ? 'bg-accent text-bg' : 'bg-surface text-gray-300 hover:bg-border'">
        Erase
      </button>
      <div class="w-px h-5 bg-border mx-1"></div>
      <button (click)="onToggleSnap()"
        class="px-2.5 py-1 rounded text-xs font-mono transition-all"
        [class]="(snapEnabled$ | async) ? 'bg-accent/20 text-accent border border-accent/50' : 'bg-surface text-gray-400'">
        Snap
      </button>
      <div class="w-px h-5 bg-border mx-1"></div>
      <span class="text-[10px] text-gray-500 font-mono mr-1">Zoom X</span>
      <input type="range" min="0.5" max="4" step="0.1" [value]="(zoomX$ | async)!"
        (input)="onSetZoomX($event)"
        class="w-20 h-1 accent-accent">
      <span class="text-[10px] text-gray-500 font-mono mr-1 ml-2">Zoom Y</span>
      <input type="range" min="0.5" max="4" step="0.1" [value]="(zoomY$ | async)!"
        (input)="onSetZoomY($event)"
        class="w-20 h-1 accent-accent">
    </div>
  `,
})
export class ToolbarComponent {
  tool$ = this.store.select(selectTool);
  snapEnabled$ = this.store.select(selectSnapEnabled);
  zoomX$ = this.store.select(selectZoomX);
  zoomY$ = this.store.select(selectZoomY);

  constructor(private store: Store) {}

  onSetTool(tool: 'select' | 'draw' | 'erase'): void {
    this.store.dispatch(setTool({ tool }));
  }

  onToggleSnap(): void {
    this.store.dispatch(toggleSnap());
  }

  onSetZoomX(event: Event): void {
    this.store.dispatch(setZoomX({ zoom: +(event.target as HTMLInputElement).value }));
  }

  onSetZoomY(event: Event): void {
    this.store.dispatch(setZoomY({ zoom: +(event.target as HTMLInputElement).value }));
  }
}
