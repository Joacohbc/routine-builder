import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import InventoryPage from '@/pages/InventoryPage';
import ExerciseListPage from '@/pages/ExerciseListPage';
import ExerciseFormPage from '@/pages/ExerciseFormPage';
import RoutineListPage from '@/pages/RoutineListPage';
import RoutineBuilderPage from '@/pages/RoutineBuilderPage';
import WorkoutPageContainer from '@/pages/WorkoutPageContainer';
import SettingsPage from '@/pages/SettingsPage';
import ManageTagsPage from '@/pages/ManageTagsPage';
import SpeechTestPage from '@/pages/SpeechTestPage';
import NotFoundPage from '@/pages/NotFoundPage';
import { MobileExperienceWarning } from '@/components/MobileExperienceWarning';
import { BottomNav } from '@/components/ui/BottomNav';
import { ROUTES, ROUTE_PATTERNS } from '@/lib/routes';

function AppContent() {
  const location = useLocation();
  const isWorkoutPlay = location.pathname.startsWith('/play/');

  return (
    <>
      <MobileExperienceWarning />
      <Routes>
        <Route path={ROUTES.HOME} element={<InventoryPage />} />

        {/* Exercise Library Routes */}
        <Route path={ROUTES.EXERCISES} element={<ExerciseListPage />} />
        <Route path={ROUTES.EXERCISES_NEW} element={<ExerciseFormPage />} />
        <Route path={ROUTE_PATTERNS.EXERCISE_EDIT} element={<ExerciseFormPage />} />

        {/* Routine Builder Routes */}
        <Route path={ROUTES.ROUTINE} element={<RoutineListPage />} />
        <Route path={ROUTES.ROUTINE_NEW} element={<RoutineBuilderPage />} />
        <Route path={ROUTE_PATTERNS.ROUTINE_EDIT} element={<RoutineBuilderPage />} />

        {/* Workout Player */}
        <Route path={ROUTE_PATTERNS.WORKOUT_PLAY} element={<WorkoutPageContainer />} />

        <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
        <Route path={ROUTES.SETTINGS_TAGS} element={<ManageTagsPage />} />
        <Route path={ROUTES.SETTINGS_SPEECH_TEST} element={<SpeechTestPage />} />

        {/* 404 Routes */}
        <Route path={ROUTES.NOT_FOUND} element={<NotFoundPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {!isWorkoutPlay && <BottomNav />}
    </>
  );
}

function App() {
  return (
    <HashRouter>
      <AppContent />
    </HashRouter>
  );
}

export default App;
