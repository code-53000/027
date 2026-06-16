import { Track } from './track.model';
import { Note } from './note.model';

export interface Project {
  id: string;
  name: string;
  bpm: number;
  timeSignatureNumerator: number;
  timeSignatureDenominator: number;
  totalBars: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFull {
  project: Project;
  tracks: Track[];
  notes: Note[];
}
