import { HashRouter, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <HashRouter>
      <MobileExperienceWarning />
      <Routes>
        <Route path="/" element={<InventoryPage />} />

        {/* Exercise Library Routes */}
        <Route path="/exercises" element={<ExerciseListPage />} />
        <Route path="/exercises/new" element={<ExerciseFormPage />} />
        <Route path="/exercises/:id" element={<ExerciseFormPage />} />

        {/* Routine Builder Routes */}
        <Route path="/routine" element={<RoutineListPage />} />
        <Route path="/routine/new" element={<RoutineBuilderPage />} />
        <Route path="/routine/:id" element={<RoutineBuilderPage />} />

        {/* Workout Player */}
        <Route path="/play/:id" element={<WorkoutPageContainer />} />

        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/tags" element={<ManageTagsPage />} />
        <Route path="/settings/speech-test" element={<SpeechTestPage />} />

        {/* Catch-all route for 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
