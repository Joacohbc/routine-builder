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
    indexes: { 'by-name': string };
  };
}

const DB_NAME = 'routine-db';
const DB_VERSION = 1;

const INITIAL_TAGS: Tag[] = [
  { name: 'Chest', color: '#ef4444' },
  { name: 'Back', color: '#3b82f6' },
  { name: 'Legs', color: '#10b981' },
  { name: 'Shoulders', color: '#f59e0b' },
  { name: 'Heavy', color: '#6366f1' },
  { name: 'Favorite', color: '#ec4899' },
  { name: 'Mobility', color: '#8b5cf6' },
];

const INITIAL_INVENTORY: InventoryItem[] = [
  { name: 'Hex Dumbbells', icon: 'fitness_center', tagIds: [5, 6], status: 'available', condition: 'good', quantity: 2 },
  { name: 'Adjustable Bench', icon: 'chair_alt', tagIds: [1, 2], status: 'checked_out', condition: 'worn', quantity: 1 },
  { name: 'Yoga Mats', icon: 'landscape', tagIds: [7, 6], status: 'available', condition: 'new', quantity: 5 },
  { name: 'Kettlebells (16kg)', icon: 'shopping_bag', tagIds: [5], status: 'maintenance', condition: 'poor', quantity: 4 },
  { name: 'Resistance Bands', icon: 'all_inclusive', tagIds: [7], status: 'available', condition: 'good', quantity: 8 },
];

export const initDB = async (): Promise<IDBPDatabase<StitchDB>> => {
  return openDB<StitchDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('inventory')) {
        const store = db.createObjectStore('inventory', { keyPath: 'id', autoIncrement: true });
        store.createIndex('by-status', 'status');
        INITIAL_INVENTORY.forEach(item => store.add(item));
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
        INITIAL_TAGS.forEach(tag => tagStore.add(tag));
      }
    },
  });
};

export const dbPromise = initDB();
