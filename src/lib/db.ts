import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { InventoryItem, Exercise, Routine, Tag } from '@/types';
import { 
  ALL_MUSCLES, 
  MUSCLE_COLORS, 
  ALL_PURPOSES, 
  PURPOSE_COLORS, 
  ALL_DIFFICULTIES, 
  DIFFICULTY_COLORS 
} from '@/lib/systemTags';

// Dehydrated types (as stored in IndexedDB)
export type DehydratedInventoryItem = Omit<InventoryItem, 'tags'> & { tagIds?: number[] };
export type DehydratedExercise = Omit<Exercise, 'tags' | 'primaryEquipment'> & { tagIds?: number[]; primaryEquipmentIds?: number[] };

/**
 * Build the full list of system tags to seed into the DB.
 * Includes muscles, exercise purposes, and difficulty levels.
 */
export function buildSystemTags(): Omit<Tag, 'id'>[] {
  const systemTags: Omit<Tag, 'id'>[] = [];

  // Muscle tags
  for (const muscle of ALL_MUSCLES) {
    systemTags.push({
      name: muscle,
      color: MUSCLE_COLORS[muscle],
      type: 'muscle',
      system: true,
    });
  }

  // Exercise purpose tags
  for (const purpose of ALL_PURPOSES) {
    systemTags.push({
      name: purpose,
      color: PURPOSE_COLORS[purpose],
      type: 'purpose',
      system: true,
    });
  }

  // Difficulty level tags
  for (const difficulty of ALL_DIFFICULTIES) {
    systemTags.push({
      name: difficulty,
      color: DIFFICULTY_COLORS[difficulty],
      type: 'difficulty',
      system: true,
    });
  }

  return systemTags;
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

        // Seed system tags on fresh install
        const systemTags = buildSystemTags();
        for (const tag of systemTags) {
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
