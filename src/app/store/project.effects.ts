import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { of, interval, from } from 'rxjs';
import { switchMap, map, catchError, withLatestFrom, filter, takeUntil } from 'rxjs/operators';
import { ProjectState } from './project.reducer';
import * as ProjectActions from './project.actions';
import { selectProject, selectTracks, selectNotes } from './project.selectors';
import { PersistenceService } from '@app/app/services/persistence/persistence.service';
import { PlaybackEngineService } from '@app/app/services/playback/playback-engine.service';

@Injectable()
export class ProjectEffects {
  constructor(
    private actions$: Actions,
    private store: Store<{ project: ProjectState }>,
    private persistence: PersistenceService,
    private playback: PlaybackEngineService,
  ) {}

  loadProject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.loadProject),
      switchMap(() =>
        from(this.persistence.listProjects()).pipe(
          switchMap((projects) => {
            if (projects.length === 0) {
              return of(ProjectActions.loadProjectFailure({ error: 'No projects found' }));
            }
            return from(this.persistence.load(projects[0].id)).pipe(
              map((project) => {
                if (!project) return ProjectActions.loadProjectFailure({ error: 'Project not found' });
                return ProjectActions.loadProjectSuccess({ project });
              }),
              catchError((error) => of(ProjectActions.loadProjectFailure({ error: error.message ?? 'Load failed' }))),
            );
          }),
          catchError((error) => of(ProjectActions.loadProjectFailure({ error: error.message ?? 'Load failed' }))),
        ),
      ),
    ),
  );

  saveProject$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.saveProject),
      withLatestFrom(
        this.store.select(selectProject),
        this.store.select(selectTracks),
        this.store.select(selectNotes),
      ),
      switchMap(([, project, tracks, notes]) => {
        if (!project) return of(ProjectActions.saveProjectFailure({ error: 'No project to save' }));
        return from(this.persistence.save({ project, tracks, notes })).pipe(
          map(() => ProjectActions.saveProjectSuccess()),
          catchError((error) => of(ProjectActions.saveProjectFailure({ error: error.message ?? 'Save failed' }))),
        );
      }),
    ),
  );

  autoSave$ = createEffect(() =>
    interval(30000).pipe(
      withLatestFrom(this.store.select(selectProject)),
      filter(([, project]) => !!project),
      map(() => ProjectActions.saveProject()),
    ),
  );

  playheadUpdate$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.play),
      withLatestFrom(
        this.store.select(selectProject),
        this.store.select(selectTracks),
        this.store.select(selectNotes),
        this.store.select((s: any) => s.project?.isLooping ?? false),
      ),
      switchMap(([, project, tracks, notes, isLooping]) => {
        if (project) {
          this.playback.start(project.bpm, tracks, notes, 0, isLooping).catch(() => {});
        }
        return interval(25).pipe(
          takeUntil(this.actions$.pipe(ofType(ProjectActions.pause, ProjectActions.stop))),
          map(() => {
            const tick = this.playback.getPlayheadTick();
            return ProjectActions.setPlayheadTick({ tick });
          }),
        );
      }),
    ),
  );

  pausePlayback$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.pause),
      switchMap(() => from(this.playback.pause()).pipe(
        map(() => ProjectActions.setPlayheadTick({ tick: this.playback.getPlayheadTick() })),
      )),
    ),
  );

  stopPlayback$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ProjectActions.stop),
      switchMap(() => from(this.playback.stop()).pipe(
        map(() => ProjectActions.setPlayheadTick({ tick: 0 })),
      )),
    ),
  );
}
