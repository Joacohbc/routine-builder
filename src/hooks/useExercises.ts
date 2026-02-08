import { useState, useEffect, useCallback } from 'react';
import { dbPromise } from '@/lib/db';
import { validateSchema, exerciseValidators } from '@/lib/validations';
import type { Exercise, Tag, InventoryItem } from '@/types';

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExercises = useCallback(async () => {
    try {
      const db = await dbPromise;
      const [allExercises, allTags, allInventory] = await Promise.all([
        db.getAll('exercises'),
        db.getAll('tags'),
        db.getAll('inventory')
      ]);
      
      // Hydrate tags and equipment
      const hydratedExercises = allExercises.map((ex: any) => ({
        ...ex,
        tags: ex.tags || (ex.tagIds || []).map((id: number) => allTags.find((t: Tag) => t.id === id)).filter(Boolean) as Tag[],
        primaryEquipment: ex.primaryEquipment || (ex.primaryEquipmentIds || []).map((id: number) => allInventory.find((i: InventoryItem) => i.id === id)).filter(Boolean) as InventoryItem[]
      }));

      setExercises(hydratedExercises);
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
    const errors = validateSchema(exercise, exerciseValidators);
    if (Object.keys(errors).length > 0) throw errors;

    const db = await dbPromise;
    // Dehydrate for storage
    const exToSave = {
        ...exercise,
        tagIds: (exercise.tags || []).map(t => t.id).filter(Boolean) as number[],
        primaryEquipmentIds: (exercise.primaryEquipment || []).map(i => i.id).filter(Boolean) as number[]
    };
    // @ts-ignore
    delete exToSave.tags;
    // @ts-ignore
    delete exToSave.primaryEquipment;

    await db.add('exercises', exToSave as any);
    await fetchExercises();
  };

  const updateExercise = async (exercise: Exercise) => {
    if (!exercise.id) return;

    const errors = validateSchema(exercise, exerciseValidators);
    if (Object.keys(errors).length > 0) throw errors;

    const db = await dbPromise;
    // Dehydrate for storage
    const exToSave = {
        ...exercise,
        tagIds: (exercise.tags || []).map(t => t.id).filter(Boolean) as number[],
        primaryEquipmentIds: (exercise.primaryEquipment || []).map(i => i.id).filter(Boolean) as number[]
    };
    // @ts-ignore
    delete exToSave.tags;
    // @ts-ignore
    delete exToSave.primaryEquipment;

    await db.put('exercises', exToSave as any);
    await fetchExercises();
  };

  const deleteExercise = async (id: number) => {
    const db = await dbPromise;
    await db.delete('exercises', id);
    await fetchExercises();
  };

  return { exercises, loading, addExercise, updateExercise, deleteExercise, refresh: fetchExercises };
}
