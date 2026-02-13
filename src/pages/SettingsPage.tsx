import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/ui/Layout';
import { Icon } from '@/components/ui/Icon';
import { useTheme, type Theme } from '@/hooks/useTheme';
import { useSettings } from '@/hooks/useSettings';
import { useAudio, getTimerSoundOptions, getTimerSoundLabel } from '@/hooks/useAudio';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { useTags } from '@/hooks/useTags';
import { Form } from '@/components/ui/Form';
import { ListItemSelect } from '@/components/ui/ListItemSelect';
import { AudioUploadInput } from '@/components/ui/AudioUploadInput';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { exportData, importData } from '@/lib/dataManagement';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const { settings, updateSettings } = useSettings();
  const { playTimerSound } = useAudio();
  const { t, i18n } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isSupported: isSpeechSupported, voices, setSelectedVoice } = useSpeechSynthesis();
  const { restoreSystemTags, deleteAllSystemTags } = useTags();

  const [importConfirmationOpen, setImportConfirmationOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [restoreTagsConfirmationOpen, setRestoreTagsConfirmationOpen] = useState(false);
  const [deleteTagsConfirmationOpen, setDeleteTagsConfirmationOpen] = useState(false);

  // Get current language code (first two letters)
  const currentLangCode = i18n.language.split('-')[0];
  const currentLanguage = currentLangCode === 'es' ? 'Español' : 'English';

  const languages = [
    { label: 'English', value: 'en' },
    { label: 'Español', value: 'es' },
  ];

  const handleLanguageChange = async (langCode: string) => {
    await i18n.changeLanguage(langCode);
    localStorage.setItem('i18nextLng', langCode);
  };

  const handleExport = async () => {
    try {
      await exportData();
    } catch (error) {
      console.error('Export failed:', error);
      // Ideally show a toast/notification
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportConfirmationOpen(true);
    }
    // Reset input so same file can be selected again if needed
    e.target.value = '';
  };

  const handleImportConfirm = async () => {
    if (!selectedFile) return;

    try {
      await importData(selectedFile);
      alert(t('settings.importSuccess', 'Data imported successfully'));
      window.location.reload();
    } catch (error) {
      console.error('Import failed:', error);
      alert(t('settings.importError', 'Failed to import data'));
    } finally {
      setImportConfirmationOpen(false);
      setSelectedFile(null);
    }
  };

  const handleRestoreSystemTags = async () => {
    try {
      await restoreSystemTags();
      alert(t('settings.restoreSuccess', 'Default tags restored successfully'));
    } catch (error) {
      console.error('Restore system tags failed:', error);
      alert(t('settings.operationError', 'Operation failed. Please try again.'));
    } finally {
      setRestoreTagsConfirmationOpen(false);
    }
  };

  const handleDeleteAllSystemTags = async () => {
    try {
      await deleteAllSystemTags();
      alert(t('settings.deleteSuccess', 'All default tags deleted successfully'));
    } catch (error) {
      console.error('Delete system tags failed:', error);
      alert(t('settings.operationError', 'Operation failed. Please try again.'));
    } finally {
      setDeleteTagsConfirmationOpen(false);
    }
  };

  return (
    <Layout
      header={
        <div className="flex items-center p-4 pb-2 justify-between border-b border-border">
          <button
            onClick={() => navigate(-1)}
            className="text-text-main flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-surface-highlight transition-colors"
          >
            <Icon name="arrow_back" size={24} />
          </button>
          <h2 className="text-text-main text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">{t('common.settings', 'Settings')}</h2>
        </div>
      }
    >
      <div className="flex flex-col gap-6 pt-4">
        {/* Section: General */}
        <section>
          {/* SectionHeader */}
          <h3 className="text-primary text-sm font-bold uppercase tracking-wider px-2 pb-3 pt-2">{t('settings.general', 'General')}</h3>
          {/* Grouped List Items Background */}
          <div className="bg-surface rounded-xl overflow-hidden shadow-sm border border-border">
            {/* ListItem: Language */}
            <ListItemSelect
              icon="language"
              label={t('settings.language', 'Language')}
              valueLabel={currentLanguage}
              value={currentLangCode}
              options={languages}
              onSelect={handleLanguageChange}
              title={t('settings.selectLanguage', 'Select Language')}
            />
          
            {/* ListItem: Manage Tags */}
            <div className="relative flex flex-col w-full border-t border-border">
              <button
                onClick={() => navigate('/settings/tags')}
                className="flex items-center gap-4 px-4 min-h-15 justify-between w-full hover:bg-surface-highlight transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary">
                    <Icon name="label" size={18} />
                  </div>
                  <p className="text-text-main text-base font-medium leading-normal flex-1 truncate text-left">
                    {t('tags.title', 'Manage Tags')}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2 text-text-secondary">
                  <Icon name="chevron_right" size={20} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            </div>

            {/* ListItem: Speech Test */}
            <div className="relative flex flex-col w-full border-t border-border">
              <button
                onClick={() => navigate('/speech-test')}
                className="flex items-center gap-4 px-4 min-h-15 justify-between w-full hover:bg-surface-highlight transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary">
                    <Icon name="mic" size={18} />
                  </div>
                  <p className="text-text-main text-base font-medium leading-normal flex-1 truncate text-left">
                    {t('speechTest.title', 'Web Speech API Test')}
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-2 text-text-secondary">
                  <Icon name="chevron_right" size={20} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Section: Workout */}
        <section>
          {/* SectionHeader */}

          <h3 className="text-primary text-sm font-bold uppercase tracking-wider px-2 pb-3 pt-2">{t('settings.workout', 'Workout')}</h3>
          
          {/* Grouped List Items Background */}
          <div className="bg-surface rounded-xl overflow-hidden shadow-sm border border-border">
          
            {/* ListItem: Auto-Next */}
            <ListItemSelect
              icon="bolt"
              label={t('settings.autoNext', 'Auto-Next')}
              valueLabel={settings.autoNext ? t('common.enabled', 'Enabled') : t('common.disabled', 'Disabled')}
              value={settings.autoNext ? 'enabled' : 'disabled'}
              options={[
                { label: t('common.enabled', 'Enabled'), value: 'enabled' },
                { label: t('common.disabled', 'Disabled'), value: 'disabled' },
              ]}
              onSelect={(value) => updateSettings({ autoNext: value === 'enabled' })}
              title={t('settings.selectAutoNext', 'Select Auto-Next')}
              description={t('settings.autoNextDesc', 'Automatically advance when target time is reached')}
            />

            {/* ListItem: Timer Sound Enabled */}
            <ListItemSelect
              icon="notifications_active"
              label={t('settings.timerSound', 'Timer Sound')}
              valueLabel={settings.timerSoundEnabled ? t('common.enabled', 'Enabled') : t('common.disabled', 'Disabled')}
              value={settings.timerSoundEnabled ? 'enabled' : 'disabled'}
              options={[
                { label: t('common.enabled', 'Enabled'), value: 'enabled' },
                { label: t('common.disabled', 'Disabled'), value: 'disabled' },
              ]}
              onSelect={(value) => updateSettings({ timerSoundEnabled: value === 'enabled' })}
              title={t('settings.selectTimerSound', 'Select Timer Sound')}
              description={t('settings.timerSoundDesc', 'Play sound when target time is reached')}
            />

            

            {/* ListItem: Voice Countdown */}
            {isSpeechSupported && (
              <ListItemSelect
                icon="record_voice_over"
                label={t('settings.voiceCountdown', 'Seconds Aloud')}
                valueLabel={settings.voiceCountdownEnabled ? t('common.enabled', 'Enabled') : t('common.disabled', 'Disabled')}
                value={settings.voiceCountdownEnabled ? 'enabled' : 'disabled'}
                options={[
                  { label: t('common.enabled', 'Enabled'), value: 'enabled' },
                  { label: t('common.disabled', 'Disabled'), value: 'disabled' },
                ]}
                onSelect={(value) => updateSettings({ voiceCountdownEnabled: value === 'enabled' })}
                title={t('settings.selectVoiceCountdown', 'Select Seconds Aloud')}
                description={t('settings.voiceCountdownDesc', 'Speak countdown seconds during workout')}
              />
            )}

            {/* ListItem: Voice Selection (only if voice countdown is enabled and supported) */}
            {isSpeechSupported && settings.voiceCountdownEnabled && voices.length > 0 && (
              <ListItemSelect
                icon="person"
                label={t('settings.voiceSelection', 'Voice Selection')}
                valueLabel={
                  voices.find(v => v.voiceURI == settings.voiceCountdownVoiceURI)?.name 
                  || t('settings.selectVoice', 'Select Voice')
                }
                value={settings.voiceCountdownVoiceURI}
                options={voices.map(voice => ({
                  label: `${voice.name} (${voice.lang})`,
                  value: voice.voiceURI
                }))}
                onSelect={(voiceURI) => {
                  const voice = voices.find(v => v.voiceURI === voiceURI);
                  if (voice) {
                    setSelectedVoice(voice);
                    updateSettings({ voiceCountdownVoiceURI: voiceURI });
                  }
                }}
                title={t('settings.selectVoice', 'Select Voice')}
              />
            )}

            {/* ListItem: Sound Selection (only if timer sound is enabled) */}
            {settings.timerSoundEnabled && (
              <>
                <ListItemSelect
                  icon="volume_up"
                  label={t('settings.soundType', 'Sound Type')}
                  valueLabel={getTimerSoundLabel(settings.timerSoundId, t)}
                  value={settings.timerSoundId}
                  options={getTimerSoundOptions(t)}
                  onSelect={(value) => updateSettings({ timerSoundId: value })}
                  title={t('settings.selectSound', 'Select Sound')}
                />

                {/* Sound Preview (for predefined sounds) */}
                {settings.timerSoundId !== 'custom' && (
                  <div className="px-4 py-3 border-t border-border">
                    <div className="flex items-center gap-3 p-3 bg-surface-highlight rounded-xl border border-border">
                      <div className="flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary">
                        <Icon name="audiotrack" size={20} />
                      </div>
                      <div className="flex-1">
                        <p className="text-text-main text-sm font-medium">
                          {getTimerSoundLabel(settings.timerSoundId, t)}
                        </p>
                        <p className="text-text-secondary text-xs">
                          {t('settings.tapToPreview', 'Tap play to preview')}
                        </p>
                      </div>
                      <button
                        onClick={() => playTimerSound(settings.timerSoundId, settings.customTimerSound)}
                        className="flex items-center justify-center size-10 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        <Icon name="play_arrow" size={20} />
                      </button>
                    </div>
                  </div>
                )}

                {/* Custom Audio Upload (only if custom is selected) */}
                {settings.timerSoundId === 'custom' && (
                  <div className="px-4 py-3 border-t border-border">
                    <AudioUploadInput
                      value={settings.customTimerSound}
                      onChange={(value) => updateSettings({ customTimerSound: value })}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Section: Appearance */}
        <section>
          {/* SectionHeader */}
          <h3 className="text-primary text-sm font-bold uppercase tracking-wider px-2 pb-3">{t('settings.appearance', 'Appearance')}</h3>
          {/* RadioList Container */}
          <Form
            onSubmit={() => { }}
            defaultValues={{ theme_selector: theme }}
          >
            <Form.RadioButtonGroup
              name="theme_selector"
              options={[
                { label: t('settings.lightMode', 'Light Mode'), value: 'light', icon: 'light_mode' },
                { label: t('settings.darkMode', 'Dark Mode'), value: 'dark', icon: 'dark_mode' },
                { label: t('settings.systemDefault', 'System Default'), value: 'system', icon: 'settings_brightness' }
              ]}
              validator={(value) => {
                if (value !== theme) {
                  setTheme(value as Theme);
                }
                return { ok: true };
              }}
            />
          </Form>
        </section>

        {/* Section: Data Management */}
        <section>
          <h3 className="text-primary text-sm font-bold uppercase tracking-wider px-2 pb-3">{t('settings.dataManagement', 'Data Management')}</h3>
          <div className="bg-surface rounded-xl overflow-hidden shadow-sm border border-border">
            {/* Export Data */}
            <div className="relative flex flex-col w-full">
              <button
                onClick={handleExport}
                className="flex items-center gap-4 px-4 min-h-15 justify-between w-full hover:bg-surface-highlight transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary">
                    <Icon name="download" size={18} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-text-main text-base font-medium leading-normal">
                      {t('settings.exportData', 'Export Data')}
                    </p>
                    <p className="text-text-secondary text-xs">
                      {t('settings.exportDataDesc', 'Download a backup of your data')}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2 text-text-secondary">
                  <Icon name="chevron_right" size={20} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            </div>

            {/* Import Data */}
            <div className="relative flex flex-col w-full border-t border-border">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-4 px-4 min-h-15 justify-between w-full hover:bg-surface-highlight transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary">
                    <Icon name="upload" size={18} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-text-main text-base font-medium leading-normal">
                      {t('settings.importData', 'Import Data')}
                    </p>
                    <p className="text-text-secondary text-xs">
                      {t('settings.importDataDesc', 'Restore data from a backup file')}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2 text-text-secondary">
                  <Icon name="chevron_right" size={20} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".json"
                onChange={handleFileSelect}
              />
            </div>

            {/* Restore Default Tags */}
            <div className="relative flex flex-col w-full border-t border-border">
              <button
                onClick={() => setRestoreTagsConfirmationOpen(true)}
                className="flex items-center gap-4 px-4 min-h-15 justify-between w-full hover:bg-surface-highlight transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-8 rounded-full bg-primary/10 text-primary">
                    <Icon name="refresh" size={18} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-text-main text-base font-medium leading-normal">
                      {t('settings.restoreDefaultTags', 'Restore Default Tags')}
                    </p>
                    <p className="text-text-secondary text-xs">
                      {t('settings.restoreDefaultTagsDesc', 'Reset all system tags to default values')}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2 text-text-secondary">
                  <Icon name="chevron_right" size={20} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            </div>

            {/* Delete All Default Tags */}
            <div className="relative flex flex-col w-full border-t border-border">
              <button
                onClick={() => setDeleteTagsConfirmationOpen(true)}
                className="flex items-center gap-4 px-4 min-h-15 justify-between w-full hover:bg-surface-highlight transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center size-8 rounded-full bg-red-500/10 text-red-500">
                    <Icon name="delete_sweep" size={18} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-text-main text-base font-medium leading-normal">
                      {t('settings.deleteDefaultTags', 'Delete All Default Tags')}
                    </p>
                    <p className="text-text-secondary text-xs">
                      {t('settings.deleteDefaultTagsDesc', 'Remove all muscle, purpose, and difficulty tags')}
                    </p>
                  </div>
                </div>
                <div className="shrink-0 flex items-center gap-2 text-text-secondary">
                  <Icon name="chevron_right" size={20} className="group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            </div>
          </div>
        </section>

        {/* Footer Info */}
        <div className="mt-auto pt-8 pb-6 flex flex-col items-center justify-center opacity-40">
          <div className="size-10 rounded-xl bg-primary mb-3 flex items-center justify-center shadow-lg shadow-primary/40">
            <Icon name="inventory_2" className="text-white" />
          </div>
          <p className="text-xs font-medium text-text-secondary">{t('settings.version', 'Lavender Focus v1.0.4')}</p>
          <p className="text-[10px] text-text-muted mt-1">{t('settings.localData', 'Local Data Storage Active')}</p>
          <p className="text-[9px] text-text-muted mt-2">
            {t('settings.soundsFrom', 'Sounds from')}{' '}
            <a 
              href="https://pixabay.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:text-text-secondary transition-colors"
            >
              Pixabay
            </a>
          </p>
        </div>
      </div>

      <ConfirmationDialog
        isOpen={importConfirmationOpen}
        onClose={() => {
          setImportConfirmationOpen(false);
          setSelectedFile(null);
        }}
        onConfirm={handleImportConfirm}
        title={t('settings.importWarningTitle', 'Import Data')}
        description={t('settings.importWarningDesc', 'This will overwrite all existing data with the content of the backup file. This action cannot be undone. Are you sure?')}
        confirmText={t('common.confirm', 'Confirm')}
        cancelText={t('common.cancel', 'Cancel')}
        variant="danger"
      />

      <ConfirmationDialog
        isOpen={restoreTagsConfirmationOpen}
        onClose={() => setRestoreTagsConfirmationOpen(false)}
        onConfirm={handleRestoreSystemTags}
        title={t('settings.restoreDefaultTagsTitle', 'Restore Default Tags')}
        description={t('settings.restoreDefaultTagsWarning', 'This will reset all system tags (muscles, purposes, difficulties) to their default values. Any custom modifications will be lost. Continue?')}
        confirmText={t('common.confirm', 'Confirm')}
        cancelText={t('common.cancel', 'Cancel')}
        variant="primary"
      />

      <ConfirmationDialog
        isOpen={deleteTagsConfirmationOpen}
        onClose={() => setDeleteTagsConfirmationOpen(false)}
        onConfirm={handleDeleteAllSystemTags}
        title={t('settings.deleteDefaultTagsTitle', 'Delete All Default Tags')}
        description={t('settings.deleteDefaultTagsWarning', 'This will permanently delete all system tags (muscles, purposes, difficulties). They will be removed from all exercises and inventory items. This action cannot be undone. Are you sure?')}
        confirmText={t('common.confirm', 'Confirm')}
        cancelText={t('common.cancel', 'Cancel')}
        variant="danger"
      />
    </Layout>
  );
}
