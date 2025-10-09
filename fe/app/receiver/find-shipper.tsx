import { Stack, useRouter } from "expo-router";
import { Button, Image, Pressable, Text, View } from "react-native";

function FindShipper() {
    return (
        <View className="container bg-[#F5F6FA] p-[20px] h-full">
            <View className="pt-[100px] space-y-[20px]">
                <View className="space-y-[16px]">
                    <View className="items-center">
                        <Image source={require("../../assets/images/success.png")} className="w-[48px] h-[45px]" />
                    </View>
                    <View>
                        <Text className="text-[#189989] text-[28px] font-bold text-center">Đã tìm thấy người vận {"\n"} chuyển phù hợp!</Text>
                    </View>
                </View>
                <View className="bg-white p-[12px] rounded-[12px] space-y-[12px]">
                    <View className="flex-row items-center space-x-[12px]">
                        <View>
                            <Image source={require("../../assets/images/avatar.webp")} className="w-[48px] h-[48px]" />
                        </View>
                        <View className="space-y-[4px]">
                            <View className="flex-row items-center space-x-2">
                                <Text className="text-[#1B1B1B] font-semibold">Tony Trần</Text>
                                <View className="bg-[#1570EF]  rounded-[80px]">
                                    <Text className="text-white py-[2px] px-[6px]  text-center">Verified</Text>
                                </View>
                            </View>
                            <Text className="text-[#7E8492]">+97878900890</Text>
                            <View className="flex-row items-center space-x-[2px] ">
                                <Image source={require("../../assets/images/star.png")} className="w-[10px] h-[10px]" />
                                <Image source={require("../../assets/images/star.png")} className="w-[10px] h-[10px]" />
                                <Image source={require("../../assets/images/star.png")} className="w-[10px] h-[10px]" />
                                <Image source={require("../../assets/images/star.png")} className="w-[10px] h-[10px]" />
                                <Image source={require("../../assets/images/star.png")} className="w-[10px] h-[10px]" />
                            </View>
                        </View>
                    </View>
                    <View className="space-y-[12px]">
                        <Text className="text-[12px] text-[#344054]">Đơn hàng #12345</Text>
                        <View className="flex-row space-x-[8px]">
                            <View className="py-[2px] px-[8px] bg-[#D3E8FF] rounded-[30px] font-medium">
                                <Text className="font-medium">500.000 VNĐ</Text>
                            </View>
                            <View className="py-[2px] px-[8px] bg-[#FFF5E0] rounded-[30px] font-medium">
                                <Text className="text-[#FF9500]">Luggage - 2kg</Text>
                            </View>
                        </View>
                        <View className="space-y-4">
                            <View className="flex-row items-center space-x-2">
                                <View className="w-3 h-3 bg-blue-500 rounded-full" />
                                <View className="flex-1">
                                    <Text className="text-xl font-semibold">Hồ Chí Minh (SGN)</Text>
                                    <Text className="text-gray-600">10.08.2025, 10:00</Text>
                                </View>
                            </View>

                            <View className="flex-row items-center space-x-2">
                                <View className="w-3 h-3 bg-blue-900 rounded-full" />
                                <View className="flex-1">
                                    <Text className="text-xl font-semibold">Hà Nội (HAN)</Text>
                                    <Text className="text-gray-600">10.08.2025, 15:00</Text>
                                </View>
                            </View>
                        </View>
                        <View className="flex-row items-center space-x-[6px]">
                            <Image source={require("../../assets/images/bag.png")} className="rounded-[4px] w-[48px] h-[48px]" />
                            <Image source={require("../../assets/images/bag.png")} className="rounded-[4px] w-[48px] h-[48px]" />
                            <Image source={require("../../assets/images/bag.png")} className="rounded-[4px] w-[48px] h-[48px]" />
                        </View>
                    </View>
                </View>
            </View>

            <View className="absolute inset-x-0 bottom-0 space-y-[10px] px-[20px] bg-white py-[20px]">
                <View className="bg-[#F5F6FA] rounded-[12px] py-[16px]">
                    <Text className="font-semibold text-center text-[#D92D20]">Hủy</Text>
                </View>
                <View className="bg-[#FFD700] rounded-[12px] py-[16px]">
                    <Text className="text-[#0F172A] font-semibold text-center">Xác nhận người vận chuyển</Text>
                </View>
            </View>
        </View>
    )
}

export default FindShipper