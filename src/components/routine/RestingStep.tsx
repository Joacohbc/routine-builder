import { useTranslation } from 'react-i18next';
import { formatTimeMMSS } from '@/lib/timeUtils';

interface RestingStepProps {
  restTimer: number;
  targetRestTime?: number;
  restType: 'exercise_rest' | 'serie_rest';
}

export function RestingStep({ restTimer, targetRestTime, restType }: RestingStepProps) {
  const { t } = useTranslation();

  const restLabel = restType === 'serie_rest'
    ? t('activeWorkout.seriesRest')
    : t('activeWorkout.exerciseRest');

  return (
    <div className="flex flex-col items-center justify-center py-10 animate-fade-in">
      <span className="text-text-secondary text-sm uppercase tracking-widest font-bold mb-2">
        {t('activeWorkout.resting')}
      </span>
      <span className="text-xs text-text-muted mb-4 px-3 py-1 bg-surface-highlight rounded-full">
        {restLabel}
      </span>
      <div className="text-6xl font-mono font-bold text-primary mb-2">
        {formatTimeMMSS(restTimer)}
      </div>
      {targetRestTime !== undefined && (
        <div className="text-sm text-text-secondary mb-6">
          {t('activeWorkout.targetRestTime', { time: formatTimeMMSS(targetRestTime) })}
        </div>
      )}
    </div>
  );
}
