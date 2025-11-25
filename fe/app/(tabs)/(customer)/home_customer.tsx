import React, { useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useSelector } from 'react-redux';
import CitySelectModal from '../../components/CitySelectModal';
import DatePickerInput from '../../components/DatePickerInput';
import api from '@/api/api';

export default function HomeScreen() {
  const router = useRouter();

  // Lấy user từ Redux store
  const user = useSelector((state: any) => state.user);

  // State cho form đăng chuyến bay
  const [departureAirport, setDepartureAirport] = useState({ value: '', label: '' });
  const [arrivalAirport, setArrivalAirport] = useState({ value: '', label: '' });
  const [flightDateTime, setFlightDateTime] = useState('');
  const [airline, setAirline] = useState('');
  const [flightCode, setFlightCode] = useState('');
  const [allowedWeight, setAllowedWeight] = useState('');
  const [boardingPass, setBoardingPass] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Dữ liệu Yêu cầu Ưu tiên (scroll ngang)
  const priorityRequests = [
    {
      name: 'Lê Minh Anh',
      item: 'Tài liệu gấp',
      route: 'SGN to HAN',
      reward: '250.000đ',
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuA9W_inshPmtJpr0zofvRT153vXvWy34rBoI8vWbCWELoZryiCn_pRAH076kf-Gqtk3_gPt4Mqmn8R05zbfru-yX_7PCfCYYQKCznDUAKSKrdlv2Uas5zVUk3FI_mFid8pLeBHpzmQisR45o-IQZHVPtXb58uuD8eHFEWvthutXM23bnS7KGNtqI9EGaphnB-YRt6jBTFf2gx6d1OU2VQPT9yD9VH3Ds2TuGE2dLgiOAXL3rlAdCNEcFfBiN61Qwcz0MJ2ANBDWM5tJ',
    },
    {
      name: 'Phạm Văn',
      item: 'Hồ sơ công ty',
      route: 'DAD to SGN',
      reward: '200.000đ',
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuBgNBKB8x2XrJGMh-G4Ky70ghqMewFKZF7WsX_ZfsJS8afazchW_uPIRmle2Qgy4Wbmfozv-H7tzsAfHSx1N5CssnjF57uSR0p5mOkQZRYvaKouLdkfe2r-nL1snAvrG2D7i1k-GdtY0gYnsr4KTsKEyE4mwYVtfWrTetJA6ZyaiZbNPkQYcXAbyKKmB6C1QA4EIKHge5GxWt59g7xKKkBDrXl16dFdm20tUpDjAoadqlD02Npp_ChF4S9ewqyUg0IDzH4EOmVQaz4y',
    },
    {
      name: 'Ngọc Trinh',
      item: 'Giấy tờ cá nhân',
      route: 'PQC to HAN',
      reward: '180.000đ',
      avatar:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAlYQ44LQ_Eq8dLPux09V7kbWCePMxr0Px3Nrw77YJd0rn1faQZ-_XwtVISQPZXSTi_WXqd3uawfsIRNtVzSk1WEQPSvphmbo8-yyfPZjxXW3bZbBhZB_oI8ByW7YLvvWcKXAuwEx_bXAINzI3JuqSDuO_Ur7k8b1PGdMlD9mOR4uqMusqVed-dqHBYUVyqVG_UtNJCQaKnHeVhY-CKNGCmPaxUnf6cR2dAXOfia6CnsbNErtM1WwXOE8Uv355BYVz91Lf7fJo7gKiR',
    },
  ];

  // Yêu cầu phù hợp (danh sách dọc)
  const regularRequests = [
    { name: 'An Nguyễn', item: 'Tài liệu', route: 'SGN to HAN', reward: '150.000đ', urgent: true },
    { name: 'Trần Minh', item: 'Hợp đồng', route: 'SGN to DAD', reward: '120.000đ', urgent: false },
  ];

  // Hàm xử lý đăng chuyến bay
  const handlePostFlight = async () => {
    // Kiểm tra user đã login chưa
    console.log('User from Redux:', user); // Debug

    if (!user || !user.token) {
      Alert.alert(
        'Chưa đăng nhập',
        'Vui lòng đăng nhập để đăng chuyến bay',
        [
          {
            text: 'Đăng nhập',
            onPress: () => router.push('/login'),
          },
          {
            text: 'Hủy',
            style: 'cancel',
          },
        ]
      );
      return;
    }

    // Validation
    if (!departureAirport.value) {
      Alert.alert('Thông báo', 'Vui lòng chọn sân bay đi');
      return;
    }
    if (!arrivalAirport.value) {
      Alert.alert('Thông báo', 'Vui lòng chọn sân bay đến');
      return;
    }
    if (!flightDateTime) {
      Alert.alert('Thông báo', 'Vui lòng chọn ngày và giờ bay');
      return;
    }
    if (!airline) {
      Alert.alert('Thông báo', 'Vui lòng nhập hãng bay');
      return;
    }
    if (!flightCode) {
      Alert.alert('Thông báo', 'Vui lòng nhập mã chuyến bay');
      return;
    }
    if (!allowedWeight) {
      Alert.alert('Thông báo', 'Vui lòng nhập khối lượng cho phép');
      return;
    }

    setIsSubmitting(true);

    try {
      // Chuẩn bị dữ liệu gửi lên API
      const flightData = {
        from_airport: departureAirport.value,
        to_airport: arrivalAirport.value,
        flight_date: flightDateTime,
        airline: airline,
        flight_number: flightCode,
        max_weight: parseFloat(allowedWeight),
        boarding_pass:
          boardingPass || `boarding_pass_${flightCode}_${flightDateTime.replace(/-/g, '')}.jpg`,
      };

      console.log('Sending flight data:', flightData); // Debug

      // api instance đã tự động gắn token qua interceptor
      const response = await api.post('flights/store', flightData);

      console.log('Response:', response.data); // Debug

      if (response.status === 200 || response.status === 201) {
        Alert.alert('Thành công!', 'Chuyến bay đã được tạo.');

        const flightId = response.data.data?.id || response.data.id;
        
        setDepartureAirport({ value: '', label: '' });
        setArrivalAirport({ value: '', label: '' });
        setFlightDateTime('');
        setAirline('');
        setFlightCode('');
        setAllowedWeight('');
        setBoardingPass('');
        
        router.push({
          pathname: '/flight_posted_success',
          params: { flightId: flightId }
        });
      }
    } catch (err: any) {
      console.error('Error posting flight:', err);
      console.error('Error response:', err.response?.data); // Debug

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
        return;
      }

      const errorMessage =
        err.response?.data?.message || err.message || 'Có lỗi xảy ra khi đăng chuyến bay';

      Alert.alert('Lỗi', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      {/* Header */}
      <View className="sticky top-0 z-10 flex-row items-center justify-between bg-background-light px-4 pb-2 pt-4 dark:bg-background-dark">
        <View className="w-12" />
        <Text className="text-text-dark-gray text-lg font-bold dark:text-white">Trang chủ</Text>
        <TouchableOpacity onPress={() => router.push('notifications')} className="h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm dark:bg-gray-800">
          <MaterialIcons
            name="notifications"
            size={24}
            color="#1F2937"
            className="dark:text-white"
          />
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Greeting */}
        <Text className="text-text-dark-gray pt-4 text-[32px] font-bold dark:text-white">
          Xin chào, David!
        </Text>
        <Text className="text-text-dark-gray/80 pb-6 text-base dark:text-white/80">
          Chia sẻ chuyến bay, kiếm thêm thu nhập.
        </Text>

        {/* Form đăng chuyến bay */}
        <View className="mb-8 rounded-xl bg-white p-6 shadow-sm dark:bg-gray-800">
          <Text className="text-text-dark-gray mb-4 text-lg font-bold dark:text-white">
            Thêm chuyến bay của bạn
          </Text>

          <View className="mb-4 grid grid-cols-2 gap-4">
            {/* Sân bay đi */}
            <View className="col-span-1">
              <Text className="text-text-dark-gray pb-2 text-sm font-medium dark:text-white/90">
                Sân bay đi
              </Text>
              <CitySelectModal
                placeholder="VD: SGN"
                iconName="flight-takeoff"
                value={departureAirport.value}
                onValueChange={(value, label) => setDepartureAirport({ value, label })}
              />
            </View>

            {/* Sân bay đến */}
            <View className="col-span-1">
              <Text className="text-text-dark-gray pb-2 text-sm font-medium dark:text-white/90">
                Sân bay đến
              </Text>
              <CitySelectModal
                placeholder="VD: HAN"
                iconName="flight-land"
                value={arrivalAirport.value}
                onValueChange={(value, label) => setArrivalAirport({ value, label })}
              />
            </View>
          </View>

          {/* Ngày & giờ bay */}
          <View className="mb-4">
            <DatePickerInput
              label="Ngày & giờ bay"
              placeholder="Chọn ngày và giờ"
              value={flightDateTime}
              onValueChange={setFlightDateTime}
              minimumDate={new Date()}
            />
          </View>

          <View className="mb-4 grid grid-cols-2 gap-4">
            <Input
              label="Hãng bay"
              placeholder="VD: VNA"
              value={airline}
              onChangeText={setAirline}
            />
            <Input
              label="Mã chuyến bay"
              placeholder="VN123"
              value={flightCode}
              onChangeText={setFlightCode}
            />
          </View>

          {/* Upload vé */}
          <View className="mb-4">
            <Text className="text-text-dark-gray pb-2 text-sm font-medium dark:text-white/90">
              Tải lên vé máy bay / boarding pass
            </Text>
            <TouchableOpacity className="items-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 dark:border-gray-700 dark:bg-gray-900">
              <MaterialIcons name="cloud-upload" size={48} color="#9CA3AF" />
              <Text className="mt-2 text-sm text-gray-500">Kéo thả hoặc nhấn để chọn tệp</Text>
            </TouchableOpacity>
            <Text className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              Trạng thái: <Text className="font-medium">Chưa xác thực</Text>
            </Text>
          </View>

          <Input
            label="Khối lượng cho phép cho tài liệu (kg)"
            placeholder="VD: 5"
            keyboardType="numeric"
            value={allowedWeight}
            onChangeText={setAllowedWeight}
          />

          <TouchableOpacity
            onPress={handlePostFlight}
            disabled={isSubmitting}
            className={`mt-6 h-14 items-center justify-center rounded-lg ${isSubmitting ? 'bg-gray-400' : 'bg-primary'
              }`}>
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-base font-bold text-white">Đăng chuyến bay</Text>
            )}
          </TouchableOpacity>

          {/* Debug: Hiển thị dữ liệu sẽ gửi */}
          {(departureAirport.value || arrivalAirport.value || flightDateTime) && (
            <View className="mt-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
              <Text className="mb-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                Dữ liệu sẽ gửi lên API:
              </Text>
              <Text className="text-xs text-gray-600 dark:text-gray-400">
                from_airport: {departureAirport.value || 'Chưa chọn'}
              </Text>
              <Text className="text-xs text-gray-600 dark:text-gray-400">
                to_airport: {arrivalAirport.value || 'Chưa chọn'}
              </Text>
              <Text className="text-xs text-gray-600 dark:text-gray-400">
                flight_date: {flightDateTime || 'Chưa chọn'}
              </Text>
              <Text className="text-xs text-gray-600 dark:text-gray-400">
                airline: {airline || 'Chưa nhập'}
              </Text>
              <Text className="text-xs text-gray-600 dark:text-gray-400">
                flight_number: {flightCode || 'Chưa nhập'}
              </Text>
              <Text className="text-xs text-gray-600 dark:text-gray-400">
                max_weight: {allowedWeight || 'Chưa nhập'}
              </Text>
              <Text className="mt-2 text-xs font-semibold text-green-600 dark:text-green-400">
                Token: {user?.token ? '✓ Có token' : '✗ Chưa có token'}
              </Text>
              <Text className="mt-1 text-xs italic text-gray-500 dark:text-gray-500">
                API endpoint: POST /api/flights/store
              </Text>
            </View>
          )}
        </View>

        {/* Yêu cầu Ưu tiên – Scroll ngang */}
        <Text className="text-text-dark-gray mb-4 text-xl font-bold dark:text-white">
          Yêu cầu Ưu tiên
        </Text>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={priorityRequests}
          keyExtractor={(_, i) => i.toString()}
          renderItem={({ item }) => (
            <View className="mr-4 w-72 rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
              <View className="flex-row items-center gap-3">
                <Image source={{ uri: item.avatar }} className="h-10 w-10 rounded-full" />
                <View>
                  <Text className="text-text-dark-gray font-bold dark:text-white">{item.name}</Text>
                  <Text className="text-sm text-gray-500">{item.item}</Text>
                </View>
              </View>
              <View className="mt-4">
                <Text className="text-text-dark-gray text-lg font-semibold dark:text-white">
                  {item.route}
                </Text>
                <Text className="mt-1 text-base font-bold text-primary">+ {item.reward}</Text>
              </View>
              <TouchableOpacity
                onPress={() => router.push('order_accepted_success')}
                className="mt-4 items-center rounded-lg bg-secondary py-2.5">
                <Text className="text-sm font-bold text-white">Nhận ngay</Text>
              </TouchableOpacity>
            </View>
          )}
          contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 16 }}
        />

        {/* Yêu cầu phù hợp */}
        <Text className="text-text-dark-gray mb-4 mt-8 text-xl font-bold dark:text-white">
          Các yêu cầu gửi phù hợp
        </Text>
        <View className="gap-4 pb-32">
          {regularRequests.map((req, i) => (
            <View key={i} className="rounded-xl bg-white p-4 shadow-sm dark:bg-gray-800">
              <View className="flex-row items-start justify-between">
                <View className="flex-row items-center gap-3">
                  <Image
                    source={{ uri: priorityRequests[0].avatar }}
                    className="h-10 w-10 rounded-full"
                  />
                  <View>
                    <Text className="text-text-dark-gray font-bold dark:text-white">
                      {req.name}
                    </Text>
                    <Text className="text-sm text-gray-500">{req.item}</Text>
                  </View>
                </View>
                {req.urgent && (
                  <View className="rounded-full bg-secondary/10 px-2.5 py-1">
                    <Text className="text-xs font-bold text-secondary">Yêu cầu khẩn</Text>
                  </View>
                )}
              </View>
              <View className="mt-4 flex-row items-center justify-between">
                <View>
                  <Text className="text-text-dark-gray font-semibold dark:text-white">
                    {req.route}
                  </Text>
                  <Text className="text-sm font-bold text-primary">+ {req.reward}</Text>
                </View>
                <TouchableOpacity className="rounded-lg bg-primary/10 px-6 py-2.5">
                  <Text className="text-sm font-bold text-primary">Nhận mang hộ</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Component Input nhỏ gọn
const Input = ({
  label,
  placeholder,
  keyboardType,
  value,
  onChangeText,
}: {
  label: string;
  placeholder: string;
  keyboardType?: any;
  value?: string;
  onChangeText?: (text: string) => void;
}) => (
  <View>
    <Text className="text-text-dark-gray pb-2 text-sm font-medium dark:text-white/90">{label}</Text>
    <TextInput
      placeholder={placeholder}
      keyboardType={keyboardType}
      value={value}
      onChangeText={onChangeText}
      className="text-text-dark-gray h-12 rounded-lg border border-[#dbdee6] bg-gray-50 px-3 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
    />
  </View>
);
