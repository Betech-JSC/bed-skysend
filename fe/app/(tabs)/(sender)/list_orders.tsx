import React, { useEffect, useState, useCallback } from "react";
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
import { Alert } from "react-native";
import api from "@/api/api";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import ItemOrder from "app/components/ItemOrder";
import { router, Stack, useFocusEffect } from "expo-router";
import { getAvatarUrl } from "@/constants/avatars";
import {
    normalizeOrderStatus,
    getOrderStatusLabel,
    getRequestStatusLabel,
    ORDER_FILTER_TABS,
    REQUEST_FILTER_TABS,
} from "../../utils/orderStatusUtils";
import { getAirportWithCity } from "../../utils/airportUtils";
import { formatDateOnly } from "../../utils/dateUtils";

function ListOrder() {
    const user = useSelector((state: RootState) => state.user);
    const role = user?.role;

    const [activeTab, setActiveTab] = useState<'orders' | 'requests'>('orders');
    const [orderStatusFilter, setOrderStatusFilter] = useState<string>(''); // 'confirmed', 'picked_up', 'in_transit', 'delivered', 'completed', 'cancelled'
    const [requestStatusFilter, setRequestStatusFilter] = useState<string>(''); // 'pending', 'accepted', 'declined', 'confirmed', 'expired', 'cancelled'
    const [orders, setOrders] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadingRequests, setLoadingRequests] = useState(false);

    // Fetch data khi filter thay đổi
    useEffect(() => {
        if (activeTab === 'orders') {
            fetchOrders();
        } else {
            fetchRequests();
        }
    }, [activeTab, orderStatusFilter, requestStatusFilter, role]);

    // Fetch lại data khi quay lại màn hình
    useFocusEffect(
        useCallback(() => {
            if (activeTab === 'orders') {
                fetchOrders();
            } else {
                fetchRequests();
            }
        }, [activeTab, orderStatusFilter, requestStatusFilter])
    );

    const fetchOrders = async () => {
        if (!role) return;

        try {
            setLoading(true);
            setError(null);

            const params: any = {};
            // Backend vẫn dùng status cũ, filter ở frontend sau khi nhận data

            const response = await api.get("orders/getList", { params });

            let ordersData = [];
            if (response.data?.success) {
                ordersData = response.data.data?.data || response.data.data || [];
            } else if (response.data?.success) {
                ordersData = response.data.data?.orders?.data || response.data.data || [];
            }

            // Filter theo status mới nếu có filter
            if (orderStatusFilter) {
                ordersData = ordersData.filter((order: any) => {
                    const normalized = normalizeOrderStatus(order.status);
                    return normalized === orderStatusFilter;
                });
            }

            // Sort by priority: urgent > priority > normal/null, then by created_at desc
            ordersData.sort((a: any, b: any) => {
                const priorityOrder: { [key: string]: number } = {
                    'urgent': 1,
                    'priority': 2,
                    'normal': 3,
                };
                const aPriority = a.request?.priority_level || 'normal';
                const bPriority = b.request?.priority_level || 'normal';
                const aPriorityOrder = priorityOrder[aPriority] || 3;
                const bPriorityOrder = priorityOrder[bPriority] || 3;
                
                if (aPriorityOrder !== bPriorityOrder) {
                    return aPriorityOrder - bPriorityOrder;
                }
                
                // Secondary sort by created_at desc
                const aDate = new Date(a.created_at || 0).getTime();
                const bDate = new Date(b.created_at || 0).getTime();
                return bDate - aDate;
            });

            setOrders(ordersData);
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

            const params: any = {};
            if (requestStatusFilter) {
                params.status = requestStatusFilter;
            }

            const response = await api.get("private-requests", { params });

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

            // Chỉ lấy các request có flight_id (đã gửi tới customer)
            requestsData = requestsData.filter((request: any) => request.flight_id !== null && request.flight_id !== undefined);

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


    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: true,
                    title: 'Đơn hàng',
                    headerTitle: 'Đơn hàng của tôi',
                    headerTitleStyle: {
                        fontSize: 16,
                        fontWeight: 'bold',
                        color: '#111318',
                    },
                }}
            />
            <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
                {/* Main Tabs: Orders vs Requests */}
                <View className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <View className="flex-row mx-4">
                        <TouchableOpacity
                            onPress={() => {
                                setActiveTab('orders');
                                // Reset request filter khi chuyển sang tab orders
                                setRequestStatusFilter('');
                            }}
                            className={`flex-1 items-center py-4 ${activeTab === 'orders' ? 'border-b-2 border-primary' : ''}`}
                        >
                            <View className="flex-row items-center gap-2">
                                <MaterialIcons
                                    name="inventory-2"
                                    size={20}
                                    color={activeTab === 'orders' ? "#2563EB" : "#6B7280"}
                                />
                                <Text
                                    className={`text-sm font-bold ${activeTab === 'orders'
                                        ? "text-primary"
                                        : "text-text-secondary dark:text-gray-400"
                                        }`}
                                >
                                    Đơn hàng
                                </Text>
                            </View>
                            <Text className="text-xs text-text-secondary dark:text-gray-400 mt-1">
                                Đơn đã xác nhận
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                setActiveTab('requests');
                                // Reset order filter khi chuyển sang tab requests
                                setOrderStatusFilter('');
                            }}
                            className={`flex-1 items-center py-4 ${activeTab === 'requests' ? 'border-b-2 border-primary' : ''}`}
                        >
                            <View className="flex-row items-center gap-2">
                                <MaterialIcons
                                    name="send"
                                    size={20}
                                    color={activeTab === 'requests' ? "#2563EB" : "#6B7280"}
                                />
                                <Text
                                    className={`text-sm font-bold ${activeTab === 'requests'
                                        ? "text-primary"
                                        : "text-text-secondary dark:text-gray-400"
                                        }`}
                                >
                                    Yêu cầu đã gửi
                                </Text>
                            </View>
                            <Text className="text-xs text-text-secondary dark:text-gray-400 mt-1">
                                Yêu cầu gửi hàng
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Status Filter Tabs for Orders */}
                {activeTab === 'orders' && (
                    <View className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="flex-row"
                            contentContainerStyle={{ paddingHorizontal: 16 }}
                        >
                            {ORDER_FILTER_TABS.map((tab) => {
                                const isActive = orderStatusFilter === tab.status;
                                return (
                                    <TouchableOpacity
                                        key={tab.status || 'all'}
                                        onPress={() => setOrderStatusFilter(tab.status)}
                                        className={`items-center py-3 px-4 mr-2 rounded-lg ${isActive
                                            ? "bg-primary/10"
                                            : ""
                                            }`}
                                    >
                                        <Text
                                            className={`text-sm font-semibold ${isActive
                                                ? "text-primary"
                                                : "text-text-secondary dark:text-gray-400"
                                                }`}
                                        >
                                            {tab.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>
                )}

                {/* Status Filter Tabs for Requests */}
                {activeTab === 'requests' && (
                    <View className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="flex-row"
                            contentContainerStyle={{ paddingHorizontal: 16 }}
                        >
                            {REQUEST_FILTER_TABS.map((tab) => {
                                const isActive = requestStatusFilter === tab.status;
                                return (
                                    <TouchableOpacity
                                        key={tab.status || 'all'}
                                        onPress={() => setRequestStatusFilter(tab.status)}
                                        className={`items-center py-3 px-4 mr-2 rounded-lg ${isActive
                                            ? "bg-primary/10"
                                            : ""
                                            }`}
                                    >
                                        <Text
                                            className={`text-sm font-semibold ${isActive
                                                ? "text-primary"
                                                : "text-text-secondary dark:text-gray-400"
                                                }`}
                                        >
                                            {tab.label}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
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
                                const statusInfo = getOrderStatusLabel(order.status || 'pending');

                                return (
                                    <View
                                        key={order.id || order.uuid}
                                        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden mb-4"
                                    >
                                        {/* Header: ID + Status */}
                                        <View className="flex-row justify-between items-center px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                            <View className="flex-row items-center gap-2">
                                                <Text className="text-sm font-semibold text-text-secondary dark:text-gray-400">
                                                    #{order.uuid || order.id}
                                                </Text>
                                                {order.request?.priority_level === 'urgent' && (
                                                    <View className="bg-red-500 px-2 py-0.5 rounded-full">
                                                        <Text className="text-xs font-bold text-white">Gấp</Text>
                                                    </View>
                                                )}
                                                {order.request?.priority_level === 'priority' && (
                                                    <View className="bg-orange-500 px-2 py-0.5 rounded-full">
                                                        <Text className="text-xs font-bold text-white">Ưu tiên</Text>
                                                    </View>
                                                )}
                                            </View>
                                            <View className={`px-2.5 py-1 rounded-full ${statusInfo.color}`}>
                                                <Text className="text-xs font-bold">{statusInfo.label}</Text>
                                            </View>
                                        </View>

                                        {/* Route */}
                                        <View className="px-4 py-6">
                                            <View className="flex-row items-center justify-between">
                                                <Text className="text-xl font-bold text-text-primary dark:text-white">
                                                    {getAirportWithCity(flight.from_airport || order.from)}
                                                </Text>
                                                <View className="flex-row items-center gap-2">
                                                    <View className="w-4 h-px bg-gray-300 dark:bg-gray-600" />
                                                    <MaterialIcons name="flight-takeoff" size={20} color="#2563EB" />
                                                    <View className="w-4 h-px bg-gray-300 dark:bg-gray-600" />
                                                </View>
                                                <Text className="text-xl font-bold text-text-primary dark:text-white">
                                                    {getAirportWithCity(flight.to_airport || order.to)}
                                                </Text>
                                            </View>
                                        </View>

                                        <View className="h-px bg-gray-100 dark:bg-gray-700" />

                                        {/* Hình ảnh kiện hàng */}
                                        {order.request?.item_images && Array.isArray(order.request.item_images) && order.request.item_images.length > 0 && (
                                            <View className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                                <Text className="text-xs text-gray-500 mb-2">Hình ảnh kiện hàng ({order.request.item_images.length})</Text>
                                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                                    <View className="flex-row gap-2">
                                                        {order.request.item_images.slice(0, 4).map((imageUrl: string, index: number) => (
                                                            <Image
                                                                key={index}
                                                                source={{ uri: imageUrl }}
                                                                className="w-16 h-16 rounded-lg"
                                                                resizeMode="cover"
                                                            />
                                                        ))}
                                                        {order.request.item_images.length > 4 && (
                                                            <View className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 items-center justify-center">
                                                                <Text className="text-xs text-gray-600 dark:text-gray-400">
                                                                    +{order.request.item_images.length - 4}
                                                                </Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                </ScrollView>
                                            </View>
                                        )}

                                        {/* Hình ảnh vé máy bay */}
                                        {flight.item_images && Array.isArray(flight.item_images) && flight.item_images.length > 0 && (
                                            <View className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                                                <Text className="text-xs text-gray-500 mb-2">Hình ảnh vé máy bay ({flight.item_images.length})</Text>
                                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                                    <View className="flex-row gap-2">
                                                        {flight.item_images.slice(0, 4).map((imageUrl: string, index: number) => (
                                                            <Image
                                                                key={index}
                                                                source={{ uri: imageUrl }}
                                                                className="w-16 h-16 rounded-lg"
                                                                resizeMode="cover"
                                                            />
                                                        ))}
                                                        {flight.item_images.length > 4 && (
                                                            <View className="w-16 h-16 rounded-lg bg-gray-200 dark:bg-gray-700 items-center justify-center">
                                                                <Text className="text-xs text-gray-600 dark:text-gray-400">
                                                                    +{flight.item_images.length - 4}
                                                                </Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                </ScrollView>
                                            </View>
                                        )}

                                        {/* Customer Info + Price */}
                                        <View className="flex-row items-center justify-between px-4 py-4 gap-3">
                                            <View className="flex-row items-center gap-3 flex-1">
                                                {/* Avatar temporarily hidden */}
                                                {/* <Image
                                                    source={{ uri: getAvatarUrl(customer.avatar) }}
                                                    className="w-10 h-10 rounded-full"
                                                /> */}
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
                                                    {order.reward ? `${Number(order.reward).toLocaleString('vi-VN')}đ` : 'Chưa có'}
                                                </Text>
                                                {order.fee && (
                                                    <Text className="text-xs text-text-secondary dark:text-gray-400">
                                                        Phí: {order.fee}
                                                    </Text>
                                                )}
                                            </View>
                                        </View>

                                        {/* Action Buttons */}
                                        <View className="px-4 pb-4 pt-0 gap-2">
                                            <View className="flex-row gap-2">
                                                <TouchableOpacity
                                                    onPress={() => router.push({
                                                        pathname: '/orders_details',
                                                        params: { orderId: order.id || order.uuid }
                                                    })}
                                                    className="bg-primary flex-1 h-11 rounded-lg items-center justify-center"
                                                >
                                                    <Text className="text-white font-bold text-sm">Xem chi tiết</Text>
                                                </TouchableOpacity>

                                                {customer.name && (
                                                    <TouchableOpacity
                                                        onPress={() => {
                                                            // Use chat_id if available, otherwise use order id/uuid
                                                            const chatId = order.chat_id || order.id || order.uuid;
                                                            router.push({
                                                                pathname: '/chat/[chatId]',
                                                                params: {
                                                                    chatId: String(chatId),
                                                                    partnerName: customer.name || 'Hành khách',
                                                                    partnerAvatar: getAvatarUrl(customer.avatar),
                                                                }
                                                            } as any);
                                                        }}
                                                        className="bg-blue-600 h-11 rounded-lg items-center justify-center px-4"
                                                    >
                                                        <MaterialIcons name="chat" size={20} color="white" />
                                                    </TouchableOpacity>
                                                )}
                                            </View>
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
                                const statusInfo = getRequestStatusLabel(request.status || 'pending');

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
                                                    {getAirportWithCity(flight.from_airport)}
                                                </Text>
                                                <View className="flex-row items-center gap-2">
                                                    <View className="w-4 h-px bg-gray-300 dark:bg-gray-600" />
                                                    <MaterialIcons name="flight-takeoff" size={20} color="#2563EB" />
                                                    <View className="w-4 h-px bg-gray-300 dark:bg-gray-600" />
                                                </View>
                                                <Text className="text-xl font-bold text-text-primary dark:text-white">
                                                    {getAirportWithCity(flight.to_airport)}
                                                </Text>
                                            </View>
                                        </View>

                                        <View className="h-px bg-gray-100 dark:bg-gray-700" />

                                        {/* Customer Info + Reward */}
                                        <View className="flex-row items-center justify-between px-4 py-4 gap-3">
                                            <View className="flex-row items-center gap-3 flex-1">
                                                {/* Avatar temporarily hidden */}
                                                {/* <Image
                                                    source={{ uri: getAvatarUrl(customer.avatar) }}
                                                    className="w-10 h-10 rounded-full"
                                                /> */}
                                                <View>
                                                    <Text className="font-semibold text-text-primary dark:text-white text-sm">
                                                        {customer.name || 'Hành khách'}
                                                    </Text>
                                                    <Text className="text-xs text-text-secondary dark:text-gray-400 mt-0.5">
                                                        {flight.flight_number || ''} • {flight.flight_date ? formatDateOnly(flight.flight_date) : ''}
                                                    </Text>
                                                </View>
                                            </View>

                                            <View className="items-end">
                                                <Text className="font-bold text-text-primary dark:text-white">
                                                    {request.reward ? `${Number(request.reward).toLocaleString('vi-VN')}đ` : 'Chưa có'}
                                                </Text>
                                                <Text className="text-xs text-text-secondary dark:text-gray-400">
                                                    Phần thưởng
                                                </Text>
                                            </View>
                                        </View>

                                        {/* Hiển thị ảnh kiện hàng */}
                                        {request.item_images && Array.isArray(request.item_images) && request.item_images.length > 0 && (
                                            <View className="px-4 pt-0 pb-3 border-t border-gray-100 dark:border-gray-700">
                                                <Text className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                                    Ảnh kiện hàng ({request.item_images.length})
                                                </Text>
                                                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                                                    {request.item_images.slice(0, 4).map((imageUrl: string, index: number) => (
                                                        <Image
                                                            key={index}
                                                            source={{ uri: imageUrl }}
                                                            className="h-16 w-16 rounded-lg"
                                                            resizeMode="cover"
                                                        />
                                                    ))}
                                                    {request.item_images.length > 4 && (
                                                        <View className="h-16 w-16 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                                                            <Text className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                                                +{request.item_images.length - 4}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </ScrollView>
                                            </View>
                                        )}

                                        {/* Action Buttons */}
                                        <View className="px-4 pb-4 pt-0 gap-2">
                                            <TouchableOpacity
                                                onPress={() => router.push({
                                                    pathname: '/private-requests/[id]',
                                                    params: { id: request.id || request.uuid }
                                                })}
                                                className="bg-primary h-11 rounded-lg items-center justify-center"
                                            >
                                                <Text className="text-white font-bold text-sm">Xem chi tiết</Text>
                                            </TouchableOpacity>

                                            {/* Button hủy request nếu đã gửi (có flight_id) và status = pending */}
                                            {request.flight_id && request.status === 'pending' && (
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        Alert.alert(
                                                            'Xác nhận hủy',
                                                            'Bạn có chắc muốn hủy request đã gửi? Request sẽ quay lại trạng thái chờ match.',
                                                            [
                                                                { text: 'Không', style: 'cancel' },
                                                                {
                                                                    text: 'Hủy request',
                                                                    style: 'destructive',
                                                                    onPress: async () => {
                                                                        try {
                                                                            const response = await api.post(
                                                                                `/private-requests/${request.id || request.uuid}/cancel`
                                                                            );
                                                                            if (response.data.success) {
                                                                                Alert.alert('Thành công', response.data.message);
                                                                                fetchRequests();
                                                                            }
                                                                        } catch (error: any) {
                                                                            Alert.alert(
                                                                                'Lỗi',
                                                                                error.response?.data?.message || 'Không thể hủy request'
                                                                            );
                                                                        }
                                                                    },
                                                                },
                                                            ]
                                                        );
                                                    }}
                                                    className="bg-red-100 dark:bg-red-900/20 h-11 rounded-lg items-center justify-center flex-row gap-2"
                                                >
                                                    <MaterialIcons name="cancel" size={18} color="#EF4444" />
                                                    <Text className="text-red-600 dark:text-red-400 font-bold text-sm">
                                                        Hủy request
                                                    </Text>
                                                </TouchableOpacity>
                                            )}
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
