// Reusable Header Component for consistent navigation
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Typography } from 'constants/typography';
import { useColors } from 'constants/colors';

interface HeaderProps {
    title: string;
    showBack?: boolean;
    onBackPress?: () => void;
    rightComponent?: React.ReactNode;
    transparent?: boolean;
}

export default function Header({
    title,
    showBack = true,
    onBackPress,
    rightComponent,
    transparent = false,
}: HeaderProps) {
    const router = useRouter();
    const pathname = usePathname();
    const colorScheme = useColorScheme();
    const colors = useColors();
    const insets = useSafeAreaInsets();

    const handleBack = () => {
        if (onBackPress) {
            onBackPress();
        } else {
            if (router.canGoBack()) {
                router.back();
            } else {
                // Fallback to home if can't go back
                router.replace('/(tabs)/(sender)/home');
            }
        }
    };

    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: transparent ? 'transparent' : colors.background,
                    borderBottomColor: colors.border,
                    paddingTop: insets.top,
                },
                transparent && styles.transparent,
            ]}
        >
            <View style={styles.content}>
                {showBack && (
                    <TouchableOpacity
                        onPress={handleBack}
                        style={styles.backButton}
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        accessibilityLabel="Quay lại"
                        accessibilityHint="Nhấn để quay lại màn hình trước"
                        accessibilityRole="button"
                    >
                        <MaterialIcons
                            name="arrow-back"
                            size={24}
                            color={colors.text}
                        />
                    </TouchableOpacity>
                )}
                {!showBack && <View style={styles.backButton} />}

                <Text
                    style={[
                        Typography.headline,
                        {
                            flex: 1,
                            textAlign: 'center',
                            color: colors.text,
                            marginHorizontal: 8,
                        },
                    ]}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {title}
                </Text>

                {rightComponent ? (
                    <View style={styles.rightComponent}>{rightComponent}</View>
                ) : (
                    <View style={styles.backButton} />
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        justifyContent: 'flex-end',
    },
    transparent: {
        backgroundColor: 'transparent',
        borderBottomWidth: 0,
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 12,
        height: 44, // HIG standard navigation bar height
    },
    backButton: {
        minWidth: 44, // HIG minimum tap target
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rightComponent: {
        minWidth: 44, // HIG minimum tap target
        minHeight: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

