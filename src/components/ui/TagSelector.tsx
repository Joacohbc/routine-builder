import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTags } from '@/hooks/useTags';
import { useInventory } from '@/hooks/useInventory';
import { useExercises } from '@/hooks/useExercises';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { TagItem } from '@/components/ui/TagItem';

interface TagSelectorProps {
  selectedTagIds: number[];
  onChange: (tagIds: number[]) => void;
  type: 'inventory' | 'exercise';
  label?: string;
}

export function TagSelector({ selectedTagIds, onChange, type, label = 'Muscles & Tags' }: TagSelectorProps) {  const { t } = useTranslation();  const navigate = useNavigate();
  const { tags } = useTags();
  const { items: inventoryItems } = useInventory();
  const { exercises } = useExercises();
  const [search ] = useState('');
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

        <div className="border-t border-gray-100 dark:border-surface-highlight pt-4 flex gap-2">
            <button
                type="button"
                className="flex-1 flex items-center justify-center gap-2 text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-surface-highlight py-2 rounded-xl text-sm font-medium transition-colors"
                onClick={() => navigate('/settings/tags')}
            >
                <Icon name="add" size={18} />
                {t('tags.addNew', 'Add New')}
            </button>
            <button
                type="button"
                className="flex-1 flex items-center justify-center gap-2 text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-surface-highlight py-2 rounded-xl text-sm font-medium transition-colors"
                onClick={() => setIsModalOpen(true)}
            >
                <Icon name="list" size={18} />
                {t('tags.viewAll', 'View All')}
            </button>
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
                placeholder={t('common.search', 'Search...')}
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
                    <TagItem
                      key={tag.id}
                      tag={tag}
                      onClick={() => toggleTag(tag.id!)}
                      selected={isSelected}
                      className="w-full sm:w-auto"
                    />
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
            {t('common.done', 'Done')}
          </button>
        </div>
      </Modal>
    </>
  );
}
