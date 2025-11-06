import React, { useEffect, useState } from 'react'
import { View, Text, Image, ScrollView, ActivityIndicator } from "react-native";
import { useSelector } from 'react-redux';
import { registerPushToken } from '@/notifications/registerPushToken';
import api from '@/api/api';
import { Stack } from 'expo-router';
import ItemOrder from 'app/components/ItemOrder';

const home = () => {

    const user = useSelector((state) => state.user);

    useEffect(() => {
        registerPushToken(user.id);
    }, []);

    const role = user?.role;

    const [orders, setOrders] = useState([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {

            if (!role) return;

            try {
                const response = await api.get("orders", { params: { role } });

                if (response.data.status === "success") {
                    setOrders(response.data.data.orders.data);
                }
            } catch (err) {
                setError("Error fetching orders");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [role]);

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (

        <View className="flex justify-between h-full">
            <View>
                <View className="relative">
                    <Image source={require("@assets/images/banner-top.webp")} className="w-full" />
                    <View className="p-[24px] absolute inset-x-0">
                        <View className="flex-row justify-between items-center">
                            <View className="flex-row gap-x-[12px] items-center">
                                <View className="flex-row justify-center py-[48px]">
                                    <Image source={require("@assets/images/avatar.webp")} className="w-[48px] h-[48px]" />
                                </View>
                                <View className="gap-y-[2px]">
                                    <Text className="text-[#0F172A] font-bold text-[18px]"> {user.name} </Text>
                                    <Text className="text-[#344054]">{user.role} </Text>
                                </View>
                            </View>
                            <Image source={require("@assets/images/bell.webp")} className="w-[20px] h-[20px]" />
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
                </View>
                <View className="flex-col items-center py-[80px] gap-y-[12px]">
                    {
                        orders.length === 0 ? (
                            <>
                                <Image source={require("@assets/images/create-order.webp")} className="w-[64px] h-[64px]" />
                                <Text className="text-[#0F172A] font-semibold text-[16px]">
                                    Tạo hành trình đầu tiên
                                </Text>
                            </>
                        ) : <ScrollView className="flex-1 py-[12px] px-[16px] gap-y-[20px]">
                            {orders.map((order) => (
                                <ItemOrder key={order.id} item={order} />
                            ))}
                        </ScrollView>
                    }
                </View>
            </View>
        </View>
    )
}

export default home