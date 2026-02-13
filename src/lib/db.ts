import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { InventoryItem, Exercise, Routine, Tag } from '@/types';
import { ALL_MUSCLES, MUSCLE_COLORS } from '@/lib/typesMuscle';

// Dehydrated types (as stored in IndexedDB)
export type DehydratedInventoryItem = Omit<InventoryItem, 'tags'> & { tagIds?: number[] };
export type DehydratedExercise = Omit<Exercise, 'tags' | 'primaryEquipment'> & { tagIds?: number[]; primaryEquipmentIds?: number[] };

/**
 * Build the full list of system muscle tags to seed into the DB.
 * Each muscle gets a tag with its predefined color.
 */
function buildMuscleSystemTags(): Omit<Tag, 'id'>[] {
  const muscleTags: Omit<Tag, 'id'>[] = [];

  for (const muscle of ALL_MUSCLES) {
    muscleTags.push({
      name: muscle,
      color: MUSCLE_COLORS[muscle],
      type: 'muscle',
      system: true,
    });
  }

  return muscleTags;
}

interface RoutineDB extends DBSchema {
  inventory: {
    key: number;
    value: DehydratedInventoryItem;
    indexes: { 'by-status': string };
  };
  exercises: {
    key: number;
    value: DehydratedExercise;
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

export const DB_TABLES = Object.freeze({
  INVENTORY: 'inventory',
  EXERCISES: 'exercises',
  ROUTINES: 'routines',
  TAGS: 'tags',
});

export const dbPromise = initDB();
