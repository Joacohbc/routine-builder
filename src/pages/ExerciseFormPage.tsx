import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useExercises } from '@/hooks/useExercises';
import { ExerciseForm } from '@/components/ExerciseForm';
import type { MediaItem, Exercise, Tag, InventoryItem } from '@/types';
import type { FormFieldValues } from '@/components/ui/Form';

export default function ExerciseFormPage() {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const { exercises, addExercise, updateExercise, loading: exercisesLoading } = useExercises();

    const initialValues = useMemo(() => {
        if (id) {
            if (!exercisesLoading && exercises.length > 0) {
                return exercises.find(e => e.id === Number(id)) || null;
            }
            return null;
        }

        // New exercise defaults
        return {
            title: '',
            description: '',
            muscleGroup: '',
            tags: [],
            media: [],
            primaryEquipment: [],
            defaultType: 'weight_reps'
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
            defaultType: values.defaultType as Exercise['defaultType']
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
        <ExerciseForm
            initialValues={initialValues as FormFieldValues}
            onSubmit={handleSave}
            isEditing={!!id}
        />
    );
}
