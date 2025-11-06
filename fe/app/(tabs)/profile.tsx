import { View, Text, Pressable, Alert, ScrollView, Image, TouchableOpacity } from 'react-native';
import api from '@/api/api';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux';
import { setUser } from '@/reducers/userSlice';
import { RootState } from '@/store';

const Profile = () => {
    const dispatch = useDispatch();
    const router = useRouter();

    const user = useSelector((state: RootState) => state.user);
    const role = user?.role;

    const toggleRole = () => {
        if (!user) return;

        const newRole: string = role === 'sender' ? 'carrier' : 'sender';

        dispatch(setUser({ ...user, role: newRole }));
    };

    const logout = async () => {
        try {
            const response = await api.post('logout');

            if (response.status === 200) {
                await AsyncStorage.removeItem('user');

                Alert.alert('Đăng xuất thành công');
                router.push('/login');
            } else {
                Alert.alert('Đăng xuất thất bại', response.data.message || 'Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Logout error:', error);
            Alert.alert('Lỗi mạng', 'Không thể kết nối đến server. Vui lòng thử lại.');
        }
    };

    return (
        <ScrollView>
            <View className="">
                <View className="gap-y-[12px] p-[16px]">
                    <View className="gap-y-[12px] rounded-[22px] bg-white p-[16px]">
                        <View className="gap-y-[12px]">
                            <View className="flex-row gap-x-[12px]">
                                <Text className="font-semibold"> {user.name} </Text>
                                <View className="flex-row gap-x-[8px] rounded-[300px] bg-[#12B76A] px-[6px] py-[4px]">
                                    <Image source={require('@assets/images/comfirm.webp')} />
                                    <Text className="text-white">Đã định danh</Text>
                                </View>
                            </View>
                            <View className="flex-row gap-x-[12px]">
                                <Text> {user.email} </Text>
                                <Text>|</Text>
                                <Text>Người gửi hàng</Text>
                            </View>
                        </View>
                        <View className="flex-row gap-x-[12px] ">
                            <Pressable
                                onPress={toggleRole}
                                className="w-1/2 rounded-[12px] bg-[#EFF8FF] p-[10px]">
                                <Text className="text-center text-[#1570EF]">
                                    {`Chuyển sang ${role === 'sender' ? 'Carrier' : 'Sender'}`}
                                </Text>
                            </Pressable>
                            <Pressable
                                onPress={() => router.push('/update_profile')}
                                className="w-1/2  rounded-[12px] bg-[#EFF8FF] p-[10px]">
                                <View className="w-1/2 rounded-[12px] bg-[#FFFAEB] p-[10px]">
                                    <Text className="text-center text-[#F79009]">Cập nhật hồ sơ</Text>
                                </View>
                            </Pressable>
                        </View>
                    </View>
                    <View className="gap-y-[12px] rounded-[22px] bg-white p-[16px]">
                        <View className="gap-y-[12px]">
                            <Text className="font-semibold">Đơn hàng</Text>
                        </View>
                        <ScrollView horizontal={true} showsHorizontalScrollIndicator={false}>
                            <View className="flex-row gap-x-[12px]">
                                <View className="flex-col items-center justify-center gap-y-[8px]">
                                    <Image source={require('@assets/images/icon-order.webp')} />
                                    <Text className="text-center">Chờ xác nhận</Text>
                                </View>
                                <View className="flex-col items-center justify-center gap-y-[8px]">
                                    <Image source={require('@assets/images/icon-order.webp')} />
                                    <Text className="text-center">Chờ lấy hàng</Text>
                                </View>
                                <View className="flex-col items-center justify-center gap-y-[8px]">
                                    <Image source={require('@assets/images/icon-order.webp')} />
                                    <Text className="text-center">Đang vận chuyển</Text>
                                </View>
                                <View className="flex-col items-center justify-center gap-y-[8px]">
                                    <Image source={require('@assets/images/icon-order.webp')} />
                                    <Text className="text-center">Hoàn thành</Text>
                                </View>
                            </View>
                        </ScrollView>
                        <View className="flex-row items-center justify-between border-t border-[#EAECF0] py-[12px]">
                            <Text>Lịch sử đơn hàng</Text>
                            <Image source={require('@assets/images/icon-right.webp')} />
                        </View>
                    </View>
                    <View className="gap-y-[12px] rounded-[22px] bg-white p-[16px]">
                        <View className="gap-y-[12px]">
                            <Text className="font-semibold">Tổng quát</Text>
                        </View>

                        {/* Bảo mật */}
                        <TouchableOpacity
                            className="flex-row items-center justify-between border-b border-gray-300 py-3"
                            onPress={() => router.push('/security')}>
                            <Text className="text-base">Bảo mật</Text>
                            <Image source={require('@assets/images/icon-right.webp')} />
                        </TouchableOpacity>

                        {/* Cài đặt */}
                        <TouchableOpacity
                            className="flex-row items-center justify-between border-b border-gray-300 py-3"
                            onPress={() => router.push('/settings')}>
                            <Text className="text-base">Cài đặt</Text>
                            <Image source={require('@assets/images/icon-right.webp')} />
                        </TouchableOpacity>

                        {/* Trợ giúp */}
                        <TouchableOpacity
                            className="flex-row items-center justify-between border-b border-gray-300 py-3"
                            onPress={() => router.push('/support')}>
                            <Text className="text-base">Trợ giúp</Text>
                            <Image source={require('@assets/images/icon-right.webp')} />
                        </TouchableOpacity>
                        <Pressable onPress={logout}>
                            <View className="flex-row items-center justify-between py-[12px]">
                                <Text className="text-[#B42318]">Đăng xuất</Text>
                                <Image source={require('@assets/images/icon-right.webp')} />
                            </View>
                        </Pressable>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

export default Profile;
