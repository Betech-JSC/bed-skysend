import React, { useState } from 'react';
import { TextInput, TextInputProps, View, Text } from 'react-native';
import { useColorScheme } from 'nativewind';

interface EnhancedTextInputProps extends TextInputProps {
  label?: string;
  error?: string;
  containerClassName?: string;
}

/**
 * Enhanced TextInput với placeholder động:
 * - Mờ khi input trống và không focus
 * - Rõ hơn khi input có focus
 * - Tự động ẩn khi có value (React Native default)
 */
export default function EnhancedTextInput({
  label,
  error,
  placeholder,
  placeholderTextColor,
  containerClassName,
  className,
  value,
  onFocus,
  onBlur,
  ...props
}: EnhancedTextInputProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isFocused, setIsFocused] = useState(false);

  // Tính toán placeholder color dựa trên focus state
  const getPlaceholderColor = () => {
    if (placeholderTextColor) {
      return placeholderTextColor;
    }
    
    // Khi có focus: rõ hơn (opacity cao)
    if (isFocused) {
      return isDark ? '#9CA3AF' : '#6B7280'; // Gray-400
    }
    
    // Khi không focus và trống: mờ hơn (opacity thấp)
    return isDark ? '#4B5563' : '#D1D5DB'; // Gray-500/Gray-300 (mờ hơn)
  };

  const handleFocus = (e: any) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: any) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  return (
    <View className={containerClassName}>
      {label && (
        <Text className="text-sm font-semibold text-text-primary dark:text-white mb-2">
          {label}
        </Text>
      )}
      <TextInput
        {...props}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={getPlaceholderColor()}
        onFocus={handleFocus}
        onBlur={handleBlur}
        className={className || `border rounded-2xl px-4 py-4 text-base bg-white dark:bg-slate-800 text-text-primary dark:text-white ${
          error
            ? "border-red-500"
            : isFocused
            ? "border-primary dark:border-primary"
            : "border-gray-300 dark:border-gray-600"
        }`}
      />
      {error && (
        <Text className="text-red-500 text-xs mt-1">{error}</Text>
      )}
    </View>
  );
}

