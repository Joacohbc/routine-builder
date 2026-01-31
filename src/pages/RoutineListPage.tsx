import { useNavigate } from 'react-router-dom';
import { useRoutines } from '@/hooks/useRoutines';
import { Layout } from '@/components/ui/Layout';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Icon } from '@/components/ui/Icon';

export default function RoutineListPage() {
  const { routines, loading, deleteRoutine } = useRoutines();
  const navigate = useNavigate();

  return (
    <Layout
      header={
        <div className="flex flex-col px-6 pb-4 pt-12 gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Routine Builder</h1>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4 mt-2">
        {loading ? <p className="text-center text-gray-500">Loading routines...</p> : routines.length === 0 ? (
           <div className="text-center py-10 text-gray-500">
             <p>No routines created yet.</p>
             <p className="text-xs mt-2">Tap + to build your first plan.</p>
           </div>
        ) : routines.map((routine) => (
          <Card key={routine.id} hover className="group" onClick={() => navigate(`/builder/${routine.id}`)}>
            <div className="flex items-start justify-between w-full">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{routine.name}</h3>
                <p className="text-sm text-gray-500">{routine.series.length} Series · {routine.series.reduce((acc, s) => acc + s.exercises.length, 0)} Exercises</p>
              </div>
              <div className="flex gap-2">
                 <button 
                  onClick={(e) => { e.stopPropagation(); navigate(`/play/${routine.id}`); }}
                  className="p-2 text-primary hover:text-primary-dark"
                >
                  <Icon name="play_arrow" size={24} filled />
                </button>
                 <button 
                  onClick={(e) => { e.stopPropagation(); deleteRoutine(routine.id!); }}
                  className="p-2 text-gray-400 hover:text-red-400"
                >
                  <Icon name="delete" />
                </button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Button variant="floating" onClick={() => navigate('/builder/new')}>
        <Icon name="add" size={32} />
      </Button>
    </Layout>
  );
}
