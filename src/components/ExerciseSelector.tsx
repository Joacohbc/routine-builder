import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useExercises } from '@/hooks/useExercises';
import { Input } from '@/components/ui/Input';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import type { Exercise } from '@/types';

interface ExerciseSelectorProps {
  onSelect: (exercise: Exercise) => void;
  onClose: () => void;
}

export function ExerciseSelector({ onSelect, onClose }: ExerciseSelectorProps) {
  const { t } = useTranslation();
  const { exercises } = useExercises();
  const [search, setSearch] = useState('');

  const filtered = exercises.filter(e => 
    e.title.toLowerCase().includes(search.toLowerCase()) 
  );

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      variant="bottom-sheet"
      className="max-w-md h-[80vh] sm:h-auto sm:max-h-[80vh] p-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Add Exercise</h2>
        <button onClick={onClose}><Icon name="close" /></button>
      </div>

      <Input
        icon="search"
        placeholder={t('common.search', 'Search...')}
        defaultValue={search}
        onChange={e => setSearch(e.target.value)}
        className="mb-4"
      />

      <div className="flex-1 overflow-y-auto flex flex-col gap-2">
        {filtered.map(ex => (
          <button
            key={ex.id}
            onClick={() => onSelect(ex)}
            className="flex items-center p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-surface-highlight text-left transition-colors"
          >
              <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-surface-input flex items-center justify-center mr-3 shrink-0">
                {ex.media.length > 0 && ex.media[0].type === 'image' ? (
                    <img src={ex.media[0].url} className="w-full h-full object-cover rounded-lg" />
                ) : (
                    <Icon name="fitness_center" size={20} className="text-gray-500" />
                )}
              </div>
              <div>
                <p className="font-semibold text-sm">{ex.title}</p>
              </div>
          </button>
        ))}
      </div>
    </Modal>
  );
}
