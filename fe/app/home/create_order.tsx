import React, { useState } from "react";
import { Stack, useRouter } from "expo-router";
import { View, Text, TouchableOpacity, TextInput, Image, ScrollView, Pressable } from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialIcons, Entypo } from '@expo/vector-icons'; // Icons

function create_order() {
    const router = useRouter();

    return (
        <>
            <View className="p-4  h-full">
                <ScrollView className="space-y-[12px]">
                    <View className="space-y-[12px] bg-white p-[12px] rounded-[12px]">
                        <View >
                            <Text className="text-lg text-[#0F172A] mb-2">Hành trình của bạn</Text>
                            <View className="space-y-4">
                                <View className="flex-row items-center">
                                    <View className="w-4 h-4 bg-blue-500 rounded-full"></View>
                                    <Text className="ml-3 text-base text-[#0F172A]">Điểm khởi hành</Text>
                                </View>
                                <View className="flex-row items-center">
                                    <View className="w-4 h-4 bg-gray-300 rounded-full"></View>
                                    <Text className="ml-3 text-base text-[#0F172A]">Điểm đến</Text>
                                </View>
                                <View className="border-t border-gray-200 mt-4"></View>
                            </View>
                            <View >
                                <View className="flex-row justify-between space-x-[8px] ">
                                    <TouchableOpacity
                                        className="flex-row items-center justify-between bg-white border border-[#D0D5DD] p-3 rounded-xl w-1/2 "
                                    >
                                        <Text className="ml-2 text-base text-gray-800">Ngày</Text>
                                        <MaterialIcons name="calendar-today" size={24} color="blue" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        className="flex-row items-center justify-between bg-white border border-[#D0D5DD] p-3 rounded-xl w-1/2 "
                                    >
                                        <Text className="ml-2 text-base text-gray-800">Giờ</Text>
                                        <Entypo name="clock" size={24} color="blue" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        <View >
                            <Text className="text-lg text-[#0F172A] mb-2">Thời gian khởi hành</Text>
                            <View >
                                <View className="flex-row justify-between space-x-[8px] ">
                                    <TouchableOpacity
                                        className="flex-row items-center justify-between bg-white border border-[#D0D5DD] p-3 rounded-xl w-1/2 "

                                    >
                                        <Text className="ml-2 text-base text-gray-800">Ngày</Text>
                                        <MaterialIcons name="calendar-today" size={24} color="blue" />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        className="flex-row items-center justify-between bg-white border border-[#D0D5DD] p-3 rounded-xl w-1/2 "
                                    >
                                        <Text className="ml-2 text-base text-gray-800">Giờ</Text>
                                        <Entypo name="clock" size={24} color="blue" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                        <View >
                            <Text className="text-lg text-[#0F172A] mb-2">Thời gian đến</Text>
                            <View>
                                <View className="flex-row justify-between space-x-[8px] ">
                                    <TouchableOpacity
                                        className="flex-row items-center justify-between bg-white border border-[#D0D5DD] p-3 rounded-xl w-1/2 "

                                    >
                                        <Text className="ml-2 text-base text-gray-800">Ngày</Text>
                                        <MaterialIcons name="calendar-today" size={24} color="blue" />
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        className="flex-row items-center justify-between bg-white border border-[#D0D5DD] p-3 rounded-xl w-1/2"
                                    >
                                        <Text className="ml-2 text-base text-gray-800">Giờ</Text>
                                        <Entypo name="clock" size={24} color="blue" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </View>
                    <View className="space-y-[12px] bg-white p-[12px] rounded-[12px]">
                        <View >
                            <Text className="text-lg text-[#0F172A] mb-2">Hàng hóa</Text>
                            <View className="flex-row items-center space-x-[12px]">
                                <View className="flex-row items-center  border border-[#D0D5DD] space-x-[12px] py-[8px] px-[8px] rounded-[10px]">
                                    <Image source={require("../../assets/images/box.webp")} className="w-[24px]" />
                                    <Text>Hộp</Text>
                                </View>
                                <View className="flex-row items-center  border border-[#D0D5DD] space-x-[12px] py-[8px] px-[8px] rounded-[10px]">
                                    <Image source={require("../../assets/images/document.webp")} className="w-[24px]" />
                                    <Text>Tài liệu</Text>
                                </View>
                                <View className="flex-row items-center  border border-[#D0D5DD] space-x-[12px] py-[8px] px-[8px] rounded-[10px]">
                                    <Image source={require("../../assets/images/orther.webp")} className="w-[24px]" />
                                    <Text>Khác</Text>
                                </View>
                            </View>
                            <View className="space-y-[12px]" >
                                <View className="flex-row justify-between space-x-[8px] ">

                                </View>
                                <TextInput
                                    className="p-4 border border-gray-300 rounded-[16px] text-lg w-full"
                                    placeholder="Giá trị hàng hóa"
                                    placeholderTextColor="#667085"
                                />
                                <TextInput
                                    className=" p-4 border border-gray-300 rounded-[16px]  text-lg w-full"
                                    placeholder="Cân nặng ước tính"
                                    placeholderTextColor="#667085"
                                />
                                <View className="flex-row items-center justify-center py-[24px] border border-dashed border-[#D0D5DD] rounded-[12px]">
                                    <View className="flex-col items-center justify-center space-y-[12px]">
                                        <Image source={require("../../assets/images/upload.webp")} className="w-[28px]" />
                                        <Text>Tải ảnh hàng hóa</Text>
                                    </View>
                                </View>
                                <Text>*Đăng 1–3 ảnh chụp thực tế của kiện hàng. Ảnh giúp tăng độ tin cậy và an toàn khi vận chuyển</Text>
                                <TextInput
                                    className="p-4 border border-gray-300 rounded-[16px]  text-lg w-full"
                                    placeholder="Ghi chú"
                                    placeholderTextColor="#667085"
                                />
                            </View>
                        </View>
                    </View>
                </ScrollView>
                <View className="absolute inset-x-0 bottom-0 space-y-[16px] px-[20px] bg-white py-[40px]">
                    <View className="flex-row justify-between items-center">
                        <Text>Chi phí đơn hàng</Text>
                        <Text className="text-[#109283] font-medium">50.000 vnđ</Text>
                    </View>
                    <Pressable onPress={() => router.push("/create_order_success")}>
                        <View className="bg-[#FFD700] rounded-[12px] py-[16px]">
                            <Text className="text-[#0F172A] font-semibold text-center">Tạo đơn</Text>
                        </View>
                    </Pressable>
                </View>
            </View>
        </>
    )
}

export default create_order