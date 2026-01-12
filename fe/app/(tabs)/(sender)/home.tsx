import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { useUnreadNotificationCount } from '@/hooks/useUnreadNotificationCount';
import api from '@/api/api';
import ItemOrder from 'app/components/ItemOrder';
import { router, useFocusEffect } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useOrderMatchList } from '@/hooks/useOrderMatchList';
import BannerSlider from '../../components/BannerSlider';
import SearchFlightModal from '../../components/SearchFlightModal';
import { formatVND } from '@/utils/currencyFormatter';

const Home = () => {
  const user = useSelector((state: RootState) => state.user);
  const role = user?.role;
  const unreadNotificationCount = useUnreadNotificationCount();

  const [orders, setOrders] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  // State cho available customers
  const [availableCustomers, setAvailableCustomers] = useState<any[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // State cho modal tìm kiếm
  const [searchModalVisible, setSearchModalVisible] = useState(false);

  // Stats data
  const [stats, setStats] = useState({
    totalOrders: 0,
    completedOrders: 0,
    pendingOrders: 0,
    totalEarnings: 0,
  });

  // Fetch orders
  const fetchOrders = async () => {
    if (!user?.token) {
      setOrders([]);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get('orders/getList');

      // Xử lý response structure
      let ordersData = [];
      if (response.data?.success && response.data?.data) {
        // Response có structure: { success: true, data: { data: [...], current_page: ... } }
        if (response.data.data?.data) {
          ordersData = response.data.data.data;
        } else if (Array.isArray(response.data.data)) {
          ordersData = response.data.data;
        }
      } else if (response.data?.status === 'success' && response.data?.data) {
        // Fallback cho structure cũ
        if (response.data.data?.orders?.data) {
          ordersData = response.data.data.orders.data;
        } else if (Array.isArray(response.data.data)) {
          ordersData = response.data.data;
        }
      }

      setOrders(ordersData);
    } catch (err: any) {
      // Chỉ log error nếu không phải 401 (unauthorized)
      if (err.response?.status !== 401) {
        console.error('Error fetching orders:', err);
        setError('Error fetching orders');
      }
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    // Kiểm tra authentication trước khi gọi API
    if (!user?.token) {
      setStats({
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
        totalEarnings: 0,
      });
      return;
    }

    try {
      const response = await api.get('orders/getList');
      let ordersData = [];
      if (response.data?.success && response.data?.data) {
        if (response.data.data?.data) {
          ordersData = response.data.data.data;
        } else if (Array.isArray(response.data.data)) {
          ordersData = response.data.data;
        }
      }

      const completed = ordersData.filter((o: any) => o.status === 'completed').length;
      const pending = ordersData.filter((o: any) =>
        ['pending', 'confirmed', 'in_transit'].includes(o.status)
      ).length;

      const earnings = ordersData
        .filter((o: any) => o.status === 'completed')
        .reduce((sum: number, o: any) => sum + (o.reward || 0), 0);

      setStats({
        totalOrders: ordersData.length,
        completedOrders: completed,
        pendingOrders: pending,
        totalEarnings: earnings,
      });
    } catch (err: any) {
      // Chỉ log error nếu không phải 401 (unauthorized)
      if (err.response?.status !== 401) {
        console.error('Error fetching stats:', err);
      }
      setStats({
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
        totalEarnings: 0,
      });
    }
  };

  // Fetch available customers
  const fetchAvailableCustomers = async () => {
    // Kiểm tra authentication trước khi gọi API
    if (!user?.token) {
      setAvailableCustomers([]);
      setLoadingCustomers(false);
      return;
    }

    try {
      setLoadingCustomers(true);
      const response = await api.get('sender/available-customers');

      let customersData = [];
      if (response.data?.success && response.data?.data) {
        if (Array.isArray(response.data.data)) {
          customersData = response.data.data;
        }
      }

      setAvailableCustomers(customersData);
    } catch (err: any) {
      // Chỉ log error nếu không phải 401 (unauthorized)
      if (err.response?.status !== 401) {
        console.error('Error fetching available customers:', err);
      }
      setAvailableCustomers([]);
    } finally {
      setLoadingCustomers(false);
    }
  };

  useEffect(() => {
    // Chỉ fetch khi user đã đăng nhập
    if (!user?.token) {
      setOrders([]);
      setAvailableCustomers([]);
      setStats({
        totalOrders: 0,
        completedOrders: 0,
        pendingOrders: 0,
        totalEarnings: 0,
      });
      setLoading(false);
      return;
    }

    fetchOrders();
    fetchAvailableCustomers();
    fetchStats();
  }, [user?.token]);

  // Refresh data khi quay lại màn hình
  useFocusEffect(
    useCallback(() => {
      if (user?.token) {
        fetchOrders();
        fetchAvailableCustomers();
        fetchStats();
      }
    }, [user?.token])
  );

  useOrderMatchList(
    orders.map((o) => o.id),
    (chatId) => {
      router.push(`/chat/${chatId}`);
    }
  );

  const handleSearch = async (searchParams: any) => {
    console.log('Dữ liệu gửi lên API:', searchParams);

    setSearchLoading(true);
    setSearchModalVisible(false);

    try {
      // Gọi API sử dụng instance api đã config sẵn
      const response = await api.get('flights/search', {
        params: {
          from_airport: searchParams.from_airport,
          to_airport: searchParams.to_airport,
          date: searchParams.date,
          time_slot: searchParams.time_slot,
        },
      });

      console.log('API Response:', response.data);

      // Kiểm tra response thành công
      if (response.data.success) {
        router.push({
          pathname: '/PassengerSearchResultsScreen',
          params: {
            departureCode: searchParams.from_airport,
            departureLabel: searchParams.departureLabel,
            arrivalCode: searchParams.to_airport,
            arrivalLabel: searchParams.arrivalLabel,
            date: searchParams.date,
            timeSlot: searchParams.time_slot,
            searchResults: JSON.stringify(response.data.data || []),
          },
        });
      } else {
        Alert.alert('Lỗi', response.data.message || 'Không tìm thấy kết quả phù hợp');
      }
    } catch (err: any) {
      console.error('Search error:', err);

      // Xử lý lỗi chi tiết
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'Có lỗi xảy ra khi tìm kiếm';

      Alert.alert('Lỗi', errorMessage);
    } finally {
      setSearchLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-gray-900">
      {/* Header - Clean & Simple */}
      <View className="bg-white dark:bg-gray-900 px-6 pt-6 pb-4">
        <View className="flex-row items-center justify-between mb-2">
          <Text className="text-2xl font-bold text-gray-900 dark:text-white">
            SkySend
          </Text>
          <TouchableOpacity
            onPress={() => router.push('/notifications')}
            className="relative"
            activeOpacity={0.7}
          >
            <MaterialIcons name="notifications" size={24} color="#1F2937" />
            {unreadNotificationCount > 0 && (
              <View className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full items-center justify-center border border-white">
                <Text className="text-white text-[10px] font-bold">
                  {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <Text className="text-sm text-gray-600 dark:text-gray-400">
          Xin chào, {user?.name || 'Bạn'}!
        </Text>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Summary Cards - 3 cards ngang như Gojek */}
        <View className="px-6 mb-6">
          <View className="flex-row gap-3">
            {/* Total Orders Card */}
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/(sender)/list_orders')}
              activeOpacity={0.8}
              className="flex-1 rounded-2xl bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700 shadow-sm"
            >
              <View className="flex-row items-center justify-between mb-2">
                <MaterialIcons name="shopping-bag" size={20} color="#2563EB" />
                <MaterialIcons name="chevron-right" size={18} color="#9CA3AF" />
              </View>
              <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stats.totalOrders}
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                Tổng đơn hàng
              </Text>
            </TouchableOpacity>

            {/* Completed Orders Card */}
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/(sender)/list_orders')}
              activeOpacity={0.8}
              className="flex-1 rounded-2xl bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700 shadow-sm"
            >
              <View className="flex-row items-center justify-between mb-2">
                <MaterialIcons name="check-circle" size={20} color="#10B981" />
                <MaterialIcons name="chevron-right" size={18} color="#9CA3AF" />
              </View>
              <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stats.completedOrders}
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                Đã hoàn thành
              </Text>
            </TouchableOpacity>

            {/* Pending Orders Card */}
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/(sender)/list_orders')}
              activeOpacity={0.8}
              className="flex-1 rounded-2xl bg-white dark:bg-gray-800 p-4 border border-gray-100 dark:border-gray-700 shadow-sm"
            >
              <View className="flex-row items-center justify-between mb-2">
                <MaterialIcons name="schedule" size={20} color="#F59E0B" />
                <MaterialIcons name="chevron-right" size={18} color="#9CA3AF" />
              </View>
              <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {stats.pendingOrders}
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                Đang xử lý
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Actions - 2 cards ngang */}
        <View className="px-6 mb-6">
          <View className="flex-row gap-3">
            {/* Create Request Card */}
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/(sender)/create_request_waiting')}
              activeOpacity={0.8}
              className="flex-1 rounded-2xl bg-primary p-4 shadow-md"
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="h-10 w-10 items-center justify-center rounded-full bg-white/20">
                  <MaterialIcons name="add-circle" size={24} color="#FFFFFF" />
                </View>
                <MaterialIcons name="arrow-forward" size={20} color="#FFFFFF" />
              </View>
              <Text className="text-base font-bold text-white mb-1">
                Tạo Request
              </Text>
              <Text className="text-xs text-white/90">
                Yêu cầu gửi hàng mới
              </Text>
            </TouchableOpacity>

            {/* View Matches Card */}
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/(sender)/request_matches')}
              activeOpacity={0.8}
              className="flex-1 rounded-2xl bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <View className="flex-row items-center justify-between mb-3">
                <View className="h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <MaterialIcons name="people" size={20} color="#2563EB" />
                </View>
                <MaterialIcons name="arrow-forward" size={20} color="#6B7280" />
              </View>
              <Text className="text-base font-bold text-gray-900 dark:text-white mb-1">
                Xem Matches
              </Text>
              <Text className="text-xs text-gray-500 dark:text-gray-400">
                Requests đang chờ
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Banner Slider */}
        <View className="px-6 mb-6">
          <BannerSlider
            items={[
              {
                id: '1',
                title: 'Gửi hàng nhanh chóng',
                description: 'Tìm hành khách phù hợp trong vài phút',
                image: require('../../../assets/sky-banner.webp'),
                action: () => { },
              },
              {
                id: '2',
                title: 'Gửi hàng nhanh chóng',
                description: 'Tìm hành khách phù hợp trong vài phút',
                image: require('../../../assets/sky-banner.webp'),
                action: () => { },
              },
            ]}
            height={140}
          />
        </View>

        {/* Earnings Card - Prominent */}
        {stats.totalEarnings > 0 && (
          <View className="px-6 mb-6">
            <View className="rounded-2xl bg-primary p-5 shadow-lg">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-sm text-white/90 mb-1">
                    Tổng thu nhập
                  </Text>
                  <Text className="text-3xl font-bold text-white">
                    {formatVND(stats.totalEarnings)} VNĐ
                  </Text>
                </View>
                <View className="h-16 w-16 items-center justify-center rounded-full bg-white/20">
                  <MaterialIcons name="attach-money" size={32} color="#FFFFFF" />
                </View>
              </View>
            </View>
          </View>
        )}

      </ScrollView>

      {/* Floating Action Button - Tìm hành khách */}
      <TouchableOpacity
        onPress={() => setSearchModalVisible(true)}
        className="absolute bottom-6 right-6 h-16 w-16 items-center justify-center rounded-full bg-primary shadow-lg"
        style={{
          shadowColor: '#2563EB',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <MaterialIcons name="search" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Search Modal */}
      <SearchFlightModal
        visible={searchModalVisible}
        onClose={() => setSearchModalVisible(false)}
        onSearch={handleSearch}
        searchLoading={searchLoading}
      />
    </SafeAreaView>
  );
};

export default Home;
