import { useState, useMemo } from 'react';
import { useTags } from '@/hooks/useTags';
import { useInventory } from '@/hooks/useInventory';
import { useExercises } from '@/hooks/useExercises';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';

interface TagSelectorProps {
  selectedTagIds: number[];
  onChange: (tagIds: number[]) => void;
  type: 'inventory' | 'exercise';
  label?: string;
}

const PRESET_COLORS = [
  '#ef4444', '#3b82f6', '#10b981', '#f59e0b',
  '#6366f1', '#ec4899', '#8b5cf6', '#06b6d4'
];

export function TagSelector({ selectedTagIds, onChange, type, label = 'Muscles & Tags' }: TagSelectorProps) {
  const { tags, addTag } = useTags();
  const { items: inventoryItems } = useInventory();
  const { exercises } = useExercises();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalSearch, setModalSearch] = useState('');

  // Calculate most used tags for this type
  const suggestedTags = useMemo(() => {
    const usageCount: Record<number, number> = {};
    const relevantItems = type === 'inventory' ? inventoryItems : exercises;

    relevantItems.forEach((item) => {
      (item.tagIds || []).forEach((id: number) => {
        usageCount[id] = (usageCount[id] || 0) + 1;
      });
    });

    return tags
      .filter(tag => !selectedTagIds.includes(tag.id!))
      .sort((a, b) => (usageCount[b.id!] || 0) - (usageCount[a.id!] || 0))
      .slice(0, 4);
  }, [type, inventoryItems, exercises, tags, selectedTagIds]);

  const filteredTags = useMemo(() => {
    if (!search) return [];
    return tags.filter(tag =>
      tag.name.toLowerCase().includes(search.toLowerCase()) &&
      !selectedTagIds.includes(tag.id!)
    );
  }, [search, tags, selectedTagIds ]);

  const handleAddTag = async () => {
    if (!search.trim()) return;

    // Check if tag already exists (check both raw name and translated name if needed, but storage is raw)
    // For simplicity, we check raw name first, but user sees translated.
    // Ideally we shouldn't create "Pecho" if "Chest" exists and translates to "Pecho".
    // But since `tags` contains raw names ("Chest"), we can check against translated names.

    const existing = tags.find(tag => tag.name.toLowerCase() === search.toLowerCase());

    if (existing) {
      if (!selectedTagIds.includes(existing.id!)) {
        onChange([...selectedTagIds, existing.id!]);
      }
    } else {
      const color = PRESET_COLORS[Math.floor(Math.random() * PRESET_COLORS.length)];
      // If adding a new tag, we add it as entered.
      const id = await addTag({ name: search.trim(), color });
      onChange([...selectedTagIds, id as number]);
    }
    setSearch('');
  };

  const toggleTag = (id: number) => {
    if (selectedTagIds.includes(id)) {
      onChange(selectedTagIds.filter(tid => tid !== id));
    } else {
      onChange([...selectedTagIds, id]);
    }
  };

  const selectedTags = tags.filter(t => selectedTagIds.includes(t.id!));

  const modalFilteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(modalSearch.toLowerCase())
  );

  return (
    <>
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</label>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="text-gray-400 hover:text-primary transition-colors active:scale-95"
          >
            <Icon name="search" size={18} />
          </button>
        </div>
        <div className="bg-surface-light dark:bg-surface-dark border border-gray-200 dark:border-surface-highlight rounded-2xl p-4 space-y-4">
        {/* Selected Tags */}
        <div className="flex flex-wrap gap-2">
          {selectedTags.map(tag => (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id!)}
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary border border-primary/20 transition-all hover:bg-primary/20"
              style={{ color: tag.color, backgroundColor: `${tag.color}15`, borderColor: `${tag.color}30` }}
            >
              <span className="text-sm font-medium">{tag.name}</span>
              <Icon name="close" size={14} className="opacity-60 group-hover:opacity-100" />
            </button>
          ))}

          {/* Suggestions */}
          {!search && suggestedTags.map(tag => (
            <button
              key={tag.id}
              onClick={() => toggleTag(tag.id!)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-surface-highlight text-gray-600 dark:text-gray-400 border border-transparent transition-all hover:border-gray-300 dark:hover:border-gray-600"
            >
              <span className="text-sm font-medium">{tag.name}</span>
            </button>
          ))}
        </div>

        <div className="border-t border-gray-100 dark:border-surface-highlight pt-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Icon name="sell" size={18} className="text-gray-400 group-focus-within:text-primary transition-colors" />
            </div>
            <Input
              defaultValue={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Add custom tag..."
              className="pl-10 pr-10 border-none bg-transparent focus:ring-0 h-8"
              onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
            />
            {search && (
              <button
                type="button"
                onClick={handleAddTag}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-primary"
              >
                <Icon name="add" size={20} />
              </button>
            )}
          </div>

          {/* Search Results Dropdown-like (simplified for now) */}
          {search && filteredTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {filteredTags.map(tag => (
                <button
                  type="button"
                  key={tag.id}
                  onClick={() => toggleTag(tag.id!)}
                  className="px-3 py-1 rounded-full text-xs bg-surface-highlight border border-gray-700 hover:border-primary transition-colors"
                >
                  {tag.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>

      {/* Full Screen Search Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        variant="fullscreen"
        className="bg-background-light dark:bg-background-dark"
      >
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-surface-highlight">
          <button
            type="button"
            onClick={() => setIsModalOpen(false)}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-surface-highlight"
          >
            <Icon name="arrow_back" />
          </button>
          <div className="flex-1 relative">
             <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
             <input
                autoFocus
                value={modalSearch}
                onChange={e => setModalSearch(e.target.value)}
                placeholder="Search tags..."
                className="w-full bg-gray-100 dark:bg-surface-highlight rounded-xl py-3 pl-10 pr-4 outline-none border border-transparent focus:border-primary transition-all"
             />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
           <div className="flex flex-wrap gap-3">
             {modalFilteredTags.length === 0 ? (
               <p className="text-gray-500 w-full text-center mt-10">No tags found matching "{modalSearch}"</p>
             ) : (
               modalFilteredTags.map(tag => {
                 const isSelected = selectedTagIds.includes(tag.id!);
                 return (
                   <button
                     type="button"
                     key={tag.id}
                     onClick={() => toggleTag(tag.id!)}
                     className={cn(
                       "flex items-center gap-2 px-4 py-3 rounded-xl border transition-all w-full sm:w-auto justify-between sm:justify-start",
                       isSelected
                         ? "bg-primary/5 border-primary"
                         : "bg-surface-light dark:bg-surface-dark border-gray-200 dark:border-surface-highlight"
                     )}
                   >
                      <div className="flex items-center gap-3">
                         <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: tag.color }}
                         />
                         <span className={cn("font-medium", isSelected ? "text-primary" : "text-gray-700 dark:text-gray-300")}>
                           {tag.name}
                         </span>
                      </div>
                      {isSelected && <Icon name="check" size={18} className="text-primary" />}
                   </button>
                 );
               })
             )}
           </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-surface-highlight">
          <button
             type="button"
             onClick={() => setIsModalOpen(false)}
             className="w-full bg-primary text-white font-bold py-4 rounded-2xl"
          >
            Done
          </button>
        </div>
      </Modal>
    </>
  );
}
