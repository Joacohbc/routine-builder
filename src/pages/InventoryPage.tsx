import { useState, useMemo } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { Layout } from '@/components/ui/Layout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Tag } from '@/components/ui/Tag';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/utils';
import type { InventoryItem, InventoryCondition, InventoryStatus } from '@/types';

export default function InventoryPage() {
  const { items, loading, addItem, updateItem, deleteItem } = useInventory();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'checked_out'>('all');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Derived state for tags
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    items.forEach(item => item.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags);
  }, [items]);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' 
      ? true 
      : filterStatus === 'available' 
        ? item.status === 'available'
        : item.status !== 'available'; // Simplified logic
    const matchesTag = activeTag ? item.tags.includes(activeTag) : true;
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
            value={search}
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
        {allTags.map(tag => (
          <Tag 
            key={tag} 
            label={tag} 
            icon="sell" 
            variant={activeTag === tag ? 'primary' : 'default'} 
            onClick={() => setActiveTag(activeTag === tag ? null : tag)}
          />
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
            <div className="flex flex-wrap gap-2 mt-3 pl-[64px]">
              {item.tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-surface-highlight text-gray-600 dark:text-gray-400 text-[10px] font-medium border border-gray-200 dark:border-gray-700">
                  {tag}
                </span>
              ))}
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
  const [name, setName] = useState(item?.name || '');
  const [icon, setIcon] = useState(item?.icon || 'fitness_center');
  const [status, setStatus] = useState<InventoryStatus>(item?.status || 'available');
  const [condition, setCondition] = useState<InventoryCondition>(item?.condition || 'good');
  const [quantity, setQuantity] = useState(item?.quantity || 1);
  const [tags, setTags] = useState<string>(item?.tags.join(', ') || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name,
      icon,
      status,
      condition,
      quantity,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface-light dark:bg-surface-dark w-full max-w-sm rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-surface-highlight">
        <h2 className="text-xl font-bold mb-4">{item ? 'Edit Item' : 'New Item'}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input label="Name" value={name} onChange={e => setName(e.target.value)} required />
          <div className="grid grid-cols-2 gap-4">
             <Input label="Icon (Symbol)" value={icon} onChange={e => setIcon(e.target.value)} />
             <Input label="Quantity" type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Condition</label>
            <select 
              value={condition} 
              onChange={e => setCondition(e.target.value as InventoryCondition)}
              className="w-full h-12 rounded-2xl bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-surface-highlight px-4"
            >
              <option value="new">New</option>
              <option value="good">Good</option>
              <option value="worn">Worn</option>
              <option value="poor">Poor</option>
            </select>
          </div>
           <div>
            <label className="block text-xs font-medium text-gray-500 mb-1 ml-1">Status</label>
            <select 
              value={status} 
              onChange={e => setStatus(e.target.value as InventoryStatus)}
              className="w-full h-12 rounded-2xl bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-surface-highlight px-4"
            >
              <option value="available">Available</option>
              <option value="checked_out">Checked Out</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          <Input label="Tags (comma separated)" value={tags} onChange={e => setTags(e.target.value)} />
          
          <div className="flex gap-3 mt-4">
            <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
            <Button type="submit" className="flex-1">Save</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
