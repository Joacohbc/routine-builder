import { useState, useEffect, useCallback } from 'react';
import { dbPromise } from '@/lib/db';
import type { Tag } from '@/types';

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
    const db = await dbPromise;
    const id = await db.add('tags', tag as Tag);
    await fetchTags();
    return id;
  };

  const updateTag = async (tag: Tag) => {
    if (!tag.id) return;
    const db = await dbPromise;
    await db.put('tags', tag);
    await fetchTags();
  };

  const deleteTag = async (id: number) => {
    const db = await dbPromise;
    await db.delete('tags', id);
    await fetchTags();
  };

  return { tags, loading, addTag, updateTag, deleteTag, refresh: fetchTags };
}
