import React from 'react';
import { View, Text } from 'react-native';
import BackButton from './BackButton';

interface CustomerHeaderProps {
    title: string;
    onBack?: () => void;
    rightComponent?: React.ReactNode;
    showBorder?: boolean;
}

export default function CustomerHeader({
    title,
    onBack,
    rightComponent,
    showBorder = true,
}: CustomerHeaderProps) {
    return (
        <View
            className={`h-16 flex-row items-center justify-between bg-white px-4 dark:bg-gray-800 ${
                showBorder ? 'border-b border-gray-200 dark:border-gray-700' : ''
            }`}
        >
            <BackButton onPress={onBack} />
            <Text className="flex-1 text-center text-lg font-bold text-text-dark-gray dark:text-white -ml-10">
                {title}
            </Text>
            {rightComponent || <View className="w-10" />}
        </View>
    );
}

