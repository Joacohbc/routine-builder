import { useState, useEffect, useCallback } from 'react';
import {
  dbPromise,
  DB_TABLES,
  type DehydratedExercise,
  type DehydratedInventoryItem,
} from '@/lib/db';
import { validateSchema, exerciseValidators } from '@/lib/validations';
import type { Exercise, Tag, InventoryItem } from '@/types';

const fetchExercises = async (): Promise<Exercise[]> => {
  try {
    const db = await dbPromise;
    const [allExercises, allTags, allInventory] = await Promise.all([
      db.getAll(DB_TABLES.EXERCISES),
      db.getAll(DB_TABLES.TAGS),
      db.getAll(DB_TABLES.INVENTORY),
    ]);

    // Hydrate tags and equipment
    const hydratedExercises = allExercises.map((ex: DehydratedExercise) => ({
      ...ex,
      tags: (ex.tagIds || [])
        .map((id: number) => allTags.find((t: Tag) => t.id === id))
        .filter(Boolean) as Tag[],
      primaryEquipment: (ex.primaryEquipmentIds || [])
        .map((id: number) => allInventory.find((i: DehydratedInventoryItem) => i.id === id))
        .filter(Boolean) as InventoryItem[],
    }));

    return hydratedExercises;
  } catch (error) {
    console.error('Failed to fetch exercises:', error);
    throw error;
  }
};

const addExercise = async (exercise: Omit<Exercise, 'id'>) => {
  const errors = validateSchema(exercise, exerciseValidators);
  if (Object.keys(errors).length > 0) throw errors;

  const db = await dbPromise;
  // Dehydrate for storage
  const { tags, primaryEquipment, ...exWithoutRelations } = exercise;
  const exToSave = {
    ...exWithoutRelations,
    tagIds: (tags || []).map((t) => t.id).filter(Boolean) as number[],
    primaryEquipmentIds: (primaryEquipment || []).map((i) => i.id).filter(Boolean) as number[],
  };

  const id = await db.add(DB_TABLES.EXERCISES, exToSave);
  return id;
};

const updateExercise = async (exercise: Exercise) => {
  if (!exercise.id) return;

  const errors = validateSchema(exercise, exerciseValidators);
  if (Object.keys(errors).length > 0) throw errors;

  const db = await dbPromise;
  // Dehydrate for storage
  const { tags, primaryEquipment, ...exWithoutRelations } = exercise;
  const exToSave = {
    ...exWithoutRelations,
    tagIds: (tags || []).map((t) => t.id).filter(Boolean) as number[],
    primaryEquipmentIds: (primaryEquipment || []).map((i) => i.id).filter(Boolean) as number[],
  };

  await db.put(DB_TABLES.EXERCISES, exToSave);
};

const deleteExercise = async (id: number) => {
  const db = await dbPromise;
  await db.delete(DB_TABLES.EXERCISES, id);
};

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const hydratedExercises = await fetchExercises();
      setExercises(hydratedExercises);
    } catch (error) {
      console.error('Failed to fetch exercises:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onAddExercise = useCallback(
    async (exercise: Omit<Exercise, 'id'>) => {
      const id = await addExercise(exercise);
      await refresh();
      return id;
    },
    [refresh]
  );

  const onUpdateExercise = useCallback(
    async (exercise: Exercise) => {
      await updateExercise(exercise);
      await refresh();
    },
    [refresh]
  );

  const onDeleteExercise = useCallback(
    async (id: number) => {
      await deleteExercise(id);
      await refresh();
    },
    [refresh]
  );

  return {
    exercises,
    loading,
    addExercise: onAddExercise,
    updateExercise: onUpdateExercise,
    deleteExercise: onDeleteExercise,
    refresh,
  };
}
