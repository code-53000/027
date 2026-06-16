import { Injectable } from '@angular/core';
import { Note } from '@app/app/models/note.model';
import { PPQ, NOTE_NAMES, MIN_PITCH, MAX_PITCH } from '@app/app/models/constants';

export interface RenderConfig {
  canvasWidth: number;
  canvasHeight: number;
  zoomX: number;
  zoomY: number;
  scrollXTicks: number;
  scrollYPitch: number;
  playheadTick: number;
  trackColor: string;
  selectedNoteIds: string[];
  totalBars: number;
  timeSignatureNumerator: number;
}

const PIANO_KEY_WIDTH = 48;
const HEADER_HEIGHT = 24;
const BASE_TICK_WIDTH = 0.5;
const BASE_PITCH_HEIGHT = 12;
const GRID_COLOR_MAJOR = '#2a2a3a';
const GRID_COLOR_MINOR = '#1e1e2e';
const GRID_COLOR_BEAT = '#3a3a4a';
const PLAYHEAD_COLOR = '#ff4444';
const NOTE_BORDER_RADIUS = 2;

@Injectable({ providedIn: 'root' })
export class PianoRollRendererService {

  get tickWidth(): number { return BASE_TICK_WIDTH; }
  get pitchHeight(): number { return BASE_PITCH_HEIGHT; }
  get pianoKeyWidth(): number { return PIANO_KEY_WIDTH; }
  get headerHeight(): number { return HEADER_HEIGHT; }

  render(ctx: CanvasRenderingContext2D, notes: Note[], config: RenderConfig): void {
    const { canvasWidth, canvasHeight, zoomX, zoomY, scrollXTicks, scrollYPitch, playheadTick, trackColor, selectedNoteIds, totalBars, timeSignatureNumerator } = config;

    const tickW = BASE_TICK_WIDTH * zoomX;
    const pitchH = BASE_PITCH_HEIGHT * zoomY;
    const gridLeft = PIANO_KEY_WIDTH;
    const gridTop = HEADER_HEIGHT;
    const gridWidth = canvasWidth - PIANO_KEY_WIDTH;
    const gridHeight = canvasHeight - HEADER_HEIGHT;

    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    ctx.fillStyle = '#0f0f14';
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    this.drawGrid(ctx, gridLeft, gridTop, gridWidth, gridHeight, tickW, pitchH, scrollXTicks, scrollYPitch, totalBars, timeSignatureNumerator);
    this.drawNotes(ctx, notes, gridLeft, gridTop, tickW, pitchH, scrollXTicks, scrollYPitch, trackColor, selectedNoteIds);
    this.drawPlayhead(ctx, gridLeft, gridTop, gridHeight, tickW, scrollXTicks, playheadTick);
    this.drawPianoKeys(ctx, gridLeft, gridHeight, pitchH, scrollYPitch);
    this.drawHeader(ctx, gridLeft, gridTop, canvasWidth, tickW, scrollXTicks, totalBars, timeSignatureNumerator);

    ctx.strokeStyle = '#2a2a3a';
    ctx.lineWidth = 1;
    ctx.strokeRect(gridLeft, gridTop, gridWidth, gridHeight);
  }

  private drawGrid(ctx: CanvasRenderingContext2D, left: number, top: number, width: number, height: number, tickW: number, pitchH: number, scrollXTicks: number, scrollYPitch: number, totalBars: number, tsNum: number): void {
    const totalTicks = totalBars * tsNum * PPQ;
    const ticksPerBeat = PPQ;
    const ticksPerBar = tsNum * PPQ;

    for (let tick = 0; tick <= totalTicks; tick += ticksPerBar) {
      const x = left + (tick - scrollXTicks) * tickW;
      if (x < left || x > left + width) continue;
      ctx.strokeStyle = GRID_COLOR_MAJOR;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, top + height);
      ctx.stroke();
    }

    for (let tick = 0; tick <= totalTicks; tick += ticksPerBeat) {
      const x = left + (tick - scrollXTicks) * tickW;
      if (x < left || x > left + width) continue;
      ctx.strokeStyle = GRID_COLOR_BEAT;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, top + height);
      ctx.stroke();
    }

    for (let tick = 0; tick <= totalTicks; tick += ticksPerBeat / 4) {
      const x = left + (tick - scrollXTicks) * tickW;
      if (x < left || x > left + width) continue;
      ctx.strokeStyle = GRID_COLOR_MINOR;
      ctx.lineWidth = 0.25;
      ctx.beginPath();
      ctx.moveTo(x, top);
      ctx.lineTo(x, top + height);
      ctx.stroke();
    }

    for (let pitch = MIN_PITCH; pitch <= MAX_PITCH; pitch++) {
      const y = top + (MAX_PITCH - pitch - scrollYPitch) * pitchH;
      if (y < top - pitchH || y > top + height) continue;
      const noteName = NOTE_NAMES[pitch % 12];
      const isBlack = noteName.includes('#');
      if (isBlack) {
        ctx.fillStyle = 'rgba(30, 30, 46, 0.6)';
        ctx.fillRect(left, y, width, pitchH);
      }
      ctx.strokeStyle = '#1a1a28';
      ctx.lineWidth = 0.25;
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(left + width, y);
      ctx.stroke();
    }
  }

  private drawNotes(ctx: CanvasRenderingContext2D, notes: Note[], left: number, top: number, tickW: number, pitchH: number, scrollXTicks: number, scrollYPitch: number, color: string, selectedIds: string[]): void {
    for (const note of notes) {
      const x = left + (note.startTick - scrollXTicks) * tickW;
      const y = top + (MAX_PITCH - note.pitch - scrollYPitch) * pitchH;
      const w = note.durationTicks * tickW;
      const h = pitchH - 1;
      if (x + w < left || x > left + (ctx.canvas.width - left)) continue;
      if (y + h < top || y > top + (ctx.canvas.height - top)) continue;

      const isSelected = selectedIds.includes(note.id);
      const alpha = note.velocity / 127 * 0.5 + 0.5;

      ctx.fillStyle = color;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.roundRect(x, y + 0.5, Math.max(w, 2), h, NOTE_BORDER_RADIUS);
      ctx.fill();
      ctx.globalAlpha = 1;

      if (isSelected) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(x, y + 0.5, Math.max(w, 2), h, NOTE_BORDER_RADIUS);
        ctx.stroke();
      } else {
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 0.5;
        ctx.beginPath();
        ctx.roundRect(x, y + 0.5, Math.max(w, 2), h, NOTE_BORDER_RADIUS);
        ctx.stroke();
      }
    }
  }

  private drawPlayhead(ctx: CanvasRenderingContext2D, left: number, top: number, height: number, tickW: number, scrollXTicks: number, playheadTick: number): void {
    const x = left + (playheadTick - scrollXTicks) * tickW;
    if (x < left || x > left + (ctx.canvas.width - left)) return;
    ctx.strokeStyle = PLAYHEAD_COLOR;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, top + height);
    ctx.stroke();

    ctx.fillStyle = PLAYHEAD_COLOR;
    ctx.beginPath();
    ctx.moveTo(x - 5, top);
    ctx.lineTo(x + 5, top);
    ctx.lineTo(x, top + 8);
    ctx.closePath();
    ctx.fill();
  }

  private drawPianoKeys(ctx: CanvasRenderingContext2D, width: number, height: number, pitchH: number, scrollYPitch: number): void {
    ctx.fillStyle = '#1a1a24';
    ctx.fillRect(0, HEADER_HEIGHT, width, height);

    for (let pitch = MIN_PITCH; pitch <= MAX_PITCH; pitch++) {
      const y = HEADER_HEIGHT + (MAX_PITCH - pitch - scrollYPitch) * pitchH;
      if (y < HEADER_HEIGHT - pitchH || y > HEADER_HEIGHT + height) continue;
      const noteName = NOTE_NAMES[pitch % 12];
      const octave = Math.floor(pitch / 12) - 1;
      const isBlack = noteName.includes('#');
      const isC = noteName === 'C';

      if (isBlack) {
        ctx.fillStyle = '#2a2a3a';
        ctx.fillRect(0, y, width - 2, pitchH);
      } else {
        ctx.fillStyle = '#c8c8d0';
        ctx.fillRect(0, y, width - 2, pitchH);
      }

      ctx.strokeStyle = '#2a2a3a';
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(0, y + pitchH);
      ctx.lineTo(width - 2, y + pitchH);
      ctx.stroke();

      if (isC) {
        ctx.fillStyle = isBlack ? '#888' : '#333';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(`C${octave}`, width - 6, y + pitchH / 2);
      }
    }
  }

  private drawHeader(ctx: CanvasRenderingContext2D, left: number, top: number, canvasWidth: number, tickW: number, scrollXTicks: number, totalBars: number, tsNum: number): void {
    ctx.fillStyle = '#1a1a24';
    ctx.fillRect(left, 0, canvasWidth - left, top);

    const ticksPerBar = tsNum * PPQ;
    for (let bar = 0; bar < totalBars; bar++) {
      const x = left + (bar * ticksPerBar - scrollXTicks) * tickW;
      if (x < left - 50 || x > canvasWidth) continue;
      ctx.fillStyle = '#8a8a9a';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${bar + 1}`, x + 4, top / 2);
    }
  }

  screenToTick(screenX: number, config: RenderConfig): number {
    const tickW = BASE_TICK_WIDTH * config.zoomX;
    return Math.floor((screenX - PIANO_KEY_WIDTH) / tickW + config.scrollXTicks);
  }

  screenToPitch(screenY: number, config: RenderConfig): number {
    const pitchH = BASE_PITCH_HEIGHT * config.zoomY;
    return Math.round(MAX_PITCH - (screenY - HEADER_HEIGHT) / pitchH - config.scrollYPitch);
  }

  snapTick(tick: number, snapValue: number): number {
    return Math.round(tick / snapValue) * snapValue;
  }

  clampPitch(pitch: number): number {
    return Math.max(MIN_PITCH, Math.min(MAX_PITCH, pitch));
  }
}
