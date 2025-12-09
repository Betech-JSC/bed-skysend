import React, { useEffect, useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import api from "@/api/api";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { router, Stack, useRouter } from "expo-router";
import UserProfileInfo from "../../components/UserProfileInfo";
import { getAvatarUrl } from "@/constants/avatars";

function ListOrdersCustomer() {
    const router = useRouter();
    const user = useSelector((state: RootState) => state.user);

    const [orderStatusFilter, setOrderStatusFilter] = useState<string>(''); // 'confirmed', 'picked_up', 'in_transit', 'delivered', 'completed', 'cancelled'
    const [orders, setOrders] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Map order status to Vietnamese - Rút gọn còn 4 trạng thái
    const getStatusLabel = (status: string) => {
        // Map các trạng thái cũ về trạng thái mới
        const normalizedStatus = normalizeStatus(status);

        const statusMap: { [key: string]: { label: string; color: string } } = {
            'new': { label: 'Đơn mới', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
            'in_transit': { label: 'Đang vận chuyển', color: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' },
            'completed': { label: 'Hoàn thành', color: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
            'cancelled': { label: 'Đã hủy', color: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },
        };
        return statusMap[normalizedStatus] || { label: normalizedStatus, color: 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400' };
    };

    // Normalize status từ backend về 4 trạng thái mới
    const normalizeStatus = (status: string): string => {
        // Đơn mới: pending, confirmed
        if (status === 'pending' || status === 'confirmed') {
            return 'new';
        }
        // Đang vận chuyển: picked_up, in_transit, arrived, delivered
        if (status === 'picked_up' || status === 'in_transit' || status === 'arrived' || status === 'delivered') {
            return 'in_transit';
        }
        // Hoàn thành và Đã hủy giữ nguyên
        if (status === 'completed' || status === 'cancelled') {
            return status;
        }
        return status;
    };

    // Danh sách các filter tabs với status tương ứng - Rút gọn còn 4 trạng thái
    const filterTabs = [
        { label: 'Tất cả', status: '' },
        { label: 'Đơn mới', status: 'new' },
        { label: 'Đang vận chuyển', status: 'in_transit' },
        { label: 'Hoàn thành', status: 'completed' },
        { label: 'Đã hủy', status: 'cancelled' },
    ];

    // Get next available status for customer - Flow mới: new -> in_transit -> completed
    const getNextStatus = (currentStatus: string): string | null => {
        const normalized = normalizeStatus(currentStatus);
        const statusFlow: { [key: string]: string } = {
            'new': 'in_transit',           // Đơn mới -> Đang vận chuyển
            'in_transit': 'completed',     // Đang vận chuyển -> Hoàn thành
        };
        return statusFlow[normalized] || null;
    };

    useEffect(() => {
        fetchOrders();
    }, [orderStatusFilter]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);

            const params: any = {};
            if (orderStatusFilter) {
                // Backend vẫn dùng status cũ, nên cần filter ở frontend sau khi nhận data
                // Hoặc có thể gửi multiple status nếu backend hỗ trợ
                // Tạm thời để backend trả về tất cả, filter ở frontend
            }

            const response = await api.get("orders/getList", { params });

            let ordersData = [];
            if (response.data?.success) {
                if (response.data.data?.data) {
                    ordersData = response.data.data.data;
                } else if (Array.isArray(response.data.data)) {
                    ordersData = response.data.data;
                }
            } else if (response.data?.status === "success") {
                if (response.data.data?.orders?.data) {
                    ordersData = response.data.data.orders.data;
                } else if (Array.isArray(response.data.data)) {
                    ordersData = response.data.data;
                }
            }

            // Filter theo status mới nếu có filter
            if (orderStatusFilter) {
                ordersData = ordersData.filter((order: any) => {
                    const normalized = normalizeStatus(order.status);
                    return normalized === orderStatusFilter;
                });
            }

            setOrders(ordersData);
        } catch (err: any) {
            console.error('Error fetching orders:', err);
            setError(err.response?.data?.message || "Không thể tải danh sách đơn hàng");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    const handleUpdateStatus = async (orderId: string, orderUuid: string, currentStatus: string) => {
        const normalizedCurrent = normalizeStatus(currentStatus);
        const nextStatus = getNextStatus(normalizedCurrent);
        if (!nextStatus) {
            Alert.alert('Thông báo', 'Không thể cập nhật trạng thái này');
            return;
        }

        // Map status frontend về status backend theo flow backend
        // Flow backend: confirmed -> picked_up -> in_transit -> arrived -> delivered -> completed
        const mapToBackendStatus = (frontendStatus: string, currentBackendStatus: string): string => {
            if (frontendStatus === 'in_transit') {
                // Từ 'new' (confirmed/pending) -> 'in_transit': gửi 'picked_up' (bước đầu)
                if (currentBackendStatus === 'confirmed' || currentBackendStatus === 'pending') {
                    return 'picked_up';
                }
                // Nếu đã ở trong flow vận chuyển, chuyển sang bước tiếp theo
                if (currentBackendStatus === 'picked_up') {
                    return 'in_transit';
                }
                if (currentBackendStatus === 'in_transit') {
                    return 'arrived';
                }
                if (currentBackendStatus === 'arrived') {
                    return 'delivered';
                }
                // Nếu đã delivered, không thể chuyển sang in_transit nữa
                return 'picked_up'; // Default fallback
            }
            if (frontendStatus === 'completed') {
                // Chỉ có thể complete từ delivered
                if (currentBackendStatus === 'delivered') {
                    return 'completed';
                }
                // Nếu chưa delivered, không thể complete
                Alert.alert('Lỗi', 'Chỉ có thể hoàn thành đơn hàng khi đã giao hàng');
                return currentBackendStatus;
            }
            return frontendStatus; // cancelled giữ nguyên
        };

        const backendStatus = mapToBackendStatus(nextStatus, currentStatus);
        const statusLabels: { [key: string]: string } = {
            'in_transit': 'Đang vận chuyển',
            'completed': 'Hoàn thành',
        };

        Alert.alert(
            'Xác nhận',
            `Bạn có chắc chắn muốn cập nhật trạng thái thành "${statusLabels[nextStatus]}"?`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xác nhận',
                    onPress: async () => {
                        try {
                            const orderIdentifier = orderUuid || orderId;
                            await api.put(`orders/${orderIdentifier}/status`, {
                                status: backendStatus,
                            });
                            Alert.alert('Thành công', 'Đã cập nhật trạng thái đơn hàng');
                            fetchOrders();
                        } catch (err: any) {
                            Alert.alert('Lỗi', err.response?.data?.message || 'Không thể cập nhật trạng thái');
                        }
                    },
                },
            ]
        );
    };

    if (loading && !refreshing) {
        return (
            <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            </SafeAreaView>
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
                        textAlign: 'center',
                    },
                }}
            />
            <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
                {/* Status Filter Tabs */}
                <View className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="flex-row"
                        contentContainerStyle={{ paddingHorizontal: 16 }}
                    >
                        {filterTabs.map((tab) => {
                            const isActive = orderStatusFilter === tab.status;
                            return (
                                <TouchableOpacity
                                    key={tab.status || 'all'}
                                    onPress={() => setOrderStatusFilter(tab.status)}
                                    className="items-center py-4 px-3 mr-2"
                                >
                                    <Text
                                        className={`text-sm font-bold pb-3 ${isActive
                                            ? "text-primary border-b-2 border-primary"
                                            : "text-text-secondary dark:text-gray-400 border-b-2 border-transparent"
                                            }`}
                                    >
                                        {tab.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Order List */}
                <ScrollView
                    className="flex-1 px-4 py-4"
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {error ? (
                        <View className="items-center pt-16">
                            <MaterialIcons name="error-outline" size={48} color="#EF4444" />
                            <Text className="mt-4 text-gray-600 dark:text-gray-400 text-center">
                                {error}
                            </Text>
                            <TouchableOpacity
                                onPress={fetchOrders}
                                className="mt-4 bg-primary px-6 py-3 rounded-lg"
                            >
                                <Text className="text-white font-bold">Thử lại</Text>
                            </TouchableOpacity>
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
                            const sender = order.sender || order.partner || {};
                            const request = order.request || {};
                            const statusInfo = getStatusLabel(order.status || 'pending');
                            const normalizedStatus = normalizeStatus(order.status || 'pending');
                            const nextStatus = getNextStatus(normalizedStatus);

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
                                                {flight.from_airport || 'Chưa có'}
                                            </Text>
                                            <View className="flex-row items-center gap-2">
                                                <View className="w-4 h-px bg-gray-300 dark:bg-gray-600" />
                                                <MaterialIcons name="flight-takeoff" size={20} color="#2563EB" />
                                                <View className="w-4 h-px bg-gray-300 dark:bg-gray-600" />
                                            </View>
                                            <Text className="text-xl font-bold text-text-primary dark:text-white">
                                                {flight.to_airport || 'Chưa có'}
                                            </Text>
                                        </View>
                                        {flight.flight_date && (() => {
                                            try {
                                                const date = new Date(flight.flight_date);
                                                if (!isNaN(date.getTime())) {
                                                    return (
                                                        <Text className="text-center text-sm text-gray-500 mt-2">
                                                            {date.toLocaleDateString('vi-VN')}
                                                        </Text>
                                                    );
                                                }
                                            } catch { }
                                            return null;
                                        })()}
                                    </View>

                                    <View className="h-px bg-gray-100 dark:bg-gray-700" />

                                    {/* Sender Info + Reward */}
                                    <View className="flex-row items-center justify-between px-4 py-4 gap-3">
                                        <View className="flex-row items-center gap-3 flex-1">
                                            <UserProfileInfo
                                                avatar={getAvatarUrl(sender.avatar)}
                                                name={sender.name || 'Người gửi'}
                                                subtitle={sender.phone || ''}
                                                size="large"
                                            />
                                        </View>

                                        <View className="items-end">
                                            <Text className="font-bold text-text-primary dark:text-white">
                                                {order.reward ? `${Number(order.reward).toLocaleString('vi-VN')}đ` : 'Chưa có'}
                                            </Text>
                                            <Text className="text-xs text-text-secondary dark:text-gray-400">
                                                Phần thưởng
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Request Info */}
                                    {request.item_description && (
                                        <View className="px-4 pb-3">
                                            <Text className="text-xs text-gray-500 mb-1">Mô tả:</Text>
                                            <Text className="text-sm text-text-dark-gray dark:text-white">
                                                {request.item_description}
                                            </Text>
                                        </View>
                                    )}

                                    {/* Action Buttons */}
                                    <View className="px-4 pb-4 pt-0 gap-2">
                                        <View className="flex-row gap-2">
                                            <TouchableOpacity
                                                onPress={() => {
                                                    const orderIdentifier = order.id || order.uuid;
                                                    router.push({
                                                        pathname: '/orders_details',
                                                        params: { orderId: String(orderIdentifier) }
                                                    });
                                                }}
                                                className="bg-primary flex-1 h-11 rounded-lg items-center justify-center"
                                            >
                                                <Text className="text-white font-bold text-sm">Xem chi tiết</Text>
                                            </TouchableOpacity>

                                            {sender.name && (
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        // Use chat_id if available, otherwise use order id/uuid
                                                        const chatId = order.chat_id || order.id || order.uuid;
                                                        router.push({
                                                            pathname: '/chat/[chatId]',
                                                            params: {
                                                                chatId: String(chatId),
                                                                partnerName: sender.name || 'Người gửi',
                                                                partnerAvatar: getAvatarUrl(sender.avatar),
                                                            }
                                                        } as any);
                                                    }}
                                                    className="bg-blue-600 h-11 rounded-lg items-center justify-center px-4"
                                                >
                                                    <MaterialIcons name="chat" size={20} color="white" />
                                                </TouchableOpacity>
                                            )}
                                        </View>

                                        {nextStatus && (
                                            <TouchableOpacity
                                                onPress={() => handleUpdateStatus(order.id, order.uuid, order.status)}
                                                className="bg-green-600 h-11 rounded-lg items-center justify-center"
                                            >
                                                <Text className="text-white font-bold text-sm">
                                                    Cập nhật: {getStatusLabel(nextStatus === 'in_transit' ? 'in_transit' : nextStatus).label}
                                                </Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            );
                        })
                    )}
                </ScrollView>
            </SafeAreaView>
        </>
    );
}

export default ListOrdersCustomer;

