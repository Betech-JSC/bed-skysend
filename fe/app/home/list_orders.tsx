import React, { useEffect, useState } from "react";
import { View, ScrollView, Text, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import ItemOrder from "../components/ItemOrder";  // Giả sử đây là component hiển thị mỗi đơn hàng
import api from "@/api/api";

function ListOrder() {
    const [orders, setOrders] = useState([]);  // State lưu danh sách đơn hàng
    const [loading, setLoading] = useState(true);  // State loading
    const [error, setError] = useState(null);  // State lỗi (nếu có)

    const fetchOrders = async () => {
        try {
            const response = await api.get("orders", {
                params: {
                    role: "sender",
                    // status: "pending"
                }
            });
            if (response.data.status === "success") {
                setOrders(response.data.data.orders.data);
            }
        } catch (err) {
            setError("Error fetching orders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

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
            <Stack.Screen
                options={{
                    title: "Danh sách đơn hàng",
                }}
            />
            <ScrollView className="flex-1 py-[12px] px-[16px] space-y-[20px]">
                {orders.map((order) => (
                    <ItemOrder key={order.id} item={order} />
                ))}
            </ScrollView>
        </>
    );
}

export default ListOrder;
