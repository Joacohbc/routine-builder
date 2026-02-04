import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { InventoryItem, Exercise, Routine, Tag } from '@/types';

interface StitchDB extends DBSchema {
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
    color: string;
    indexes: { 'by-name': string };
  };
}

const DB_NAME = 'routine-db';
const DB_VERSION = 1;

export const initDB = async (): Promise<IDBPDatabase<StitchDB>> => {
  return openDB<StitchDB>(DB_NAME, DB_VERSION, {
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
        tagStore.createIndex('by-name', 'name', { unique: true });
      }
    },
  });
};

export const dbPromise = initDB();
