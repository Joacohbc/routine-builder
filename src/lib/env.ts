const TEST_MODE_KEY = '__TEST_MODE__';

export const isTestMode = (): boolean => {
  try {
    return localStorage.getItem(TEST_MODE_KEY) === 'true';
  } catch {
    return false;
  }
};

export const setTestMode = (enabled: boolean): void => {
  try {
    localStorage.setItem(TEST_MODE_KEY, String(enabled));
  } catch (error) {
    console.error('Failed to set test mode:', error);
  }
};

export const getEnvSuffix = (): string => {
  return isTestMode() ? '_test' : '';
};
