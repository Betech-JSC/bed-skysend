import React from 'react'
import { View, Text, Image } from "react-native";

const home = () => {
    return (
        <View className="flex justify-between h-full">
            <View>
                <View className="relative">
                    <Image source={require("../../assets/images/banner-top.webp")} className="w-full" />
                    <View className="p-[24px] absolute inset-x-0">
                        <View className="flex-row justify-between items-center">
                            <View className="flex-row space-x-[12px] items-center">
                                <View className="flex-row justify-center py-[48px]">
                                    <Image source={require("../../assets/images/avatar.webp")} className="w-[48px] h-[48px]" />
                                </View>
                                <View className="space-y-[2px]">
                                    <Text className="text-[#0F172A] font-bold text-[18px]">Tony Trần</Text>
                                    <Text className="text-[#344054]">Người vận chuyển</Text>
                                </View>
                            </View>
                            <Image source={require("../../assets/images/bell.webp")} className="w-[20px] h-[20px]" />
                        </View>
                    </View>
                </View>
                <View className="p-[24px]">
                    <View className="justify-between flex-row">
                        <Text className="text-[#1B1B1B] font-semibold text-[16px]">
                            Các đơn hàng hoạt động
                        </Text>
                        <Text className="text-[#109283] text-[14px]">
                            Xem thêm
                        </Text>
                    </View>
                    <View className="flex-col items-center py-[80px] space-y-[12px]">
                        <Image source={require("../../assets/images/create-order.webp")} className="w-[64px] h-[64px]" />
                        <Text className="text-[#0F172A] font-semibold text-[16px]">
                            Tạo hành trình đầu tiên
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    )
}

export default home