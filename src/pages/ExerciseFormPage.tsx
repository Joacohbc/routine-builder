import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useExercises } from '@/hooks/useExercises';
import { Layout } from '@/components/ui/Layout';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { TagSelector } from '@/components/ui/TagSelector';
import { InventorySelector } from '@/components/ui/InventorySelector';
import { Form, type FormFieldValues } from '@/components/ui/Form';
import { exerciseValidators } from '@/lib/validations';
import type { MediaItem, Exercise, Tag, InventoryItem } from '@/types';

export default function ExerciseFormPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { exercises, addExercise, updateExercise, loading: exercisesLoading } = useExercises();

  const isEditing = !!id;

  const initialValues = useMemo(() => {
    if (id) {
      if (!exercisesLoading && exercises.length > 0) {
        return exercises.find((e) => e.id === Number(id)) || null;
      }
      return null;
    }

    // New exercise defaults
    return {
      title: '',
      description: '',
      tags: [],
      media: [],
      primaryEquipment: [],
      defaultType: 'weight_reps',
    };
  }, [id, exercises, exercisesLoading]);

  useEffect(() => {
    if (id && !exercisesLoading && exercises.length > 0 && !initialValues) {
      navigate('/exercises');
    }
  }, [id, exercises, exercisesLoading, initialValues, navigate]);

  const handleSave = async (values: FormFieldValues) => {
    const exerciseData: Exercise = {
      id: id ? Number(id) : undefined,
      title: values.title as string,
      description: values.description as string,
      tags: values.tags as Tag[],
      media: values.media as MediaItem[],
      primaryEquipment: values.primaryEquipment as InventoryItem[],
      defaultType: values.defaultType as Exercise['defaultType'],
    };

    if (id) {
      await updateExercise(exerciseData);
    } else {
      const newEx = { ...exerciseData };
      delete newEx.id;
      await addExercise(newEx);
    }
    navigate('/exercises');
  };

  if (!initialValues) {
    return <div className="p-4 text-center">{t('common.loading', 'Loading...')}</div>;
  }

  return (
    <Form onSubmit={handleSave} defaultValues={initialValues as FormFieldValues} className="h-full">
      <Layout
        header={
          <div className="flex items-center justify-between px-6 py-4 bg-background/95 backdrop-blur-md z-50">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-surface-highlight text-gray-900 dark:text-white transition-colors"
            >
              <Icon name="close" />
            </button>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">
              {isEditing ? t('exercise.edit', 'Edit Exercise') : t('exercise.new', 'New Exercise')}
            </h1>
            <Button size="sm" type="submit" className="bg-primary text-white rounded-full px-6">
              {t('common.save', 'Save')}
            </Button>
          </div>
        }
      >
        <div className="flex flex-col gap-8 mt-4">
          {/* Exercise Title */}
          <Form.Input
            name="title"
            label={t('exercise.title', 'Exercise Title')}
            placeholder={t('exercise.titlePlaceholder', 'e.g. Incline Bench Press')}
            validator={exerciseValidators.title}
            className="font-bold text-lg"
          />

          {/* Description */}
          <Form.Textarea
            name="description"
            label={t('exercise.description', 'Description')}
            placeholder={t(
              'exercise.descriptionPlaceholder',
              'Add cues, form tips, or setup instructions...'
            )}
          />

          {/* Multimedia Gallery */}
          <Form.Media name="media" />

          {/* Required Equipment */}
          <Form.Field name="primaryEquipment">
            {({ value, setValue }) => (
              <InventorySelector
                selectedItems={(value as InventoryItem[]) || []}
                onChange={setValue}
              />
            )}
          </Form.Field>

          {/* Tags */}
          <Form.Field name="tags" validator={exerciseValidators.tags}>
            {({ value, setValue, error }) => (
              <div className="flex flex-col gap-1">
                <TagSelector
                  label={t('exercise.tags')}
                  type="exercise"
                  activeTags={(value as Tag[]) || []}
                  onChange={setValue}
                />
                {error && <span className="text-xs text-red-500 pl-1">{error}</span>}
              </div>
            )}
          </Form.Field>
        </div>
      </Layout>
    </Form>
  );
}
