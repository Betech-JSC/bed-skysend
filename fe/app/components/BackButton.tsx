import React from 'react';
import { TouchableOpacity, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';

interface BackButtonProps {
    onPress?: () => void;
    className?: string;
    iconColor?: string;
    iconSize?: number;
    showText?: boolean;
    text?: string;
}

export default function BackButton({
    onPress,
    className = '',
    iconColor,
    iconSize = 24,
    showText = false,
    text = 'Trở về'
}: BackButtonProps) {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';

    const defaultColor = iconColor || (isDark ? '#F3F4F6' : '#1F2937');
    const handlePress = onPress || (() => router.back());

    if (showText) {
        return (
            <TouchableOpacity
                onPress={handlePress}
                className={`flex-row items-center gap-2 ${className}`}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <MaterialIcons
                    name="arrow-back"
                    size={iconSize}
                    color={defaultColor}
                />
                <Text className={`text-base font-semibold ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
                    {text}
                </Text>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            onPress={handlePress}
            className={`h-10 w-10 items-center justify-center rounded-full ${className}`}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
            <MaterialIcons
                name="arrow-back"
                size={iconSize}
                color={defaultColor}
            />
        </TouchableOpacity>
    );
}
