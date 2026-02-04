import { useState, useEffect, useCallback } from 'react';
import { dbPromise } from '@/lib/db';
import { validateSchema, tagValidators } from '@/lib/validations';
import type { Tag } from '@/types';

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

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTags = useCallback(async () => {
    try {
      const db = await dbPromise;
      const allTags = await db.getAll('tags');
      setTags(allTags);
    } catch (error) {
      console.error('Failed to fetch tags:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const addTag = async (tag: Omit<Tag, 'id'>) => {
    const errors = validateSchema(tag, tagValidators);

    // Check uniqueness
    if (tags.some(t => t.name.toLowerCase() === tag.name.toLowerCase())) {
        errors['name'] = { key: 'validations.uniqueName' };
    }

    if (Object.keys(errors).length > 0) throw errors;

    const db = await dbPromise;
    const id = await db.add('tags', tag as Tag);
    await fetchTags();
    return id;
  };

  const updateTag = async (tag: Tag) => {
    if (!tag.id) return;

    const errors = validateSchema(tag, tagValidators);

    // Check uniqueness
    if (tags.some(t => t.id !== tag.id && t.name.toLowerCase() === tag.name.toLowerCase())) {
        errors['name'] = { key: 'validations.uniqueName' };
    }

    if (Object.keys(errors).length > 0) throw errors;

    const db = await dbPromise;
    await db.put('tags', tag);
    await fetchTags();
  };

  const deleteTag = async (id: number) => {
    const db = await dbPromise;
    const tx = db.transaction(['tags', 'inventory', 'exercises'], 'readwrite');
    
    // 1. Delete the tag
    await tx.objectStore('tags').delete(id);

    // 2. Remove tagId from Inventory Items
    let cursor = await tx.objectStore('inventory').openCursor();
    while (cursor) {
      const item = cursor.value;
      if (item.tagIds && item.tagIds.includes(id)) {
        item.tagIds = item.tagIds.filter(tId => tId !== id);
        await cursor.update(item);
      }
      cursor = await cursor.continue();
    }

    // 3. Remove tagId from Exercises
    let exCursor = await tx.objectStore('exercises').openCursor();
    while (exCursor) {
      const exercise = exCursor.value;
      if (exercise.tagIds && exercise.tagIds.includes(id)) {
        exercise.tagIds = exercise.tagIds.filter(tId => tId !== id);
        await exCursor.update(exercise);
      }
      exCursor = await exCursor.continue();
    }
    
    await tx.done;
    await fetchTags();
  };

  return { tags, loading, addTag, updateTag, deleteTag, refresh: fetchTags };
}
