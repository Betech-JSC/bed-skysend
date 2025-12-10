import { useColorScheme } from 'react-native';

export const Colors = {
  light: {
    background: '#FFFFFF',
    backgroundSecondary: '#F5F7FB',
    text: '#1F2937',
    textSecondary: '#6B7280',
    border: '#E5E7EB',
    card: '#FFFFFF',
    primary: '#2563EB',
    secondary: '#F97316',
    error: '#EF4444',
    success: '#10B981',
    warning: '#F59E0B',
  },
  dark: {
    background: '#000000',
    backgroundSecondary: '#1C1C1E',
    text: '#FFFFFF',
    textSecondary: '#AEAEB2',
    border: '#38383A',
    card: '#1C1C1E',
    primary: '#0A84FF', // iOS system blue in dark mode
    secondary: '#FF9500', // Adjusted for dark mode
    error: '#FF453A', // iOS system red in dark mode
    success: '#32D74B', // iOS system green in dark mode
    warning: '#FF9F0A', // Adjusted for dark mode
  },
};

export const useColors = () => {
  const colorScheme = useColorScheme();
  return Colors[colorScheme || 'light'];
};
