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

    const [activeTab, setActiveTab] = useState<'orders' | 'requests'>('orders');
    const [orderStatusFilter, setOrderStatusFilter] = useState<string>(''); // 'confirmed', 'picked_up', 'in_transit', 'delivered', 'completed', 'cancelled'
    const [orders, setOrders] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingRequests, setLoadingRequests] = useState(false);

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

    // Map order status to Vietnamese
    const getStatusLabel = (status: string) => {
        const statusMap: { [key: string]: { label: string; color: string } } = {
            'confirmed': { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
            'picked_up': { label: 'Đã lấy hàng', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
            'in_transit': { label: 'Đang vận chuyển', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' },
            'delivered': { label: 'Đã giao hàng', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
            'completed': { label: 'Hoàn thành', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
            'cancelled': { label: 'Đã hủy', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
            'pending': { label: 'Chờ xác nhận', color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400' },
            'accepted': { label: 'Đã chấp nhận', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
            'declined': { label: 'Đã từ chối', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
            'expired': { label: 'Hết hạn', color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400' },
        };
        return statusMap[status] || { label: status, color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400' };
    };

    // Map order status to filter tabs
    const getStatusForTab = (tabIndex: number): string => {
        const statusMap: { [key: number]: string } = {
            0: 'confirmed', // Đang xử lý
            1: 'in_transit', // Đang vận chuyển
            2: 'completed', // Hoàn thành
        };
        return statusMap[tabIndex] || '';
    };

    useEffect(() => {
        if (activeTab === 'orders') {
            fetchOrders();
        } else {
            fetchRequests();
        }
    }, [activeTab, orderStatusFilter, role]);

    const fetchOrders = async () => {
        if (!role) return;

        try {
            setLoading(true);
            setError(null);

            const params: any = {};
            if (orderStatusFilter) {
                params.status = orderStatusFilter;
            }

            const response = await api.get("orders/getList", { params });

            if (response.data?.success) {
                const ordersData = response.data.data?.data || response.data.data || [];
                setOrders(ordersData);
            } else if (response.data?.success) {
                const ordersData = response.data.data?.orders?.data || response.data.data || [];
                setOrders(ordersData);
            }
        } catch (err: any) {
            console.error('Error fetching orders:', err);
            setError(err.response?.data?.message || "Không thể tải danh sách đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    const fetchRequests = async () => {
        try {
            setLoadingRequests(true);
            setError(null);

            const response = await api.get("private-requests");

            let requestsData = [];
            if (response.data?.data) {
                // Handle paginated response
                if (response.data.data?.data) {
                    requestsData = response.data.data.data;
                } else if (Array.isArray(response.data.data)) {
                    requestsData = response.data.data;
                }
            } else if (Array.isArray(response.data)) {
                requestsData = response.data;
            }

            setRequests(requestsData);
        } catch (err: any) {
            console.error('Error fetching requests:', err);
            setError(err.response?.data?.message || "Không thể tải danh sách yêu cầu");
        } finally {
            setLoadingRequests(false);
        }
    };

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

                {/* Main Tabs: Orders vs Requests */}
                <View className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <View className="flex-row mx-4">
                        <TouchableOpacity
                            onPress={() => setActiveTab('orders')}
                            className="flex-1 items-center py-4"
                        >
                            <Text
                                className={`text-sm font-bold pb-3 ${activeTab === 'orders'
                                    ? "text-primary border-b-3 border-primary"
                                    : "text-text-secondary dark:text-gray-400 border-b-3 border-transparent"
                                    }`}
                            >
                                Đơn hàng
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setActiveTab('requests')}
                            className="flex-1 items-center py-4"
                        >
                            <Text
                                className={`text-sm font-bold pb-3 ${activeTab === 'requests'
                                    ? "text-primary border-b-3 border-primary"
                                    : "text-text-secondary dark:text-gray-400 border-b-3 border-transparent"
                                    }`}
                            >
                                Yêu cầu đã gửi
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Status Filter Tabs (only for orders) */}
                {activeTab === 'orders' && (
                    <View className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <View className="flex-row mx-4">
                            {["Đang xử lý", "Đang vận chuyển", "Hoàn thành"].map((tab, index) => {
                                const status = getStatusForTab(index);
                                const isActive = orderStatusFilter === status || (index === 0 && !orderStatusFilter);
                                return (
                                    <TouchableOpacity
                                        key={tab}
                                        onPress={() => setOrderStatusFilter(index === 0 ? '' : status)}
                                        className="flex-1 items-center py-4"
                                    >
                                        <Text
                                            className={`text-sm font-bold pb-3 ${isActive
                                                ? "text-primary border-b-3 border-primary"
                                                : "text-text-secondary dark:text-gray-400 border-b-3 border-transparent"
                                                }`}
                                        >
                                            {tab}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>
                )}

                {/* Content List */}
                <ScrollView className="flex-1 px-4 py-4" showsVerticalScrollIndicator={false}>
                    {activeTab === 'orders' ? (
                        // Orders List
                        loading ? (
                            <View className="items-center pt-16">
                                <ActivityIndicator size="large" color="#2563EB" />
                            </View>
                        ) : orders.length === 0 ? (
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
                            orders.map((order: any) => {
                                const flight = order.flight || {};
                                const customer = order.customer || order.partner || {};
                                const statusInfo = getStatusLabel(order.status || 'pending');

                                return (
                                    <View
                                        key={order.id || order.uuid}
                                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-4"
                                    >
                                        {/* Header: ID + Status */}
                                        <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                            <Text className="text-sm font-semibold text-text-secondary dark:text-gray-400">
                                                #{order.uuid || order.id}
                                            </Text>
                                            <View className={`px-2.5 py-1 rounded-full ${statusInfo.color}`}>
                                                <Text className="text-xs font-bold">{statusInfo.label}</Text>
                                            </View>
                                        </View>

                                        {/* Route */}
                                        <View className="px-4 py-6">
                                            <View className="flex-row items-center justify-between">
                                                <Text className="text-xl font-bold text-text-primary dark:text-white">
                                                    {flight.from_airport || order.from || 'N/A'}
                                                </Text>
                                                <View className="flex-row items-center gap-2">
                                                    <View className="w-4 h-px bg-gray-300 dark:bg-gray-600" />
                                                    <MaterialIcons name="flight-takeoff" size={20} color="#2563EB" />
                                                    <View className="w-4 h-px bg-gray-300 dark:bg-gray-600" />
                                                </View>
                                                <Text className="text-xl font-bold text-text-primary dark:text-white">
                                                    {flight.to_airport || order.to || 'N/A'}
                                                </Text>
                                            </View>
                                        </View>

                                        <View className="h-px bg-gray-100 dark:bg-gray-700" />

                                        {/* Customer Info + Price */}
                                        <View className="flex-row items-center justify-between px-4 py-4 gap-3">
                                            <View className="flex-row items-center gap-3 flex-1">
                                                <Image
                                                    source={{ uri: customer.avatar || 'https://via.placeholder.com/40' }}
                                                    className="w-10 h-10 rounded-full"
                                                />
                                                <View>
                                                    <Text className="font-semibold text-text-primary dark:text-white text-sm">
                                                        {customer.name || 'Hành khách'}
                                                    </Text>
                                                    <View className="flex-row items-center gap-1 mt-0.5">
                                                        <Text className="text-xs text-text-secondary dark:text-gray-400">
                                                            Hành khách
                                                        </Text>
                                                    </View>
                                                </View>
                                            </View>

                                            <View className="items-end">
                                                <Text className="font-bold text-text-primary dark:text-white">
                                                    {order.reward ? `${Number(order.reward).toLocaleString('vi-VN')}đ` : 'N/A'}
                                                </Text>
                                                {order.fee && (
                                                    <Text className="text-xs text-text-secondary dark:text-gray-400">
                                                        Phí: {order.fee}
                                                    </Text>
                                                )}
                                            </View>
                                        </View>

                                        {/* Action Button */}
                                        <View className="px-4 pb-4 pt-0">
                                            <TouchableOpacity
                                                onPress={() => router.push({
                                                    pathname: '/orders_details',
                                                    params: { orderId: order.id || order.uuid }
                                                })}
                                                className="bg-primary h-11 rounded-lg items-center justify-center"
                                            >
                                                <Text className="text-white font-bold text-sm">Xem chi tiết</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            })
                        )
                    ) : (
                        // Requests List
                        loadingRequests ? (
                            <View className="items-center pt-16">
                                <ActivityIndicator size="large" color="#2563EB" />
                            </View>
                        ) : requests.length === 0 ? (
                            <View className="items-center pt-16">
                                <View className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center">
                                    <MaterialIcons name="send" size={48} color="#9CA3AF" />
                                </View>
                                <Text className="mt-5 text-lg font-bold text-text-primary dark:text-white">
                                    Chưa có yêu cầu nào
                                </Text>
                                <Text className="text-sm text-text-secondary dark:text-gray-400 mt-1 text-center px-8">
                                    Các yêu cầu bạn đã gửi tới hành khách sẽ xuất hiện ở đây.
                                </Text>
                            </View>
                        ) : (
                            requests.map((request: any) => {
                                const flight = request.flight || {};
                                const customer = flight.customer || {};
                                const statusInfo = getStatusLabel(request.status || 'pending');

                                return (
                                    <View
                                        key={request.id || request.uuid}
                                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-4"
                                    >
                                        {/* Header: ID + Status */}
                                        <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                            <Text className="text-sm font-semibold text-text-secondary dark:text-gray-400">
                                                #{request.uuid || request.id}
                                            </Text>
                                            <View className={`px-2.5 py-1 rounded-full ${statusInfo.color}`}>
                                                <Text className="text-xs font-bold">{statusInfo.label}</Text>
                                            </View>
                                        </View>

                                        {/* Route */}
                                        <View className="px-4 py-6">
                                            <View className="flex-row items-center justify-between">
                                                <Text className="text-xl font-bold text-text-primary dark:text-white">
                                                    {flight.from_airport || 'N/A'}
                                                </Text>
                                                <View className="flex-row items-center gap-2">
                                                    <View className="w-4 h-px bg-gray-300 dark:bg-gray-600" />
                                                    <MaterialIcons name="flight-takeoff" size={20} color="#2563EB" />
                                                    <View className="w-4 h-px bg-gray-300 dark:bg-gray-600" />
                                                </View>
                                                <Text className="text-xl font-bold text-text-primary dark:text-white">
                                                    {flight.to_airport || 'N/A'}
                                                </Text>
                                            </View>
                                        </View>

                                        <View className="h-px bg-gray-100 dark:bg-gray-700" />

                                        {/* Customer Info + Reward */}
                                        <View className="flex-row items-center justify-between px-4 py-4 gap-3">
                                            <View className="flex-row items-center gap-3 flex-1">
                                                <Image
                                                    source={{ uri: customer.avatar || 'https://via.placeholder.com/40' }}
                                                    className="w-10 h-10 rounded-full"
                                                />
                                                <View>
                                                    <Text className="font-semibold text-text-primary dark:text-white text-sm">
                                                        {customer.name || 'Hành khách'}
                                                    </Text>
                                                    <Text className="text-xs text-text-secondary dark:text-gray-400 mt-0.5">
                                                        {flight.flight_number || ''} • {flight.flight_date ? new Date(flight.flight_date).toLocaleDateString('vi-VN') : ''}
                                                    </Text>
                                                </View>
                                            </View>

                                            <View className="items-end">
                                                <Text className="font-bold text-text-primary dark:text-white">
                                                    {request.reward ? `${Number(request.reward).toLocaleString('vi-VN')}đ` : 'N/A'}
                                                </Text>
                                                <Text className="text-xs text-text-secondary dark:text-gray-400">
                                                    Phần thưởng
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Action Button */}
                                        <View className="px-4 pb-4 pt-0">
                                            <TouchableOpacity
                                                onPress={() => router.push({
                                                    pathname: '/private-requests/[id]',
                                                    params: { id: request.id || request.uuid }
                                                })}
                                                className="bg-primary h-11 rounded-lg items-center justify-center"
                                            >
                                                <Text className="text-white font-bold text-sm">Xem chi tiết</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                );
                            })
                        )
                    )}
                </ScrollView>
            </SafeAreaView>
        </>
    );
}

export default ListOrder;
