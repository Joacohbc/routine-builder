import { createContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import {
  dbPromise,
  DB_TABLES,
  type DehydratedExercise,
  type DehydratedInventoryItem,
} from '@/lib/db';
import { validateSchema, exerciseValidators } from '@/lib/validations';
import type { Exercise, Tag, InventoryItem } from '@/types';

interface ExerciseContextType {
  exercises: Exercise[];
  loading: boolean;
  addExercise: (exercise: Omit<Exercise, 'id'>) => Promise<number>;
  updateExercise: (exercise: Exercise) => Promise<void>;
  deleteExercise: (id: number) => Promise<void>;
  refresh: () => Promise<void>;
}

export const ExerciseContext = createContext<ExerciseContextType | null>(null);

const fetchExercisesFromDB = async (): Promise<Exercise[]> => {
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
    })) as Exercise[];

    return hydratedExercises;
  } catch (error) {
    console.error('Failed to fetch exercises:', error);
    throw error;
  }
};

const addExerciseToDB = async (exercise: Omit<Exercise, 'id'>) => {
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

const updateExerciseInDB = async (exercise: Exercise) => {
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

const deleteExerciseFromDB = async (id: number) => {
  const db = await dbPromise;
  await db.delete(DB_TABLES.EXERCISES, id);
};

export function ExerciseProvider({ children }: { children: ReactNode }) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const hydratedExercises = await fetchExercisesFromDB();
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
      const id = await addExerciseToDB(exercise);
      await refresh();
      return id;
    },
    [refresh]
  );

  const onUpdateExercise = useCallback(
    async (exercise: Exercise) => {
      await updateExerciseInDB(exercise);
      await refresh();
    },
    [refresh]
  );

  const onDeleteExercise = useCallback(
    async (id: number) => {
      await deleteExerciseFromDB(id);
      await refresh();
    },
    [refresh]
  );

  const value = useMemo(
    () => ({
      exercises,
      loading,
      addExercise: onAddExercise,
      updateExercise: onUpdateExercise,
      deleteExercise: onDeleteExercise,
      refresh,
    }),
    [exercises, loading, onAddExercise, onUpdateExercise, onDeleteExercise, refresh]
  );

  return <ExerciseContext.Provider value={value}>{children}</ExerciseContext.Provider>;
}
