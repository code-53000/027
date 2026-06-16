import { Component, ElementRef, OnInit, AfterViewInit, OnDestroy, NgZone, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { PianoRollRendererService, RenderConfig } from '@app/app/services/piano-roll/piano-roll-renderer.service';
import { PianoRollInteractionService } from '@app/app/services/piano-roll/piano-roll-interaction.service';
import { addNote, updateNote, removeNote, selectNote, deselectAllNotes } from '@app/app/store/project.actions';
import { selectVisibleNotes, selectSelectedNoteIds, selectTool, selectSnapEnabled, selectSnapValue, selectZoomX, selectZoomY, selectScrollX, selectScrollY, selectPlayheadTick, selectActiveTrack, selectProject, selectActiveTrackId } from '@app/app/store/project.selectors';
import { Note } from '@app/app/models/note.model';

@Component({
  selector: 'app-piano-roll-canvas',
  standalone: true,
  template: `<canvas #canvas class="block w-full h-full cursor-crosshair"></canvas>`,
})
export class PianoRollCanvasComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private notes: Note[] = [];
  private selectedIds: string[] = [];
  private tool: 'select' | 'draw' | 'erase' = 'draw';
  private snapEnabled = true;
  private snapValue = 120;
  private zoomX = 1;
  private zoomY = 1;
  private scrollX = 0;
  private scrollY = 0;
  private playheadTick = 0;
  private trackColor = '#00e5c8';
  private activeTrackId: string | null = null;
  private totalBars = 32;
  private tsNum = 4;
  private destroy$ = new Subject<void>();
  private animFrameId = 0;

  constructor(
    private store: Store,
    private rendererSvc: PianoRollRendererService,
    private interactionSvc: PianoRollInteractionService,
    private zone: NgZone,
    private el: ElementRef,
  ) {}

  ngOnInit(): void {
    this.store.select(selectVisibleNotes).pipe(takeUntil(this.destroy$)).subscribe(n => { this.notes = n; });
    this.store.select(selectSelectedNoteIds).pipe(takeUntil(this.destroy$)).subscribe(s => { this.selectedIds = s; });
    this.store.select(selectTool).pipe(takeUntil(this.destroy$)).subscribe(t => { this.tool = t; });
    this.store.select(selectSnapEnabled).pipe(takeUntil(this.destroy$)).subscribe(s => { this.snapEnabled = s; });
    this.store.select(selectSnapValue).pipe(takeUntil(this.destroy$)).subscribe(s => { this.snapValue = s; });
    this.store.select(selectZoomX).pipe(takeUntil(this.destroy$)).subscribe(z => { this.zoomX = z; });
    this.store.select(selectZoomY).pipe(takeUntil(this.destroy$)).subscribe(z => { this.zoomY = z; });
    this.store.select(selectScrollX).pipe(takeUntil(this.destroy$)).subscribe(s => { this.scrollX = s; });
    this.store.select(selectScrollY).pipe(takeUntil(this.destroy$)).subscribe(s => { this.scrollY = s; });
    this.store.select(selectPlayheadTick).pipe(takeUntil(this.destroy$)).subscribe(t => { this.playheadTick = t; });
    this.store.select(selectActiveTrack).pipe(takeUntil(this.destroy$)).subscribe(t => { if (t) this.trackColor = t.color; });
    this.store.select(selectActiveTrackId).pipe(takeUntil(this.destroy$)).subscribe(id => { this.activeTrackId = id; });
    this.store.select(selectProject).pipe(takeUntil(this.destroy$)).subscribe(p => { if (p) { this.totalBars = p.totalBars; this.tsNum = p.timeSignatureNumerator; } });
  }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;
    this.setupCanvasSize(canvas);
    this.setupMouseHandlers(canvas);
    this.startRenderLoop(canvas, ctx);

    new ResizeObserver(() => {
      this.setupCanvasSize(canvas);
    }).observe(this.el.nativeElement.parentElement!);
  }

  private setupCanvasSize(canvas: HTMLCanvasElement): void {
    const parent = canvas.parentElement!;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
  }

  private setupMouseHandlers(canvas: HTMLCanvasElement): void {
    canvas.addEventListener('mousedown', (e) => this.onMouseDown(e, canvas));
    canvas.addEventListener('mousemove', (e) => this.onMouseMove(e, canvas));
    canvas.addEventListener('mouseup', () => this.onMouseUp());
    canvas.addEventListener('mouseleave', () => this.onMouseUp());
    canvas.addEventListener('wheel', (e) => this.onWheel(e), { passive: false });
  }

  private onMouseDown(e: MouseEvent, canvas: HTMLCanvasElement): void {
    const config = this.getConfig(canvas);
    const result = this.interactionSvc.handleMouseDown(e, canvas, this.notes, this.selectedIds, this.tool, this.snapEnabled, this.snapValue, config, this.rendererSvc);
    if (result) {
      this.dispatchResult(result);
    }
  }

  private onMouseMove(e: MouseEvent, canvas: HTMLCanvasElement): void {
    const config = this.getConfig(canvas);
    const result = this.interactionSvc.handleMouseMove(e, canvas, this.notes, this.tool, this.snapEnabled, this.snapValue, config, this.rendererSvc);
    if (result) {
      this.dispatchResult(result);
    }
  }

  private onMouseUp(): void {
    this.interactionSvc.handleMouseUp();
  }

  private onWheel(e: WheelEvent): void {
    e.preventDefault();
    if (e.shiftKey) {
      this.scrollX += e.deltaY > 0 ? 480 : -480;
    } else if (e.ctrlKey) {
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      this.zoomX = Math.max(0.5, Math.min(4, this.zoomX + delta));
      this.store.dispatch({ type: '[Project] Set Zoom X', zoom: this.zoomX });
    } else {
      this.scrollY += e.deltaY > 0 ? 2 : -2;
    }
  }

  private dispatchResult(result: any): void {
    switch (result.action) {
      case 'add':
        if (result.note && this.activeTrackId) {
          result.note.trackId = this.activeTrackId;
        }
        this.store.dispatch(addNote({ note: result.note }));
        break;
      case 'update':
        this.store.dispatch(updateNote({ note: result.updates }));
        break;
      case 'remove':
        this.store.dispatch(removeNote({ noteId: result.noteId }));
        break;
      case 'select':
        if (result.selectedIds && result.selectedIds.length > 0) {
          this.store.dispatch(selectNote({ noteId: result.selectedIds[result.selectedIds.length - 1] }));
        }
        break;
      case 'deselect':
        this.store.dispatch(deselectAllNotes());
        break;
    }
  }

  private getConfig(canvas: HTMLCanvasElement): RenderConfig {
    return {
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      zoomX: this.zoomX,
      zoomY: this.zoomY,
      scrollXTicks: this.scrollX,
      scrollYPitch: this.scrollY,
      playheadTick: this.playheadTick,
      trackColor: this.trackColor,
      selectedNoteIds: this.selectedIds,
      totalBars: this.totalBars,
      timeSignatureNumerator: this.tsNum,
    };
  }

  private startRenderLoop(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D): void {
    this.zone.runOutsideAngular(() => {
      const render = () => {
        const config = this.getConfig(canvas);
        this.rendererSvc.render(ctx, this.notes, config);
        this.animFrameId = requestAnimationFrame(render);
      };
      render();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    cancelAnimationFrame(this.animFrameId);
  }
}
