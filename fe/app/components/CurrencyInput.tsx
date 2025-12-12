import React, { useMemo, useState, useEffect } from 'react';
import { TextInput, TextInputProps, View, Text } from 'react-native';
import { useColorScheme } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { formatVND } from '@/utils/currencyFormatter';

interface CurrencyInputProps extends Omit<TextInputProps, 'value' | 'onChangeText' | 'keyboardType'> {
    value: string;
    onChangeText: (text: string) => void;
    onValueChange?: (numericValue: number) => void; // Callback với giá trị số
    label?: string | React.ReactNode;
    showUnit?: boolean; // Hiển thị "VNĐ" trong input
    leftIcon?: string; // Tên icon MaterialIcons bên trái
}

export default function CurrencyInput({
    value,
    onChangeText,
    onValueChange,
    label,
    showUnit = false,
    leftIcon,
    placeholder = '0',
    className,
    ...props
}: CurrencyInputProps) {
    const isDark = useColorScheme() === 'dark';
    const [internalValue, setInternalValue] = useState(value);

    // Sync với value từ bên ngoài
    useEffect(() => {
        if (value !== internalValue) {
            setInternalValue(value);
        }
    }, [value]);

    const handleChangeText = (text: string) => {
        // Loại bỏ tất cả ký tự không phải số
        const numbersOnly = text.replace(/[^\d]/g, '');

        if (!numbersOnly) {
            setInternalValue('');
            onChangeText('');
            onValueChange?.(0);
            return;
        }

        // Parse số - sử dụng Number để tránh mất số lớn
        const numValue = Number(numbersOnly);

        // Kiểm tra nếu không phải số hợp lệ
        if (isNaN(numValue) || numValue < 0 || !isFinite(numValue)) {
            // Giữ nguyên giá trị cũ nếu parse lỗi
            return;
        }

        // Format với dấu phẩy
        const formatted = formatVND(numValue);
        setInternalValue(formatted);
        onChangeText(formatted);
        onValueChange?.(numValue);
    };

    return (
        <View>
            {label && (
                <View className="mb-2">
                    {typeof label === 'string' ? (
                        <Text className="text-sm font-medium text-text-primary dark:text-white">
                            {label}
                        </Text>
                    ) : (
                        label
                    )}
                </View>
            )}
            <View className="relative">
                {leftIcon && (
                    <MaterialIcons
                        name={leftIcon as any}
                        size={20}
                        color={isDark ? '#9ca3af' : '#6b7280'}
                        style={{ position: 'absolute', left: 12, top: 17, zIndex: 10 }}
                    />
                )}
                <TextInput
                    {...props}
                    value={internalValue}
                    onChangeText={handleChangeText}
                    placeholder={placeholder}
                    keyboardType="numeric"
                    className={`h-14 rounded-lg border border-gray-200 bg-background-light text-text-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white ${leftIcon ? 'pl-10' : 'px-4'} ${showUnit ? 'pr-16' : leftIcon ? '' : 'px-4'} ${className || ''}`}
                />
                {showUnit && internalValue && (
                    <View className="absolute right-4 top-0 h-14 items-center justify-center">
                        <Text className="text-sm text-gray-500 dark:text-gray-400">VNĐ</Text>
                    </View>
                )}
            </View>
        </View>
    );
}
