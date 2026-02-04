import type { TFunction } from 'i18next';
import type { Tag } from '@/types';

export const getDisplayTag = (tag: Tag, t: TFunction): string => {
  // Check if the tag name corresponds to a default tag key
  const key = `tags.defaults.${tag.name}`;
  if (t(key, { defaultValue: '__MISSING__' }) !== '__MISSING__') {
    return t(key);
  }
  return tag.name;
};
