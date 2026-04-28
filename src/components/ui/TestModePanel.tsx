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
      // Create some basic seed data with system tags + a mock exercise to prove it works
      const tags = buildSystemTags().map((t, index) => ({ id: index + 1, ...t }));

      await seedTestDB({
        tags,
        exercises: [
          {
            id: 1,
            title: 'Mock Squat',
            defaultType: 'weight_reps',
            media: [],
            tagIds: tags.filter(t => t.name === 'Legs' || t.name === 'Strength').map(t => t.id!),
          }
        ],
        routines: [
          {
            id: 1,
            name: 'Test Routine',
            series: [],
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
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
