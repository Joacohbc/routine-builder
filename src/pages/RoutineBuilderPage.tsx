import { useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useRoutines } from '@/hooks/useRoutines';
import { RoutineBuilderForm } from '@/components/routine/RoutineBuilderForm';
import type { Routine, RoutineSeries } from '@/types';
import type { FormFieldValues } from '@/components/ui/Form';

export default function RoutineBuilderPage() {
	const { t } = useTranslation();
	const { id } = useParams();
	const navigate = useNavigate();
	const { routines, addRoutine, updateRoutine, loading: routinesLoading } = useRoutines();

	const initialValues = useMemo(() => {
		if (id) {
			if (!routinesLoading && routines.length > 0) {
				return routines.find(r => r.id === Number(id)) ?? null;
			}
			return null;
		}

		// New routine default
		return {
			name: t('routineBuilder.newRoutine'),
			series: [{
				id: crypto.randomUUID(),
				type: 'standard',
				exercises: []
			}]
		};
	}, [id, routines, routinesLoading, t]);

	// Handle not found routine
	useEffect(() => {
		if (id && !routinesLoading && routines.length > 0) {
			const r = routines.find(r => r.id === Number(id));
			if (!r) {
				navigate('/builder');
			}
		}
	}, [id, routines, routinesLoading, navigate]);

	const handleSave = async (values: FormFieldValues) => {
		const routineData: Routine = {
			id: id ? Number(id) : undefined,
			name: values.name as string,
			series: values.series as RoutineSeries[],
			updatedAt: new Date(),
			createdAt: id ? (initialValues as Routine).createdAt : new Date()
		};

		if (id) {
			await updateRoutine(routineData);
		} else {
			const newRoutine = { ...routineData };
			delete newRoutine.id;
			await addRoutine(newRoutine);
		}
		navigate('/builder');
	};

	const handleCancel = () => {
		navigate(-1);
	};

	if (!initialValues) {
		return <div className="p-4 text-center">{t('common.loading', 'Loading...')}</div>;
	}

	return (
		<RoutineBuilderForm
			initialValues={initialValues as FormFieldValues}
			onSubmit={handleSave}
			onCancel={handleCancel}
		/>
	);
}
