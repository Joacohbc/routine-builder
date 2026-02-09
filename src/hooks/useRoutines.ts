import { useState, useEffect, useCallback } from 'react';
import { dbPromise, DB_TABLES } from '@/lib/db';
import { validateSchema, routineValidators } from '@/lib/validations';
import type { Routine } from '@/types';

const fetchRoutines = async (): Promise<Routine[]> => {
  try {
    const db = await dbPromise;
    const allRoutines = await db.getAll(DB_TABLES.ROUTINES);
    return allRoutines;
  } catch (error) {
    console.error('Failed to fetch routines:', error);
    throw error;
  }
};

const addRoutine = async (routine: Omit<Routine, 'id'>) => {
  const errors = validateSchema(routine, routineValidators);
  if (Object.keys(errors).length > 0) throw errors;

  const db = await dbPromise;
  const id = await db.add(DB_TABLES.ROUTINES, routine as Routine);
  return id;
};

const updateRoutine = async (routine: Routine) => {
  if (!routine.id) return;

  const errors = validateSchema(routine, routineValidators);
  if (Object.keys(errors).length > 0) throw errors;

  const db = await dbPromise;
  await db.put(DB_TABLES.ROUTINES, routine);
};

const deleteRoutine = async (id: number) => {
  const db = await dbPromise;
  await db.delete(DB_TABLES.ROUTINES, id);
};

export function useRoutines() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const allRoutines = await fetchRoutines();
      setRoutines(allRoutines);
    } catch (error) {
      console.error('Failed to fetch routines:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onAddRoutine = useCallback(async (routine: Omit<Routine, 'id'>) => {
    const id = await addRoutine(routine);
    await refresh();
    return id;
  }, [refresh]);

  const onUpdateRoutine = useCallback(async (routine: Routine) => {
    await updateRoutine(routine);
    await refresh();
  }, [refresh]);

  const onDeleteRoutine = useCallback(async (id: number) => {
    await deleteRoutine(id);
    await refresh();
  }, [refresh]);

  return { 
    routines, 
    loading, 
    addRoutine: onAddRoutine, 
    updateRoutine: onUpdateRoutine, 
    deleteRoutine: onDeleteRoutine, 
    refresh 
  };
}
