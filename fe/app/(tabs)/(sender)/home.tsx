import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useSelector } from 'react-redux';
import api from '@/api/api';
import ItemOrder from 'app/components/ItemOrder';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useOrderMatchList } from '@/hooks/useOrderMatchList';
import CitySelectModal from '../../components/CitySelectModal';
import ItemTypeSelect from '../../components/ItemTypeSelect';
import { useApi } from '../../../hooks/useApi';
interface RootState {
  user: {
    role?: string;
    token?: string;
    [key: string]: any;
  };
}

const Home = () => {
  const user = useSelector((state: RootState) => state.user);
  const role = user?.role;

  const [orders, setOrders] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // State để lưu dữ liệu từ CitySelectModal
  const [departureCity, setDepartureCity] = useState({ value: '', label: '' });
  const [arrivalCity, setArrivalCity] = useState({ value: '', label: '' });
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [itemType, setItemType] = useState('');
  const [itemValue, setItemValue] = useState('');

  // Use API call hook
  const { callApi, loading: searchLoading } = useApi();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!role) return;

      try {
        const response = await api.get('orders', { params: { role } });

        if (response.data.status === 'success') {
          setOrders(response.data.data.orders.data);
        }
      } catch (err) {
        setError('Error fetching orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [role]);

  useOrderMatchList(
    orders.map((o) => o.id),
    (chatId) => {
      router.push(`/chat/${chatId}`);
    }
  );

  // Hàm xử lý khi tìm kiếm
  const handleSearch = async () => {
    // Validate dữ liệu
    if (!departureCity.value) {
      alert('Vui lòng chọn thành phố đi');
      return;
    }
    if (!arrivalCity.value) {
      alert('Vui lòng chọn thành phố đến');
      return;
    }
    if (!date) {
      alert('Vui lòng chọn ngày gửi');
      return;
    }
    if (!timeSlot) {
      alert('Vui lòng chọn khung giờ ưu tiên');
      return;
    }

    // Prepare params for API (date already in yyyy-mm-dd format)
    const searchParams = {
      from_airport: departureCity.value,
      to_airport: arrivalCity.value,
      date: date, // Already in yyyy-mm-dd format
      time_slot: timeSlot,
      ...(itemType && { item_type: itemType }),
      ...(itemValue && { item_value: itemValue }),
    };

    console.log('Dữ liệu gửi lên API:', searchParams);

    // Call API using useApi hook
    const result = await callApi('flights/search', {
      method: 'GET',
      params: searchParams,
      requireAuth: true,
      onSuccess: (data) => {
        // Chuyển sang màn hình kết quả với data
        router.push({
          pathname: '/PassengerSearchResultsScreen',
          params: {
            departureCode: departureCity.value,
            departureLabel: departureCity.label,
            arrivalCode: arrivalCity.value,
            arrivalLabel: arrivalCity.label,
            date: date,
            timeSlot: timeSlot,
            searchResults: JSON.stringify(data.data || []),
          },
        });
      },
      onError: (error) => {
        console.error('Search error:', error);
      },
    });
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header cố định */}
      <View className="sticky top-0 z-10 border-b border-gray-200 bg-background-light px-4 pb-2 pt-4 dark:border-gray-700 dark:bg-background-dark">
        <View className="h-12 flex-row items-center justify-between">
          <Text className="text-text-primary text-3xl font-bold dark:text-white">Xin chào, An</Text>
          <TouchableOpacity onPress={() => router.push('/notifications')}>
            <MaterialIcons name="notifications" size={28} color="#2563EB" />
          </TouchableOpacity>
        </View>
        <Text className="text-text-secondary mt-1 dark:text-gray-400">
          Bạn cần gửi tài liệu đi đâu hôm nay?
        </Text>
      </View>

      <ScrollView className="flex-1 px-4 pb-32">
        {/* Form tìm hành khách */}
        <View className="mt-4 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
          <View className="grid grid-cols-2 gap-4">
            {/* Thành phố đi */}
            <View className="col-span-1">
              <Text className="text-text-primary pb-2 text-sm font-medium dark:text-gray-300">
                Thành phố đi
              </Text>
              <CitySelectModal
                placeholder="Ví dụ: Hà Nội"
                iconName="flight-takeoff"
                value={departureCity.value}
                onValueChange={(value, label) => setDepartureCity({ value, label })}
              />
            </View>

            {/* Thành phố đến */}
            <View className="col-span-1">
              <Text className="text-text-primary pb-2 text-sm font-medium dark:text-gray-300">
                Thành phố đến
              </Text>
              <CitySelectModal
                placeholder="Ví dụ: TP. HCM"
                iconName="flight-land"
                value={arrivalCity.value}
                onValueChange={(value, label) => setArrivalCity({ value, label })}
              />
            </View>

            {/* Ngày gửi */}
            <View className="col-span-1">
              <Text className="text-text-primary pb-2 text-sm font-medium dark:text-gray-300">
                Ngày gửi
              </Text>
              <View className="relative">
                <MaterialIcons
                  name="calendar-today"
                  size={20}
                  color="#6b7280"
                  style={{ position: 'absolute', left: 12, top: 17, zIndex: 10 }}
                />
                <TextInput
                  placeholder="dd-mm-yyyy"
                  value={date}
                  onChangeText={setDate}
                  className="text-text-primary h-14 rounded-lg border border-gray-200 bg-background-light pl-10 pr-4 text-base dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </View>
            </View>

            {/* Khung giờ */}
            <View className="col-span-1">
              <Text className="text-text-primary pb-2 text-sm font-medium dark:text-gray-300">
                Khung giờ ưu tiên
              </Text>
              <View className="relative">
                <MaterialIcons
                  name="schedule"
                  size={20}
                  color="#6b7280"
                  style={{ position: 'absolute', left: 12, top: 17, zIndex: 10 }}
                />
                <TextInput
                  placeholder="Buổi sáng (6h-12h)"
                  value={timeSlot}
                  onChangeText={setTimeSlot}
                  className="text-text-primary h-14 rounded-lg border border-gray-200 bg-background-light pl-10 pr-4 text-base dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </View>
            </View>

            {/* Loại tài liệu - COMMENTED */}
            <View className="col-span-2">
              <Text className="text-text-primary pb-2 text-sm font-medium dark:text-gray-300">
                Loại tài liệu
              </Text>
              <ItemTypeSelect
                placeholder="Chọn loại tài liệu"
                value={itemType}
                onValueChange={(value, label) => setItemType(value)}
              />
            </View>

            {/* Giá trị ước tính - COMMENTED */}
            <View className="col-span-2">
              <Text className="text-text-primary pb-2 text-sm font-medium dark:text-gray-300">
                Giá trị ước tính tài liệu (VND)
              </Text>
              <View className="relative">
                <MaterialIcons
                  name="payments"
                  size={20}
                  color="#6b7280"
                  style={{ position: 'absolute', left: 12, top: 17, zIndex: 10 }}
                />
                <TextInput
                  placeholder="Ví dụ: 5,000,000"
                  keyboardType="numeric"
                  value={itemValue}
                  onChangeText={setItemValue}
                  className="text-text-primary h-14 rounded-lg border border-gray-200 bg-background-light pl-10 pr-4 text-base dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </View>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleSearch}
            disabled={searchLoading}
            className={`mt-4 h-14 items-center justify-center rounded-lg ${
              searchLoading ? 'bg-gray-400' : 'bg-primary'
            }`}>
            {searchLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-base font-bold text-white">Tìm hành khách phù hợp</Text>
            )}
          </TouchableOpacity>

          {/* Debug: Hiển thị giá trị đã chọn */}
          {(departureCity.value || arrivalCity.value || date || timeSlot) && (
            <View className="mt-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
              <Text className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Dữ liệu sẽ gửi lên API:
              </Text>
              <Text className="text-xs text-gray-600 dark:text-gray-400">
                from_airport: {departureCity.value || 'Chưa chọn'}
              </Text>
              <Text className="text-xs text-gray-600 dark:text-gray-400">
                to_airport: {arrivalCity.value || 'Chưa chọn'}
              </Text>
              <Text className="text-xs text-gray-600 dark:text-gray-400">
                date: {date ? `${date} (API: ${date.split('-').reverse().join('-')})` : 'Chưa nhập'}
              </Text>
              <Text className="text-xs text-gray-600 dark:text-gray-400">
                time_slot: {timeSlot || 'Chưa nhập'}
              </Text>
                <Text className="text-xs text-gray-600 dark:text-gray-400">
                item_type: {itemType || 'Chưa nhập'}
              </Text>
                 <Text className="text-xs text-gray-600 dark:text-gray-400">
                item_value: {itemValue || 'Chưa nhập'}
              </Text>
              <Text className="mt-2 text-xs italic text-gray-500 dark:text-gray-500">
                API endpoint: GET /api/flights/search
              </Text>
            </View>
          )}
        </View>

        {/* Đơn hàng nổi bật */}
        <View className="mt-8">
          <View className="mb-4 flex-row items-center justify-between">
            <Text className="text-text-primary text-lg font-bold dark:text-white">
              Đơn hàng Nổi bật dành cho bạn
            </Text>
            <Text className="text-sm font-semibold text-primary">Xem tất cả</Text>
          </View>

          <View className="gap-3">
            {[
              { title: 'Tài liệu HN - SGN', time: 'Giao trước 18:00 hôm nay', price: '250.000đ' },
              { title: 'Hợp đồng DAD - SGN', time: 'Giao trong ngày mai', price: '300.000đ' },
            ].map((item, i) => (
              <View
                key={i}
                className="flex-row items-center rounded-lg bg-white p-3 shadow-sm dark:bg-gray-800">
                <View className="mr-4 h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/40">
                  <MaterialIcons
                    name={i === 0 ? 'description' : 'folder-special'}
                    size={28}
                    color="#2563EB"
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-text-primary font-bold dark:text-white">{item.title}</Text>
                  <Text className="text-text-secondary text-sm dark:text-gray-400">
                    {item.time}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="font-bold text-secondary">{item.price}</Text>
                  <Text className="text-text-secondary text-xs dark:text-gray-400">Đang tìm</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Hành khách sẵn có */}
        <View className="mt-8">
          <Text className="text-text-primary mb-4 text-lg font-bold dark:text-white">
            Hành khách sẵn có cho bạn
          </Text>

          {/* Hành khách 1 */}
          <View className="mb-4 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
            <View className="flex-row items-center">
              <Image
                source={{
                  uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCt1uclnQVmRt4FpXFSBOmqwkd7L1z-v6wELp4awVZPFJvpgEMQxPwfI81Umsb1Ioxb-8x74MbwZwQBQx5BULoT206OeocHce63_UGWhTcJvyO1fbozdfC0OrBdgAOzmPd8-HoiOSZ9qsA0VuBkeqq9V3kRCrtRsvlkWLeQ8trYnuKqRCBjLQ3saRSJfc-1LxeUOPZ8gt5cjbqA_SU9KMzQhTRlXgzWWR9n_tHcDczWFQNsBgsN-Gk7_2fNPqRYhcISQtax1Wcc8gaC',
                }}
                className="mr-4 h-14 w-14 rounded-full"
              />
              <View className="flex-1">
                <Text className="text-text-primary font-bold dark:text-white">Bình An</Text>
                <View className="mt-1 flex-row items-center">
                  <MaterialIcons name="star" size={16} color="#facc15" />
                  <Text className="text-text-secondary ml-1 text-sm dark:text-gray-400">
                    5.0 · 98% thành công
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => router.push('request_order')}
                className="rounded-lg bg-primary/10 px-4 py-2 dark:bg-primary/20">
                <Text className="text-sm font-bold text-primary dark:text-blue-400">
                  Gửi yêu cầu
                </Text>
              </TouchableOpacity>
            </View>

            <View className="my-4 h-px bg-gray-200 dark:bg-gray-700" />

            <View className="gap-y-3">
              <View className="flex-row items-center">
                <MaterialIcons name="flight" size={20} color="#6B7280" />
                <Text className="text-text-secondary ml-2 text-sm dark:text-gray-300">
                  SGN → HAN 18:00 - 20:00
                </Text>
              </View>
              <View className="flex-row items-center">
                <MaterialIcons name="work" size={20} color="#6B7280" />
                <Text className="text-text-secondary ml-2 text-sm dark:text-gray-300">
                  Hành lý còn trống:{' '}
                  <Text className="font-bold text-green-600 dark:text-green-400">2kg</Text>
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
