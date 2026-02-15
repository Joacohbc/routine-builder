import { useState, useEffect, useCallback } from 'react';
import {
  dbPromise,
  DB_TABLES,
  buildSystemTags,
  type DehydratedInventoryItem,
  type DehydratedExercise,
} from '@/lib/db';
import { validateSchema, tagValidators } from '@/lib/validations';
import type { Tag } from '@/types';
import { useTranslation } from 'react-i18next';

export const TAG_COLORS = [
  // Reds
  '#ef4444', // red-500
  '#dc2626', // red-600
  '#f87171', // red-400

  // Oranges
  '#f97316', // orange-500
  '#ea580c', // orange-600
  '#fb923c', // orange-400

  // Ambers/Yellows
  '#f59e0b', // amber-500
  '#eab308', // yellow-500
  '#fbbf24', // amber-400

  // Limes/Greens
  '#84cc16', // lime-500
  '#22c55e', // green-500
  '#10b981', // emerald-500
  '#14b8a6', // teal-500
  '#16a34a', // green-600
  '#65a30d', // lime-600

  // Cyans/Blues
  '#06b6d4', // cyan-500
  '#0ea5e9', // sky-500
  '#3b82f6', // blue-500
  '#2563eb', // blue-600
  '#1d4ed8', // blue-700
  '#0891b2', // cyan-600

  // Indigos/Purples
  '#6366f1', // indigo-500
  '#8b5cf6', // violet-500
  '#a855f7', // purple-500
  '#5b21b6', // violet-800
  '#7c3aed', // violet-600

  // Pinks/Fuchsias
  '#d946ef', // fuchsia-500
  '#ec4899', // pink-500
  '#db2777', // pink-600
  '#f472b6', // pink-400

  // Neutrals
  '#64748b', // slate-500
  '#6b7280', // gray-500
  '#78716c', // stone-500
  '#737373', // neutral-500
  '#475569', // slate-600
  '#4b5563', // gray-600
];

const fetchTags = async (): Promise<Tag[]> => {
  try {
    const db = await dbPromise;
    const allTags = await db.getAll(DB_TABLES.TAGS);
    return allTags;
  } catch (error) {
    console.error('Failed to fetch tags:', error);
    throw error;
  }
};

type TagCreation = Omit<Tag, 'id' | 'system' | 'type'>;
const addTag = async (tags: Tag[], tag: TagCreation) => {
  // User-created tags are never system tags
  const userTag: Omit<Tag, 'id'> = { ...tag, system: false, type: 'custom' };

  // Check validations and uniqueness
  const errors = validateSchema(userTag, tagValidators);
  if (tags.some((t) => t.name.toLowerCase() === userTag.name.toLowerCase())) {
    errors['name'] = { key: 'validations.uniqueName' };
  }

  if (Object.keys(errors).length > 0) {
    throw errors;
  }

  // Assign a random color if not provided
  if (!userTag.color) {
    userTag.color = TAG_COLORS[Math.floor(Math.random() * TAG_COLORS.length)];
  }

  const db = await dbPromise;
  const id = await db.add(DB_TABLES.TAGS, userTag as Tag);
  return id;
};

type TagUpdate = Omit<Tag, 'system' | 'type'>;
const updateTag = async (tags: Tag[], tag: TagUpdate) => {
  if (!tag.id) return;

  // System tags cannot be modified by the user
  const existing = tags.find((t) => t.id === tag.id);
  if (existing?.system) {
    throw { key: 'validations.systemTagProtected' };
  }

  const errors = validateSchema(tag, tagValidators);

  // Check uniqueness
  if (tags.some((t) => t.id !== tag.id && t.name.toLowerCase() === tag.name.toLowerCase())) {
    errors['name'] = { key: 'validations.uniqueName' };
  }

  if (Object.keys(errors).length > 0) {
    throw errors;
  }

  const db = await dbPromise;
  await db.put(DB_TABLES.TAGS, { ...existing, name: tag.name, color: tag.color } as Tag);
};

const deleteTag = async (tags: Tag[], id: number) => {
  // System tags cannot be deleted
  const existing = tags.find((t) => t.id === id);
  if (existing?.system) {
    throw { key: 'validations.systemTagProtected' };
  }

  const db = await dbPromise;
  const tx = db.transaction(
    [DB_TABLES.TAGS, DB_TABLES.INVENTORY, DB_TABLES.EXERCISES],
    'readwrite'
  );

  // 1. Delete the tag
  await tx.objectStore(DB_TABLES.TAGS).delete(id);

  // 2. Remove tagId from Inventory Items
  let cursor = await tx.objectStore(DB_TABLES.INVENTORY).openCursor();
  while (cursor) {
    const item = cursor.value as DehydratedInventoryItem;

    if (item.tagIds && item.tagIds.includes(id)) {
      item.tagIds = item.tagIds.filter((tid: number) => tid !== id);
      await cursor.update(item);
    }
    cursor = await cursor.continue();
  }

  // 3. Remove tagId from Exercises
  let exCursor = await tx.objectStore(DB_TABLES.EXERCISES).openCursor();
  while (exCursor) {
    const exercise = exCursor.value as DehydratedExercise;

    if (exercise.tagIds && exercise.tagIds.includes(id)) {
      exercise.tagIds = exercise.tagIds.filter((tid: number) => tid !== id);
      await exCursor.update(exercise);
    }
    exCursor = await exCursor.continue();
  }

  await tx.done;
};

/**
 * Restore/update all system tags to their default values.
 * This will delete existing system tags and recreate them from scratch.
 */
const restoreSystemTags = async () => {
  const db = await dbPromise;
  const tx = db.transaction([DB_TABLES.TAGS], 'readwrite');
  const store = tx.objectStore(DB_TABLES.TAGS);

  // 1. Delete all existing system tags
  const allTags = await store.getAll();
  for (const tag of allTags) {
    if (tag.system) {
      await store.delete(tag.id!);
    }
  }

  // 2. Re-create system tags with default values
  const systemTags = buildSystemTags();
  for (const tag of systemTags) {
    await store.add(tag as Tag);
  }

  await tx.done;
};

/**
 * Delete all system tags.
 * Warning: This will remove all default muscle, purpose, and difficulty tags.
 */
const deleteAllSystemTags = async () => {
  const db = await dbPromise;
  const tx = db.transaction(
    [DB_TABLES.TAGS, DB_TABLES.INVENTORY, DB_TABLES.EXERCISES],
    'readwrite'
  );
  const tagStore = tx.objectStore(DB_TABLES.TAGS);

  // Get all system tags
  const allTags = await tagStore.getAll();
  const systemTagIds = allTags.filter((tag) => tag.system).map((tag) => tag.id!);

  // 1. Delete all system tags
  for (const id of systemTagIds) {
    await tagStore.delete(id);
  }

  // 2. Remove system tag IDs from Inventory Items
  let cursor = await tx.objectStore(DB_TABLES.INVENTORY).openCursor();
  while (cursor) {
    const item = cursor.value as DehydratedInventoryItem;

    if (item.tagIds) {
      const updatedTagIds = item.tagIds.filter((tid: number) => !systemTagIds.includes(tid));
      if (updatedTagIds.length !== item.tagIds.length) {
        item.tagIds = updatedTagIds;
        await cursor.update(item);
      }
    }
    cursor = await cursor.continue();
  }

  // 3. Remove system tag IDs from Exercises
  let exCursor = await tx.objectStore(DB_TABLES.EXERCISES).openCursor();
  while (exCursor) {
    const exercise = exCursor.value as DehydratedExercise;

    if (exercise.tagIds) {
      const updatedTagIds = exercise.tagIds.filter((tid: number) => !systemTagIds.includes(tid));
      if (updatedTagIds.length !== exercise.tagIds.length) {
        exercise.tagIds = updatedTagIds;
        await exCursor.update(exercise);
      }
    }
    exCursor = await exCursor.continue();
  }

  await tx.done;
};

export function useTags() {
  const { t } = useTranslation();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  const formatTagName = useCallback(
    (tag: Tag) => {
      if (!tag.system) return tag.name;

      // Map tag type to translation key
      const translationKey =
        tag.type === 'muscle'
          ? `exercise.muscles.${tag.name}`
          : tag.type === 'purpose'
            ? `exercise.purposes.${tag.name}`
            : tag.type === 'difficulty'
              ? `exercise.difficulties.${tag.name}`
              : tag.name;

      return t(translationKey, tag.name);
    },
    [t]
  );

  const refresh = useCallback(async () => {
    try {
      const fetchedTags = await fetchTags();
      setTags(fetchedTags.map((tag) => ({ ...tag, name: formatTagName(tag) })));
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    } finally {
      setLoading(false);
    }
  }, [formatTagName]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onAddTag = useCallback(
    async (tag: TagCreation) => {
      await addTag(tags, tag);
      await refresh();
    },
    [tags, refresh]
  );

  const onUpdateTag = useCallback(
    async (tag: TagUpdate) => {
      await updateTag(tags, tag);
      await refresh();
    },
    [tags, refresh]
  );

  const onDeleteTag = useCallback(
    async (id: number) => {
      await deleteTag(tags, id);
      await refresh();
    },
    [tags, refresh]
  );

  const onRestoreSystemTags = useCallback(async () => {
    await restoreSystemTags();
    await refresh();
  }, [refresh]);

  const onDeleteAllSystemTags = useCallback(async () => {
    await deleteAllSystemTags();
    await refresh();
  }, [refresh]);

  return {
    tags,
    loading,
    addTag: onAddTag,
    updateTag: onUpdateTag,
    deleteTag: onDeleteTag,
    restoreSystemTags: onRestoreSystemTags,
    deleteAllSystemTags: onDeleteAllSystemTags,
    refresh,
    formatTagName,
  };
}
