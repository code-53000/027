import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase } from 'idb';
import { PianoRollDB, DB_NAME, DB_VERSION } from './db.schema';
import { ProjectFull } from '@app/app/models/project.model';

@Injectable({ providedIn: 'root' })
export class PersistenceService {
  private db: IDBPDatabase<PianoRollDB> | null = null;

  private async getDb(): Promise<IDBPDatabase<PianoRollDB>> {
    if (!this.db) {
      this.db = await openDB<PianoRollDB>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          db.createObjectStore('projects', { keyPath: 'id' });
          const trackStore = db.createObjectStore('tracks', { keyPath: 'id' });
          trackStore.createIndex('by-project', 'projectId');
          const noteStore = db.createObjectStore('notes', { keyPath: 'id' });
          noteStore.createIndex('by-track', 'trackId');
        },
      });
    }
    return this.db;
  }

  async save(data: ProjectFull): Promise<void> {
    const db = await this.getDb();
    const tx = db.transaction(['projects', 'tracks', 'notes'], 'readwrite');
    await tx.objectStore('projects').put(data.project);
    for (const track of data.tracks) {
      await tx.objectStore('tracks').put(track);
    }
    const noteStore = tx.objectStore('notes');
    const trackIds = new Set(data.tracks.map(t => t.id));
    let cursor = await noteStore.index('by-track').openCursor();
    while (cursor) {
      if (!trackIds.has(cursor.value.trackId)) {
        await cursor.delete();
      }
      cursor = await cursor.continue();
    }
    for (const note of data.notes) {
      await noteStore.put(note);
    }
    await tx.done;
  }

  async load(projectId: string): Promise<ProjectFull | null> {
    const db = await this.getDb();
    const project = await db.get('projects', projectId);
    if (!project) return null;
    const tracks = await db.getAllFromIndex('tracks', 'by-project', projectId);
    const allNotes: PianoRollDB['notes']['value'][] = [];
    for (const track of tracks) {
      const notes = await db.getAllFromIndex('notes', 'by-track', track.id);
      allNotes.push(...notes);
    }
    return { project: project as any, tracks: tracks as any[], notes: allNotes as any[] };
  }

  async listProjects(): Promise<PianoRollDB['projects']['value'][]> {
    const db = await this.getDb();
    return db.getAll('projects');
  }

  async deleteProject(projectId: string): Promise<void> {
    const db = await this.getDb();
    const tracks = await db.getAllFromIndex('tracks', 'by-project', projectId);
    const tx = db.transaction(['projects', 'tracks', 'notes'], 'readwrite');
    await tx.objectStore('projects').delete(projectId);
    for (const track of tracks) {
      await tx.objectStore('tracks').delete(track.id);
      const notes = await tx.objectStore('notes').index('by-track').getAllKeys(track.id);
      for (const key of notes) {
        await tx.objectStore('notes').delete(key);
      }
    }
    await tx.done;
  }
}
