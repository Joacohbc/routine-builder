import { useState, useEffect, useCallback } from 'react';
import { dbPromise } from '../lib/db';
import type { Exercise } from '../types';

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExercises = useCallback(async () => {
    try {
      const db = await dbPromise;
      const allExercises = await db.getAll('exercises');
      
      // Hydrate blob URLs for persisted media
      const hydrated = allExercises.map(ex => ({
        ...ex,
        media: ex.media.map(m => {
          if (m.blob && (m.type === 'image' || m.type === 'video')) {
            return { ...m, url: URL.createObjectURL(m.blob) };
          }
          return m;
        })
      }));

      setExercises(hydrated);
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExercises();
    // Cleanup function could go here but tricky with global state
  }, [fetchExercises]);

  const addExercise = async (exercise: Omit<Exercise, 'id'>) => {
    const db = await dbPromise;
    await db.add('exercises', exercise as Exercise);
    await fetchExercises();
  };

  const updateExercise = async (exercise: Exercise) => {
    if (!exercise.id) return;
    const db = await dbPromise;
    await db.put('exercises', exercise);
    await fetchExercises();
  };

  const deleteExercise = async (id: number) => {
    const db = await dbPromise;
    await db.delete('exercises', id);
    await fetchExercises();
  };

  return { exercises, loading, addExercise, updateExercise, deleteExercise, refresh: fetchExercises };
}
