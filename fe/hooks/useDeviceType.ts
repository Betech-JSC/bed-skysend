import { Platform, Dimensions } from 'react-native';

export const useDeviceType = () => {
  const { width, height } = Dimensions.get('window');
  const isTablet = Platform.OS === 'ios' && (width >= 768 || height >= 768);
  const isIPad = Platform.OS === 'ios' && isTablet;

  return {
    isTablet,
    isIPad,
    isPhone: !isTablet,
    width,
    height,
    // HIG recommended max content width for iPad
    maxContentWidth: isTablet ? 672 : width,
  };
};
