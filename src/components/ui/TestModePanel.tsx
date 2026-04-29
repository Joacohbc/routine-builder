import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@/components/ui/Icon';
import { isTestMode, setTestMode } from '@/lib/env';
import { clearTestStorage } from '@/lib/storage';
import { purgeTestDB, seedTestDB } from '@/lib/db';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { buildSystemTags } from '@/lib/db';

export function TestModePanel() {
  const { t } = useTranslation();
  const [testMode, setTestModeState] = useState(isTestMode());
  const [purgeConfirmationOpen, setPurgeConfirmationOpen] = useState(false);
  const [seedConfirmationOpen, setSeedConfirmationOpen] = useState(false);

  const handleToggleTestMode = () => {
    const newValue = !testMode;
    setTestModeState(newValue);
    setTestMode(newValue);
    // Reload is strictly necessary to properly unmount all global contexts and start fresh with the new db logic
    window.location.reload();
  };

  const handlePurge = async () => {
    try {
      clearTestStorage();
      await purgeTestDB();
      alert(t('developer.purgeSuccess', 'Test DB and LocalStorage have been successfully purged'));
      window.location.reload();
    } catch (error) {
      console.error('Failed to purge test environment:', error);
      alert(t('developer.operationError', 'Operation failed. Please try again.'));
    } finally {
      setPurgeConfirmationOpen(false);
    }
  };

  const handleSeed = async () => {
    try {
      // Create comprehensive seed data spanning inventory, exercises, and varied routines
      const tags = buildSystemTags().map((t, index) => ({ id: index + 1, ...t }));

      const inventory = [
        { id: 1, name: 'Dumbbells (Set)', icon: 'fitness_center', status: 'available' as const, condition: 'good' as const, quantity: 2, tagIds: [] },
        { id: 2, name: 'Yoga Mat', icon: 'sports_gymnastics', status: 'available' as const, condition: 'new' as const, quantity: 1, tagIds: [] },
        { id: 3, name: 'Resistance Band', icon: 'line_weight', status: 'available' as const, condition: 'worn' as const, quantity: 3, tagIds: [] }
      ];

      const exercises = [
        {
          id: 1,
          title: 'Dumbbell Squat',
          description: 'A lower body strength exercise.',
          defaultType: 'weight_reps' as const,
          media: [],
          tagIds: tags.filter(t => t.name === 'Legs' || t.name === 'Strength').map(t => t.id!),
          primaryEquipmentIds: [1]
        },
        {
          id: 2,
          title: 'Push-up',
          description: 'A classic bodyweight chest exercise.',
          defaultType: 'bodyweight_reps' as const,
          media: [],
          tagIds: tags.filter(t => t.name === 'Chest' || t.name === 'Strength').map(t => t.id!),
          primaryEquipmentIds: []
        },
        {
          id: 3,
          title: 'Plank',
          description: 'Core stability exercise.',
          defaultType: 'time' as const,
          media: [],
          tagIds: tags.filter(t => t.name === 'Abs' || t.name === 'Endurance').map(t => t.id!),
          primaryEquipmentIds: [2]
        },
        {
          id: 4,
          title: 'Band Pull-Aparts',
          description: 'Upper back and shoulder health.',
          defaultType: 'bodyweight_reps' as const,
          media: [],
          tagIds: tags.filter(t => t.name === 'Back' || t.name === 'Warmup').map(t => t.id!),
          primaryEquipmentIds: [3]
        }
      ];

      const routines = [
        {
          id: 1,
          name: 'Quick Core (Short)',
          description: 'A fast 5-minute core burner.',
          createdAt: new Date(),
          updatedAt: new Date(),
          series: [
            {
              id: 's1',
              type: 'standard' as const,
              restAfterSerie: 0,
              exercises: [
                {
                  id: 're1',
                  exerciseId: 3,
                  trackingType: 'time' as const,
                  restAfterSet: 30,
                  sets: [
                    { id: 'set1', type: 'working' as const, time: 60, completed: false },
                    { id: 'set2', type: 'working' as const, time: 60, completed: false },
                    { id: 'set3', type: 'failure' as const, time: 120, completed: false }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 2,
          name: 'Heavy Strength (Long)',
          description: 'Heavy dumbbell squats and chest work with long rest periods.',
          createdAt: new Date(),
          updatedAt: new Date(),
          series: [
            {
              id: 's2',
              type: 'standard' as const,
              restAfterSerie: 120,
              exercises: [
                {
                  id: 're2',
                  exerciseId: 1,
                  trackingType: 'reps' as const,
                  restAfterSet: 90,
                  sets: [
                    { id: 'set4', type: 'warmup' as const, weight: 10, reps: 15, completed: false },
                    { id: 'set5', type: 'working' as const, weight: 25, reps: 8, completed: false },
                    { id: 'set6', type: 'working' as const, weight: 25, reps: 8, completed: false },
                    { id: 'set7', type: 'working' as const, weight: 25, reps: 8, completed: false },
                    { id: 'set8', type: 'working' as const, weight: 25, reps: 8, completed: false }
                  ]
                }
              ]
            },
            {
              id: 's3',
              type: 'standard' as const,
              restAfterSerie: 60,
              exercises: [
                {
                  id: 're3',
                  exerciseId: 2,
                  trackingType: 'reps' as const,
                  restAfterSet: 60,
                  sets: [
                    { id: 'set9', type: 'working' as const, reps: 20, completed: false },
                    { id: 'set10', type: 'working' as const, reps: 18, completed: false },
                    { id: 'set11', type: 'failure' as const, reps: 15, completed: false }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 3,
          name: 'Morning Superset',
          description: 'Fast paced antagonist superset to start the day.',
          createdAt: new Date(),
          updatedAt: new Date(),
          series: [
            {
              id: 's4',
              type: 'superset' as const,
              restAfterSerie: 90,
              exercises: [
                {
                  id: 're4',
                  exerciseId: 2,
                  trackingType: 'reps' as const,
                  restAfterSet: 0,
                  sets: [
                    { id: 'set12', type: 'working' as const, reps: 15, completed: false },
                    { id: 'set13', type: 'working' as const, reps: 15, completed: false },
                    { id: 'set14', type: 'working' as const, reps: 15, completed: false }
                  ]
                },
                {
                  id: 're5',
                  exerciseId: 4,
                  trackingType: 'reps' as const,
                  restAfterSet: 0,
                  sets: [
                    { id: 'set15', type: 'working' as const, reps: 20, completed: false },
                    { id: 'set16', type: 'working' as const, reps: 20, completed: false },
                    { id: 'set17', type: 'working' as const, reps: 20, completed: false }
                  ]
                }
              ]
            }
          ]
        },
        {
          id: 4,
          name: 'Full Body Endurance',
          description: 'Conditioning routine for the whole body.',
          createdAt: new Date(),
          updatedAt: new Date(),
          series: [
            {
              id: 's5',
              type: 'standard' as const,
              restAfterSerie: 45,
              exercises: [
                {
                  id: 're6',
                  exerciseId: 1,
                  trackingType: 'reps' as const,
                  restAfterSet: 45,
                  sets: [
                    { id: 'set18', type: 'working' as const, weight: 15, reps: 20, completed: false },
                    { id: 'set19', type: 'working' as const, weight: 15, reps: 20, completed: false }
                  ]
                }
              ]
            },
            {
              id: 's6',
              type: 'standard' as const,
              restAfterSerie: 45,
              exercises: [
                {
                  id: 're7',
                  exerciseId: 2,
                  trackingType: 'time' as const,
                  restAfterSet: 45,
                  sets: [
                    { id: 'set20', type: 'working' as const, time: 45, completed: false },
                    { id: 'set21', type: 'working' as const, time: 45, completed: false }
                  ]
                }
              ]
            },
            {
              id: 's7',
              type: 'standard' as const,
              restAfterSerie: 0,
              exercises: [
                {
                  id: 're8',
                  exerciseId: 3,
                  trackingType: 'time' as const,
                  restAfterSet: 30,
                  sets: [
                    { id: 'set22', type: 'working' as const, time: 90, completed: false }
                  ]
                }
              ]
            }
          ]
        }
      ];

      await seedTestDB({
        tags,
        inventory,
        exercises,
        routines
      });

      alert(t('developer.seedSuccess', 'Test DB has been successfully seeded with mock data.'));
      window.location.reload();
    } catch (error) {
      console.error('Failed to seed test environment:', error);
      alert(t('developer.operationError', 'Operation failed. Please try again.'));
    } finally {
      setSeedConfirmationOpen(false);
    }
  };

  return (
    <div className="bg-surface rounded-xl overflow-hidden shadow-sm border border-border">
      {/* Test Mode Toggle */}
      <div className="relative flex flex-col w-full">
        <div className="flex items-center gap-4 px-4 py-4 justify-between w-full">
          <div className="flex items-center gap-3">
            <div
              className={`flex items-center justify-center size-8 rounded-full shrink-0 transition-colors ${
                testMode ? 'bg-amber-500/10 text-amber-500' : 'bg-primary/10 text-primary'
              }`}
            >
              <Icon name="bug_report" size={18} />
            </div>
            <div className="flex-1 text-left">
              <p className="text-text-main text-base font-medium leading-normal">
                {t('developer.testMode', 'Test Mode')}
              </p>
              <p className="text-text-secondary text-xs mt-1 leading-relaxed">
                {t(
                  'developer.testModeDesc',
                  'Isolate database and storage to safely test features.'
                )}
              </p>
            </div>
          </div>
          <div className="shrink-0 flex items-center">
            {/* Simple toggle UI since Form/RadioButton might require context/form wrapper */}
            <button
              onClick={handleToggleTestMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                testMode ? 'bg-amber-500' : 'bg-border'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  testMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Tools only available in Test Mode */}
      {testMode && (
        <div className="border-t border-border bg-amber-500/5">
          {/* Seed Data Button */}
          <button
            onClick={() => setSeedConfirmationOpen(true)}
            className="flex items-center gap-4 px-4 py-3 justify-between w-full hover:bg-surface-highlight transition-colors border-b border-border/50 group"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-8 rounded-full bg-green-500/10 text-green-500 shrink-0">
                <Icon name="science" size={18} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-text-main text-sm font-medium leading-normal">
                  {t('developer.seedData', 'Seed Test Data')}
                </p>
                <p className="text-text-secondary text-xs mt-1 leading-relaxed">
                  {t('developer.seedDataDesc', 'Inject mock data to test schemas')}
                </p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2 text-text-secondary">
              <Icon
                name="chevron_right"
                size={20}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </div>
          </button>

          {/* Purge DB Button */}
          <button
            onClick={() => setPurgeConfirmationOpen(true)}
            className="flex items-center gap-4 px-4 py-3 justify-between w-full hover:bg-surface-highlight transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center size-8 rounded-full bg-red-500/10 text-red-500 shrink-0">
                <Icon name="delete_forever" size={18} />
              </div>
              <div className="flex-1 text-left">
                <p className="text-text-main text-sm font-medium leading-normal">
                  {t('developer.purgeData', 'Purge Test Data')}
                </p>
                <p className="text-text-secondary text-xs mt-1 leading-relaxed">
                  {t('developer.purgeDataDesc', 'Completely erase the Test DB and Storage')}
                </p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2 text-text-secondary">
              <Icon
                name="chevron_right"
                size={20}
                className="group-hover:translate-x-0.5 transition-transform"
              />
            </div>
          </button>
        </div>
      )}

      <ConfirmationDialog
        isOpen={purgeConfirmationOpen}
        onClose={() => setPurgeConfirmationOpen(false)}
        onConfirm={handlePurge}
        title={t('developer.purgeDataTitle', 'Purge Test Data')}
        description={t(
          'developer.purgeDataWarning',
          'This will permanently delete the Test DB and test local storage. Are you sure?'
        )}
        confirmText={t('common.confirm', 'Confirm')}
        cancelText={t('common.cancel', 'Cancel')}
        variant="danger"
      />

      <ConfirmationDialog
        isOpen={seedConfirmationOpen}
        onClose={() => setSeedConfirmationOpen(false)}
        onConfirm={handleSeed}
        title={t('developer.seedDataTitle', 'Seed Test Data')}
        description={t(
          'developer.seedDataWarning',
          'This will append mock data to the current Test DB. Continue?'
        )}
        confirmText={t('common.confirm', 'Confirm')}
        cancelText={t('common.cancel', 'Cancel')}
        variant="primary"
      />
    </div>
  );
}
