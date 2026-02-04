import { useState, useEffect, useCallback } from 'react';
import { dbPromise } from '@/lib/db';
import { validateSchema, routineValidators } from '@/lib/validations';
import type { Routine } from '@/types';

export function useRoutines() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRoutines = useCallback(async () => {
    try {
      const db = await dbPromise;
      const allRoutines = await db.getAll('routines');
      setRoutines(allRoutines);
    } catch (error) {
      console.error('Failed to fetch routines:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoutines();
  }, [fetchRoutines]);

  const addRoutine = async (routine: Omit<Routine, 'id'>) => {
    const errors = validateSchema(routine, routineValidators);
    if (Object.keys(errors).length > 0) throw errors;

    const db = await dbPromise;
    const id = await db.add('routines', routine as Routine);
    await fetchRoutines();
    return id;
  };

  const updateRoutine = async (routine: Routine) => {
    if (!routine.id) return;

    const errors = validateSchema(routine, routineValidators);
    if (Object.keys(errors).length > 0) throw errors;

    const db = await dbPromise;
    await db.put('routines', routine);
    await fetchRoutines();
  };

  const deleteRoutine = async (id: number) => {
    const db = await dbPromise;
    await db.delete('routines', id);
    await fetchRoutines();
  };

  return { routines, loading, addRoutine, updateRoutine, deleteRoutine, refresh: fetchRoutines };
}
