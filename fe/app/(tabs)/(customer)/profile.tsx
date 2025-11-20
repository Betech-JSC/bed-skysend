// app/(customer)/profile.tsx   (hoặc app/(sender)/profile.tsx)
import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    Switch,
    Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '@/reducers/userSlice';
import { RootState } from '@/store';
import api from '@/api/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Dùng @expo/vector-icons – CHẠY NGAY, KHÔNG CẦN FONT
import { MaterialIcons, Ionicons, FontAwesome5 } from '@expo/vector-icons';

export default function ProfileScreen() {
    const router = useRouter();
    const dispatch = useDispatch();
    const user = useSelector((state: RootState) => state.user);
    const role = user?.role || 'customer';
    const isSender = role === 'sender';

    const toggleRole = () => {
        if (!user) return;
        const newRole = isSender ? 'customer' : 'sender';
        dispatch(setUser({ ...user, role: newRole }));
    };

    const logout = async () => {
        try {
            await api.post('logout');
            await AsyncStorage.removeItem('user');
            Alert.alert('Đăng xuất thành công');
            router.replace('/login');
        } catch (error: any) {
            Alert.alert('Lỗi', error.response?.data?.message || 'Đăng xuất thất bại');
        }
    };

    return (
        <View className="flex-1 bg-background-light dark:bg-background-dark">
            {/* Top App Bar */}
            <View className="sticky top-0 z-10 flex-row items-center justify-between bg-background-light dark:bg-background-dark px-4 py-4">
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={28} color="#1F2937" className="dark:text-white" />
                </TouchableOpacity>
                <Text className="absolute left-0 right-0 text-center text-xl font-bold text-text-primary dark:text-white">
                    Tài khoản
                </Text>
                <View className="w-10" />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Avatar + Info */}
                <View className="items-center px-4 pt-8">
                    <View className="h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-xl">
                        <Image
                            source={{
                                uri: user?.avatar || 'https://via.placeholder.com/150',
                            }}
                            className="h-full w-full"
                            resizeMode="cover"
                        />
                    </View>

                    <Text className="mt-4 text-2xl font-bold text-text-primary dark:text-white">
                        {user?.name || 'Người dùng'}
                    </Text>
                    <Text className="mt-1 text-base text-text-secondary dark:text-slate-400">
                        {user?.phone || 'Chưa có số điện thoại'}
                    </Text>

                    {/* Badge xác minh */}
                    <View className="mt-3 flex-row items-center gap-2 rounded-full bg-green-100 px-3 py-1.5 dark:bg-green-900/40">
                        <MaterialIcons name="verified" size={18} color="#16A34A" />
                        <Text className="text-sm font-medium text-green-800 dark:text-green-300">
                            Đã xác minh danh tính
                        </Text>
                    </View>
                </View>

                {/* Menu List */}
                <View className="mt-8 px-4 space-y-4 pb-20">
                    {/* Group 1 */}
                    <View className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-slate-800/50">
                        {/* Hồ sơ & KYC */}
                        <TouchableOpacity
                            onPress={() => router.push('/update_profile')}
                            className="flex-row items-center justify-between px-4 py-4"
                        >
                            <View className="flex-row items-center gap-4">
                                <View className="h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                    <MaterialIcons name="person" size={24} color="#2563EB" />
                                </View>
                                <Text className="text-base font-medium text-text-primary dark:text-white">
                                    Hồ sơ & Xác minh KYC
                                </Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color="#6B7280" />
                        </TouchableOpacity>

                        <View className="mx-4 border-t border-slate-100 dark:border-slate-700" />

                        {/* Vai trò của tôi */}
                        <View className="flex-row items-center justify-between px-4 py-4">
                            <View className="flex-row items-center gap-4">
                                <View className="h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                    <MaterialIcons name="swap-horiz" size={24} color="#2563EB" />
                                </View>
                                <Text className="text-base font-medium text-text-primary dark:text-white">
                                    Vai trò của tôi
                                </Text>
                            </View>
                            <Switch
                                value={isSender}
                                onValueChange={toggleRole}
                                trackColor={{ false: '#D1D5DB', true: '#2563EB' }}
                                thumbColor={isSender ? '#ffffff' : '#f4f3f4'}
                            />
                        </View>

                        <View className="mx-4 border-t border-slate-100 dark:border-slate-700" />

                        {/* Ngân hàng */}
                        <TouchableOpacity
                            onPress={() => router.push('/bank_info')}
                            className="flex-row items-center justify-between px-4 py-4"
                        >
                            <View className="flex-row items-center gap-4">
                                <View className="h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                    <MaterialIcons name="account-balance-wallet" size={24} color="#2563EB" />
                                </View>
                                <Text className="text-base font-medium text-text-primary dark:text-white">
                                    Thông tin ngân hàng / Ví nhận tiền
                                </Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Group 2 */}
                    <View className="overflow-hidden rounded-xl bg-white shadow-sm dark:bg-slate-800/50">
                        <TouchableOpacity className="flex-row items-center justify-between px-4 py-4">
                            <View className="flex-row items-center gap-4">
                                <View className="h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                    <MaterialIcons name="gavel" size={24} color="#2563EB" />
                                </View>
                                <Text className="text-base font-medium text-text-primary dark:text-white">
                                    Hợp đồng & Điều khoản
                                </Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color="#6B7280" />
                        </TouchableOpacity>

                        <View className="mx-4 border-t border-slate-100 dark:border-slate-700" />

                        <TouchableOpacity className="flex-row items-center justify-between px-4 py-4">
                            <View className="flex-row items-center gap-4">
                                <View className="h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                    <Ionicons name="help-circle" size={24} color="#2563EB" />
                                </View>
                                <Text className="text-base font-medium text-text-primary dark:text-white">
                                    Trung tâm hỗ trợ
                                </Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    {/* Đăng xuất */}
                    <TouchableOpacity
                        onPress={logout}
                        className="flex-row items-center gap-4 rounded-xl bg-white px-4 py-4 shadow-sm dark:bg-slate-800/50"
                    >
                        <View className="h-10 w-10 items-center justify-center rounded-lg bg-red-100 dark:bg-red-500/20">
                            <MaterialIcons name="logout" size={24} color="#DC2626" />
                        </View>
                        <Text className="text-base font-medium text-red-600 dark:text-red-400">
                            Đăng xuất
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}