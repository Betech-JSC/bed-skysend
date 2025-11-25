import React, { useState, useEffect } from "react";
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import CitySelectModal from './components/CitySelectModal';
import DatePickerInput from './components/DatePickerInput';
import api from "@/api/api";

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
}

export default function EditFlightScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    
    // Form states
    const [departureAirport, setDepartureAirport] = useState({ value: '', label: '' });
    const [arrivalAirport, setArrivalAirport] = useState({ value: '', label: '' });
    const [flightDateTime, setFlightDateTime] = useState('');
    const [airline, setAirline] = useState('');
    const [flightCode, setFlightCode] = useState('');
    const [allowedWeight, setAllowedWeight] = useState('');
    const [boardingPass, setBoardingPass] = useState('');

    useEffect(() => {
        if (id) {
            fetchFlightDetail(id as string);
        }
    }, [id]);

    const fetchFlightDetail = async (flightId: string) => {
        try {
            setLoading(true);
            const response = await api.get(`flights/${flightId}/show`);
            
            const data = response.data.data || response.data;
            
            // Populate form với dữ liệu từ API
            setDepartureAirport({ value: data.from_airport, label: data.from_airport });
            setArrivalAirport({ value: data.to_airport, label: data.to_airport });
            setFlightDateTime(data.flight_date);
            setAirline(data.airline);
            setFlightCode(data.flight_number);
            setAllowedWeight(data.max_weight.toString());
            setBoardingPass(data.boarding_pass);
            
        } catch (err: any) {
            console.error('Error fetching flight detail:', err);
            
            const errorMessage = err.response?.data?.message || 
                                err.message || 
                                'Không thể tải thông tin chuyến bay';
            
            Alert.alert('Lỗi', errorMessage, [
                {
                    text: 'OK',
                    onPress: () => router.back()
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateFlight = async () => {
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

        setSubmitting(true);

        try {
            const flightData = {
                from_airport: departureAirport.value,
                to_airport: arrivalAirport.value,
                flight_date: flightDateTime,
                airline: airline,
                flight_number: flightCode,
                max_weight: parseFloat(allowedWeight),
                boarding_pass: boardingPass,
            };

            console.log('Updating flight data:', flightData);

            // Call API update với endpoint: /flights/{id}/update
            const response = await api.put(`flights/${id}/update`, flightData);

            console.log('Update response:', response.data);

            if (response.status === 200 || response.status === 201) {
                Alert.alert(
                    'Thành công!', 
                    'Chuyến bay đã được cập nhật.',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                // Quay lại trang chi tiết
                                router.back();
                            }
                        }
                    ]
                );
            }
        } catch (err: any) {
            console.error('Error updating flight:', err);
            console.error('Error response:', err.response?.data);
            
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
                err.response?.data?.message || 
                err.message || 
                'Có lỗi xảy ra khi cập nhật chuyến bay';

            Alert.alert('Lỗi', errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelFlight = () => {
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
                            await api.delete(`flights/${id}`);
                            Alert.alert('Thành công', 'Chuyến bay đã được hủy', [
                                {
                                    text: 'OK',
                                    onPress: () => router.push('/(tabs)/home')
                                }
                            ]);
                        } catch (err: any) {
                            Alert.alert('Lỗi', err.response?.data?.message || 'Không thể hủy chuyến bay');
                        }
                    }
                }
            ]
        );
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

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            {/* Header */}
            <View className="h-16 flex-row items-center justify-between border-b border-gray-200 bg-white px-4 dark:bg-gray-800 dark:border-gray-700">
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text className="flex-1 text-center text-lg font-bold text-text-dark-gray dark:text-white -ml-10">
                    Chỉnh sửa chuyến bay
                </Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 140 }}>
                <View className="p-4 gap-4">

                    {/* Form chỉnh sửa */}
                    <View className="bg-white rounded-xl p-4 shadow-sm dark:bg-gray-800">
                        <Text className="text-lg font-bold text-text-dark-gray dark:text-white mb-4">
                            Thông tin chuyến bay
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
                            <InputField
                                label="Hãng bay"
                                placeholder="VD: VNA"
                                value={airline}
                                onChangeText={setAirline}
                            />
                            <InputField
                                label="Mã chuyến bay"
                                placeholder="VN123"
                                value={flightCode}
                                onChangeText={setFlightCode}
                            />
                        </View>

                        <InputField
                            label="Khối lượng cho phép cho tài liệu (kg)"
                            placeholder="VD: 5"
                            keyboardType="numeric"
                            value={allowedWeight}
                            onChangeText={setAllowedWeight}
                        />
                    </View>

                    {/* Vé máy bay */}
                    <View className="bg-white rounded-xl p-4 shadow-sm dark:bg-gray-800">
                        <Text className="text-base font-medium text-text-dark-gray dark:text-white mb-3">
                            Vé máy bay
                        </Text>
                        <View className="flex-row items-center justify-between rounded-lg border border-dashed border-gray-300 p-4 dark:border-gray-600">
                            <View className="flex-row items-center gap-3">
                                <View className="w-10 h-10 rounded-full bg-green-100 justify-center items-center dark:bg-green-900/30">
                                    <MaterialIcons name="verified" size={20} color="#10B981" />
                                </View>
                                <View>
                                    <Text className="font-medium text-text-dark-gray dark:text-white">
                                        {/* {boardingPass.split('/').pop() || 'ticket_image.jpg'} */}
                                        ticket_image.jpg
                                    </Text>
                                    <Text className="text-sm text-green-600">Đã xác thực</Text>
                                </View>
                            </View>
                            <TouchableOpacity className="flex-row items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg dark:bg-gray-700">
                                <MaterialIcons name="upload" size={20} color="#1F2937" />
                                <Text className="text-sm font-semibold text-text-dark-gray dark:text-white">
                                    Tải lên vé mới
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                </View>
            </ScrollView>

            {/* Fixed Bottom Buttons */}
            <View className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm p-4 border-t border-gray-200 dark:bg-gray-900/95 dark:border-gray-700">
                <View className="gap-3">
                    <TouchableOpacity 
                        onPress={handleUpdateFlight}
                        disabled={submitting}
                        className={`h-14 rounded-lg justify-center items-center ${
                            submitting ? 'bg-gray-400' : 'bg-primary'
                        }`}
                    >
                        {submitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="text-white text-base font-bold">Lưu thay đổi</Text>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity 
                        onPress={handleCancelFlight}
                        disabled={submitting}
                        className="h-14 rounded-lg border border-red-600 justify-center items-center"
                    >
                        <Text className="text-base font-bold text-red-600">Hủy chuyến bay</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

// Component Input
const InputField = ({
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
        <Text className="text-text-dark-gray pb-2 text-sm font-medium dark:text-white/90">
            {label}
        </Text>
        <TextInput
            placeholder={placeholder}
            keyboardType={keyboardType}
            value={value}
            onChangeText={onChangeText}
            className="text-text-dark-gray h-12 rounded-lg border border-[#dbdee6] bg-gray-50 px-3 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
    </View>
);
