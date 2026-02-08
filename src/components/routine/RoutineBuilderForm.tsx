import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ExerciseSelector } from '@/components/ExerciseSelector';
import { Layout } from '@/components/ui/Layout';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Form, type FormFieldValues } from '@/components/ui/Form';
import { routineValidators } from '@/lib/validations';

import type { RoutineSeries, RoutineExercise, WorkoutSet, Exercise } from '@/types';
import { Serie } from '@/components/routine/Serie';

// ==================== Main Form Component ====================
export interface RoutineBuilderFormProps {
	initialValues: FormFieldValues;
	onSubmit: (values: FormFieldValues) => Promise<void>;
	onCancel: () => void;
}

export function RoutineBuilderForm({ initialValues, onSubmit, onCancel }: RoutineBuilderFormProps) {
	const { t } = useTranslation();
	const [showSelector, setShowSelector] = useState<{ seriesId: string } | null>(null);

	// Helper to add exercise to form state (used by ExerciseSelector)
	const handleAddExercise = (seriesId: string, exercise: Exercise, currentSeries: RoutineSeries[], setSeries: (s: RoutineSeries[]) => void) => {
		const updatedSeries = currentSeries.map(s => {
			if (s.id !== seriesId) return s;

			const trackingType = exercise.defaultType === 'time' ? 'time' : 'reps';
			// Set restAfter to 0 for superset, 90 seconds for standard
			const restAfter = s.type === 'superset' ? 0 : 90;
			const newEx: RoutineExercise = {
				id: crypto.randomUUID(),
				exerciseId: exercise.id!,
				trackingType,
				sets: [
					{ id: crypto.randomUUID(), type: 'working', weight: 0, reps: 0, time: 0, completed: false },
					{ id: crypto.randomUUID(), type: 'working', weight: 0, reps: 0, time: 0, completed: false },
					{ id: crypto.randomUUID(), type: 'working', weight: 0, reps: 0, time: 0, completed: false }
				],
				restAfter
			};
			return { ...s, exercises: [...s.exercises, newEx] };
		});
		setSeries(updatedSeries);
		setShowSelector(null);
	};

	return (
		<Form
			onSubmit={onSubmit}
			defaultValues={initialValues}
			className="h-full"
		>
			<Layout
				header={
					<div className="flex items-center justify-between px-4 py-3 bg-background/95 backdrop-blur-md border-b border-gray-200 dark:border-white/5">
						<button type="button" onClick={onCancel} className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-surface-highlight">
							<Icon name="arrow_back" />
						</button>
						<Form.Field name="name" validator={routineValidators.name}>
							{({ value, setValue, error }) => (
								<div className="flex-1 px-4 text-center">
									<input
										value={String(value || '')}
										onChange={e => setValue(e.target.value)}
										className="bg-transparent text-center font-bold text-lg focus:outline-none focus:ring-1 focus:ring-primary rounded px-2 w-full max-w-50"
										placeholder={t('routineBuilder.routineName', 'Routine Name')}
									/>
									{error && <p className="text-xs text-red-500 mt-1">{error}</p>}
								</div>
							)}
						</Form.Field>
						<Button size="sm" type="submit">{t('common.save', 'Save')}</Button>
					</div>
				}
			>
				<Form.Field name="series" validator={routineValidators.series}>
					{({ value, setValue, error }) => {
						const series = (value as RoutineSeries[]) || [];

						const updateSeriesList = (newSeries: RoutineSeries[]) => setValue(newSeries);

						const addSeries = () => {
							const newSeries: RoutineSeries = {
								id: crypto.randomUUID(),
								type: 'standard',
								exercises: []
							};
							updateSeriesList([...series, newSeries]);
						};

						const removeSeries = (seriesId: string) => {
							updateSeriesList(series.filter(s => s.id !== seriesId));
						};

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

						const addSet = (seriesId: string, exId: string) => {
							updateSeriesList(series.map(s => {
								if (s.id !== seriesId) return s;
								return {
									...s,
									exercises: s.exercises.map(ex => {
										if (ex.id !== exId) return ex;
										const lastSet = ex.sets[ex.sets.length - 1];
										const newSet: WorkoutSet = {
											id: crypto.randomUUID(),
											type: 'working',
											weight: lastSet ? lastSet.weight : 0,
											reps: lastSet ? lastSet.reps : 0,
											time: lastSet ? lastSet.time : 0,
											completed: false
										};
										return { ...ex, sets: [...ex.sets, newSet] };
									})
								};
							}));
						};

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

						const removeExercise = (seriesId: string, exId: string) => {
							updateSeriesList(series.map(s => {
								if (s.id !== seriesId) return s;
								return { ...s, exercises: s.exercises.filter(ex => ex.id !== exId) };
							}));
						};

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

						const updateRestAfter = (seriesId: string, exId: string, restAfter: number) => {
							updateSeriesList(series.map(s => {
								if (s.id !== seriesId) return s;
								return {
									...s,
									exercises: s.exercises.map(ex => {
										if (ex.id !== exId) return ex;
										return { ...ex, restAfter };
									})
								};
							}));
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
										onUpdateSerieType={(seriesId, newType) => {
											updateSeriesList(series.map(serie => {
												if (serie.id !== seriesId) return serie;
												// When changing to superset, set all restAfter to 0
												// When changing to standard, set default restAfter to 90 seconds
												const updatedExercises = serie.exercises.map(ex => ({
													...ex,
													restAfter: newType === 'superset' ? 0 : (ex.restAfter || 90)
												}));
												return { ...serie, type: newType, exercises: updatedExercises };
											}));
										}}
										onOpenSelector={(seriesId) => setShowSelector({ seriesId })}
										onRemoveExercise={removeExercise}
										onToggleTrackingType={toggleTrackingType}
										onUpdateSet={updateSet}
										onAddSet={addSet}
										onRemoveSet={removeSet} onUpdateRestAfter={updateRestAfter} />
								))}

								<Button type="button" onClick={addSeries} variant="secondary" className="mt-4">
									{t('routineBuilder.addSeries')}
								</Button>

								{/* Spacer for FAB */}
								<div className="h-20" />

								{showSelector && (
									<ExerciseSelector
										onClose={() => setShowSelector(null)}
										onSelect={(ex) => handleAddExercise(showSelector.seriesId, ex, series, updateSeriesList)}
									/>
								)}
							</div>
						);
					}}
				</Form.Field>
			</Layout>
		</Form>
	);
}
