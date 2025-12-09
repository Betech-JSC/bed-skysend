import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';

interface BackButtonProps {
    onPress?: () => void;
    className?: string;
    iconColor?: string;
    iconSize?: number;
}

export default function BackButton({
    onPress,
    className = '',
    iconColor,
    iconSize = 24
}: BackButtonProps) {
    const router = useRouter();
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';


    const defaultColor = iconColor || (isDark ? '#F3F4F6' : '#1F2937');

    return (
        <TouchableOpacity
            onPress={() => router.back()}
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
