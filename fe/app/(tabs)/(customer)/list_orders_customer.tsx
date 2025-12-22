import React, { useEffect, useState, useCallback } from "react";
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
import { router, Stack, useRouter, useFocusEffect } from "expo-router";
import UserProfileInfo from "../../components/UserProfileInfo";
import { getAvatarUrl } from "@/constants/avatars";
import {
    normalizeOrderStatus,
    getOrderStatusLabel,
    getNextOrderStatus,
    mapToBackendStatus,
    ORDER_FILTER_TABS,
} from "../../utils/orderStatusUtils";
import { getAirportWithCity } from "../../utils/airportUtils";
import { formatDateOnly } from "../../utils/dateUtils";

function ListOrdersCustomer() {
    const router = useRouter();
    const user = useSelector((state: RootState) => state.user);

    const [orderStatusFilter, setOrderStatusFilter] = useState<string>('');
    const [orders, setOrders] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch data khi filter thay đổi
    useEffect(() => {
        fetchOrders();
    }, [orderStatusFilter]);

    // Fetch lại data khi quay lại màn hình
    useFocusEffect(
        useCallback(() => {
            fetchOrders();
        }, [orderStatusFilter])
    );

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
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchOrders();
    };

    const handleUpdateStatus = async (orderId: string, orderUuid: string, currentStatus: string, orderItemImages?: string[]) => {
        const normalizedCurrent = normalizeOrderStatus(currentStatus);
        const nextStatus = getNextOrderStatus(normalizedCurrent);
        if (!nextStatus) {
            Alert.alert('Thông báo', 'Không thể cập nhật trạng thái này');
            return;
        }

        const backendStatus = mapToBackendStatus(nextStatus, currentStatus);

        // Check if item_images is required (for delivered or completed status)
        if ((backendStatus === 'delivered' || backendStatus === 'completed') && (!orderItemImages || orderItemImages.length === 0)) {
            Alert.alert(
                'Cần upload ảnh đơn hàng',
                'Vui lòng chụp hoặc upload ít nhất một hình ảnh đơn hàng trước khi cập nhật trạng thái. Vui lòng vào chi tiết đơn hàng để upload ảnh.',
                [
                    { text: 'Hủy', style: 'cancel' },
                    {
                        text: 'Vào chi tiết',
                        onPress: () => {
                            router.push({
                                pathname: '/orders_details',
                                params: { orderId: orderId || orderId }
                            });
                        },
                    },
                ]
            );
            return;
        }

        const nextStatusLabel = getOrderStatusLabel(nextStatus);
        const statusLabels: { [key: string]: string } = {
            'in_transit': 'Đang vận chuyển',
            'completed': 'Hoàn thành',
        };

        Alert.alert(
            'Xác nhận cập nhật trạng thái',
            `Bạn có chắc chắn muốn cập nhật trạng thái đơn hàng thành "${nextStatusLabel.label}"?\n\nĐiều này sẽ thay đổi trạng thái hiện tại của đơn hàng.`,
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Xác nhận',
                    onPress: async () => {
                        try {
                            const orderIdentifier = orderUuid || orderId;
                            const payload: any = {
                                status: backendStatus,
                            };

                            // Include item_images if updating to delivered or completed
                            if ((backendStatus === 'delivered' || backendStatus === 'completed') && orderItemImages && orderItemImages.length > 0) {
                                payload.item_images = orderItemImages;
                            }

                            await api.put(`orders/${orderIdentifier}/status`, payload);
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
                            const statusInfo = getOrderStatusLabel(order.status || 'pending');
                            const normalizedStatus = normalizeOrderStatus(order.status || 'pending');
                            const nextStatus = getNextOrderStatus(normalizedStatus);

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
                                        {flight.flight_date && (
                                            <Text className="text-center text-sm text-gray-500 mt-2">
                                                {formatDateOnly(flight.flight_date)}
                                            </Text>
                                        )}
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

                                    {/* Hình ảnh - Gộp tất cả ảnh lại */}
                                    {((request.item_images && request.item_images.length > 0) ||
                                        (flight.item_images && flight.item_images.length > 0) ||
                                        (order.item_images && order.item_images.length > 0)) && (
                                            <View className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-700">
                                                <View className="flex-row items-center gap-2 mb-2">
                                                    <MaterialIcons name="photo-library" size={14} color="#6B7280" />
                                                    <Text className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                                                        Hình ảnh
                                                    </Text>
                                                </View>
                                                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                                    <View className="flex-row gap-1.5">
                                                        {/* Ảnh kiện hàng */}
                                                        {request.item_images?.slice(0, 3).map((imageUrl: string, index: number) => (
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
                                                            const requestCount = request.item_images?.length || 0;
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
                                                onPress={() => handleUpdateStatus(order.id, order.uuid, order.status, order.item_images)}
                                                className="bg-green-600 dark:bg-green-700 h-11 rounded-lg items-center justify-center flex-row gap-2"
                                            >
                                                <MaterialIcons name="update" size={18} color="white" />
                                                <Text className="text-white font-bold text-sm">
                                                    Cập nhật: {getOrderStatusLabel(nextStatus).label}
                                                </Text>
                                                <MaterialIcons name="arrow-forward" size={16} color="white" />
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

