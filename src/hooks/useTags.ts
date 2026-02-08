import { useState, useEffect, useCallback } from 'react';
import { dbPromise, DB_TABLES } from '@/lib/db';
import { validateSchema, tagValidators } from '@/lib/validations';
import type { Tag } from '@/types';
import { useTranslation } from 'react-i18next';

export const TAG_COLORS = [
  '#ef4444', // red-500
  '#f97316', // orange-500
  '#f59e0b', // amber-500
  '#84cc16', // lime-500
  '#22c55e', // green-500
  '#10b981', // emerald-500
  '#06b6d4', // cyan-500
  '#0ea5e9', // sky-500
  '#3b82f6', // blue-500
  '#6366f1', // indigo-500
  '#8b5cf6', // violet-500
  '#d946ef', // fuchsia-500
  '#ec4899', // pink-500
  '#64748b', // slate-500
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
}

type TagCreation = Omit<Tag, 'id' | 'system' | 'type'>
const addTag = async (tags: Tag[], tag: TagCreation) => {

  // User-created tags are never system tags
  const userTag: Omit<Tag, 'id'> = { ...tag, system: false, type: 'custom' };
  
  // Check validations and uniqueness
  const errors = validateSchema(userTag, tagValidators);
  if (tags.some(t => t.name.toLowerCase() === userTag.name.toLowerCase())) {
      errors['name'] = { key: 'validations.uniqueName' };
  }
  
  if (Object.keys(errors).length > 0) {
    throw errors
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
  const existing = tags.find(t => t.id === tag.id);
  if (existing?.system) {
    throw { key: 'validations.systemTagProtected' };
  }

  const errors = validateSchema(tag, tagValidators);

  // Check uniqueness
  if (tags.some(t => t.id !== tag.id && t.name.toLowerCase() === tag.name.toLowerCase())) {
      errors['name'] = { key: 'validations.uniqueName' };
  }

  if (Object.keys(errors).length > 0) {
    throw errors;
  };

  const db = await dbPromise;
  await db.put(DB_TABLES.TAGS, { ...existing, name: tag.name, color: tag.color } as Tag);
};

const deleteTag = async (tags: Tag[], id: number) => {
  // System tags cannot be deleted
  const existing = tags.find(t => t.id === id);
  if (existing?.system) {
    throw { key: 'validations.systemTagProtected' };
  }

  const db = await dbPromise;
  const tx = db.transaction([ DB_TABLES.TAGS, DB_TABLES.INVENTORY, DB_TABLES.EXERCISES ], 'readwrite');
  
  // 1. Delete the tag
  await tx.objectStore(DB_TABLES.TAGS).delete(id);

  // 2. Remove tagId from Inventory Items
  let cursor = await tx.objectStore(DB_TABLES.INVENTORY).openCursor();
  while (cursor) {
    const item = cursor.value;
    const tagsIds = item.tags.map((t: Tag) => t.id);

    if (item.tags.length > 0 && tagsIds.includes(id)) {
      item.tags = item.tags.filter((t: Tag) => t.id !== id);
      await cursor.update(item);
    }
    cursor = await cursor.continue();
  }

  // 3. Remove tagId from Exercises
  let exCursor = await tx.objectStore(DB_TABLES.EXERCISES).openCursor();
  while (exCursor) {
    const exercise = exCursor.value;
    const tagsIds = exercise.tags.map((t: Tag) => t.id);
    if (exercise.tags && tagsIds.includes(id)) {
      exercise.tags = exercise.tags.filter((t: Tag) => t.id !== id);
      await exCursor.update(exercise);
    }
    exCursor = await exCursor.continue();
  }
  
  await tx.done;
};

export function useTags() {
  const { t } = useTranslation();
  const [ tags, setTags ] = useState<Tag[]>([]);
  const [ loading, setLoading ] = useState(true);

  const formatTagName = useCallback(
    (tag: Tag) => tag.system ? t('exercise.muscles.' + tag.name, 'No name') : tag.name,
  [ t ]);

  const refresh = useCallback(async () => {
    try {
      const fetchedTags = await fetchTags();
      setTags(fetchedTags.map(tag => ({ ...tag, name: formatTagName(tag) })));
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    } finally {
      setLoading(false);
    }
  }, [formatTagName]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onAddTag = useCallback(async (tag: TagCreation) => {
    await addTag(tags, tag);
    await refresh();
  }, [tags, refresh]);

  const onUpdateTag = useCallback(async (tag: TagUpdate) => {
    await updateTag(tags, tag);
    await refresh();
  }, [tags, refresh]);

  const onDeleteTag = useCallback(async (id: number) => {
    await deleteTag(tags, id);
    await refresh();
  }, [tags, refresh]);

  return { 
    tags, 
    loading, 
    addTag: onAddTag, 
    updateTag: onUpdateTag, 
    deleteTag: onDeleteTag, 
    refresh,
    formatTagName
  };
}
