import { createAction, props } from '@ngrx/store';
import { ProjectFull } from '@app/app/models/project.model';
import { Track } from '@app/app/models/track.model';
import { Note } from '@app/app/models/note.model';

export const loadProject = createAction('[Project] Load Project');
export const loadProjectSuccess = createAction('[Project] Load Project Success', props<{ project: ProjectFull }>());
export const loadProjectFailure = createAction('[Project] Load Project Failure', props<{ error: string }>());

export const saveProject = createAction('[Project] Save Project');
export const saveProjectSuccess = createAction('[Project] Save Project Success');
export const saveProjectFailure = createAction('[Project] Save Project Failure', props<{ error: string }>());

export const newProject = createAction('[Project] New Project', props<{ name?: string }>());

export const setBpm = createAction('[Project] Set BPM', props<{ bpm: number }>());
export const setTotalBars = createAction('[Project] Set Total Bars', props<{ totalBars: number }>());
export const setProjectName = createAction('[Project] Set Project Name', props<{ name: string }>());

export const addTrack = createAction('[Project] Add Track', props<{ name?: string }>());
export const removeTrack = createAction('[Project] Remove Track', props<{ trackId: string }>());
export const updateTrack = createAction('[Project] Update Track', props<{ track: Partial<Track> & { id: string } }>());
export const setActiveTrack = createAction('[Project] Set Active Track', props<{ trackId: string }>());
export const toggleMute = createAction('[Project] Toggle Mute', props<{ trackId: string }>());
export const toggleSolo = createAction('[Project] Toggle Solo', props<{ trackId: string }>());

export const addNote = createAction('[Project] Add Note', props<{ note: Note }>());
export const removeNote = createAction('[Project] Remove Note', props<{ noteId: string }>());
export const updateNote = createAction('[Project] Update Note', props<{ note: Partial<Note> & { id: string } }>());
export const selectNote = createAction('[Project] Select Note', props<{ noteId: string }>());
export const deselectAllNotes = createAction('[Project] Deselect All Notes');

export const play = createAction('[Project] Play');
export const pause = createAction('[Project] Pause');
export const stop = createAction('[Project] Stop');
export const toggleLoop = createAction('[Project] Toggle Loop');
export const setPlayheadTick = createAction('[Project] Set Playhead Tick', props<{ tick: number }>());

export const setTool = createAction('[Project] Set Tool', props<{ tool: 'select' | 'draw' | 'erase' }>());
export const toggleSnap = createAction('[Project] Toggle Snap');
export const setSnapValue = createAction('[Project] Set Snap Value', props<{ value: number }>());
export const setZoomX = createAction('[Project] Set Zoom X', props<{ zoom: number }>());
export const setZoomY = createAction('[Project] Set Zoom Y', props<{ zoom: number }>());
export const setScrollX = createAction('[Project] Set Scroll X', props<{ scroll: number }>());
export const setScrollY = createAction('[Project] Set Scroll Y', props<{ scroll: number }>());
