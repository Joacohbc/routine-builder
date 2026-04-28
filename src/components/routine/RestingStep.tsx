import { useTranslation } from 'react-i18next';
import { formatTimeMMSS } from '@/lib/timeUtils';
import type { RestType } from '@/pages/WorkoutPageContainer';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

interface RestingStepProps {
  restTimer: number;
  targetRestTime?: number;
  restType: RestType;
  onAddExtraTime?: (seconds: number) => void;
  isPaused?: boolean;
  onTogglePause?: () => void;
}

export function RestingStep({ restTimer, targetRestTime, restType, onAddExtraTime, isPaused, onTogglePause }: RestingStepProps) {
  const { t } = useTranslation();

  const restLabel =
    restType === 'serie_rest'
      ? t('activeWorkout.seriesRest')
      : restType === 'exercise_rest'
        ? t('activeWorkout.exerciseRest')
        : t('activeWorkout.setRest');

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
        <>
          <div className="text-sm text-text-secondary mb-6">
            {t('activeWorkout.targetRestTime', { time: formatTimeMMSS(targetRestTime) })}
          </div>

          <div className="flex flex-col items-center gap-4 mt-2">
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => onAddExtraTime?.(10)}>
                +10s
              </Button>
              <Button size="sm" variant="secondary" onClick={() => onAddExtraTime?.(15)}>
                +15s
              </Button>
              <Button size="sm" variant="secondary" onClick={() => onAddExtraTime?.(30)}>
                +30s
              </Button>
              <Button size="sm" variant="secondary" onClick={() => onAddExtraTime?.(60)}>
                +1m
              </Button>
            </div>

            <Button
              variant="secondary"
              className="w-14 h-14 rounded-full p-0 flex items-center justify-center"
              onClick={onTogglePause}
            >
              <Icon name={isPaused ? 'play_arrow' : 'pause'} size={24} />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
