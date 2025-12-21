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

    const renderRequestItem = ({ item }: { item: Request }) => (
        <View className="mb-3 rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <TouchableOpacity
                onPress={() => router.push(`/request_matches/${item.id}`)}
                className="p-4">
                <View className="mb-2 flex-row items-center justify-between">
                    <View className="flex-1">
                        <Text className="text-base font-semibold text-text-primary dark:text-white">
                            {getAirportWithCity(item.from_airport)} → {getAirportWithCity(item.to_airport)}
                        </Text>
                        <Text className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Ngày: {item.desired_date ? new Date(item.desired_date).toLocaleDateString('vi-VN') : 'N/A'}
                        </Text>
                    </View>
                    {item.match_count !== undefined && item.match_count > 0 && (
                        <View className="ml-2 rounded-full bg-blue-100 px-3 py-1 dark:bg-blue-900">
                            <Text className="text-sm font-semibold text-blue-600 dark:text-blue-300">
                                {item.match_count} matches
                            </Text>
                        </View>
                    )}
                </View>
                <View className="mt-2 flex-row items-center justify-between">
                    <Text className="text-sm font-medium text-green-600 dark:text-green-400">
                        {formatVND(item.reward)} VNĐ
                    </Text>
                    <MaterialIcons name="chevron-right" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
                </View>

                {/* Hiển thị ảnh kiện hàng */}
                {item.item_images && item.item_images.length > 0 && (
                    <View className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <Text className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                            Ảnh kiện hàng ({item.item_images.length})
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                            {item.item_images.slice(0, 4).map((imageUrl, index) => (
                                <Image
                                    key={index}
                                    source={{ uri: imageUrl }}
                                    className="h-16 w-16 rounded-lg"
                                    resizeMode="cover"
                                />
                            ))}
                            {item.item_images.length > 4 && (
                                <View className="h-16 w-16 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                                    <Text className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                        +{item.item_images.length - 4}
                                    </Text>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                )}
            </TouchableOpacity>

            {/* Action Buttons */}
            <View className="flex-row border-t border-gray-200 dark:border-gray-700">
                <TouchableOpacity
                    onPress={() => handleEditRequest(item.id)}
                    className="flex-1 flex-row items-center justify-center py-3 border-r border-gray-200 dark:border-gray-700">
                    <MaterialIcons name="edit" size={18} color="#2563EB" />
                    <Text className="ml-2 text-sm font-medium text-blue-600 dark:text-blue-400">
                        Chỉnh sửa
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => handleCancelRequest(item.id, item.uuid)}
                    disabled={cancelling === item.id}
                    className="flex-1 flex-row items-center justify-center py-3">
                    {cancelling === item.id ? (
                        <ActivityIndicator size="small" color="#EF4444" />
                    ) : (
                        <>
                            <MaterialIcons name="delete-outline" size={18} color="#EF4444" />
                            <Text className="ml-2 text-sm font-medium text-red-600 dark:text-red-400">
                                Hủy
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );

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
                        Requests đang chờ match
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
