import { Injectable } from '@angular/core';
import { Note } from '@app/app/models/note.model';
import { RenderConfig, PianoRollRendererService } from './piano-roll-renderer.service';
import { PPQ, DEFAULT_VELOCITY, MIN_PITCH, MAX_PITCH } from '@app/app/models/constants';

export type Tool = 'select' | 'draw' | 'erase';
export type DragMode = 'none' | 'create' | 'move' | 'resize-left' | 'resize-right' | 'erase';

export interface InteractionResult {
  action: 'add' | 'update' | 'remove' | 'select' | 'deselect';
  note?: Note;
  noteId?: string;
  updates?: Partial<Note> & { id: string };
  selectedIds?: string[];
}

@Injectable({ providedIn: 'root' })
export class PianoRollInteractionService {
  private dragMode: DragMode = 'none';
  private dragStartX = 0;
  private dragStartY = 0;
  private dragNote: Note | null = null;
  private dragOriginalNote: Note | null = null;
  private creatingNote: Note | null = null;
  private eraseIds: string[] = [];

  handleMouseDown(
    event: MouseEvent,
    canvas: HTMLCanvasElement,
    notes: Note[],
    selectedNoteIds: string[],
    tool: Tool,
    snapEnabled: boolean,
    snapValue: number,
    config: RenderConfig,
    renderer: PianoRollRendererService
  ): InteractionResult | null {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (x < renderer.pianoKeyWidth || y < renderer.headerHeight) {
      return null;
    }

    const rawTick = renderer.screenToTick(x, config);
    const tick = snapEnabled ? renderer.snapTick(rawTick, snapValue) : rawTick;
    const pitch = renderer.clampPitch(renderer.screenToPitch(y, config));

    if (pitch < MIN_PITCH || pitch > MAX_PITCH) return null;

    if (tool === 'erase') {
      const hitNote = this.hitTest(x, y, notes, config, renderer);
      if (hitNote) {
        this.dragMode = 'erase';
        this.eraseIds = [hitNote.id];
        return { action: 'remove', noteId: hitNote.id };
      }
      return null;
    }

    if (tool === 'draw') {
      const id = crypto.randomUUID();
      const note: Note = {
        id,
        trackId: '',
        pitch,
        startTick: tick,
        durationTicks: snapEnabled ? snapValue : PPQ / 4,
        velocity: DEFAULT_VELOCITY,
      };
      this.dragMode = 'create';
      this.creatingNote = note;
      return { action: 'add', note };
    }

    if (tool === 'select') {
      const hitNote = this.hitTest(x, y, notes, config, renderer);
      if (hitNote) {
        const isAlreadySelected = selectedNoteIds.includes(hitNote.id);
        let newSelectedIds: string[];
        if (event.shiftKey && isAlreadySelected) {
          newSelectedIds = selectedNoteIds.filter(id => id !== hitNote.id);
        } else if (event.shiftKey) {
          newSelectedIds = [...selectedNoteIds, hitNote.id];
        } else {
          newSelectedIds = [hitNote.id];
        }
        this.dragMode = 'move';
        this.dragNote = hitNote;
        this.dragOriginalNote = { ...hitNote };
        this.dragStartX = x;
        this.dragStartY = y;
        return { action: 'select', selectedIds: newSelectedIds };
      } else {
        this.dragMode = 'none';
        return { action: 'deselect' };
      }
    }

    return null;
  }

  handleMouseMove(
    event: MouseEvent,
    canvas: HTMLCanvasElement,
    notes: Note[],
    tool: Tool,
    snapEnabled: boolean,
    snapValue: number,
    config: RenderConfig,
    renderer: PianoRollRendererService
  ): InteractionResult | null {
    if (this.dragMode === 'none') return null;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const dx = x - this.dragStartX;
    const dy = y - this.dragStartY;

    const tickW = renderer.tickWidth * config.zoomX;
    const pitchH = renderer.pitchHeight * config.zoomY;

    if (this.dragMode === 'create' && this.creatingNote) {
      const rawTick = renderer.screenToTick(x, config);
      const currentTick = snapEnabled ? renderer.snapTick(rawTick, snapValue) : rawTick;
      const newDuration = Math.max(snapEnabled ? snapValue : 1, currentTick - this.creatingNote.startTick);
      const updates: Partial<Note> & { id: string } = {
        id: this.creatingNote.id,
        durationTicks: newDuration,
      };
      this.creatingNote.durationTicks = newDuration;
      return { action: 'update', updates };
    }

    if (this.dragMode === 'move' && this.dragNote && this.dragOriginalNote) {
      const tickDelta = Math.round(dx / tickW);
      const pitchDelta = -Math.round(dy / pitchH);
      let newStartTick = this.dragOriginalNote.startTick + tickDelta;
      let newPitch = this.dragOriginalNote.pitch + pitchDelta;
      if (snapEnabled) {
        newStartTick = renderer.snapTick(newStartTick, snapValue);
      }
      newPitch = renderer.clampPitch(newPitch);
      const updates: Partial<Note> & { id: string } = {
        id: this.dragNote.id,
        startTick: Math.max(0, newStartTick),
        pitch: newPitch,
      };
      return { action: 'update', updates };
    }

    if (this.dragMode === 'erase') {
      const hitNote = this.hitTest(x, y, notes, config, renderer);
      if (hitNote && !this.eraseIds.includes(hitNote.id)) {
        this.eraseIds.push(hitNote.id);
        return { action: 'remove', noteId: hitNote.id };
      }
      return null;
    }

    return null;
  }

  handleMouseUp(): void {
    this.dragMode = 'none';
    this.dragNote = null;
    this.dragOriginalNote = null;
    this.creatingNote = null;
    this.eraseIds = [];
  }

  private hitTest(x: number, y: number, notes: Note[], config: RenderConfig, renderer: PianoRollRendererService): Note | null {
    const tickW = renderer.tickWidth * config.zoomX;
    const pitchH = renderer.pitchHeight * config.zoomY;
    for (let i = notes.length - 1; i >= 0; i--) {
      const note = notes[i];
      const nx = renderer.pianoKeyWidth + (note.startTick - config.scrollXTicks) * tickW;
      const ny = renderer.headerHeight + (MAX_PITCH - note.pitch - config.scrollYPitch) * pitchH;
      const nw = note.durationTicks * tickW;
      const nh = pitchH - 1;
      if (x >= nx && x <= nx + nw && y >= ny && y <= ny + nh) {
        return note;
      }
    }
    return null;
  }
}
