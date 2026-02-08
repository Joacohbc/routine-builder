import { useState, useEffect, useCallback } from 'react';
import { dbPromise } from '@/lib/db';
import { validateSchema, inventoryValidators } from '@/lib/validations';
import type { InventoryItem, Tag } from '@/types';

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    try {
      const db = await dbPromise;
      const [allItems, allTags] = await Promise.all([
        db.getAll('inventory'),
        db.getAll('tags')
      ]);

      // Hydrate tags - support both old tagIds and new embedded tags structure if any
      const hydratedItems = allItems.map((item: any) => ({
        ...item,
        tags: item.tags || (item.tagIds || []).map((id: number) => allTags.find((t: Tag) => t.id === id)).filter(Boolean) as Tag[]
      }));

      setItems(hydratedItems);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const addItem = async (item: Omit<InventoryItem, 'id'>) => {
    const errors = validateSchema(item, inventoryValidators);
    if (Object.keys(errors).length > 0) throw errors;

    const db = await dbPromise;
    // Dehydrate for storage to keep DB normalized
    const itemToSave = {
        ...item,
        tagIds: (item.tags || []).map(t => t.id).filter(Boolean) as number[]
    };
    // @ts-ignore - tags is not in the DB version of the object
    delete itemToSave.tags;

    await db.add('inventory', itemToSave as any);
    await fetchItems();
  };

  const updateItem = async (item: InventoryItem) => {
    if (!item.id) return;

    const errors = validateSchema(item, inventoryValidators);
    if (Object.keys(errors).length > 0) throw errors;

    const db = await dbPromise;
    // Dehydrate for storage
    const itemToSave = {
        ...item,
        tagIds: (item.tags || []).map(t => t.id).filter(Boolean) as number[]
    };
    // @ts-ignore
    delete itemToSave.tags;

    await db.put('inventory', itemToSave as any);
    await fetchItems();
  };

  const deleteItem = async (id: number) => {
    const db = await dbPromise;
    await db.delete('inventory', id);
    await fetchItems();
  };

  return { items, loading, addItem, updateItem, deleteItem, refresh: fetchItems };
}
