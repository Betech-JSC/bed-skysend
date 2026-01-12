import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
    Alert,
    Image,
    ScrollView,
} from 'react-native';
import { Stack, useRouter, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import api from '@/api/api';
import BackButton from 'app/components/BackButton';
import { formatVND, parseVND } from '@/utils/currencyFormatter';
import { getAirportWithCity } from '../../utils/airportUtils';

interface Request {
    id: number;
    uuid: string;
    from_airport: string;
    to_airport: string;
    desired_date: string;
    reward: number;
    status: string;
    match_count?: number;
    item_images?: string[];
}

export default function RequestMatchesScreen() {
    const router = useRouter();
    const isDark = useColorScheme() === 'dark';
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [requests, setRequests] = useState<Request[]>([]);
    const [cancelling, setCancelling] = useState<number | null>(null);

    const fetchRequests = async () => {
        try {
            const response = await api.get('/private-requests?status=pending');
            const data = response.data?.data || response.data || [];

            // Filter only requests waiting for match (no flight_id)
            const waitingRequests = Array.isArray(data)
                ? data.filter((req: any) => !req.flight_id && req.status === 'pending')
                : [];

            // Fetch match count for each request
            const requestsWithMatches = await Promise.all(
                waitingRequests.map(async (req: any) => {
                    try {
                        const matchResponse = await api.get(`/requests/${req.id}/matches`);
                        return {
                            ...req,
                            match_count: matchResponse.data?.data?.total_matches || 0,
                        };
                    } catch {
                        return { ...req, match_count: 0 };
                    }
                })
            );

            setRequests(requestsWithMatches);
        } catch (error: any) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    // Tự động fetch lại data khi quay lại màn hình
    useFocusEffect(
        useCallback(() => {
            fetchRequests();
        }, [])
    );

    const onRefresh = () => {
        setRefreshing(true);
        fetchRequests();
    };

    const handleCancelRequest = async (requestId: number, requestUuid: string) => {
        Alert.alert(
            'Xác nhận hủy',
            'Bạn có chắc muốn hủy request này? Request sẽ bị xóa và không thể khôi phục.',
            [
                { text: 'Không', style: 'cancel' },
                {
                    text: 'Hủy request',
                    style: 'destructive',
                    onPress: async () => {
                        setCancelling(requestId);
                        try {
                            const response = await api.post(`/private-requests/${requestId}/cancel`);
                            if (response.data.success) {
                                Alert.alert('Thành công', response.data.message);
                                fetchRequests();
                            }
                        } catch (error: any) {
                            Alert.alert(
                                'Lỗi',
                                error.response?.data?.message || 'Không thể hủy request'
                            );
                        } finally {
                            setCancelling(null);
                        }
                    },
                },
            ]
        );
    };

    const handleEditRequest = (requestId: number) => {
        router.push({
            pathname: '/(tabs)/(sender)/create_request_waiting',
            params: { editId: requestId.toString() },
        });
    };

    const renderRequestItem = ({ item }: { item: Request }) => {
        const thumbnailImage = item.item_images && item.item_images.length > 0 ? item.item_images[0] : null;
        const formattedDate = item.desired_date ? new Date(item.desired_date).toLocaleDateString('vi-VN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        }) : 'N/A';

        return (
            <View className="mb-4 rounded-xl bg-white shadow-sm dark:bg-gray-800 overflow-hidden border border-gray-100 dark:border-gray-700">
                <TouchableOpacity
                    onPress={() => router.push(`/request_matches/${item.id}`)}
                    activeOpacity={0.9}
                >
                    {/* Main Content: Thumbnail + Info */}
                    <View className="flex-row p-4">
                        {/* Thumbnail - Left Side */}
                        <View className="mr-4">
                            {thumbnailImage ? (
                                <Image
                                    source={{ uri: thumbnailImage }}
                                    className="h-20 w-20 rounded-lg"
                                    resizeMode="cover"
                                />
                            ) : (
                                <View className="h-20 w-20 items-center justify-center rounded-lg bg-primary/10">
                                    <MaterialIcons name="local-shipping" size={32} color="#2563EB" />
                                </View>
                            )}
                        </View>

                        {/* Content - Right Side */}
                        <View className="flex-1">
                            {/* Route + Status Badge */}
                            <View className="flex-row items-start justify-between mb-2">
                                <View className="flex-1 mr-2">
                                    <Text className="text-base font-bold text-gray-900 dark:text-white" numberOfLines={2}>
                                        {getAirportWithCity(item.from_airport)} → {getAirportWithCity(item.to_airport)}
                                    </Text>
                                </View>
                                {item.match_count !== undefined && item.match_count > 0 && (
                                    <View className="rounded-full bg-blue-100 px-2.5 py-1 dark:bg-blue-900/30 flex-shrink-0">
                                        <Text className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                                            {item.match_count} matches
                                        </Text>
                                    </View>
                                )}
                            </View>

                            {/* Date */}
                            <View className="flex-row items-center mb-2">
                                <MaterialIcons name="calendar-today" size={14} color="#6B7280" />
                                <Text className="ml-1 text-sm text-gray-600 dark:text-gray-400">
                                    {formattedDate}
                                </Text>
                            </View>

                            {/* Reward */}
                            <View className="flex-row items-center justify-between">
                                <View className="flex-row items-center">
                                    <MaterialIcons name="attach-money" size={16} color="#10B981" />
                                    <Text className="ml-1 text-base font-bold text-green-600 dark:text-green-400">
                                        {formatVND(item.reward)} VNĐ
                                    </Text>
                                </View>
                                <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
                            </View>

                            {/* Image count indicator */}
                            {item.item_images && item.item_images.length > 1 && (
                                <View className="mt-2 flex-row items-center">
                                    <MaterialIcons name="photo-library" size={14} color="#6B7280" />
                                    <Text className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                                        {item.item_images.length} ảnh
                                    </Text>
                                </View>
                            )}
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Action Buttons - Vertical layout like View messages/Booking details */}
                <View className="border-t border-gray-200 dark:border-gray-700">
                    <TouchableOpacity
                        onPress={() => handleEditRequest(item.id)}
                        activeOpacity={0.7}
                        className="flex-row items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700"
                    >
                        <View className="flex-row items-center flex-1">
                            <MaterialIcons name="edit" size={20} color="#2563EB" />
                            <Text className="ml-3 text-base font-medium text-gray-900 dark:text-white">
                                Chỉnh sửa
                            </Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => handleCancelRequest(item.id, item.uuid)}
                        disabled={cancelling === item.id}
                        activeOpacity={0.7}
                        className="flex-row items-center justify-between px-4 py-4"
                    >
                        <View className="flex-row items-center flex-1">
                            {cancelling === item.id ? (
                                <ActivityIndicator size="small" color="#EF4444" />
                            ) : (
                                <MaterialIcons name="delete-outline" size={20} color="#EF4444" />
                            )}
                            <Text className={`ml-3 text-base font-medium ${cancelling === item.id ? 'text-gray-400' : 'text-red-600 dark:text-red-400'}`}>
                                Hủy request
                            </Text>
                        </View>
                        {!cancelling && (
                            <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-background-light dark:bg-background-dark">
                <ActivityIndicator size="large" color="#2563EB" />
            </View>
        );
    }

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: true,
                    headerTitle: () => null,
                    headerStyle: {
                        backgroundColor: '#fff',
                    },
                }}
            />

            <View className="flex-1 bg-background-light dark:bg-background-dark">
                <View className="flex-row items-center justify-between px-4 pt-4 pb-3 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-gray-700">
                    <BackButton showText={true} className="bg-white dark:bg-gray-800 shadow-sm px-3 py-2 rounded-lg" />
                    <Text className="flex-1 text-center text-lg font-bold text-text-primary dark:text-white -ml-10">
                        Yêu cầu đang chờ match
                    </Text>
                    <TouchableOpacity
                        onPress={() => router.push('/create_request_waiting')}
                        className="ml-2 rounded-full bg-blue-600 p-2">
                        <MaterialIcons name="add" size={20} color="#fff" />
                    </TouchableOpacity>
                </View>

                {requests.length === 0 ? (
                    <View className="flex-1 items-center justify-center px-4">
                        <MaterialIcons name="inbox" size={64} color={isDark ? '#6b7280' : '#9ca3af'} />
                        <Text className="mt-4 text-center text-lg font-semibold text-text-primary dark:text-white">
                            Chưa có request nào
                        </Text>
                        <Text className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                            Tạo request mới để hệ thống tự động tìm customer phù hợp
                        </Text>
                        <TouchableOpacity
                            onPress={() => router.push('/create_request_waiting')}
                            className="mt-6 rounded-lg bg-blue-600 px-6 py-3">
                            <Text className="font-semibold text-white">Tạo request mới</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    <FlatList
                        data={requests}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderRequestItem}
                        contentContainerStyle={{ padding: 16 }}
                        refreshControl={
                            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                        }
                    />
                )}
            </View>
        </>
    );
}
