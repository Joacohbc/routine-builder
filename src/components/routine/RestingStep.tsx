import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/Button';

interface RestingStepProps {
  restTimer: number;
  targetRestTime?: number;
  restType: 'exercise_rest' | 'serie_rest';
  onSkip: () => void;
}

export function RestingStep({ restTimer, targetRestTime, restType, onSkip }: RestingStepProps) {
  const { t } = useTranslation();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
        {formatTime(restTimer)}
      </div>
      {targetRestTime !== undefined && (
        <div className="text-sm text-text-secondary mb-6">
          {t('activeWorkout.targetRestTime', { time: formatTime(targetRestTime) })}
        </div>
      )}
      <Button onClick={onSkip} variant="secondary">
        {t('activeWorkout.skipRest')}
      </Button>
    </div>
  );
}
