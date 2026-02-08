import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { InventoryItem, Exercise, Routine, Tag } from '@/types';
import type { Muscle, MuscleGroup } from '@/types';
import { MUSCLES_BY_GROUP, MUSCLE_GROUP_COLORS } from '@/lib/typesMuscle';

/**
 * Build the full list of system muscle tags to seed into the DB.
 * Each Muscle gets a tag whose `type` is its parent MuscleGroup,
 * enabling group-based filtering without extra fields.
 */
function buildMuscleSystemTags(): Omit<Tag, 'id'>[] {
  const muscleTags: Omit<Tag, 'id'>[] = [];

  // Build a reverse lookup: muscle -> group
  const muscleToGroup = new Map<Muscle, MuscleGroup>();
  for (const [group, muscles] of Object.entries(MUSCLES_BY_GROUP) as [MuscleGroup, Muscle[]][]) {
    for (const muscle of muscles) {
      muscleToGroup.set(muscle, group);
    }
  }

  for (const [muscle, group] of muscleToGroup.entries()) {
    muscleTags.push({
      name: muscle,
      color: MUSCLE_GROUP_COLORS[group],
      type: group,
      system: true,
    });
  }

  return muscleTags;
}

interface RoutineDB extends DBSchema {
  inventory: {
    key: number;
    value: InventoryItem;
    indexes: { 'by-status': string };
  };
  exercises: {
    key: number;
    value: Exercise;
  };
  routines: {
    key: number;
    value: Routine;
  };
  tags: {
    key: number;
    value: Tag;
    indexes: {
      'by-name': string;
    };
  };
}

const DB_NAME = 'routine-db';
const DB_VERSION = 1;

export const initDB = async (): Promise<IDBPDatabase<RoutineDB>> => {
  return openDB<RoutineDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('inventory')) {
        const store = db.createObjectStore('inventory', { keyPath: 'id', autoIncrement: true });
        store.createIndex('by-status', 'status');
      }

      if (!db.objectStoreNames.contains('exercises')) {
        db.createObjectStore('exercises', { keyPath: 'id', autoIncrement: true });
      }

      if (!db.objectStoreNames.contains('routines')) {
        db.createObjectStore('routines', { keyPath: 'id', autoIncrement: true });
      }

      if (!db.objectStoreNames.contains('tags')) {
        const tagStore = db.createObjectStore('tags', { keyPath: 'id', autoIncrement: true });
        tagStore.createIndex('by-name', 'name', { unique: false });

        // Seed muscle system tags on fresh install
        const muscleTags = buildMuscleSystemTags();
        for (const tag of muscleTags) {
          tagStore.add(tag as Tag);
        }
      }
    },
  });
};

export const dbPromise = initDB();
