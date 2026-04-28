export * from './colors';
export * from './spacing';
export {useThemeStore} from '@store/useThemeStore';

import {useThemeStore} from '@store/useThemeStore';
import {themeColors} from './colors';

export const useThemeColors = () => {
  const themeMode = useThemeStore(state => state.themeMode);
  return themeColors[themeMode];
};
