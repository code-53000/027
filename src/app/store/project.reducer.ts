import { createReducer, on } from '@ngrx/store';
import { Project } from '@app/app/models/project.model';
import { Track } from '@app/app/models/track.model';
import { Note } from '@app/app/models/note.model';
import { PPQ, DEFAULT_BPM, DEFAULT_BARS, DEFAULT_TIME_SIG_NUM, DEFAULT_TIME_SIG_DEN, TRACK_COLORS } from '@app/app/models/constants';
import * as ProjectActions from './project.actions';

export interface ProjectState {
  project: Project | null;
  tracks: Track[];
  notes: Note[];
  activeTrackId: string | null;
  selectedNoteIds: string[];
  isPlaying: boolean;
  isLooping: boolean;
  playheadTick: number;
  tool: 'select' | 'draw' | 'erase';
  snapEnabled: boolean;
  snapValue: number;
  zoomX: number;
  zoomY: number;
  scrollX: number;
  scrollY: number;
  isLoading: boolean;
  error: string | null;
}

export const PROJECT_FEATURE_KEY = 'project';

export const initialState: ProjectState = {
  project: null,
  tracks: [],
  notes: [],
  activeTrackId: null,
  selectedNoteIds: [],
  isPlaying: false,
  isLooping: false,
  playheadTick: 0,
  tool: 'draw',
  snapEnabled: true,
  snapValue: PPQ / 4,
  zoomX: 1,
  zoomY: 1,
  scrollX: 0,
  scrollY: 0,
  isLoading: false,
  error: null,
};

export const projectReducer = createReducer(
  initialState,

  on(ProjectActions.loadProject, (state) => ({
    ...state,
    isLoading: true,
    error: null,
  })),

  on(ProjectActions.loadProjectSuccess, (state, { project }) => ({
    ...state,
    project: project.project,
    tracks: project.tracks,
    notes: project.notes,
    activeTrackId: project.tracks.length > 0 ? project.tracks[0].id : null,
    isLoading: false,
    error: null,
  })),

  on(ProjectActions.loadProjectFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(ProjectActions.saveProject, (state) => ({
    ...state,
    isLoading: true,
  })),

  on(ProjectActions.saveProjectSuccess, (state) => ({
    ...state,
    isLoading: false,
    error: null,
  })),

  on(ProjectActions.saveProjectFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error,
  })),

  on(ProjectActions.newProject, (state, { name }) => {
    const now = new Date().toISOString();
    const project: Project = {
      id: crypto.randomUUID(),
      name: name ?? 'Untitled Project',
      bpm: DEFAULT_BPM,
      timeSignatureNumerator: DEFAULT_TIME_SIG_NUM,
      timeSignatureDenominator: DEFAULT_TIME_SIG_DEN,
      totalBars: DEFAULT_BARS,
      createdAt: now,
      updatedAt: now,
    };
    const trackId = crypto.randomUUID();
    const track: Track = {
      id: trackId,
      projectId: project.id,
      name: 'Track 1',
      color: TRACK_COLORS[0],
      synthType: 'Synth',
      muted: false,
      solo: false,
      volume: 100,
      pan: 0,
      order: 0,
    };
    return {
      ...state,
      project,
      tracks: [track],
      notes: [],
      activeTrackId: trackId,
      selectedNoteIds: [],
      isPlaying: false,
      isLooping: false,
      playheadTick: 0,
      isLoading: false,
      error: null,
    };
  }),

  on(ProjectActions.setBpm, (state, { bpm }) => ({
    ...state,
    project: state.project ? { ...state.project, bpm, updatedAt: new Date().toISOString() } : state.project,
  })),

  on(ProjectActions.setTotalBars, (state, { totalBars }) => ({
    ...state,
    project: state.project ? { ...state.project, totalBars, updatedAt: new Date().toISOString() } : state.project,
  })),

  on(ProjectActions.setProjectName, (state, { name }) => ({
    ...state,
    project: state.project ? { ...state.project, name, updatedAt: new Date().toISOString() } : state.project,
  })),

  on(ProjectActions.addTrack, (state, { name }) => {
    if (!state.project) return state;
    const trackId = crypto.randomUUID();
    const colorIndex = state.tracks.length % TRACK_COLORS.length;
    const track: Track = {
      id: trackId,
      projectId: state.project.id,
      name: name ?? `Track ${state.tracks.length + 1}`,
      color: TRACK_COLORS[colorIndex],
      synthType: 'Synth',
      muted: false,
      solo: false,
      volume: 100,
      pan: 0,
      order: state.tracks.length,
    };
    return {
      ...state,
      tracks: [...state.tracks, track],
      activeTrackId: trackId,
      project: { ...state.project, updatedAt: new Date().toISOString() },
    };
  }),

  on(ProjectActions.removeTrack, (state, { trackId }) => ({
    ...state,
    tracks: state.tracks.filter((t) => t.id !== trackId),
    notes: state.notes.filter((n) => n.trackId !== trackId),
    activeTrackId: state.activeTrackId === trackId
      ? (state.tracks.find((t) => t.id !== trackId)?.id ?? null)
      : state.activeTrackId,
    project: state.project ? { ...state.project, updatedAt: new Date().toISOString() } : state.project,
  })),

  on(ProjectActions.updateTrack, (state, { track }) => ({
    ...state,
    tracks: state.tracks.map((t) => (t.id === track.id ? { ...t, ...track } : t)),
    project: state.project ? { ...state.project, updatedAt: new Date().toISOString() } : state.project,
  })),

  on(ProjectActions.setActiveTrack, (state, { trackId }) => ({
    ...state,
    activeTrackId: trackId,
  })),

  on(ProjectActions.toggleMute, (state, { trackId }) => ({
    ...state,
    tracks: state.tracks.map((t) => (t.id === trackId ? { ...t, muted: !t.muted } : t)),
  })),

  on(ProjectActions.toggleSolo, (state, { trackId }) => ({
    ...state,
    tracks: state.tracks.map((t) => (t.id === trackId ? { ...t, solo: !t.solo } : t)),
  })),

  on(ProjectActions.addNote, (state, { note }) => ({
    ...state,
    notes: [...state.notes, note],
    project: state.project ? { ...state.project, updatedAt: new Date().toISOString() } : state.project,
  })),

  on(ProjectActions.removeNote, (state, { noteId }) => ({
    ...state,
    notes: state.notes.filter((n) => n.id !== noteId),
    selectedNoteIds: state.selectedNoteIds.filter((id) => id !== noteId),
    project: state.project ? { ...state.project, updatedAt: new Date().toISOString() } : state.project,
  })),

  on(ProjectActions.updateNote, (state, { note }) => ({
    ...state,
    notes: state.notes.map((n) => (n.id === note.id ? { ...n, ...note } : n)),
    project: state.project ? { ...state.project, updatedAt: new Date().toISOString() } : state.project,
  })),

  on(ProjectActions.selectNote, (state, { noteId }) => ({
    ...state,
    selectedNoteIds: state.selectedNoteIds.includes(noteId)
      ? state.selectedNoteIds
      : [...state.selectedNoteIds, noteId],
  })),

  on(ProjectActions.deselectAllNotes, (state) => ({
    ...state,
    selectedNoteIds: [],
  })),

  on(ProjectActions.play, (state) => ({
    ...state,
    isPlaying: true,
  })),

  on(ProjectActions.pause, (state) => ({
    ...state,
    isPlaying: false,
  })),

  on(ProjectActions.stop, (state) => ({
    ...state,
    isPlaying: false,
    playheadTick: 0,
  })),

  on(ProjectActions.toggleLoop, (state) => ({
    ...state,
    isLooping: !state.isLooping,
  })),

  on(ProjectActions.setPlayheadTick, (state, { tick }) => ({
    ...state,
    playheadTick: tick,
  })),

  on(ProjectActions.setTool, (state, { tool }) => ({
    ...state,
    tool,
  })),

  on(ProjectActions.toggleSnap, (state) => ({
    ...state,
    snapEnabled: !state.snapEnabled,
  })),

  on(ProjectActions.setSnapValue, (state, { value }) => ({
    ...state,
    snapValue: value,
  })),

  on(ProjectActions.setZoomX, (state, { zoom }) => ({
    ...state,
    zoomX: zoom,
  })),

  on(ProjectActions.setZoomY, (state, { zoom }) => ({
    ...state,
    zoomY: zoom,
  })),

  on(ProjectActions.setScrollX, (state, { scroll }) => ({
    ...state,
    scrollX: scroll,
  })),

  on(ProjectActions.setScrollY, (state, { scroll }) => ({
    ...state,
    scrollY: scroll,
  })),
);
