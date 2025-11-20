import React, { useEffect, useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    Image,
    ActivityIndicator,
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import api from "@/api/api";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import ItemOrder from "app/components/ItemOrder";
import { router } from "expo-router";

function ListOrder() {
    const user = useSelector((state: RootState) => state.user);
    const role = user?.role;

    const [orders, setOrders] = useState([{
        id: "SS123456",
        from: "SGN",
        to: "HAN",
        passenger: "Hoàng An",
        passengerAvatar:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuBh8HKmzWfaK4vtpBxOoC4ZKoPlavPTG6GybEFi6qr9wTcLMV-3Wi2BwZtUvEl7x6NLKmY-q8Xq33RW7PZRDumC8Ki0HJqp6E3BPM1lEB8qwB2QPwzIEHWqJVz_k8A4aT05QkN3UdoHz3cwU4VdmTyY4wx_Xv7onBkfSK2B4y2p3NCO1DDbGYnN0I6tpTAY0P0JE1Q5G3-Z0n55qQ8R_V8SGZOlCpVQuDYWTZneqZUXGily4vzhQ2LO2hbVQp1LTMoNTpJ5qhjQuIEP",
        rating: 4.8,
        role: "Hành khách",
        price: "550.000đ",
        fee: "50.000đ",
        status: "Chờ xác nhận",
        statusColor: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    },
    {
        id: "SS654321",
        from: "DAD",
        to: "SGN",
        passenger: "Thuỳ Linh",
        passengerAvatar:
            "https://lh3.googleusercontent.com/aida-public/AB6AXuDnC5mDFuQXEFEzyVVUdqIkxg_yKCWk2efDKV2Xlsi0K8D1JdEH1Dfa187-BbXA75lzWdo2RrC5vIzaZOqA_Up0wpb3Yw3y5uJnFRsTOMekxIPMF682xnctoYI63AQY6II0pQhxjKE7X6SfKRFCpq9MMRYSdGondwwdepbl0W8q7mb2hoRzc4wmLwlYBFDHc__sfZNUlNAS1LmM7bPuW6-9d6Pexi1IsewGDkyLg1E3FydvLwU3jJZAX_UcqDrXt_QvPJmt2DuBqz2H",
        rating: 4.9,
        role: "Người gửi",
        price: "320.000đ",
        fee: "20.000đ",
        status: "Đã lấy hàng",
        statusColor: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    },]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // const orders = [
    //     {
    //         id: "SS123456",
    //         from: "SGN",
    //         to: "HAN",
    //         passenger: "Hoàng An",
    //         passengerAvatar:
    //             "https://lh3.googleusercontent.com/aida-public/AB6AXuBh8HKmzWfaK4vtpBxOoC4ZKoPlavPTG6GybEFi6qr9wTcLMV-3Wi2BwZtUvEl7x6NLKmY-q8Xq33RW7PZRDumC8Ki0HJqp6E3BPM1lEB8qwB2QPwzIEHWqJVz_k8A4aT05QkN3UdoHz3cwU4VdmTyY4wx_Xv7onBkfSK2B4y2p3NCO1DDbGYnN0I6tpTAY0P0JE1Q5G3-Z0n55qQ8R_V8SGZOlCpVQuDYWTZneqZUXGily4vzhQ2LO2hbVQp1LTMoNTpJ5qhjQuIEP",
    //         rating: 4.8,
    //         role: "Hành khách",
    //         price: "550.000đ",
    //         fee: "50.000đ",
    //         status: "Chờ xác nhận",
    //         statusColor: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400",
    //     },
    //     {
    //         id: "SS654321",
    //         from: "DAD",
    //         to: "SGN",
    //         passenger: "Thuỳ Linh",
    //         passengerAvatar:
    //             "https://lh3.googleusercontent.com/aida-public/AB6AXuDnC5mDFuQXEFEzyVVUdqIkxg_yKCWk2efDKV2Xlsi0K8D1JdEH1Dfa187-BbXA75lzWdo2RrC5vIzaZOqA_Up0wpb3Yw3y5uJnFRsTOMekxIPMF682xnctoYI63AQY6II0pQhxjKE7X6SfKRFCpq9MMRYSdGondwwdepbl0W8q7mb2hoRzc4wmLwlYBFDHc__sfZNUlNAS1LmM7bPuW6-9d6Pexi1IsewGDkyLg1E3FydvLwU3jJZAX_UcqDrXt_QvPJmt2DuBqz2H",
    //         rating: 4.9,
    //         role: "Người gửi",
    //         price: "320.000đ",
    //         fee: "20.000đ",
    //         status: "Đã lấy hàng",
    //         statusColor: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
    //     },
    // ];

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

    // if (error) {
    //     return (
    //         <View className="flex-1 justify-center items-center">
    //             <Text>{error}</Text>
    //         </View>
    //     );
    // }

    return (
        <>
            <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
                {/* Top App Bar */}
                <View className="h-16 flex-row items-center justify-between px-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-700">
                    <TouchableOpacity>
                        <MaterialIcons name="arrow-back-ios-new" size={24} color="#1F2937" className="dark:text-white" />
                    </TouchableOpacity>
                    <Text className="text-lg font-bold text-text-primary dark:text-white absolute left-1/2 -translate-x-1/2">
                        Đơn hàng của tôi
                    </Text>
                    <TouchableOpacity>
                        <MaterialIcons name="search" size={26} color="#1F2937" className="dark:text-white" />
                    </TouchableOpacity>
                </View>

                {/* Tabs */}
                <View className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <View className="flex-row mx-4">
                        {["Đang xử lý", "Đang vận chuyển", "Hoàn thành"].map((tab, index) => (
                            <View key={tab} className="flex-1 items-center py-4">
                                <Text
                                    className={`text-sm font-bold pb-3 ${index === 0
                                        ? "text-primary border-b-3 border-primary"
                                        : "text-text-secondary dark:text-gray-400 border-b-3 border-transparent"
                                        }`}
                                >
                                    {tab}
                                </Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Order List */}
                <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
                    {orders.length === 0 ? (
                        // Empty State
                        <View className="items-center pt-16">
                            <View className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center">
                                <MaterialIcons name="inventory-2" size={48} color="#9CA3AF" />
                            </View>
                            <Text className="mt-5 text-lg font-bold text-text-primary dark:text-white">
                                Chưa có đơn hàng nào
                            </Text>
                            <Text className="text-sm text-text-secondary dark:text-gray-400 mt-1 text-center px-8">
                                Khi bạn có đơn hàng, chúng sẽ xuất hiện ở đây.
                            </Text>
                        </View>
                    ) : (
                        orders.map((order) => (
                            <View
                                key={order.id}
                                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-4"
                            >
                                {/* Header: ID + Status */}
                                <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                    <Text className="text-sm font-semibold text-text-secondary dark:text-gray-400">
                                        #{order.id}
                                    </Text>
                                    <View className={`px-2.5 py-1 rounded-full ${order.statusColor}`}>
                                        <Text className="text-xs font-bold">{order.status}</Text>
                                    </View>
                                </View>

                                {/* Route */}
                                <View className="px-4 py-6">
                                    <View className="flex-row items-center justify-between">
                                        <Text className="text-xl font-bold text-text-primary dark:text-white">
                                            {order.from}
                                        </Text>
                                        <View className="flex-row items-center gap-2">
                                            <View className="w-4 h-px bg-gray-300 dark:bg-gray-600" />
                                            <MaterialIcons name="flight-takeoff" size={20} color="#2563EB" />
                                            <View className="w-4 h-px bg-gray-300 dark:bg-gray-600" />
                                        </View>
                                        <Text className="text-xl font-bold text-text-primary dark:text-white">
                                            {order.to}
                                        </Text>
                                    </View>
                                </View>

                                <View className="h-px bg-gray-100 dark:bg-gray-700" />

                                {/* Passenger Info + Price */}
                                <View className="flex-row items-center justify-between px-4 py-4 gap-3">
                                    <View className="flex-row items-center gap-3 flex-1">
                                        <Image
                                            source={{ uri: order.passengerAvatar }}
                                            className="w-10 h-10 rounded-full"
                                        />
                                        <View>
                                            <Text className="font-semibold text-text-primary dark:text-white text-sm">
                                                {order.passenger}
                                            </Text>
                                            <View className="flex-row items-center gap-1 mt-0.5">
                                                <Text className="text-xs text-text-secondary dark:text-gray-400">
                                                    {order.role}
                                                </Text>
                                                <FontAwesome5 name="star" size={12} color="#facc15" solid />
                                                <Text className="text-xs font-semibold text-text-secondary dark:text-gray-400">
                                                    {order.rating}
                                                </Text>
                                            </View>
                                        </View>
                                    </View>

                                    <View className="items-end">
                                        <Text className="font-bold text-text-primary dark:text-white">
                                            {order.price}
                                        </Text>
                                        <Text className="text-xs text-text-secondary dark:text-gray-400">
                                            Phí: {order.fee}
                                        </Text>
                                    </View>
                                </View>

                                {/* Action Button */}
                                <View className="px-4 pb-4 pt-0">
                                    <TouchableOpacity onPress={() => router.push('orders_details')} className="bg-primary h-11 rounded-lg items-center justify-center">
                                        <Text className="text-white font-bold text-sm">Xem chi tiết</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            </SafeAreaView>
        </>
    );
}

export default ListOrder;
