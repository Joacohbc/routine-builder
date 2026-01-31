import { useState, useEffect, useCallback } from 'react';
import { dbPromise } from '../lib/db';
import type { InventoryItem } from '../types';

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    try {
      const db = await dbPromise;
      const allItems = await db.getAll('inventory');
      setItems(allItems);
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
    const db = await dbPromise;
    await db.add('inventory', item as InventoryItem);
    await fetchItems();
  };

  const updateItem = async (item: InventoryItem) => {
    if (!item.id) return;
    const db = await dbPromise;
    await db.put('inventory', item);
    await fetchItems();
  };

  const deleteItem = async (id: number) => {
    const db = await dbPromise;
    await db.delete('inventory', id);
    await fetchItems();
  };

  return { items, loading, addItem, updateItem, deleteItem, refresh: fetchItems };
}
