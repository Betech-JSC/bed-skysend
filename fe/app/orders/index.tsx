import React, { useEffect, useState } from "react";
import { View, ScrollView, Text, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import api from "@/api/api";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import ItemOrder from "app/components/ItemOrder";

function ListOrder() {
    const user = useSelector((state: RootState) => state.user);
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

    if (error) {
        return (
            <View className="flex-1 justify-center items-center">
                <Text>{error}</Text>
            </View>
        );
    }

    return (
        <>
            <ScrollView className="flex-1 py-[12px] px-[16px] gap-y-[20px]">
                {orders.map((order) => (
                    <ItemOrder key={order.id} item={order} />
                ))}
            </ScrollView>
        </>
    );
}

export default ListOrder;
