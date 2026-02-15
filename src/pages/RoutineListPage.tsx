import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { buildRoute, ROUTES } from '@/lib/routes';
import { useRoutines } from '@/hooks/useRoutines';
import { Layout } from '@/components/ui/Layout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';

export default function RoutineListPage() {
  const { t } = useTranslation();
  const { routines, loading, deleteRoutine } = useRoutines();
  const navigate = useNavigate();

  return (
    <Layout title={t('routineList.title')}>
      <div className="flex flex-col gap-4 mt-2">
        {loading ? (
          <p className="text-center text-gray-500">{t('common.loading')}</p>
        ) : routines.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <p>{t('routineList.empty')}</p>
            <p className="text-xs mt-2">{t('routineList.emptyHint')}</p>
          </div>
        ) : (
          routines.map((routine) => (
            <Card
              key={routine.id}
              hover
              className="group"
              onClick={() => navigate(buildRoute.routineEdit(routine.id!))}
            >
              <div className="flex items-start justify-between w-full">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {routine.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {routine.series.length} {t('routineList.card.series')} ·{' '}
                    {routine.series.reduce((acc, s) => acc + s.exercises.length, 0)}{' '}
                    {t('common.exercises')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(buildRoute.workoutPlay(routine.id!));
                    }}
                    className="p-2 text-primary hover:text-primary-dark"
                  >
                    <Icon name="play_arrow" size={24} filled />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteRoutine(routine.id!);
                    }}
                    className="p-2 text-gray-400 hover:text-red-400"
                  >
                    <Icon name="delete" />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Button variant="floating" onClick={() => navigate(ROUTES.ROUTINE_NEW)}>
        <Icon name="add" size={32} />
      </Button>
    </Layout>
  );
}
