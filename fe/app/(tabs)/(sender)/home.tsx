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
  Alert,
} from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import api from '@/api/api';
import ItemOrder from 'app/components/ItemOrder';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { useOrderMatchList } from '@/hooks/useOrderMatchList';
import CitySelectModal from '../../components/CitySelectModal';
import ItemTypeSelect from '../../components/ItemTypeSelect';
import DatePickerInput from '../../components/DatePickerInput';

const Home = () => {
  const user = useSelector((state: RootState) => state.user);
  const role = user?.role;

  const [orders, setOrders] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);

  // State cho available customers
  const [availableCustomers, setAvailableCustomers] = useState<any[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // State để lưu dữ liệu từ CitySelectModal
  const [departureCity, setDepartureCity] = useState({ value: '', label: '' });
  const [arrivalCity, setArrivalCity] = useState({ value: '', label: '' });
  const [date, setDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('');
  const [itemType, setItemType] = useState('');
  const [itemValue, setItemValue] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
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
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Error fetching orders');
        // Không set orders = [] để tránh làm mất data nếu có lỗi
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    fetchAvailableCustomers();
  }, []);

  // Fetch available customers
  const fetchAvailableCustomers = async () => {
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
    } catch (err) {
      console.error('Error fetching available customers:', err);
      // Không hiển thị alert để không làm gián đoạn UX
    } finally {
      setLoadingCustomers(false);
    }
  };

  useOrderMatchList(
    orders.map((o) => o.id),
    (chatId) => {
      router.push(`/chat/${chatId}`);
    }
  );

  const handleSearch = async () => {
    // Validation
    if (!departureCity.value) {
      Alert.alert('Thông báo', 'Vui lòng chọn thành phố đi');
      return;
    }
    if (!arrivalCity.value) {
      Alert.alert('Thông báo', 'Vui lòng chọn thành phố đến');
      return;
    }
    if (!date) {
      Alert.alert('Thông báo', 'Vui lòng chọn ngày gửi');
      return;
    }
    if (!timeSlot) {
      Alert.alert('Thông báo', 'Vui lòng chọn khung giờ ưu tiên');
      return;
    }

    const searchParams = {
      from_airport: departureCity.value,
      to_airport: arrivalCity.value,
      date: date,
      time_slot: timeSlot,
      item_type: itemType,
      item_value: itemValue,
    };

    console.log('Dữ liệu gửi lên API:', searchParams);

    setSearchLoading(true);

    try {
      // Gọi API sử dụng instance api đã config sẵn
      const response = await api.get('flights/search', {
        params: searchParams,
      });

      console.log('API Response:', response.data);

      // Kiểm tra response thành công
      if (response.data.success) {
        router.push({
          pathname: '/PassengerSearchResultsScreen',
          params: {
            departureCode: departureCity.value,
            departureLabel: departureCity.label,
            arrivalCode: arrivalCity.value,
            arrivalLabel: arrivalCity.label,
            date: date,
            timeSlot: timeSlot,
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
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header cố định */}
      <View className="sticky top-0 z-10 border-b border-gray-200 bg-background-light px-4 pb-2 pt-4 dark:border-gray-700 dark:bg-background-dark">
        <View className="h-12 flex-row items-center justify-between">
          <Text className="text-text-primary text-3xl font-bold dark:text-white">
            Xin chào, {user?.name || 'Bạn'}!
          </Text>
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
              <DatePickerInput
                label="Ngày gửi"
                placeholder="yyyy-mm-dd"
                value={date}
                onValueChange={setDate}
                minimumDate={new Date()}
              />
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

            {/* Loại tài liệu */}
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

            {/* Giá trị ước tính */}
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
            className={`mt-4 h-14 items-center justify-center rounded-lg ${searchLoading ? 'bg-gray-400' : 'bg-primary'
              }`}>
            {searchLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-base font-bold text-white">Tìm hành khách phù hợp</Text>
            )}
          </TouchableOpacity>

        </View>

        {/* Hành khách sẵn có */}
        {availableCustomers.length > 0 && (
          <View className="mt-8">
            <View className="mb-4 flex-row items-center justify-between">
              <Text className="text-text-primary text-lg font-bold dark:text-white">
                Hành khách sẵn có cho bạn
              </Text>
              {loadingCustomers && (
                <ActivityIndicator size="small" color="#2563EB" />
              )}
            </View>

            {availableCustomers.map((item: any) => {
              const customer = item.customer || {};
              const flight = item.flight || {};

              return (
                <View key={item.id || item.uuid} className="mb-4 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800">
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1 mr-3">
                      <View className="flex-row items-center">
                        <Image
                          source={{
                            uri: customer.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCt1uclnQVmRt4FpXFSBOmqwkd7L1z-v6wELp4awVZPFJvpgEMQxPwfI81Umsb1Ioxb-8x74MbwZwQBQx5BULoT206OeocHce63_UGWhTcJvyO1fbozdfC0OrBdgAOzmPd8-HoiOSZ9qsA0VuBkeqq9V3kRCrtRsvlkWLeQ8trYnuKqRCBjLQ3saRSJfc-1LxeUOPZ8gt5cjbqA_SU9KMzQhTRlXgzWWR9n_tHcDczWFQNsBgsN-Gk7_2fNPqRYhcISQtax1Wcc8gaC'
                          }}
                          className="h-14 w-14 rounded-full mr-3"
                        />
                        <View className="flex-1">
                          <Text className="text-text-primary font-bold dark:text-white">
                            {customer.name || 'Người dùng'}
                          </Text>
                          <View className="mt-1 flex-row items-center">
                            <MaterialIcons name="star" size={16} color="#facc15" />
                            <Text className="text-text-secondary ml-1 text-sm dark:text-gray-400">
                              {customer.rating || 5.0} · {customer.success_rate || 98}% thành công
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        // Navigate to request order với flight_id
                        router.push({
                          pathname: '/request_order',
                          params: {
                            flight_id: flight.id || flight.uuid,
                            customer_id: customer.id,
                          }
                        });
                      }}
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
                        {flight.route || `${flight.from_airport || ''} → ${flight.to_airport || ''}`} {flight.flight_date_formatted || flight.flight_date || ''}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <MaterialIcons name="work" size={20} color="#6B7280" />
                      <Text className="text-text-secondary ml-2 text-sm dark:text-gray-300">
                        Hành lý còn trống:{' '}
                        <Text className="font-bold text-green-600 dark:text-green-400">
                          {flight.available_weight || 0}kg
                        </Text>
                      </Text>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
