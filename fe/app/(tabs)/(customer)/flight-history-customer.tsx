// app/flight-history.tsx
import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Image,
} from 'react-native';
import { useColorScheme } from 'nativewind';
import { MaterialIcons } from '@expo/vector-icons';
import { router, Stack, useFocusEffect } from 'expo-router';
import api from '@/api/api';
import { formatDateTime } from '../../utils/dateUtils';
import { getAirportWithCity } from '../../utils/airportUtils';

interface Flight {
  id: number;
  uuid: string;
  customer_id: number;
  from_airport: string;
  to_airport: string;
  flight_date: string;
  airline: string;
  flight_number: string;
  boarding_pass_url: string | null;
  item_images?: string[];
  verified: boolean;
  verified_at: string | null;
  verified_by: number | null;
  max_weight: string;
  booked_weight: string;
  note: string | null;
  created_at: string;
  updated_at: string;
  item_type: string;
  item_value: string | null;
  status: string;
  available_weight: number;
  is_fully_booked: boolean;
  requests: Array<{
    id: number;
    status: string;
    order?: {
      id: number;
      uuid: string;
      status: string;
    };
    order_id?: number;
    sender?: {
      id: number;
      name: string;
    };
  }>;
}

type FlightStatusFilter = '' | 'pending' | 'verified' | 'completed' | 'cancelled';

export default function FlightHistoryScreen() {
  const { colorScheme } = useColorScheme();
  const [flights, setFlights] = useState<Flight[]>([]);
  const [filteredFlights, setFilteredFlights] = useState<Flight[]>([]);
  const [statusFilter, setStatusFilter] = useState<FlightStatusFilter>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const FLIGHT_FILTER_TABS: { label: string; status: FlightStatusFilter }[] = [
    { label: 'Tất cả', status: '' },
    { label: 'Sắp tới', status: 'verified' },
    { label: 'Đã hoàn thành', status: 'completed' },
    { label: 'Đã hủy', status: 'cancelled' },
  ];

  const fetchFlights = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const response = await api.get('flights/');
      let data = response.data;

      // Xử lý response structure
      if (data?.data) data = data.data;
      if (data?.flights) data = data.flights;

      if (Array.isArray(data)) {
        setFlights(data);
        applyFilter(data, statusFilter);
      } else {
        throw new Error('Dữ liệu không hợp lệ');
      }
    } catch (err: any) {
      console.error('Lỗi tải danh sách chuyến bay:', err);
      const msg = err.response?.data?.message || 'Không thể tải danh sách chuyến bay';
      setError(msg);

      if (err.response?.status === 401) {
        Alert.alert('Phiên hết hạn', 'Vui lòng đăng nhập lại', [
          { text: 'OK', onPress: () => router.replace('/login') },
        ]);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Apply filter to flights
  const applyFilter = (flightsData: Flight[], filter: FlightStatusFilter) => {
    if (!filter) {
      setFilteredFlights(flightsData);
      return;
    }
    const filtered = flightsData.filter((flight) => {
      if (filter === 'verified') {
        return flight.status === 'verified' || (flight.verified && flight.status !== 'completed' && flight.status !== 'cancelled');
      }
      return flight.status === filter;
    });
    setFilteredFlights(filtered);
  };

  // Update filtered flights when filter changes
  useEffect(() => {
    applyFilter(flights, statusFilter);
  }, [statusFilter, flights]);

  // Tự động load khi vào màn hình
  useFocusEffect(
    useCallback(() => {
      fetchFlights();
    }, [])
  );

  // formatDateTime is now imported from utils/dateUtils

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { icon: string; color: string; bgColor: string; label: string }
    > = {
      pending: {
        icon: 'hourglass-empty',
        color: '#F59E0B',
        bgColor: 'bg-amber-100 dark:bg-amber-900/30',
        label: 'Chờ xác thực',
      },
      verified: {
        icon: 'schedule',
        color: '#2563EB',
        bgColor: 'bg-primary/10',
        label: 'Sắp tới',
      },
      completed: {
        icon: 'task-alt',
        color: '#10B981',
        bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
        label: 'Đã hoàn thành',
      },
      cancelled: {
        icon: 'cancel',
        color: '#EF4444',
        bgColor: 'bg-red-100 dark:bg-red-900/30',
        label: 'Đã hủy',
      },
    };

    const config = statusMap[status] || statusMap.pending;

    return (
      <View className={`flex-row items-center gap-1.5 rounded-lg px-2.5 py-1 ${config.bgColor}`}>
        <MaterialIcons name={config.icon as any} size={14} color={config.color} />
        <Text
          className="text-xs font-semibold"
          style={{ color: config.color }}
        >
          {config.label}
        </Text>
      </View>
    );
  };

  const getFlightIcon = (status: string) => {
    if (status === 'verified') return 'flight-takeoff';
    if (status === 'completed') return 'flight-land';
    if (status === 'cancelled') return 'no-transfer';
    return 'hourglass-empty';
  };

  const getFlightIconBg = (status: string) => {
    if (status === 'verified') return 'bg-blue-100 dark:bg-blue-900/50';
    if (status === 'completed') return 'bg-gray-100 dark:bg-gray-700';
    return 'bg-gray-100 dark:bg-gray-700';
  };

  if (loading && !refreshing) {
    return (
      <View className="flex-1 bg-background-light dark:bg-background-dark">
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
        <View className="sticky top-0 z-10 flex-row items-center justify-between bg-background-light/80 px-4 py-4 backdrop-blur-sm dark:bg-background-dark/80">
          <View className="w-10" />
          <Text className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
            Lịch sử Chuyến bay
          </Text>
          <TouchableOpacity className="p-2">
            <MaterialIcons
              name="filter-list"
              size={28}
              color={colorScheme === 'dark' ? '#F5F7FB' : '#1F2937'}
            />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
          <Text className="mt-4 text-gray-600 dark:text-gray-400">Đang tải...</Text>
        </View>
      </View>
    );
  }

  if (error && flights.length === 0) {
    return (
      <View className="flex-1 bg-background-light dark:bg-background-dark">
        <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
        <View className="sticky top-0 z-10 flex-row items-center justify-between bg-background-light/80 px-4 py-4 backdrop-blur-sm dark:bg-background-dark/80">
          <View className="w-10" />
          <Text className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
            Lịch sử Chuyến bay
          </Text>
          <TouchableOpacity className="p-2">
            <MaterialIcons
              name="filter-list"
              size={28}
              color={colorScheme === 'dark' ? '#F5F7FB' : '#1F2937'}
            />
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <MaterialIcons name="error-outline" size={64} color="#EF4444" />
          <Text className="mt-4 text-center text-lg font-semibold text-gray-700 dark:text-gray-300">
            {error}
          </Text>
          <TouchableOpacity
            onPress={() => fetchFlights()}
            className="mt-6 rounded-lg bg-primary px-6 py-3"
          >
            <Text className="font-bold text-white">Thử lại</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Lịch sử Chuyến bay',
          headerTitle: 'Lịch sử Chuyến bay',
          headerTitleStyle: {
            fontSize: 16,
            fontWeight: 'bold',
            color: '#111318',
          },
        }}
      />
      <View className="flex-1 bg-background-light dark:bg-background-dark">
        {/* Status Filter Tabs */}
        <View className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row"
            contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12 }}
          >
            {FLIGHT_FILTER_TABS.map((tab) => {
              const isActive = statusFilter === tab.status;
              return (
                <TouchableOpacity
                  key={tab.status || 'all'}
                  onPress={() => setStatusFilter(tab.status)}
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

        {/* List */}
        <ScrollView
          className="flex-1 px-4 pb-32"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => fetchFlights(true)} />
          }
        >
          {filteredFlights.length === 0 ? (
            <View className="mt-20 items-center justify-center px-6">
              <View className="h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
                <MaterialIcons name="flight" size={48} color="#2563EB" />
              </View>
              <Text className="mt-2 text-center text-lg font-semibold text-gray-700 dark:text-gray-300">
                {statusFilter ? 'Không có chuyến bay nào phù hợp' : 'Chưa có chuyến bay nào'}
              </Text>
              <Text className="mt-2 text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                {statusFilter ? 'Thử chọn bộ lọc khác hoặc' : 'Thêm chuyến bay đầu tiên của bạn'}
              </Text>
              {!statusFilter && (
                <TouchableOpacity
                  onPress={() => router.push('/home_customer')}
                  className="rounded-xl bg-primary px-6 py-4 shadow-lg active:opacity-90"
                >
                  <View className="flex-row items-center gap-2">
                    <MaterialIcons name="add" size={20} color="#FFFFFF" />
                    <Text className="text-base font-bold text-white">Thêm chuyến bay</Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View className="gap-3 py-3">
              {filteredFlights.map((flight) => (
                <TouchableOpacity
                  key={flight.id}
                  onPress={() =>
                    router.push({
                      pathname: '/detail-flight-customer',
                      params: { id: flight.id.toString() },
                    })
                  }
                  activeOpacity={0.7}
                >
                  <View className="rounded-2xl bg-white p-5 shadow-md dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                    {/* Header */}
                    <View className="flex-row items-center justify-between mb-4">
                      <View className="flex-row items-center gap-3 flex-1">
                        <View
                          className={`h-12 w-12 items-center justify-center rounded-xl ${getFlightIconBg(
                            flight.status
                          )}`}
                        >
                          <MaterialIcons
                            name={getFlightIcon(flight.status) as any}
                            size={24}
                            color="#2563EB"
                          />
                        </View>
                        <View className="flex-1">
                          <Text className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
                            {flight.flight_number}
                          </Text>
                          <Text className="text-xs text-text-secondary-light dark:text-text-secondary-dark mt-0.5">
                            {formatDateTime(flight.flight_date)}
                          </Text>
                        </View>
                      </View>

                      <View className="flex-row items-center gap-2 flex-shrink-0">
                        {flight.requests && flight.requests.length > 0 && (
                          <View className="rounded-lg bg-primary/10 px-2.5 py-1.5">
                            <Text className="text-xs font-semibold text-primary">
                              {flight.requests.length} Yêu cầu
                            </Text>
                          </View>
                        )}
                        {/* Badge cho chuyến bay đã confirm với sender */}
                        {(() => {
                          const confirmedRequests = flight.requests?.filter((req: any) =>
                            req.status === 'accepted' || req.status === 'confirmed'
                          ) || [];
                          if (confirmedRequests.length > 0) {
                            return (
                              <View className="rounded-lg bg-emerald-500/10 px-2.5 py-1.5 flex-row items-center gap-1">
                                <MaterialIcons name="check-circle" size={14} color="#10B981" />
                                <Text className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                                  Đã xác nhận
                                </Text>
                              </View>
                            );
                          }
                          return null;
                        })()}
                      </View>
                    </View>

                    {/* Route */}
                    <View className="mb-4 flex-row items-center justify-between px-2">
                      <View className="items-center flex-1">
                        <Text className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                          {flight.from_airport}
                        </Text>
                        <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {getAirportWithCity(flight.from_airport).split(' - ')[1] || ''}
                        </Text>
                      </View>

                      <View className="flex-1 flex-row items-center px-3">
                        <View className="flex-1 border-t-2 border-primary/30 dark:border-primary/50" />
                        <View className="mx-2">
                          <MaterialIcons name="flight" size={20} color="#2563EB" />
                        </View>
                        <View className="flex-1 border-t-2 border-primary/30 dark:border-primary/50" />
                      </View>

                      <View className="items-center flex-1">
                        <Text className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
                          {flight.to_airport}
                        </Text>
                        <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {getAirportWithCity(flight.to_airport).split(' - ')[1] || ''}
                        </Text>
                      </View>
                    </View>

                    {/* Badges */}
                    <View className="flex-row gap-2 flex-wrap mb-3">
                      {getStatusBadge(flight.status)}
                      {flight.verified && flight.status !== 'completed' && flight.status !== 'cancelled' && (
                        <View className="flex-row items-center gap-1.5 rounded-lg bg-emerald-100 px-2.5 py-1 dark:bg-emerald-900/30">
                          <MaterialIcons name="verified" size={14} color="#10B981" />
                          <Text className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                            Đã xác thực
                          </Text>
                        </View>
                      )}
                      {flight.available_weight !== undefined && flight.available_weight > 0 && (
                        <View className="flex-row items-center gap-1.5 rounded-lg bg-primary/10 px-2.5 py-1">
                          <MaterialIcons name="scale" size={14} color="#2563EB" />
                          <Text className="text-xs font-semibold text-primary">
                            Còn {flight.available_weight}kg
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Hiển thị ảnh vé máy bay */}
                    {flight.item_images && flight.item_images.length > 0 && (
                      <View className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <Text className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                          Ảnh vé máy bay ({flight.item_images.length})
                        </Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-2">
                          {flight.item_images.slice(0, 4).map((imageUrl, index) => (
                            <Image
                              key={index}
                              source={{ uri: imageUrl }}
                              className="h-16 w-16 rounded-lg"
                              resizeMode="cover"
                            />
                          ))}
                          {flight.item_images.length > 4 && (
                            <View className="h-16 w-16 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                              <Text className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                                +{flight.item_images.length - 4}
                              </Text>
                            </View>
                          )}
                        </ScrollView>
                      </View>
                    )}

                    {/* Thông báo chuyến bay hoàn thành và nút xem đơn hàng */}
                    {(() => {
                      // Tìm request đã được accepted/confirmed
                      const confirmedRequest = flight.requests?.find((req: any) =>
                        (req.status === 'accepted' || req.status === 'confirmed') && (req.order || req.order_id)
                      );

                      if (confirmedRequest) {
                        const order = confirmedRequest.order;
                        const orderId = order?.id || order?.uuid || confirmedRequest.order_id;
                        const orderStatus = order?.status;

                        // Kiểm tra nếu order đã completed
                        const isOrderCompleted = orderStatus === 'completed';

                        return (
                          <View className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            {isOrderCompleted && (
                              <View className="mb-2.5 flex-row items-center justify-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 shadow-sm">
                                <MaterialIcons name="check-circle" size={18} color="#FFFFFF" />
                                <Text className="text-sm font-bold text-white">
                                  ✓ Chuyến bay hoàn thành
                                </Text>
                              </View>
                            )}
                            <TouchableOpacity
                              onPress={(e) => {
                                e.stopPropagation(); // Ngăn chặn navigate đến detail flight
                                if (orderId) {
                                  router.push({
                                    pathname: '/orders_details',
                                    params: { orderId: String(orderId) }
                                  });
                                }
                              }}
                              className="flex-row items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 shadow-sm active:opacity-90"
                            >
                              <MaterialIcons name="local-shipping" size={18} color="#FFFFFF" />
                              <Text className="text-sm font-bold text-white">
                                Xem đơn hàng
                              </Text>
                            </TouchableOpacity>
                          </View>
                        );
                      }
                      return null;
                    })()}
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </ScrollView>

        {/* FAB - Chỉ hiển thị khi có chuyến bay */}
        {filteredFlights.length > 0 && (
          <View className="absolute bottom-6 right-6">
            <TouchableOpacity
              onPress={() => router.push('/home_customer')}
              className="flex-row items-center gap-2 rounded-full bg-primary px-5 py-3.5 shadow-xl active:opacity-90"
            >
              <MaterialIcons name="add" size={24} color="white" />
              <Text className="text-base font-bold text-white">Thêm chuyến bay</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
}
