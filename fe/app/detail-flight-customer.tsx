import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useColorScheme } from 'nativewind';
import { MaterialIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import api from '@/api/api';

interface FlightDetail {
  id: number;
  from_airport: string;
  to_airport: string;
  flight_date: string;
  airline: string;
  flight_number: string;
  max_weight: number;
  boarding_pass: string;
  status: string;
  departure_time?: string;
  arrival_time?: string;
  from_city?: string;
  to_city?: string;
}

export default function FlightDetailScreen({ navigation }: any) {
  const { colorScheme } = useColorScheme();
  const { id } = useLocalSearchParams();
  
  const [flightDetail, setFlightDetail] = useState<FlightDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchFlightDetail(id as string);
    }
  }, [id]);

  const fetchFlightDetail = async (flightId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // Call API với endpoint: /flights/{id}/show
      const response = await api.get(`flights/${flightId}/show`);
      
      console.log('Flight detail response:', response.data);
      
      // Giả sử API trả về { data: {...} } hoặc trực tiếp {...}
      const data = response.data.data || response.data;
      setFlightDetail(data);
      
    } catch (err: any) {
      console.error('Error fetching flight detail:', err);
      
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Không thể tải thông tin chuyến bay';
      
      setError(errorMessage);
      
      // Xử lý lỗi 401 Unauthenticated
      if (err.response?.status === 401) {
        Alert.alert(
          'Phiên đăng nhập hết hạn',
          'Vui lòng đăng nhập lại',
          [
            {
              text: 'OK',
              onPress: () => router.push('/login'),
            },
          ]
        );
      } else if (err.response?.status === 404) {
        Alert.alert('Lỗi', 'Không tìm thấy chuyến bay');
      } else {
        Alert.alert('Lỗi', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    return `${days[date.getDay()]}, ${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const getStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'Đang xác thực',
      'verified': 'Đã xác thực',
      'rejected': 'Bị từ chối',
      'completed': 'Hoàn thành',
      'cancelled': 'Đã hủy',
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'pending': 'bg-yellow-500/10',
      'verified': 'bg-green-500/10',
      'rejected': 'bg-red-500/10',
      'completed': 'bg-blue-500/10',
      'cancelled': 'bg-gray-500/10',
    };
    return colorMap[status] || 'bg-gray-500/10';
  };

  const getStatusTextColor = (status: string) => {
    const colorMap: { [key: string]: string } = {
      'pending': 'text-yellow-600',
      'verified': 'text-green-600',
      'rejected': 'text-red-600',
      'completed': 'text-blue-600',
      'cancelled': 'text-gray-600',
    };
    return colorMap[status] || 'text-gray-600';
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563EB" />
          <Text className="mt-4 text-gray-600 dark:text-gray-400">
            Đang tải thông tin chuyến bay...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !flightDetail) {
    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
        <View className="flex-1 items-center justify-center px-6">
          <MaterialIcons name="error-outline" size={64} color="#EF4444" />
          <Text className="mt-4 text-center text-lg font-bold text-gray-800 dark:text-white">
            {error || 'Không thể tải thông tin chuyến bay'}
          </Text>
          <TouchableOpacity
            onPress={() => id && fetchFlightDetail(id as string)}
            className="mt-6 rounded-lg bg-primary px-6 py-3">
            <Text className="font-bold text-white">Thử lại</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-3 rounded-lg border border-gray-300 px-6 py-3">
            <Text className="font-bold text-gray-700 dark:text-gray-300">Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View className="sticky top-0 z-10 flex-row items-center justify-between bg-background-light/80 px-4 py-4 backdrop-blur-sm dark:bg-background-dark/80">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm dark:bg-gray-800">
          <MaterialIcons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text className="text-text-dark-gray -ml-10 flex-1 text-center text-lg font-bold dark:text-white">
          Chi tiết chuyến bay
        </Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-4 pb-32">
        <View className="mt-4 gap-6">
          {/* Thông tin chuyến bay */}
          <View className="rounded-xl bg-white p-5 shadow-lg dark:bg-gray-800">
            <View className="flex-row items-center justify-between pb-4">
              <View className="flex-row items-center gap-3">
                <Image
                  source={{
                    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDStezHastB7_Fl09lOcS2Gy4d2X2v1puZpcExrVsI2VLGXvslaV1HK_j0rIjfxCnkEToZA9Jd3HMJr2OBcVAO3mssndjeV3vaDMaSEsdL6bITAQOObnicMdzXTTDaaQUJTGSIYIf8XHGOYGvozipARQqOl-515oe2y3AuSwveURfi-BqfDwhB1yrfOrJ9QIYLZD5J0NsNVt_wJh7zC8xNtAgv1kzxh8hmoQqk5Z9lvnKVkmP6t3ON059Nr97zJhHWcxZC7nDDkvlvI',
                  }}
                  className="h-10 w-10"
                  resizeMode="contain"
                />
                <View>
                  <Text className="text-text-dark-gray text-base font-bold dark:text-white">
                    {flightDetail.airline}
                  </Text>
                  <Text className="text-sm text-gray-500">{flightDetail.flight_number}</Text>
                </View>
              </View>
              <View className={`rounded-full px-3 py-1 ${getStatusColor(flightDetail.status)}`}>
                <Text className={`text-sm font-semibold ${getStatusTextColor(flightDetail.status)}`}>
                  {getStatusText(flightDetail.status)}
                </Text>
              </View>
            </View>

            {/* Tuyến bay */}
            <View className="relative flex-row items-center justify-between py-4">
              <View className="items-start">
                <Text className="text-text-dark-gray text-3xl font-bold dark:text-white">
                  {flightDetail.from_airport}
                </Text>
                <Text className="text-sm text-gray-500">
                  {flightDetail.departure_time || formatTime(flightDetail.flight_date)}
                </Text>
              </View>
              <View className="flex-1 flex-row items-center px-4">
                <View className="flex-1 border-t-2 border-gray-300 dark:border-gray-600" />
                <MaterialIcons name="flight-takeoff" size={28} color="#2563EB" />
                <View className="flex-1 border-t-2 border-gray-300 dark:border-gray-600" />
              </View>
              <View className="items-end">
                <Text className="text-text-dark-gray text-3xl font-bold dark:text-white">
                  {flightDetail.to_airport}
                </Text>
                <Text className="text-sm text-gray-500">
                  {flightDetail.arrival_time || '--:--'}
                </Text>
              </View>
            </View>

            <View className="mt-1 flex-row justify-between text-xs text-gray-400">
              <Text>{flightDetail.from_city || flightDetail.from_airport}</Text>
              <Text>{flightDetail.to_city || flightDetail.to_airport}</Text>
            </View>

            <View className="mt-4 border-t border-dashed border-gray-200 pt-4 dark:border-gray-700">
              <Text className="text-sm text-gray-500">Ngày bay</Text>
              <Text className="text-text-dark-gray font-bold dark:text-white">
                {formatDate(flightDetail.flight_date)}
              </Text>
            </View>
          </View>

          {/* Vé máy bay */}
          <View className="rounded-xl bg-white p-5 shadow-lg dark:bg-gray-800">
            <Text className="text-text-dark-gray text-base font-bold dark:text-white">
              Vé máy bay của bạn
            </Text>
            <View className="mt-3 flex-row items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
              <View className="flex-row items-center gap-3">
                <Image
                  source={{
                    uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMmoXMWrZ17Kce9DnQ2Pdn9jvOyJk3ucSKMmV6DkMnl20VRUWmK2bGiCPxLarlXkhLEyhqFe52115wVeJdtkOdZ0L5x2j_iUuUuZBDGKV6KpparMlRqkmViznFt8yhJJypgSdX4CKunmJ1bnwCK9uIVpKDBSGQc0W63-XA116lfGUAz58dWN-ZQfrLJlFWEfVhfPIaUidPhxRs3PK_eqpsFamYy3qbykgTMR-zC2Hwvf4JUqXkY_CgpResWN3iJv2rP-TJVyAMpT67',
                  }}
                  className="h-14 w-14 rounded-lg"
                  resizeMode="cover"
                />
                <View>
                  <Text className="text-text-dark-gray font-semibold dark:text-white">
                    boarding-pass.pdf
                    {/* {flightDetail.boarding_pass.split('/').pop() || 'boarding-pass.pdf'} */}
                  </Text>
                  <Text className="text-sm text-gray-500">Boarding Pass</Text>
                </View>
              </View>
              <TouchableOpacity className="rounded-lg bg-primary/10 px-4 py-2">
                <Text className="text-sm font-bold text-primary">Xem chi tiết</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Thông tin mang tài liệu */}
          <View className="rounded-xl bg-white p-5 shadow-lg dark:bg-gray-800">
            <Text className="text-text-dark-gray text-base font-bold dark:text-white">
              Thông tin mang tài liệu
            </Text>
            <View className="mt-3 flex-row justify-between">
              <Text className="text-sm text-gray-600">Khối lượng tối đa cho phép</Text>
              <Text className="text-text-dark-gray font-bold dark:text-white">
                {flightDetail.max_weight} kg
              </Text>
            </View>
            <View className="mt-4 flex-row items-start gap-3">
              <Text className="flex-1 text-sm text-gray-600">
                Tôi cam kết không mang hàng cấm và tuân thủ quy định của SkySend.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View className="absolute bottom-0 left-0 right-0 bg-white p-4 shadow-2xl dark:bg-gray-900">
        <TouchableOpacity
          onPress={() => router.push({
            pathname: '/edit-flight-customer',
            params: { id: flightDetail.id }
          })}
          className="mb-3 h-14 w-full items-center justify-center rounded-lg bg-primary">
          <Text className="text-base font-bold text-white">Chỉnh sửa chuyến bay</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => {
            Alert.alert(
              'Xác nhận hủy',
              'Bạn có chắc chắn muốn hủy chuyến bay này?',
              [
                { text: 'Không', style: 'cancel' },
                { 
                  text: 'Hủy chuyến bay', 
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await api.delete(`flights/${flightDetail.id}`);
                      Alert.alert('Thành công', 'Chuyến bay đã được hủy');
                      router.back();
                    } catch (err: any) {
                      Alert.alert('Lỗi', err.response?.data?.message || 'Không thể hủy chuyến bay');
                    }
                  }
                }
              ]
            );
          }}
          className="h-14 w-full items-center justify-center rounded-lg border border-red-600">
          <Text className="text-base font-bold text-red-600">Hủy chuyến bay</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
