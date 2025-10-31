import { Stack, useRouter } from "expo-router";
import { Button, Image, Pressable, ScrollView, Text, View } from "react-native";

function OrdersDetails() {
    const router = useRouter();


    return (
        <>
            <Stack.Screen
                options={{
                    title: "Chi tiết đơn hàng",
                }}
            />
            <View className="container h-full">
                <View className="bg-white flex-row justify-between py-[12px] px-[16px]">
                    <Text className="text-[#344054]">Đơn hàng #12345</Text>
                    <View className="rounded-[80px] overflow-hidden"><Text className="text-center bg-[#2DD4BF]  text-white py-[2px] px-[8px]">Đang vận chuyển</Text></View>
                </View>
                <ScrollView>
                    <View className="py-[12px] px-[16px] space-y-[20px]">
                        <View className="bg-white p-[12px] rounded-[12px] space-y-[12px]">
                            <View className="space-y-[12px]">
                                <View className="flex-row items-center space-x-[6px]">
                                    <Image source={require("../assets/images/bag.png")} className="rounded-[4px] w-[48px] h-[48px]" />
                                    <Image source={require("../assets/images/bag.png")} className="rounded-[4px] w-[48px] h-[48px]" />
                                    <Image source={require("../assets/images/bag.png")} className="rounded-[4px] w-[48px] h-[48px]" />
                                </View>
                                <View className="flex-row space-x-[8px]">
                                    <View className="py-[2px] px-[8px] bg-[#D3E8FF] rounded-[30px] font-medium">
                                        <Text className="font-medium">500.000 VNĐ</Text>
                                    </View>
                                    <View className="py-[2px] px-[8px] bg-[#FFF5E0] rounded-[30px] font-medium">
                                        <Text className="text-[#FF9500]">Luggage - 2kg</Text>
                                    </View>
                                </View>
                                <View className="space-y-[12px]">
                                    <View className="space-y-[4px]">
                                        <Text className="text-[#667085] font-medium" >Cân nặng</Text>
                                        <Text>8kg</Text>
                                    </View>
                                    <View className="space-y-[4px]">
                                        <Text className="text-[#667085] font-medium" >Lời nhắn</Text>
                                        <Text>Giao trước 10h sáng, vui lòng giữ thẳng đứng</Text>
                                    </View>
                                </View>
                                <View className="flex-row items-center justify-between ">
                                    <View className="space-x-[12px] flex-row items-center">
                                        <View>
                                            <Image source={require("../assets/images/avatar.webp")} className="w-[48px] h-[48px]" />
                                        </View>
                                        <View className="flex-row">
                                            <View>
                                                <View className="flex-row items-center space-x-2">
                                                    <Text className="text-[#1B1B1B] font-semibold">Tony Trần</Text>
                                                    <View className="bg-[#2DD4BF]  rounded-[80px]">
                                                        <Text className="text-white py-[2px] px-[6px]  text-center">Verified</Text>
                                                    </View>
                                                </View>
                                                <View className="flex-row items-center space-x-[2px] ">
                                                    <Image source={require("../assets/images/star.png")} className="w-[10px] h-[10px]" />
                                                    <Image source={require("../assets/images/star.png")} className="w-[10px] h-[10px]" />
                                                    <Image source={require("../assets/images/star.png")} className="w-[10px] h-[10px]" />
                                                    <Image source={require("../assets/images/star.png")} className="w-[10px] h-[10px]" />
                                                    <Image source={require("../assets/images/star.png")} className="w-[10px] h-[10px]" />
                                                </View>
                                            </View>
                                        </View>
                                    </View>
                                    <Pressable
                                        onPress={() => router.push(`/home/chat/${"-OcuK_Xu30NhZcwX8IH9"}`)}
                                    >
                                        <View>
                                            <Image source={require("../assets/images/icon-chat.webp")} className="w-[48px] h-[48px]" />
                                        </View>
                                    </Pressable>
                                </View>
                                <View>
                                    <Image source={require("../assets/images/map.webp")} className="h-[210px] w-full" />
                                </View>
                                <View className="space-y-4">
                                    <View className="flex-row items-center space-x-[8px]">
                                        <Image source={require("../assets/images/icon-flight.webp")} className="w-[24px] h-[24px]" />
                                        <View>
                                            <Text>Chuyến bay VN662</Text>
                                            <Text>Đang bay – 1h20m còn lại</Text>
                                        </View>
                                    </View>
                                    <View className="flex-row items-center space-x-2">
                                        <View className="w-3 h-3 bg-blue-500 rounded-full" />
                                        <View className="flex-1">
                                            <Text className="font-semibold">Hồ Chí Minh (SGN)</Text>
                                            <Text className="text-gray-600">10.08.2025, 10:00</Text>
                                        </View>
                                    </View>

                                    <View className="flex-row items-center space-x-2">
                                        <View className="w-3 h-3 bg-blue-900 rounded-full" />
                                        <View className="flex-1">
                                            <Text className="font-semibold">Hà Nội (HAN)</Text>
                                            <Text className="text-gray-600">10.08.2025, 15:00</Text>
                                        </View>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
                <View className="absolute inset-x-0 bottom-0 space-y-[10px] px-[20px] bg-white py-[20px]">
                    <View className="bg-[#F5F6FA] rounded-[12px] py-[16px]">
                        <Text className="font-semibold text-center text-[#D92D20]">Báo cáo sự cố</Text>
                    </View>
                    <Pressable onPress={() => router.push("/successful_transaction")}>
                        <View className="bg-[#FFD700] rounded-[12px] py-[16px]">
                            <Text className="text-[#0F172A] font-semibold text-center">Xác nhận nhận hàng</Text>
                        </View>
                    </Pressable>
                </View>
            </View>
        </>
    )
}

export default OrdersDetails