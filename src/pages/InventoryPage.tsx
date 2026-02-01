import { useState, useMemo } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { useTags } from '@/hooks/useTags';
import { Layout } from '@/components/ui/Layout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { TagSelector } from '@/components/ui/TagSelector';
import { Form, useFormContext } from '@/components/ui/Form';
import { cn } from '@/lib/utils';
import type { InventoryItem, InventoryCondition } from '@/types';

export default function InventoryPage() {
  const { items, loading, addItem, updateItem, deleteItem } = useInventory();
  const { tags } = useTags();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'checked_out'>('all');
  const [activeTagId, setActiveTagId] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Derived state for tags present in current inventory
  const inventoryTags = useMemo(() => {
    const ids = new Set<number>();
    items.forEach(item => item.tagIds?.forEach(id => ids.add(id)));
    return tags.filter(t => ids.has(t.id!));
  }, [items, tags]);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all'
      ? true
      : filterStatus === 'available'
        ? item.status === 'available'
        : item.status !== 'available'; // Simplified logic
    const matchesTag = activeTagId ? item.tagIds?.includes(activeTagId) : true;
    return matchesSearch && matchesStatus && matchesTag;
  });

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      await deleteItem(id);
    }
  };

  const getConditionColor = (condition: InventoryCondition) => {
    switch (condition) {
      case 'new': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'good': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'worn': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'poor': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800';
      default: return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  return (
    <Layout
      header={
        <div className="flex flex-col px-6 pb-4 pt-12 gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="p-2 -ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-surface-highlight transition-colors">
                <Icon name="menu" className="text-gray-600 dark:text-gray-300" />
              </button>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">The Cellar</h1>
            </div>
            <button className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-surface-highlight transition-colors">
              <Icon name="notifications" className="text-gray-600 dark:text-gray-300" />
              <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary border border-background-light dark:border-background-dark"></span>
            </button>
          </div>
          <Input
            icon="search"
            placeholder="Search equipment..."
            defaultValue={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      }
    >
      <div className="flex gap-3 mb-2 overflow-x-auto no-scrollbar pb-2">
        <Button
          variant={filterStatus === 'all' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setFilterStatus('all')}
        >
          All Items
        </Button>
        <Button
          variant={filterStatus === 'available' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setFilterStatus('available')}
        >
          Available
        </Button>
        <Button
          variant={filterStatus === 'checked_out' ? 'primary' : 'secondary'}
          size="sm"
          onClick={() => setFilterStatus('checked_out')}
        >
          Checked Out
        </Button>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar pb-2 pt-1 border-t border-gray-200 dark:border-surface-highlight/50">
        <div className="flex items-center pr-2 text-gray-400 dark:text-gray-500 text-xs font-semibold uppercase tracking-wider shrink-0">Tags:</div>
        {inventoryTags.map(tag => (
          <button
            key={tag.id}
            onClick={() => setActiveTagId(activeTagId === tag.id ? null : tag.id!)}
            className={cn(
              "flex-none flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
              activeTagId === tag.id
                ? "bg-primary/10 border-primary text-primary"
                : "bg-surface-light dark:bg-surface-dark border-gray-200 dark:border-surface-highlight text-gray-500 dark:text-gray-400"
            )}
            style={activeTagId === tag.id ? { color: tag.color, borderColor: tag.color, backgroundColor: `${tag.color}15` } : {}}
          >
            <Icon name="sell" size={14} />
            {tag.name}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        {loading ? <p className="text-center text-gray-500">Loading inventory...</p> : filteredItems.map((item) => (
          <Card key={item.id} hover className="group" onClick={() => handleEdit(item)}>
            <div className="flex items-start justify-between w-full">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 dark:bg-surface-highlight text-gray-600 dark:text-primary shrink-0">
                  <Icon name={item.icon || 'fitness_center'} size={24} />
                </div>
                <div className="flex flex-col truncate pr-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">{item.name}</h3>
                    <div className={cn("flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-bold border", getConditionColor(item.condition))}>
                      <span>{item.condition.toUpperCase()}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <p className={cn("text-sm font-medium", item.status === 'available' ? "text-primary" : "text-gray-500")}>
                      {item.status === 'available' ? 'Available' : item.status === 'checked_out' ? 'In Use' : 'Maintenance'}
                    </p>
                    <span className="text-gray-300 dark:text-gray-600 text-xs">•</span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Total: {item.quantity}</p>
                  </div>
                </div>
              </div>
              <div className="shrink-0 pl-2 pt-1 flex gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); handleDelete(item.id!); }}
                  className="p-1 text-gray-400 hover:text-red-400"
                >
                  <Icon name="delete" />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-3 pl-16">
              {(item.tagIds || []).map(tagId => {
                const tag = tags.find(t => t.id === tagId);
                if (!tag) return null;
                return (
                  <span
                    key={tagId}
                    className="px-2 py-0.5 rounded-md text-[10px] font-medium border"
                    style={{
                      backgroundColor: `${tag.color}15`,
                      color: tag.color,
                      borderColor: `${tag.color}30`
                    }}
                  >
                    {tag.name}
                  </span>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      <Button
        variant="floating"
        onClick={() => { setEditingItem(null); setIsFormOpen(true); }}
      >
        <Icon name="add" size={32} />
      </Button>

      {isFormOpen && (
        <InventoryForm
          item={editingItem}
          onClose={() => setIsFormOpen(false)}
          onSave={async (item) => {
            if (editingItem && editingItem.id) {
              await updateItem({ ...item, id: editingItem.id });
            } else {
              await addItem(item);
            }
            setIsFormOpen(false);
          }}
        />
      )}
    </Layout>
  );
}

function InventoryForm({ item, onClose, onSave }: { item: InventoryItem | null, onClose: () => void, onSave: (item: Omit<InventoryItem, 'id'> & { id?: number }) => Promise<void> }) {  
  // Validator function
  const validateQuantity = (value: string) => {
    const num = parseInt(value, 10);
    if (isNaN(num)) return { ok: false, message: 'Must be a valid number' };
    if (num < 1) return { ok: false, message: 'Must be at least 1' };
    return { ok: true };
  };

  const handleFormSubmit = async (rawValues: unknown) => {
    const values = rawValues as InventoryItem
    
    console.log('Form Values:', values);
    await onSave({
      name: values.name,
      icon: values.icon,
      status: values.status,
      condition: values.condition,
      quantity: Number(values.quantity),
      tagIds: values.tagIds,
    });
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
      <div className="bg-surface-light dark:bg-surface-dark w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-surface-highlight my-8">
        <h2 className="text-xl font-bold mb-4">{item ? 'Edit Item' : 'New Item'}</h2>
        <Form
          onSubmit={handleFormSubmit}
          className="flex flex-col gap-4"
        >
          <Form.Input name="name" label="Name" defaultValue={item?.name} required />
          <div className="grid grid-cols-2 gap-4">
            <Form.Input name="icon" label="Icon (Symbol)" defaultValue={item?.icon} />
            <Form.Input
              name="quantity"
              label="Quantity"
              type="number"
              defaultValue={item?.quantity}
              validator={validateQuantity}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Form.Select
              name="condition"
              label="Condition"
              defaultValue={item?.condition}
              options={[
                { label: 'New', value: 'new' },
                { label: 'Good', value: 'good' },
                { label: 'Worn', value: 'worn' },
                { label: 'Poor', value: 'poor' },
              ]}
            />
            <Form.Select
              name="status"
              label="Status"
              defaultValue={item?.status}
              options={[
                { label: 'Available', value: 'available' },
                { label: 'Checked Out', value: 'checked_out' },
                { label: 'Maintenance', value: 'maintenance' },
              ]}
            />
          </div>

          <Form.Field name="tagIds" defaultValue={item?.tagIds || []}>
            {({ value, setValue }) => (
              <TagSelector
                label="Tags"
                selectedTagIds={value as number[]}
                onChange={setValue} 
                type={'inventory'}/>
            )}
          </Form.Field>

          <div className="flex gap-3 mt-4">
            <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
            <FormSubmitButton />
          </div>
        </Form>
      </div>
    </div>
  );
}

function FormSubmitButton() {
  const { errors, isSubmitting } = useFormContext();
  const hasErrors = Object.keys(errors).some(key => !!errors[key]);
  
  return (
    <Button type="submit" className="flex-1" disabled={hasErrors || isSubmitting}>
      {isSubmitting ? 'Saving...' : 'Save'}
    </Button>
  );
}
