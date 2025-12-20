import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'react-native';
import api from '@/api/api';
import BackButton from 'app/components/BackButton';
import { formatDateOnly } from '../utils/dateUtils';

interface Match {
    id: number;
    match_score: number;
    status: string;
    customer: {
        id: number;
        name: string;
        phone: string;
        avatar: string | null;
    };
    flight: {
        id: number;
        uuid: string;
        airline: string;
        flight_number: string;
        from_airport: string;
        to_airport: string;
        flight_date: string;
        available_weight: number;
        verified: boolean;
    };
}

interface SentRequest {
    flight_id: number;
    customer: {
        id: number;
        name: string;
        phone: string;
        avatar: string | null;
    };
    flight: {
        id: number;
        uuid: string;
        airline: string;
        flight_number: string;
        from_airport: string;
        to_airport: string;
        flight_date: string;
        available_weight: number;
    };
    match_id?: number;
}

export default function RequestMatchesDetailScreen() {
    const router = useRouter();
    const { requestId } = useLocalSearchParams<{ requestId: string }>();
    const isDark = useColorScheme() === 'dark';
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [sending, setSending] = useState<number | null>(null);
    const [cancelling, setCancelling] = useState<number | null>(null);
    const [matches, setMatches] = useState<Match[]>([]);
    const [requestInfo, setRequestInfo] = useState<any>(null);
    const [sentRequest, setSentRequest] = useState<SentRequest | null>(null);

    const fetchMatches = async () => {
        try {
            const response = await api.get(`/requests/${requestId}/matches`);
            if (response.data.success) {
                setMatches(response.data.data.matches || []);
                setRequestInfo(response.data.data.request);
                setSentRequest(response.data.data.sent_request || null);
            }
        } catch (error: any) {
            Alert.alert('Lỗi', 'Không thể tải danh sách matches');
            console.error('Error fetching matches:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (requestId) {
            fetchMatches();
        }
    }, [requestId]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchMatches();
    };

    const handleSendRequest = async (matchId: number) => {
        Alert.alert(
            'Xác nhận',
            'Bạn có chắc muốn gửi request tới customer này?',
            [
                { text: 'Hủy', style: 'cancel' },
                {
                    text: 'Gửi',
                    onPress: async () => {
                        setSending(matchId);
                        try {
                            const response = await api.post(
                                `/requests/${requestId}/send-to-match/${matchId}`
                            );
                            if (response.data.success) {
                                Alert.alert('Thành công', response.data.message, [
                                    {
                                        text: 'OK',
                                        onPress: () => fetchMatches(),
                                    },
                                ]);
                            }
                        } catch (error: any) {
                            Alert.alert(
                                'Lỗi',
                                error.response?.data?.message || 'Không thể gửi request'
                            );
                        } finally {
                            setSending(null);
                        }
                    },
                },
            ]
        );
    };

    const handleCancelRequest = async (customerName?: string) => {
        Alert.alert(
            'Xác nhận hủy',
            customerName
                ? `Bạn có chắc muốn hủy request đã gửi tới ${customerName}? Request sẽ quay lại trạng thái chờ match.`
                : 'Bạn có chắc muốn hủy request đã gửi? Request sẽ quay lại trạng thái chờ match.',
            [
                { text: 'Không', style: 'cancel' },
                {
                    text: 'Hủy request',
                    style: 'destructive',
                    onPress: async () => {
                        setCancelling(requestInfo?.id || 0);
                        try {
                            const response = await api.post(
                                `/private-requests/${requestId}/cancel`
                            );
                            if (response.data.success) {
                                Alert.alert('Thành công', response.data.message, [
                                    {
                                        text: 'OK',
                                        onPress: () => {
                                            fetchMatches();
                                        },
                                    },
                                ]);
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

    const renderMatchItem = ({ item }: { item: Match }) => (
        <View className="mb-4 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
            <View className="mb-3 flex-row items-start justify-between">
                <View className="flex-1">
                    <Text className="text-base font-semibold text-text-primary dark:text-white">
                        {item.customer.name}
                    </Text>
                    {item.customer.phone && (
                        <Text className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            📱 {item.customer.phone}
                        </Text>
                    )}
                </View>
                <View className="ml-2 rounded-full bg-green-100 px-3 py-1 dark:bg-green-900">
                    <Text className="text-sm font-semibold text-green-600 dark:text-green-300">
                        {item.match_score.toFixed(0)}%
                    </Text>
                </View>
            </View>

            <View className="mb-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                <View className="mb-2 flex-row items-center">
                    <MaterialIcons name="flight" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
                    <Text className="ml-2 text-sm font-medium text-text-primary dark:text-white">
                        {item.flight.airline} {item.flight.flight_number}
                    </Text>
                </View>
                <View className="mb-1 flex-row items-center">
                    <MaterialIcons name="place" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
                    <Text className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        {item.flight.from_airport} → {item.flight.to_airport}
                    </Text>
                </View>
                <View className="mb-1 flex-row items-center">
                    <MaterialIcons name="event" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
                    <Text className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        {formatDateOnly(item.flight.flight_date)}
                    </Text>
                </View>
                <View className="flex-row items-center">
                    <MaterialIcons name="scale" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
                    <Text className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                        Còn {item.flight.available_weight} kg
                    </Text>
                </View>
            </View>

            {item.status === 'pending' && (
                <TouchableOpacity
                    onPress={() => handleSendRequest(item.id)}
                    disabled={sending === item.id}
                    className="h-12 items-center justify-center rounded-lg bg-blue-600">
                    {sending === item.id ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text className="font-semibold text-white">Gửi request</Text>
                    )}
                </TouchableOpacity>
            )}

            {item.status === 'sent' && (
                <TouchableOpacity
                    onPress={() => handleCancelRequest(item.customer.name)}
                    disabled={cancelling !== null}
                    className="h-12 flex-row items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/20">
                    {cancelling !== null ? (
                        <ActivityIndicator color="#EF4444" />
                    ) : (
                        <>
                            <MaterialIcons name="cancel" size={18} color="#EF4444" />
                            <Text className="ml-2 font-semibold text-red-600 dark:text-red-400">
                                Hủy request
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            )}
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
                    title: 'Danh sách matches',
                    headerTitle: 'Danh sách matches',
                }}
            />
            <View className="flex-1 bg-background-light dark:bg-background-dark">


                {requestInfo && (
                    <View className="border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
                        <Text className="text-sm font-medium text-text-primary dark:text-white">
                            Request: {requestInfo.from_airport} → {requestInfo.to_airport}
                        </Text>
                        <Text className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                            Ngày: {requestInfo.desired_date ? formatDateOnly(requestInfo.desired_date) : 'N/A'}
                        </Text>
                    </View>
                )}

                {/* Hiển thị request đã gửi nếu có */}
                {sentRequest && (
                    <View className="border-b border-gray-200 bg-blue-50 px-4 py-4 dark:border-gray-700 dark:bg-blue-900/20">
                        <View className="mb-3 flex-row items-center justify-between">
                            <View className="flex-1">
                                <Text className="text-sm font-semibold text-text-primary dark:text-white">
                                    Request đã gửi tới
                                </Text>
                                <Text className="mt-1 text-base font-bold text-text-primary dark:text-white">
                                    {sentRequest.customer.name}
                                </Text>
                                {sentRequest.customer.phone && (
                                    <Text className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                                        📱 {sentRequest.customer.phone}
                                    </Text>
                                )}
                            </View>
                            <TouchableOpacity
                                onPress={() => handleCancelRequest(sentRequest.customer.name)}
                                disabled={cancelling !== null}
                                className="ml-2 rounded-lg bg-red-100 px-4 py-2 dark:bg-red-900/20">
                                {cancelling !== null ? (
                                    <ActivityIndicator color="#EF4444" size="small" />
                                ) : (
                                    <View className="flex-row items-center">
                                        <MaterialIcons name="cancel" size={16} color="#EF4444" />
                                        <Text className="ml-1 text-xs font-semibold text-red-600 dark:text-red-400">
                                            Hủy
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        </View>
                        <View className="mt-2 rounded-lg bg-white p-3 dark:bg-gray-800">
                            <View className="mb-1 flex-row items-center">
                                <MaterialIcons name="flight" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
                                <Text className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                    {sentRequest.flight.airline} {sentRequest.flight.flight_number}
                                </Text>
                            </View>
                            <View className="mb-1 flex-row items-center">
                                <MaterialIcons name="place" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
                                <Text className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                    {sentRequest.flight.from_airport} → {sentRequest.flight.to_airport}
                                </Text>
                            </View>
                            <View className="flex-row items-center">
                                <MaterialIcons name="event" size={16} color={isDark ? '#9ca3af' : '#6b7280'} />
                                <Text className="ml-2 text-sm text-gray-600 dark:text-gray-400">
                                    {formatDateOnly(sentRequest.flight.flight_date)}
                                </Text>
                            </View>
                        </View>
                    </View>
                )}

                {matches.length === 0 ? (
                    <View className="flex-1 items-center justify-center px-4">
                        <MaterialIcons name="search-off" size={64} color={isDark ? '#6b7280' : '#9ca3af'} />
                        <Text className="mt-4 text-center text-lg font-semibold text-text-primary dark:text-white">
                            Chưa có khách hàng phù hợp
                        </Text>
                        <Text className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
                            Hệ thống sẽ thông báo khi tìm thấy customer phù hợp
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={matches}
                        keyExtractor={(item) => item.id.toString()}
                        renderItem={renderMatchItem}
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
