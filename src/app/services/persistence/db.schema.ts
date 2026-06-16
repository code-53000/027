import { DBSchema, IDBPDatabase } from 'idb';

export interface PianoRollDB extends DBSchema {
  projects: {
    key: string;
    value: {
      id: string;
      name: string;
      bpm: number;
      timeSignatureNumerator: number;
      timeSignatureDenominator: number;
      totalBars: number;
      createdAt: string;
      updatedAt: string;
    };
  };
  tracks: {
    key: string;
    value: {
      id: string;
      projectId: string;
      name: string;
      color: string;
      synthType: string;
      muted: boolean;
      solo: boolean;
      volume: number;
      pan: number;
      order: number;
    };
    indexes: { 'by-project': string };
  };
  notes: {
    key: string;
    value: {
      id: string;
      trackId: string;
      pitch: number;
      startTick: number;
      durationTicks: number;
      velocity: number;
    };
    indexes: { 'by-track': string };
  };
}

export const DB_NAME = 'piano-roll-editor';
export const DB_VERSION = 1;
