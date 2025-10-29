import React, { useEffect, useState } from "react";
import { View, ScrollView, Text, ActivityIndicator } from "react-native";
import { Stack } from "expo-router";
import ItemOrder from "../components/ItemOrder";  // Giả sử đây là component hiển thị mỗi đơn hàng
import api from "@/api/api";
import { useSelector } from "react-redux";
import useRole from "@/hooks/useRole";

function ListOrder() {
    const user = useSelector((state) => state.user);
    const role = useRole();  // This is now fetched asynchronously
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            // Only call API when role is available
            if (!role) return; // If role is null, do not fetch

            const response = await api.get("orders", {
                params: {
                    role: role,
                    // status: "pending"  // Optionally, you can add status filter here
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

    useEffect(() => {
        if (role) {
            fetchOrders();  // Only fetch orders when role is available
        }
    }, [role]);  // Re-run when role changes

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
