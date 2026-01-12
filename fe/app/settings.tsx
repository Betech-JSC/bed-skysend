// app/(tabs)/settings/preferences.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    Switch,
    ScrollView,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';
import { showDeleteAccountConfirmation, executeDeleteAccount } from './utils/deleteAccount';

export default function PreferencesScreen() {
    const router = useRouter();
    const dispatch = useDispatch();
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(true);
    const [loading, setLoading] = useState(false);

    const handleDeleteAccount = async () => {
        showDeleteAccountConfirmation(async () => {
            try {
                setLoading(true);
                await executeDeleteAccount(router, dispatch);
            } catch (error) {
                // Error already handled in executeDeleteAccount
            } finally {
                setLoading(false);
            }
        });
    };

    return (
        <ScrollView className="flex-1 bg-white dark:bg-slate-900">
            <View className="p-4">
                <Text className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                    Cài đặt
                </Text>

                {/* Preferences Section */}
                <View className="mb-6">
                    <Text className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                        Tùy chọn
                    </Text>
                    <View className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-slate-800/50">
                        <View className="flex-row justify-between items-center px-4 py-4 border-b border-gray-100 dark:border-slate-700">
                            <View className="flex-row items-center gap-4">
                                <View className="h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                    <MaterialIcons name="dark-mode" size={24} color="#2563EB" />
                                </View>
                                <Text className="text-base font-medium text-gray-900 dark:text-white">
                                    Chế độ tối
                                </Text>
                            </View>
                            <Switch
                                value={darkMode}
                                onValueChange={setDarkMode}
                                trackColor={{ false: '#D1D5DB', true: '#2563EB' }}
                                thumbColor={darkMode ? '#FFFFFF' : '#F3F4F6'}
                            />
                        </View>

                        <View className="flex-row justify-between items-center px-4 py-4">
                            <View className="flex-row items-center gap-4">
                                <View className="h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                    <MaterialIcons name="notifications" size={24} color="#2563EB" />
                                </View>
                                <Text className="text-base font-medium text-gray-900 dark:text-white">
                                    Thông báo
                                </Text>
                            </View>
                            <Switch
                                value={notifications}
                                onValueChange={setNotifications}
                                trackColor={{ false: '#D1D5DB', true: '#2563EB' }}
                                thumbColor={notifications ? '#FFFFFF' : '#F3F4F6'}
                            />
                        </View>
                    </View>
                </View>

                {/* Account Management Section */}
                <View className="mb-6">
                    <Text className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                        Quản lý tài khoản
                    </Text>
                    <View className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-slate-800/50">
                        <TouchableOpacity
                            onPress={() => router.push('/update_profile')}
                            className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-slate-700"
                        >
                            <View className="flex-row items-center gap-4">
                                <View className="h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                    <MaterialIcons name="person" size={24} color="#2563EB" />
                                </View>
                                <Text className="text-base font-medium text-gray-900 dark:text-white">
                                    Cập nhật hồ sơ
                                </Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color="#6B7280" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push('/reset-password')}
                            className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-slate-700"
                        >
                            <View className="flex-row items-center gap-4">
                                <View className="h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                    <MaterialIcons name="lock" size={24} color="#2563EB" />
                                </View>
                                <Text className="text-base font-medium text-gray-900 dark:text-white">
                                    Đổi mật khẩu
                                </Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color="#6B7280" />
                        </TouchableOpacity>

                        {/* Delete Account */}
                        <TouchableOpacity
                            onPress={handleDeleteAccount}
                            disabled={loading}
                            className="flex-row items-center gap-4 px-4 py-4"
                        >
                            <View className="h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-500/20">
                                <MaterialIcons name="delete-forever" size={24} color="#DC2626" />
                            </View>
                            <View className="flex-1">
                                <Text className="text-base font-medium text-red-600 dark:text-red-400">
                                    Xóa tài khoản vĩnh viễn
                                </Text>
                                <Text className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                    Xóa tất cả dữ liệu: hồ sơ, đơn hàng, chat, ví điện tử, KYC
                                </Text>
                            </View>
                            {loading && (
                                <ActivityIndicator size="small" color="#DC2626" />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Support & Legal Section */}
                <View className="mb-6">
                    <Text className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                        Hỗ trợ & Pháp lý
                    </Text>
                    <View className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-slate-800/50">
                        <TouchableOpacity
                            onPress={() => router.push('/support-center')}
                            className="flex-row items-center justify-between px-4 py-4 border-b border-gray-100 dark:border-slate-700"
                        >
                            <View className="flex-row items-center gap-4">
                                <View className="h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                    <MaterialIcons name="help" size={24} color="#2563EB" />
                                </View>
                                <Text className="text-base font-medium text-gray-900 dark:text-white">
                                    Trung tâm hỗ trợ
                                </Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color="#6B7280" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => router.push('/terms-and-conditions')}
                            className="flex-row items-center justify-between px-4 py-4"
                        >
                            <View className="flex-row items-center gap-4">
                                <View className="h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                    <MaterialIcons name="gavel" size={24} color="#2563EB" />
                                </View>
                                <Text className="text-base font-medium text-gray-900 dark:text-white">
                                    Điều khoản sử dụng
                                </Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}
