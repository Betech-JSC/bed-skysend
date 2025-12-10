import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, AccessibilityProps } from 'react-native';
import { Typography } from '@/constants/typography';
import { useColors } from '@/constants/colors';

interface ButtonProps extends AccessibilityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'large' | 'medium' | 'small';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'large',
  disabled = false,
  loading = false,
  fullWidth = false,
  accessibilityLabel,
  accessibilityHint,
  ...accessibilityProps
}) => {
  const colors = useColors();

  // HIG minimum: 44pt height for large buttons
  const height = size === 'large' ? 44 : size === 'medium' ? 36 : 32;
  const minHeight = 44; // HIG requirement

  const buttonStyle: ViewStyle = {
    minHeight: Math.max(height, minHeight),
    paddingHorizontal: size === 'large' ? 32 : size === 'medium' ? 24 : 16,
    paddingVertical: (Math.max(height, minHeight) - 22) / 2, // Center text vertically
    borderRadius: 10, // HIG standard corner radius
    justifyContent: 'center',
    alignItems: 'center',
    width: fullWidth ? '100%' : undefined,
    opacity: disabled || loading ? 0.5 : 1,
  };

  const textStyle: TextStyle = {
    ...Typography.headline,
    color: variant === 'primary' ? '#FFFFFF' : colors.primary,
  };

  if (variant === 'primary') {
    buttonStyle.backgroundColor = colors.primary;
  } else if (variant === 'secondary') {
    buttonStyle.backgroundColor = colors.backgroundSecondary;
    textStyle.color = colors.primary;
  } else if (variant === 'outline') {
    buttonStyle.borderWidth = 1;
    buttonStyle.borderColor = colors.primary;
    buttonStyle.backgroundColor = 'transparent';
  } else if (variant === 'text') {
    buttonStyle.backgroundColor = 'transparent';
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={buttonStyle}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} // Extra hit area
      accessibilityLabel={accessibilityLabel || title}
      accessibilityHint={accessibilityHint}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      {...accessibilityProps}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : colors.primary} />
      ) : (
        <Text style={textStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};
