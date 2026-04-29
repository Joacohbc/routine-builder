import { getEnvSuffix } from '@/lib/env';

const IGNORED_KEYS = ['__TEST_MODE__', 'i18nextLng'];

const getNamespacedKey = (key: string): string => {
  if (IGNORED_KEYS.includes(key)) {
    return key;
  }
  return `${key}${getEnvSuffix()}`;
};

export const getStorageItem = (key: string): string | null => {
  try {
    return localStorage.getItem(getNamespacedKey(key));
  } catch (error) {
    console.error(`Failed to get item from storage for key ${key}:`, error);
    return null;
  }
};

export const setStorageItem = (key: string, value: string): void => {
  try {
    localStorage.setItem(getNamespacedKey(key), value);
  } catch (error) {
    console.error(`Failed to set item in storage for key ${key}:`, error);
  }
};

export const removeStorageItem = (key: string): void => {
  try {
    localStorage.removeItem(getNamespacedKey(key));
  } catch (error) {
    console.error(`Failed to remove item from storage for key ${key}:`, error);
  }
};

export const clearTestStorage = (): void => {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.endsWith('_test')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.error('Failed to clear test storage:', error);
  }
};
