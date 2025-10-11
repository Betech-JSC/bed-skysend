import { Stack, useRouter } from "expo-router";
import { Button, Image, Pressable, Text, View } from "react-native";

const Index = () => {

    const router = useRouter(); // Khởi tạo router

    return (
        <>
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
                <View className="flex-row justify-between px-[24px] pt-[12px] pb-[60px] bg-white">
                    <View className="flex-col items-center space-y-2">
                        <Image source={require("../../assets/images/navigation/home.webp")} className="w-[28px] h-[28px]" />
                        <Text className="text-[10px]">Home</Text>
                    </View>
                    <View className="flex-col items-center space-y-2">
                        <Image source={require("../../assets/images/navigation/order.webp")} className="w-[28px] h-[28px]" />
                        <Text className="text-[10px]">Đơn hàng</Text>
                    </View>
                    <View className="bg-yellow-400 rounded-full w-[44px] h-[44px] items-center justify-center">
                        <Image source={require("../../assets/images/plus.webp")} className="w-[16px] h-[16px]" />
                    </View>
                    <View className="flex-col items-center space-y-2">
                        <Image source={require("../../assets/images/navigation/chat.webp")} className="w-[28px] h-[28px]" />
                        <Text className="text-[10px]">Chat</Text>
                    </View>
                    <View className="flex-col items-center space-y-2">
                        <Image source={require("../../assets/images/navigation/user.webp")} className="w-[28px] h-[28px]" />
                        <Text className="text-[10px]">Profile</Text>
                    </View>
                </View>
            </View>
        </>
    )
}

export default Index;
