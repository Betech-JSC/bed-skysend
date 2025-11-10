import { useEffect, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Image, Pressable, ScrollView, Text, View } from "react-native";
import api from "@/api/api"; // file axios instance của bạn

function OrderDetails() {
    const router = useRouter();
    const { orderId } = useLocalSearchParams<{ orderId: string }>();

    const [order, setOrder] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const response = await api.get(`orders/${orderId}/show`);
                setOrder(response.data.data.order);
            } catch (error) {
                console.log("Error fetching order details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrderDetails();
    }, [orderId]);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#0D6EFD" />
            </View>
        );
    }

    if (!order) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text>Không tìm thấy đơn hàng</Text>
            </View>
        );
    }

    console.log(order);

    return (
        <View className="container h-full">
            <View className="bg-white flex-row justify-between py-[12px] px-[16px]">
                <Text className="text-[#344054]">Đơn hàng #{order.id}</Text>
                <View className="rounded-[80px] overflow-hidden">
                    <Text className="text-center bg-[#2DD4BF] text-white py-[2px] px-[8px]">
                        {order.status}
                    </Text>
                </View>
            </View>

            <ScrollView>
                <View className="py-[12px] px-[16px] gap-y-[20px]">
                    <View className="bg-white p-[12px] rounded-[12px] gap-y-[12px]">
                        {/* Mô tả đơn hàng */}
                        <View className="gap-y-[4px]">
                            <Text className="text-[#667085] font-medium">Hàng hóa</Text>
                            <Text>{order.special_instructions}</Text>
                        </View>

                        <View className="gap-y-[4px]">
                            <Text className="text-[#667085] font-medium">Cân nặng</Text>
                            <Text>{order.package_weight} kg</Text>
                        </View>

                        <View className="gap-y-[4px]">
                            <Text className="text-[#667085] font-medium">Lời nhắn</Text>
                            <Text>{order.shipment_description || "Không có"}</Text>
                        </View>

                        {/* User đã match */}
                        {order.matched_order && order.matched_order.user && (
                            <View className="flex-row items-center justify-between mt-4">
                                <View className="flex-row items-center gap-x-[12px]">
                                    <Image
                                        source={require("@assets/images/avatar.webp")}
                                        className="w-[48px] h-[48px]"
                                    />
                                    <View>
                                        <Text className="font-semibold text-[#1B1B1B]">
                                            {order.matched_order.user.name}
                                        </Text>
                                        <Text className="text-[#667085]">
                                            {order.matched_order.user.email}
                                        </Text>
                                    </View>
                                </View>

                                <Pressable
                                    onPress={() => router.push(`/chat/${order.chat_id}`)}
                                >
                                    <Image
                                        source={require("@assets/images/icon-chat.webp")}
                                        className="w-[48px] h-[48px]"
                                    />
                                </Pressable>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* Footer */}
            <View className="absolute inset-x-0 bottom-0 gap-y-[10px] px-[20px] bg-white py-[20px]">
                <Pressable onPress={() => router.push("/report")}>
                    <View className="bg-[#F5F6FA] rounded-[12px] py-[16px]">
                        <Text className="font-semibold text-center text-[#D92D20]">
                            Báo cáo sự cố
                        </Text>
                    </View>
                </Pressable>
                <Pressable onPress={() => router.push("/successful_transaction")}>
                    <View className="bg-[#FFD700] rounded-[12px] py-[16px]">
                        <Text className="text-[#0F172A] font-semibold text-center">
                            Xác nhận nhận hàng
                        </Text>
                    </View>
                </Pressable>
            </View>
        </View>
    );
}

export default OrderDetails;
