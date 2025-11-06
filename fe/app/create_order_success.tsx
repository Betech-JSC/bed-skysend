import api from '@/api/api';
import { useOrderMatchList } from '@/hooks/useOrderMatchList';
import { RootState } from '@/store';
import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react'
import { Button, Image, Pressable, Text, View } from "react-native";
import { useSelector } from 'react-redux';

function CreateOrderSuccess() {
    const router = useRouter();

    const user = useSelector((state: RootState) => state.user);
    const role = user?.role;

    const [orders, setOrders] = useState([]);

    useOrderMatchList(
        orders.map(o => o.id),
        (chatId) => {
            router.push(`home/chat/${chatId}`);
        }
    );

    useEffect(() => {
        const fetchOrders = async () => {
            if (!role) return;

            const response = await api.get("orders", { params: { role } });

            if (response.data.status === "success") {
                setOrders(response.data.data.orders.data);
            }
        };

        fetchOrders();
    }, [role]);

    return (
        <>
            <View className="container p-[20px] bg-white h-full flex-col justify-center">
                <View>
                    <View className="gap-y-[48px]">
                        <View className="items-center">
                            <Image source={require("../assets/images/success.png")} className="w-[119px] h-[112px]" />
                        </View>
                        <View className="gap-y-[16px]">
                            <Text className="text-[#189989] text-[28px] font-bold text-center">
                                Đơn hàng của bạn đã được tạo!
                            </Text>
                            <Text className="text-center">Đơn hàng đang chờ người vận chuyển nhận.</Text>
                        </View>
                    </View>
                    <View className="gap-y-[10px] py-[20px]">
                        <Pressable onPress={() => router.push("/orders_details")}>
                            <View className="bg-[#F5F6FA] rounded-[12px] py-[16px]">
                                <Text className="text-[#0F172A] font-semibold text-center">Xem chi tiết đơn hàng</Text>
                            </View>
                        </Pressable>
                        <Pressable onPress={() => router.push("/home")}>
                            <View className="bg-[#FFD700] rounded-[12px] py-[16px]">
                                <Text className="text-[#0F172A] font-semibold text-center">Về trang chủ</Text>
                            </View>
                        </Pressable>
                    </View>
                </View>
            </View>
        </>
    )
}

export default CreateOrderSuccess