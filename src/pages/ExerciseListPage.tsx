import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useExercises } from '@/hooks/useExercises';
import { useTags } from '@/hooks/useTags';
import { Layout } from '@/components/ui/Layout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';
import { getDisplayTag } from '@/lib/tagUtils';

export default function ExerciseListPage() {
  const { t } = useTranslation();
  const { exercises, loading, deleteExercise } = useExercises();
  const { tags } = useTags();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const filteredExercises = exercises.filter(ex => 
    ex.title.toLowerCase().includes(search.toLowerCase()) ||
    ex.muscleGroup?.toLowerCase().includes(search.toLowerCase()) ||
    ex.tagIds?.some(tagId => {
      const tag = tags.find(t => t.id === tagId);
      return tag?.name.toLowerCase().includes(search.toLowerCase());
    })
  );

  return (
    <Layout
      header={
        <div className="flex flex-col px-6 pb-4 pt-12 gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('exerciseList.title')}</h1>
          </div>
          <Input 
            icon="search" 
            placeholder={t('exerciseList.searchPlaceholder')}
            defaultValue={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      }
    >
      <div className="flex flex-col gap-4 mt-4">
        {loading ? <p className="text-center text-gray-500">{t('exerciseList.loading')}</p> : filteredExercises.length === 0 ? (
           <div className="text-center py-10 text-gray-500">
             <p>{t('exerciseList.empty')}</p>
             <p className="text-xs mt-2">{t('exerciseList.emptyHint')}</p>
           </div>
        ) : filteredExercises.map((ex) => (
          <Card key={ex.id} hover className="group" onClick={() => navigate(`/exercises/${ex.id}`)}>
            <div className="flex items-start justify-between w-full">
              <div className="flex items-center gap-4 flex-1">
                {ex.media.length > 0 ? (
                    <div className="w-16 h-16 rounded-xl bg-gray-100 dark:bg-surface-highlight overflow-hidden shrink-0">
                      {ex.media[0].type === 'image' && <img src={ex.media[0].url} className="w-full h-full object-cover" />}
                      {ex.media[0].type === 'youtube' && <img src={ex.media[0].thumbnailUrl} className="w-full h-full object-cover" />}
                       {ex.media[0].type === 'video' && <video src={ex.media[0].url} className="w-full h-full object-cover" />}
                    </div>
                ) : (
                  <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-gray-100 dark:bg-surface-highlight text-gray-600 dark:text-gray-400 shrink-0">
                    <Icon name="image" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">{ex.title}</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {/* Show primary muscle group as a tag if available */}
                    {ex.muscleGroup && (
                        <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded-md font-medium">
                            {ex.muscleGroup}
                        </span>
                    )}
                    {/* Show tags */}
                    {(ex.tagIds || []).slice(0, 2).map(tagId => {
                        const tag = tags.find(t => t.id === tagId);
                        if (!tag) return null;
                        return (
                          <span 
                            key={tagId} 
                            className="text-[10px] px-2 py-0.5 rounded-md font-medium border"
                            style={{ 
                              backgroundColor: `${tag.color}15`, 
                              color: tag.color,
                              borderColor: `${tag.color}30`
                            }}
                          >
                              {getDisplayTag(tag, t)}
                          </span>
                        );
                    })}
                    {ex.tagIds && ex.tagIds.length > 2 && (
                        <span className="text-xs text-gray-400 px-1">...</span>
                    )}
                  </div>
                </div>
              </div>
               <button 
                  onClick={(e) => { e.stopPropagation(); deleteExercise(ex.id!); }}
                  className="p-2 text-gray-400 hover:text-red-400"
                >
                  <Icon name="delete" />
                </button>
            </div>
          </Card>
        ))}
      </div>

      <Button variant="floating" onClick={() => navigate('/exercises/new')}>
        <Icon name="add" size={32} />
      </Button>
    </Layout>
  );
}
