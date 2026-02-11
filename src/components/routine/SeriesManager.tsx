import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExerciseSelector } from '@/components/ExerciseSelector';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Serie } from '@/components/routine/Serie';
import type { RoutineSeries, RoutineExercise, WorkoutSet, Exercise, TrackingType } from '@/types';

// ==================== Constants ====================
const DEFAULT_REST_AFTER_SERIE = 90;
const DEFAULT_REST_AFTER_SET_STANDARD = 90;
const DEFAULT_REST_AFTER_SET_SUPERSET = 0;

const createNewSeries = (): RoutineSeries => ({
	id: crypto.randomUUID(),
	type: 'standard',
	exercises: [],
	restAfterSerie: DEFAULT_REST_AFTER_SERIE
});

const createNewExercise = (exerciseId: number, trackingType: TrackingType, restAfterSet: number): RoutineExercise => ({
	id: crypto.randomUUID(),
	exerciseId,
	trackingType,
	sets: [
		createNewSet({ type: 'working', weight: 0, reps: 0, time: 0 }),
		createNewSet({ type: 'working', weight: 0, reps: 0, time: 0 }),
		createNewSet({ type: 'working', weight: 0, reps: 0, time: 0 })
	],
	restAfterSet
});

const createNewSet = (template?: Partial<WorkoutSet>): WorkoutSet => ({
	id: crypto.randomUUID(),
	type: template?.type || 'working',
	weight: template?.weight ?? 0,
	reps: template?.reps ?? 0,
	time: template?.time ?? 0,
	completed: false
});

// ==================== Series Manager Component ====================
interface SeriesManagerProps {
	series: RoutineSeries[];
	updateSeriesList: (series: RoutineSeries[]) => void;
	error?: string;
}

export function SeriesManager({ series, updateSeriesList, error }: SeriesManagerProps) {
	const { t } = useTranslation();
	const [showSelector, setShowSelector] = useState<{ seriesId: string } | null>(null);

	/** Add a new series to the routine */
	const addSeries = () => {
		updateSeriesList([...series, createNewSeries()]);
	};

	/** Remove a series from the routine */
	const removeSeries = (seriesId: string) => {
		updateSeriesList(series.filter(s => s.id !== seriesId));
	};

	/** Update a specific field of a specific set within an exercise */
	const updateSet = (seriesId: string, exId: string, setId: string, field: keyof WorkoutSet, val: string | number | boolean) => {
		updateSeriesList(series.map(s => {
			if (s.id !== seriesId) return s;
			return {
				...s,
				exercises: s.exercises.map(ex => {
					if (ex.id !== exId) return ex;
					return {
						...ex,
						sets: ex.sets.map(set => {
							if (set.id !== setId) return set;
							return { ...set, [field]: val };
						})
					};
				})
			};
		}));
	};

	/** Add a new set to an exercise, copying values from the last set */
	const addSet = (seriesId: string, exId: string) => {
		updateSeriesList(series.map(s => {
			if (s.id !== seriesId) return s;
			return {
				...s,
				exercises: s.exercises.map(ex => {
					if (ex.id !== exId) return ex;
					const lastSet = ex.sets[ex.sets.length - 1];
					return { ...ex, sets: [...ex.sets, createNewSet(lastSet)] };
				})
			};
		}));
	};

	/** Remove a specific set from an exercise */
	const removeSet = (seriesId: string, exId: string, setId: string) => {
		updateSeriesList(series.map(s => {
			if (s.id !== seriesId) return s;
			return {
				...s,
				exercises: s.exercises.map(ex => {
					if (ex.id !== exId) return ex;
					return { ...ex, sets: ex.sets.filter(set => set.id !== setId) };
				})
			};
		}));
	};

	/** Remove an exercise from a series */
	const removeExercise = (seriesId: string, exId: string) => {
		updateSeriesList(series.map(s => {
			if (s.id !== seriesId) return s;
			return { ...s, exercises: s.exercises.filter(ex => ex.id !== exId) };
		}));
	};

	/** Toggle tracking type between 'time' and 'reps' for an exercise */
	const toggleTrackingType = (seriesId: string, exId: string) => {
		updateSeriesList(series.map(s => {
			if (s.id !== seriesId) return s;
			return {
				...s,
				exercises: s.exercises.map(ex => {
					if (ex.id !== exId) return ex;
					return { ...ex, trackingType: ex.trackingType === 'time' ? 'reps' : 'time' };
				})
			};
		}));
	};

	/** Update rest time after each set for a specific exercise */
	const updateRestAfterSet = (seriesId: string, exId: string, restAfterSet: number) => {
		updateSeriesList(series.map(s => {
			if (s.id !== seriesId) return s;
			return {
				...s,
				exercises: s.exercises.map(ex => {
					if (ex.id !== exId) return ex;
					return { ...ex, restAfterSet };
				})
			};
		}));
	};

	/** Update rest time after completing a series */
	const updateRestAfterSerie = (seriesId: string, restAfterSerie: number) => {
		updateSeriesList(series.map(s => {
			if (s.id !== seriesId) return s;
			return { ...s, restAfterSerie };
		}));
	};

	/** 
	 * Update series type (standard or superset).
	 * When changing to superset, restAfterSet is set to 0.
	 * When changing to standard, restAfterSet is set to default (90s).
	 */
	const updateSerieType = (seriesId: string, newType: 'standard' | 'superset') => {
		updateSeriesList(series.map(serie => {
			if (serie.id !== seriesId) return serie;
			const updatedExercises = serie.exercises.map(ex => ({
				...ex,
				restAfterSet: newType === 'superset' ? DEFAULT_REST_AFTER_SET_SUPERSET : (ex.restAfterSet || DEFAULT_REST_AFTER_SET_STANDARD)
			}));
			return { ...serie, type: newType, exercises: updatedExercises };
		}));
	};

	/** Add a new exercise to a series from the exercise selector */
	const handleAddExercise = (seriesId: string, exercise: Exercise) => {
		const updatedSeries = series.map(s => {
			if (s.id !== seriesId) return s;

			const trackingType = exercise.defaultType === 'time' ? 'time' : 'reps';
			const restAfterSet = s.type === 'superset' ? DEFAULT_REST_AFTER_SET_SUPERSET : DEFAULT_REST_AFTER_SET_STANDARD;
			const newEx = createNewExercise(exercise.id!, trackingType, restAfterSet);
			
			return { ...s, exercises: [...s.exercises, newEx] };
		});
		updateSeriesList(updatedSeries);
		setShowSelector(null);
	};

	return (
		<div className="flex flex-col gap-6 py-6">
			{error && (
				<div className="mx-4 p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl text-red-600 dark:text-red-400 text-sm font-medium flex items-center gap-2">
					<Icon name="error" size={20} />
					{t(error)}
				</div>
			)}

			{series.map((s, sIndex) => (
				<Serie
					key={s.id}
					serie={s}
					serieIndex={sIndex}
					canRemove={series.length > 1}
					onRemoveSeries={removeSeries}
					onUpdateSerieType={updateSerieType}
					onOpenSelector={(seriesId) => setShowSelector({ seriesId })}
					onRemoveExercise={removeExercise}
					onToggleTrackingType={toggleTrackingType}
					onUpdateSet={updateSet}
					onAddSet={addSet}
					onRemoveSet={removeSet}
					onUpdateRestAfterSet={updateRestAfterSet}
					onUpdateRestAfterSerie={updateRestAfterSerie}
				/>
			))}

			<Button type="button" onClick={addSeries} variant="secondary" className="mt-4">
				{t('routineBuilder.addSeries')}
			</Button>

			{/* Spacer for FAB */}
			<div className="h-20" />

			{showSelector && (
				<ExerciseSelector
					onClose={() => setShowSelector(null)}
					onSelect={(ex) => handleAddExercise(showSelector.seriesId, ex)}
				/>
			)}
		</div>
	);
}
