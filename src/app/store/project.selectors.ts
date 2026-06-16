import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ProjectState } from './project.reducer';

export const selectProjectState = createFeatureSelector<ProjectState>('project');

export const selectProject = createSelector(selectProjectState, (state) => state.project);
export const selectTracks = createSelector(selectProjectState, (state) => state.tracks);
export const selectNotes = createSelector(selectProjectState, (state) => state.notes);
export const selectActiveTrackId = createSelector(selectProjectState, (state) => state.activeTrackId);
export const selectSelectedNoteIds = createSelector(selectProjectState, (state) => state.selectedNoteIds);

export const selectIsPlaying = createSelector(selectProjectState, (state) => state.isPlaying);
export const selectIsLooping = createSelector(selectProjectState, (state) => state.isLooping);
export const selectPlayheadTick = createSelector(selectProjectState, (state) => state.playheadTick);

export const selectTool = createSelector(selectProjectState, (state) => state.tool);
export const selectSnapEnabled = createSelector(selectProjectState, (state) => state.snapEnabled);
export const selectSnapValue = createSelector(selectProjectState, (state) => state.snapValue);
export const selectZoomX = createSelector(selectProjectState, (state) => state.zoomX);
export const selectZoomY = createSelector(selectProjectState, (state) => state.zoomY);
export const selectScrollX = createSelector(selectProjectState, (state) => state.scrollX);
export const selectScrollY = createSelector(selectProjectState, (state) => state.scrollY);

export const selectActiveTrack = createSelector(
  selectTracks,
  selectActiveTrackId,
  (tracks, activeTrackId) => tracks.find((t) => t.id === activeTrackId) ?? null,
);

export const selectActiveTrackNotes = createSelector(
  selectNotes,
  selectActiveTrackId,
  (notes, activeTrackId) => notes.filter((n) => n.trackId === activeTrackId),
);

export const selectSelectedNotes = createSelector(
  selectNotes,
  selectSelectedNoteIds,
  (notes, selectedNoteIds) => notes.filter((n) => selectedNoteIds.includes(n.id)),
);

export const selectVisibleNotes = selectActiveTrackNotes;
