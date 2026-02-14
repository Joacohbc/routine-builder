import { useState, useEffect, useCallback } from 'react';
import { dbPromise, DB_TABLES, type DehydratedInventoryItem } from '@/lib/db';
import { validateSchema, inventoryValidators } from '@/lib/validations';
import type { InventoryItem, Tag } from '@/types';

const fetchItems = async (): Promise<InventoryItem[]> => {
  try {
    const db = await dbPromise;
    const [allItems, allTags] = await Promise.all([
      db.getAll(DB_TABLES.INVENTORY),
      db.getAll(DB_TABLES.TAGS),
    ]);

    // Hydrate tags
    const hydratedItems = allItems.map((item: DehydratedInventoryItem) => ({
      ...item,
      tags: (item.tagIds || [])
        .map((id: number) => allTags.find((t: Tag) => t.id === id))
        .filter(Boolean) as Tag[],
    }));

    return hydratedItems;
  } catch (error) {
    console.error('Failed to fetch inventory:', error);
    throw error;
  }
};

const addItem = async (item: Omit<InventoryItem, 'id'>) => {
  const errors = validateSchema(item, inventoryValidators);
  if (Object.keys(errors).length > 0) throw errors;

  const db = await dbPromise;
  // Dehydrate for storage to keep DB normalized
  const { tags, ...itemWithoutTags } = item;
  const itemToSave = {
    ...itemWithoutTags,
    tagIds: (tags || []).map((t) => t.id).filter(Boolean) as number[],
  };

  const id = await db.add(DB_TABLES.INVENTORY, itemToSave);
  return id;
};

const updateItem = async (item: InventoryItem) => {
  if (!item.id) return;

  const errors = validateSchema(item, inventoryValidators);
  if (Object.keys(errors).length > 0) throw errors;

  const db = await dbPromise;
  // Dehydrate for storage
  const { tags, ...itemWithoutTags } = item;
  const itemToSave = {
    ...itemWithoutTags,
    tagIds: (tags || []).map((t) => t.id).filter(Boolean) as number[],
  };

  await db.put(DB_TABLES.INVENTORY, itemToSave);
};

const deleteItem = async (id: number) => {
  const db = await dbPromise;
  await db.delete(DB_TABLES.INVENTORY, id);
};

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const hydratedItems = await fetchItems();
      setItems(hydratedItems);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onAddItem = useCallback(
    async (item: Omit<InventoryItem, 'id'>) => {
      const id = await addItem(item);
      await refresh();
      return id;
    },
    [refresh]
  );

  const onUpdateItem = useCallback(
    async (item: InventoryItem) => {
      await updateItem(item);
      await refresh();
    },
    [refresh]
  );

  const onDeleteItem = useCallback(
    async (id: number) => {
      await deleteItem(id);
      await refresh();
    },
    [refresh]
  );

  return {
    items,
    loading,
    addItem: onAddItem,
    updateItem: onUpdateItem,
    deleteItem: onDeleteItem,
    refresh,
  };
}
