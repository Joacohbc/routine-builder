import { dbPromise, DB_TABLES } from './db';
import type { Routine, Tag } from '@/types';
import type { DehydratedInventoryItem, DehydratedExercise } from './db';

// This interface matches the "dehydrated" structure stored in the database.
// Application code normally hydrates these, but for backup/restore we need
// the raw data as it is stored in IndexedDB.
interface BackupData {
  version: number;
  timestamp: string;
  data: {
    inventory: DehydratedInventoryItem[];
    exercises: DehydratedExercise[];
    routines: Routine[];
    tags: Tag[];
  };
}

const BACKUP_VERSION = 1;

/**
 * Exports all data from the database as a JSON file download.
 */
export async function exportData(): Promise<void> {
  const db = await dbPromise;

  // Fetch all data from stores
  const [inventory, exercises, routines, tags] = await Promise.all([
    db.getAll(DB_TABLES.INVENTORY),
    db.getAll(DB_TABLES.EXERCISES),
    db.getAll(DB_TABLES.ROUTINES),
    db.getAll(DB_TABLES.TAGS),
  ]);

  const backup: BackupData = {
    version: BACKUP_VERSION,
    timestamp: new Date().toISOString(),
    data: {
      inventory,
      exercises,
      routines,
      tags,
    },
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `lavender-focus-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Imports data from a JSON file, replacing the current database content.
 * @param file The backup file to import
 */
export async function importData(file: File): Promise<void> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const backup: BackupData = JSON.parse(content);

        // Basic validation
        if (!backup.data || !backup.version) {
          throw new Error('Invalid backup file format');
        }

        const db = await dbPromise;
        const tx = db.transaction(
          [DB_TABLES.INVENTORY, DB_TABLES.EXERCISES, DB_TABLES.ROUTINES, DB_TABLES.TAGS],
          'readwrite'
        );

        // Clear existing data
        await Promise.all([
          tx.objectStore(DB_TABLES.INVENTORY).clear(),
          tx.objectStore(DB_TABLES.EXERCISES).clear(),
          tx.objectStore(DB_TABLES.ROUTINES).clear(),
          tx.objectStore(DB_TABLES.TAGS).clear(),
        ]);

        // Restore data
        const restorePromises: Promise<unknown>[] = [];

        // We use 'put' to insert or update. Since we cleared, it's an insert.
        // Importantly, the items in the backup should have their 'id' preserved.
        // If the store is autoIncrement, providing the key in 'put' (or as part of the value if keyPath is used)
        // will update the generator.

        for (const item of backup.data.inventory) {
          restorePromises.push(tx.objectStore(DB_TABLES.INVENTORY).put(item));
        }
        for (const item of backup.data.exercises) {
          restorePromises.push(tx.objectStore(DB_TABLES.EXERCISES).put(item));
        }
        for (const item of backup.data.routines) {
          restorePromises.push(tx.objectStore(DB_TABLES.ROUTINES).put(item));
        }
        for (const item of backup.data.tags) {
          restorePromises.push(tx.objectStore(DB_TABLES.TAGS).put(item));
        }

        await Promise.all(restorePromises);
        await tx.done;

        resolve();
      } catch (err) {
        console.error('Import failed:', err);
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
