import React, { useEffect, useState } from 'react'
import { View, Text, Image, ScrollView, ActivityIndicator, Pressable } from "react-native";
import { useSelector } from 'react-redux';
import { registerPushToken } from '@/notifications/registerPushToken';
import api from '@/api/api';
import ItemOrder from 'app/components/ItemOrder';
import { router } from 'expo-router';
import ItemOrderHome from 'app/components/ItemOrderHome';

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
            <View className="p-[24px] justify-center flex">
                <View className="justify-between flex-row gap-y-2">
                    <Text className="text-[#1B1B1B] font-semibold text-[16px]">
                        Các đơn hàng hoạt động
                    </Text>
                    <Pressable onPress={() => { router.push("/list_orders"); }}>
                        <Text className="text-[#109283] text-[14px]">
                            Xem thêm
                        </Text>
                    </Pressable>
                </View>
            </View>
            <ScrollView className="gap-y-[12px] pb-[120px]">
                {
                    orders.length === 0 ? (
                        <>
                            <Image source={require("@assets/images/create-order.webp")} className="w-[64px] h-[64px]" />
                            <Text className="text-[#0F172A] font-semibold text-[16px]">
                                Tạo hành trình đầu tiên
                            </Text>
                        </>
                    ) : <View className=" py-[12px] px-[16px]">
                        {orders.map((order) => (
                            <ItemOrderHome key={order.id} item={order} />
                        ))}
                    </View>
                }
            </ScrollView>
        </View>
    )
}

export default home