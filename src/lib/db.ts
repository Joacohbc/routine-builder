import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { InventoryItem, Exercise, Routine } from '@/types';

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
}

const DB_NAME = 'stitch-db';
const DB_VERSION = 2;

const INITIAL_INVENTORY: InventoryItem[] = [
  { name: 'Hex Dumbbells', icon: 'fitness_center', tags: ['Upper Body', 'Heavy', 'Favorite'], status: 'available', condition: 'good', quantity: 2 },
  { name: 'Adjustable Bench', icon: 'chair_alt', tags: ['Support', 'Compound'], status: 'checked_out', condition: 'worn', quantity: 1 },
  { name: 'Yoga Mats', icon: 'landscape', tags: ['Mobility', 'Floor', 'Favorite'], status: 'available', condition: 'new', quantity: 5 },
  { name: 'Kettlebells (16kg)', icon: 'shopping_bag', tags: ['Dynamic', 'Heavy'], status: 'maintenance', condition: 'poor', quantity: 4 },
  { name: 'Resistance Bands', icon: 'all_inclusive', tags: ['Accessory', 'Warm-up'], status: 'available', condition: 'good', quantity: 8 },
];

export const initDB = async (): Promise<IDBPDatabase<StitchDB>> => {
  return openDB<StitchDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('inventory')) {
        const store = db.createObjectStore('inventory', { keyPath: 'id', autoIncrement: true });
        store.createIndex('by-status', 'status');
        
        // Seed data
        INITIAL_INVENTORY.forEach(item => store.add(item));
      }
      if (!db.objectStoreNames.contains('exercises')) {
        db.createObjectStore('exercises', { keyPath: 'id', autoIncrement: true });
      }
      if (!db.objectStoreNames.contains('routines')) {
        db.createObjectStore('routines', { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

export const dbPromise = initDB();
