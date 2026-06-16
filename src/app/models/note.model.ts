export interface Note {
  id: string;
  trackId: string;
  pitch: number;
  startTick: number;
  durationTicks: number;
  velocity: number;
}
