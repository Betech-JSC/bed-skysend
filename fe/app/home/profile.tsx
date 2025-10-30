import { View, Text, Pressable, Alert, ScrollView, Image, Button } from "react-native";
import api from "@/api/api";
import React, { useState } from "react";
import { useRouter } from "expo-router";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch } from "react-redux";
import { setUser } from "@/reducers/userSlice";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const Profile = () => {

    const dispatch = useDispatch();
    const router = useRouter();

    const user = useSelector((state: RootState) => state.user);
    const role = user?.role;

    const toggleRole = () => {
        if (!user) return;

        const newRole: string = role === "sender" ? "carrier" : "sender";

        dispatch(setUser({ ...user, role: newRole }));

    };

    const logout = async () => {
        try {
            const response = await api.post('logout');

            if (response.status === 200) {
                await AsyncStorage.removeItem('user');

                Alert.alert("Đăng xuất thành công");
                router.push("/login");
            } else {
                Alert.alert("Đăng xuất thất bại", response.data.message || "Vui lòng thử lại.");
            }
        } catch (error) {
            console.error("Logout error:", error);
            Alert.alert("Lỗi mạng", "Không thể kết nối đến server. Vui lòng thử lại.");
        }
    };

    return (
        <ScrollView>
            <View className="">
                <View className="p-[16px] space-y-[12px]">
                    <View className="p-[16px] bg-white rounded-[22px] space-y-[12px]">
                        <View className="space-y-[12px]">
                            <View className="flex-row space-x-[12px]">
                                <Text className="font-semibold">Nguyễn Văn Minh</Text>
                                <View className="bg-[#12B76A] rounded-[300px] px-[6px] py-[4px] flex-row space-x-[8px]">
                                    <Image source={require("../../assets/images/comfirm.webp")} />
                                    <Text className="text-white">
                                        Đã định danh</Text>
                                </View>
                            </View>
                            <View className="flex-row space-x-[12px]">
                                <Text>051188005689</Text>
                                <Text>|</Text>
                                <Text>Người gửi hàng</Text>
                            </View>
                        </View>
                        <View className="flex-row space-x-[12px] ">
                            <Pressable onPress={toggleRole} className="p-[10px]  rounded-[12px] bg-[#EFF8FF] w-1/2">
                                <Text className="text-center text-[#1570EF]">
                                    {`Chuyển sang ${role === 'sender' ? 'Carrier' : 'Sender'}`}
                                </Text>
                            </Pressable>
                            <View className="p-[10px]  rounded-[12px] bg-[#FFFAEB] w-1/2">
                                <Text className="text-center text-[#F79009]">Xem hồ sơ</Text>
                            </View>
                        </View>
                    </View>
                    <View className="p-[16px] bg-white rounded-[22px] space-y-[12px]">
                        <View className="space-y-[12px]">
                            <Text className="font-semibold">Đơn hàng</Text>
                        </View>
                        <ScrollView
                            horizontal={true}
                            showsHorizontalScrollIndicator={false}
                        >
                            <View className="flex-row space-x-[12px]">
                                <View className="space-y-[8px] flex-col items-center justify-center">
                                    <Image source={require("../../assets/images/icon-order.webp")} />
                                    <Text className="text-center">Chờ xác nhận</Text>
                                </View>
                                <View className="space-y-[8px] flex-col items-center justify-center">
                                    <Image source={require("../../assets/images/icon-order.webp")} />
                                    <Text className="text-center">Chờ lấy hàng</Text></View>
                                <View className="space-y-[8px] flex-col items-center justify-center">
                                    <Image source={require("../../assets/images/icon-order.webp")} />
                                    <Text className="text-center">Đang vận chuyển</Text></View>
                                <View className="space-y-[8px] flex-col items-center justify-center">
                                    <Image source={require("../../assets/images/icon-order.webp")} />
                                    <Text className="text-center">Hoàn thành</Text></View>
                            </View>

                        </ScrollView>
                        <View className="flex-row items-center justify-between py-[12px] border-t border-[#EAECF0]">
                            <Text>Lịch sử đơn hàng</Text>
                            <Image source={require("../../assets/images/icon-right.webp")} />
                        </View>
                    </View>
                    <View className="p-[16px] bg-white rounded-[22px]  space-y-[12px]">
                        <Text className="font-semibold">Liên kết thanh toán</Text>
                        <View className="flex-row justify-center w-full">
                            <View className="space-y-[8px]">
                                <View className="space-y-[12px] flex-row justify-center">
                                    <Image source={require("../../assets/images/icon-wallet.png")} />
                                </View>
                                <View className="w-full space-y-[8px]">
                                    <View>
                                        <Text>Chưa liên kết phương thức thanh toán nào</Text>
                                    </View>
                                    <View className=" border border-[#B2DDFF] py-[12px] rounded-[12px] w-full">
                                        <Text className="text-[#007AFF] text-center font-semibold">Thêm phương thức thanh toán</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View className="p-[16px] bg-white rounded-[22px] space-y-[12px]">
                        <View className="space-y-[12px]">
                            <Text className="font-semibold">Tổng quát</Text>
                        </View>

                        <View className="flex-row items-center justify-between py-[12px] border-b border-[#EAECF0]">
                            <Text>Bảo mật</Text>
                            <Image source={require("../../assets/images/icon-right.webp")} />
                        </View>
                        <View className="flex-row items-center justify-between py-[12px] border-b border-[#EAECF0]">
                            <Text>Cài đặt</Text>
                            <Image source={require("../../assets/images/icon-right.webp")} />
                        </View>
                        <View className="flex-row items-center justify-between py-[12px] border-b border-[#EAECF0]">
                            <Text>Trợ giúp</Text>
                            <Image source={require("../../assets/images/icon-right.webp")} />
                        </View>
                        <Pressable
                            onPress={logout}
                        >
                            <View className="flex-row items-center justify-between py-[12px]">
                                <Text className="text-[#B42318]">Đăng xuất</Text>
                                <Image source={require("../../assets/images/icon-right.webp")} />
                            </View>
                        </Pressable>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

export default Profile;
