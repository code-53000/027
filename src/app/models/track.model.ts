export type SynthType = 'Synth' | 'AMSynth' | 'FMSynth' | 'PolySynth';

export interface Track {
  id: string;
  projectId: string;
  name: string;
  color: string;
  synthType: SynthType;
  muted: boolean;
  solo: boolean;
  volume: number;
  pan: number;
  order: number;
}
