import React, { useEffect, useState, useCallback } from "react";
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    TextInput,
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
    const [searchQuery, setSearchQuery] = useState<string>('');

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

    // Filter orders by search query
    const filteredOrders = searchQuery.trim()
        ? orders.filter((order: any) => {
            const flight = order.flight || {};
            const customer = order.customer || order.partner || {};
            const searchLower = searchQuery.toLowerCase();
            return (
                (order.uuid || '').toLowerCase().includes(searchLower) ||
                (order.id || '').toString().includes(searchLower) ||
                (flight.from_airport || '').toLowerCase().includes(searchLower) ||
                (flight.to_airport || '').toLowerCase().includes(searchLower) ||
                (customer.name || '').toLowerCase().includes(searchLower) ||
                (flight.flight_number || '').toLowerCase().includes(searchLower)
            );
        })
        : orders;

    // Filter requests by search query
    const filteredRequests = searchQuery.trim()
        ? requests.filter((request: any) => {
            const flight = request.flight || {};
            const customer = flight.customer || {};
            const searchLower = searchQuery.toLowerCase();
            return (
                (request.uuid || '').toLowerCase().includes(searchLower) ||
                (request.id || '').toString().includes(searchLower) ||
                (flight.from_airport || '').toLowerCase().includes(searchLower) ||
                (flight.to_airport || '').toLowerCase().includes(searchLower) ||
                (customer.name || '').toLowerCase().includes(searchLower) ||
                (flight.flight_number || '').toLowerCase().includes(searchLower)
            );
        })
        : requests;

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
            <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
                {/* Search Bar */}
                <View className="bg-white dark:bg-gray-900 px-6 pt-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                    <View className="flex-row items-center bg-gray-100 dark:bg-gray-800 rounded-xl px-4 py-3 border border-gray-200 dark:border-gray-700">
                        <MaterialIcons name="search" size={20} color="#6B7280" />
                        <TextInput
                            className="flex-1 ml-3 text-base text-gray-900 dark:text-white"
                            placeholder="Tìm kiếm đơn hàng hoặc yêu cầu..."
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity
                                onPress={() => setSearchQuery('')}
                                className="ml-2"
                                activeOpacity={0.7}
                            >
                                <MaterialIcons name="close" size={20} color="#6B7280" />
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Main Tabs: Orders vs Requests - Compact, left-aligned like Products/Stores */}
                <View className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <View className="flex-row px-6">
                        <TouchableOpacity
                            onPress={() => {
                                setActiveTab('orders');
                                // Reset request filter khi chuyển sang tab orders
                                setRequestStatusFilter('');
                            }}
                            activeOpacity={0.7}
                            className={`items-center py-4 mr-6 ${activeTab === 'orders' ? 'border-b-2 border-gray-900 dark:border-white' : ''}`}
                        >
                            <Text
                                className={`text-base font-bold ${activeTab === 'orders'
                                    ? "text-gray-900 dark:text-white"
                                    : "text-gray-500 dark:text-gray-400"
                                    }`}
                            >
                                Đơn hàng
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                setActiveTab('requests');
                                // Reset order filter khi chuyển sang tab requests
                                setOrderStatusFilter('');
                            }}
                            activeOpacity={0.7}
                            className={`items-center py-4 ${activeTab === 'requests' ? 'border-b-2 border-gray-900 dark:border-white' : ''}`}
                        >
                            <Text
                                className={`text-base font-bold ${activeTab === 'requests'
                                    ? "text-gray-900 dark:text-white"
                                    : "text-gray-500 dark:text-gray-400"
                                    }`}
                            >
                                Yêu cầu đã gửi
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Status Filter Tabs for Orders - Pill shaped like Popular/Fashion/Home */}
                {activeTab === 'orders' && (
                    <View className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="flex-row"
                            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
                        >
                            {ORDER_FILTER_TABS.map((tab) => {
                                const isActive = orderStatusFilter === tab.status;
                                return (
                                    <TouchableOpacity
                                        key={tab.status || 'all'}
                                        onPress={() => setOrderStatusFilter(tab.status)}
                                        activeOpacity={0.7}
                                        className={`items-center justify-center py-2.5 px-5 mr-2 rounded-full ${isActive
                                            ? "bg-gray-900 dark:bg-gray-100"
                                            : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                                            }`}
                                    >
                                        <Text
                                            className={`text-sm font-semibold ${isActive
                                                ? "text-white dark:text-gray-900"
                                                : "text-gray-900 dark:text-gray-200"
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

                {/* Status Filter Tabs for Requests - Pill shaped like Popular/Fashion/Home */}
                {activeTab === 'requests' && (
                    <View className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="flex-row"
                            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
                        >
                            {REQUEST_FILTER_TABS.map((tab) => {
                                const isActive = requestStatusFilter === tab.status;
                                return (
                                    <TouchableOpacity
                                        key={tab.status || 'all'}
                                        onPress={() => setRequestStatusFilter(tab.status)}
                                        activeOpacity={0.7}
                                        className={`items-center justify-center py-2.5 px-5 mr-2 rounded-full ${isActive
                                            ? "bg-gray-900 dark:bg-gray-100"
                                            : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                                            }`}
                                    >
                                        <Text
                                            className={`text-sm font-semibold ${isActive
                                                ? "text-white dark:text-gray-900"
                                                : "text-gray-900 dark:text-gray-200"
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
                <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900 px-4 py-4" showsVerticalScrollIndicator={false}>
                    {activeTab === 'orders' ? (
                        // Orders List
                        loading ? (
                            <View className="items-center pt-16">
                                <ActivityIndicator size="large" color="#2563EB" />
                            </View>
                        ) : filteredOrders.length === 0 ? (
                            <View className="items-center pt-16">
                                <View className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center">
                                    <MaterialIcons name="inventory-2" size={48} color="#9CA3AF" />
                                </View>
                                <Text className="mt-5 text-lg font-bold text-text-primary dark:text-white">
                                    {searchQuery.trim() ? 'Không tìm thấy kết quả' : 'Chưa có đơn hàng nào'}
                                </Text>
                                <Text className="text-sm text-text-secondary dark:text-gray-400 mt-1 text-center px-8">
                                    {searchQuery.trim()
                                        ? 'Thử tìm kiếm với từ khóa khác.'
                                        : 'Khi bạn có đơn hàng, chúng sẽ xuất hiện ở đây.'}
                                </Text>
                            </View>
                        ) : (
                            filteredOrders.map((order: any) => {
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

                                        {/* Hình ảnh - Gộp tất cả ảnh lại */}
                                        {((order.request?.item_images && order.request.item_images.length > 0) ||
                                            (flight.item_images && flight.item_images.length > 0) ||
                                            (order.item_images && order.item_images.length > 0)) && (
                                                <View className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-700">
                                                    <View className="flex-row items-center gap-2 mb-2">
                                                        <MaterialIcons name="photo-library" size={14} color="#6B7280" />
                                                        <Text className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                            Hình ảnh
                                                        </Text>
                                                    </View>
                                                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                                        <View className="flex-row gap-1.5">
                                                            {/* Ảnh kiện hàng */}
                                                            {order.request?.item_images?.slice(0, 3).map((imageUrl: string, index: number) => (
                                                                <Image
                                                                    key={`request-${index}`}
                                                                    source={{ uri: imageUrl }}
                                                                    className="w-12 h-12 rounded-md"
                                                                    resizeMode="cover"
                                                                />
                                                            ))}
                                                            {/* Ảnh vé máy bay */}
                                                            {flight.item_images?.slice(0, 3).map((imageUrl: string, index: number) => (
                                                                <Image
                                                                    key={`flight-${index}`}
                                                                    source={{ uri: imageUrl }}
                                                                    className="w-12 h-12 rounded-md"
                                                                    resizeMode="cover"
                                                                />
                                                            ))}
                                                            {/* Ảnh đơn hàng */}
                                                            {order.item_images?.slice(0, 3).map((imageUrl: string, index: number) => (
                                                                <Image
                                                                    key={`order-${index}`}
                                                                    source={{ uri: imageUrl }}
                                                                    className="w-12 h-12 rounded-md"
                                                                    resizeMode="cover"
                                                                />
                                                            ))}
                                                            {/* Đếm tổng số ảnh còn lại */}
                                                            {(() => {
                                                                const requestCount = order.request?.item_images?.length || 0;
                                                                const flightCount = flight.item_images?.length || 0;
                                                                const orderCount = order.item_images?.length || 0;
                                                                const totalCount = requestCount + flightCount + orderCount;
                                                                const shownCount = Math.min(3, requestCount) + Math.min(3, flightCount) + Math.min(3, orderCount);
                                                                const remaining = totalCount - shownCount;

                                                                if (remaining > 0) {
                                                                    return (
                                                                        <View className="w-12 h-12 rounded-md bg-gray-100 dark:bg-gray-700 items-center justify-center border border-gray-200 dark:border-gray-600">
                                                                            <Text className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                                                                +{remaining}
                                                                            </Text>
                                                                        </View>
                                                                    );
                                                                }
                                                                return null;
                                                            })()}
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
                        ) : filteredRequests.length === 0 ? (
                            <View className="items-center pt-16">
                                <View className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full items-center justify-center">
                                    <MaterialIcons name="send" size={48} color="#9CA3AF" />
                                </View>
                                <Text className="mt-5 text-lg font-bold text-text-primary dark:text-white">
                                    {searchQuery.trim() ? 'Không tìm thấy kết quả' : 'Chưa có yêu cầu nào'}
                                </Text>
                                <Text className="text-sm text-text-secondary dark:text-gray-400 mt-1 text-center px-8">
                                    {searchQuery.trim()
                                        ? 'Thử tìm kiếm với từ khóa khác.'
                                        : 'Các yêu cầu bạn đã gửi tới hành khách sẽ xuất hiện ở đây.'}
                                </Text>
                            </View>
                        ) : (
                            filteredRequests.map((request: any) => {
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
