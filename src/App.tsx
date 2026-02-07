import { HashRouter, Routes, Route } from 'react-router-dom';
import InventoryPage from '@/pages/InventoryPage';
import ExerciseListPage from '@/pages/ExerciseListPage';
import ExerciseFormPage from '@/pages/ExerciseFormPage';
import RoutineListPage from '@/pages/RoutineListPage';
import RoutineBuilderPage from '@/pages/RoutineBuilderPage';
import ActiveWorkoutPage from '@/pages/ActiveWorkoutPage';
import SettingsPage from '@/pages/SettingsPage';
import ManageTagsPage from '@/pages/ManageTagsPage';
import SpeechTestPage from '@/pages/SpeechTestPage';
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
        <Route path="/builder" element={<RoutineListPage />} />
        <Route path="/builder/new" element={<RoutineBuilderPage />} />
        <Route path="/builder/:id" element={<RoutineBuilderPage />} />
        
        {/* Workout Player */}
        <Route path="/play/:id" element={<ActiveWorkoutPage />} />

        {/* Placeholders */}
        <Route path="/train" element={<RoutineListPage />} /> 
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/tags" element={<ManageTagsPage />} />
        <Route path="/speech-test" element={<SpeechTestPage />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
