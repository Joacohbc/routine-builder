import { cn } from '@/lib/utils';
import type { RoutineSeries, WorkoutSet } from '@/types';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui/Icon';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { ExerciseSerie } from '@/components/routine/ExerciseSerie';

// ==================== Serie Component ====================
interface SerieProps {
	serie: RoutineSeries;
	serieIndex: number;
	canRemove: boolean;
	onRemoveSeries: (seriesId: string) => void;
	onUpdateSerieType: (seriesId: string, newType: RoutineSeries['type']) => void;
	onOpenSelector: (seriesId: string) => void;
	onRemoveExercise: (seriesId: string, exId: string) => void;
	onToggleTrackingType: (seriesId: string, exId: string) => void;
	onUpdateSet: (seriesId: string, exId: string, setId: string, field: keyof WorkoutSet, val: string | number | boolean) => void;
	onAddSet: (seriesId: string, exId: string) => void;
	onRemoveSet: (seriesId: string, exId: string, setId: string) => void;
	onUpdateRestAfter: (seriesId: string, exId: string, restAfter: number) => void;
}
export function Serie({
	serie, serieIndex, canRemove, onRemoveSeries, onUpdateSerieType, onOpenSelector, onRemoveExercise, onToggleTrackingType, onUpdateSet, onAddSet, onRemoveSet, onUpdateRestAfter
}: SerieProps) {
	const { t } = useTranslation();

	return (
		<div className="relative">

			{/* Superset Connector Line */}
			{serie.type === 'superset' && (
				<div className="absolute left-0 top-4 bottom-4 w-1 bg-linear-to-b from-primary via-primary to-primary/50 rounded-full">
					<div className="absolute -left-10.5 top-1/2 -translate-y-1/2 -rotate-90 origin-center">
						<span className="text-[9px] uppercase font-bold text-primary tracking-widest bg-background px-1">
							{t('routineBuilder.superset')}
						</span>
					</div>
				</div>
			)}

			<div className={cn("flex flex-col gap-2", serie.type === 'superset' ? "pl-4" : "")}>

				{/* Series Header / Controls */}
				<div className="flex justify-between items-center px-1 mb-1">
					<span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
						{t('routineBuilder.series', { count: serieIndex + 1 })}
					</span>

					<div className="flex gap-2">

						{/* Series Type Selector */}
						<SegmentedControl
							options={[
								{ value: 'standard', label: t('routineBuilder.standard') },
								{ value: 'superset', label: t('routineBuilder.superset') },
							]}
							value={serie.type}
							onChange={(newType) => onUpdateSerieType(serie.id, newType)} />

						{/* Remove Series Button */}
						{canRemove && (
							<button
								type="button"
								onClick={() => onRemoveSeries(serie.id)}
								className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
								title={t('routineBuilder.removeSeries')}
							>
								<Icon name="delete" size={18} />
							</button>
						)}
					</div>
				</div>

				{/* Exercise Rows */}
				{serie.exercises.map((ex) => (
					<ExerciseSerie
						key={ex.id}
						exercise={ex}
						seriesId={serie.id}
						seriesType={serie.type}
						onRemoveExercise={onRemoveExercise}
						onToggleTrackingType={onToggleTrackingType}
						onUpdateSet={onUpdateSet}
						onAddSet={onAddSet}
						onRemoveSet={onRemoveSet}
						onUpdateRestAfter={onUpdateRestAfter} />
				))}

				{/* Add Exercise Button */}
				<button
					type="button"
					onClick={() => onOpenSelector(serie.id)}
					className="flex items-center justify-center w-full py-4 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl text-gray-400 hover:text-primary hover:border-primary transition-colors gap-2"
				>
					<Icon name="add_circle" />
					<span className="font-medium text-sm">{t('routineBuilder.addExercise')}</span>
				</button>
			</div>
		</div>
	);
}
