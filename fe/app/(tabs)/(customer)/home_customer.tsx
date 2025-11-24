import React, { useState } from "react";
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
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import CitySelectModal from '../../components/CitySelectModal';
import DatePickerInput from '../../components/DatePickerInput';
import api from '@/api/api';

export default function HomeScreen() {
    const router = useRouter();

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
            name: "Lê Minh Anh",
            item: "Tài liệu gấp",
            route: "SGN to HAN",
            reward: "250.000đ",
            avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuA9W_inshPmtJpr0zofvRT153vXvWy34rBoI8vWbCWELoZryiCn_pRAH076kf-Gqtk3_gPt4Mqmn8R05zbfru-yX_7PCfCYYQKCznDUAKSKrdlv2Uas5zVUk3FI_mFid8pLeBHpzmQisR45o-IQZHVPtXb58uuD8eHFEWvthutXM23bnS7KGNtqI9EGaphnB-YRt6jBTFf2gx6d1OU2VQPT9yD9VH3Ds2TuGE2dLgiOAXL3rlAdCNEcFfBiN61Qwcz0MJ2ANBDWM5tJ",
        },
        {
            name: "Phạm Văn",
            item: "Hồ sơ công ty",
            route: "DAD to SGN",
            reward: "200.000đ",
            avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuBgNBKB8x2XrJGMh-G4Ky70ghqMewFKZF7WsX_ZfsJS8afazchW_uPIRmle2Qgy4Wbmfozv-H7tzsAfHSx1N5CssnjF57uSR0p5mOkQZRYvaKouLdkfe2r-nL1snAvrG2D7i1k-GdtY0gYnsr4KTsKEyE4mwYVtfWrTetJA6ZyaiZbNPkQYcXAbyKKmB6C1QA4EIKHge5GxWt59g7xKKkBDrXl16dFdm20tUpDjAoadqlD02Npp_ChF4S9ewqyUg0IDzH4EOmVQaz4y",
        },
        {
            name: "Ngọc Trinh",
            item: "Giấy tờ cá nhân",
            route: "PQC to HAN",
            reward: "180.000đ",
            avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuAlYQ44LQ_Eq8dLPux09V7kbWCePMxr0Px3Nrw77YJd0rn1faQZ-_XwtVISQPZXSTi_WXqd3uawfsIRNtVzSk1WEQPSvphmbo8-yyfPZjxXW3bZbBhZB_oI8ByW7YLvvWcKXAuwEx_bXAINzI3JuqSDuO_Ur7k8b1PGdMlD9mOR4uqMusqVed-dqHBYUVyqVG_UtNJCQaKnHeVhY-CKNGCmPaxUnf6cR2dAXOfia6CnsbNErtM1WwXOE8Uv355BYVz91Lf7fJo7gKiR",
        },
    ];

    // Yêu cầu phù hợp (danh sách dọc)
    const regularRequests = [
        { name: "An Nguyễn", item: "Tài liệu", route: "SGN to HAN", reward: "150.000đ", urgent: true },
        { name: "Trần Minh", item: "Hợp đồng", route: "SGN to DAD", reward: "120.000đ", urgent: false },
    ];

    // Hàm xử lý đăng chuyến bay
    const handlePostFlight = async () => {
        console.log('=== BẮT ĐẦU SUBMIT CHUYẾN BAY ===');
        
        // Validation
        if (!departureAirport.value) {
            console.log('❌ Validation failed: Thiếu sân bay đi');
            Alert.alert('Thông báo', 'Vui lòng chọn sân bay đi');
            return;
        }
        if (!arrivalAirport.value) {
            console.log('❌ Validation failed: Thiếu sân bay đến');
            Alert.alert('Thông báo', 'Vui lòng chọn sân bay đến');
            return;
        }
        if (!flightDateTime) {
            console.log('❌ Validation failed: Thiếu ngày giờ bay');
            Alert.alert('Thông báo', 'Vui lòng chọn ngày và giờ bay');
            return;
        }
        if (!airline) {
            console.log('❌ Validation failed: Thiếu hãng bay');
            Alert.alert('Thông báo', 'Vui lòng nhập hãng bay');
            return;
        }
        if (!flightCode) {
            console.log('❌ Validation failed: Thiếu mã chuyến bay');
            Alert.alert('Thông báo', 'Vui lòng nhập mã chuyến bay');
            return;
        }
        if (!allowedWeight) {
            console.log('❌ Validation failed: Thiếu khối lượng');
            Alert.alert('Thông báo', 'Vui lòng nhập khối lượng cho phép');
            return;
        }

        console.log('✅ Validation passed');

        // Chuẩn bị dữ liệu gửi lên API
        const flightData = {
            from_airport: departureAirport.value,
            to_airport: arrivalAirport.value,
            flight_date: flightDateTime, // Format: yyyy-mm-dd
            airline: airline,
            flight_number: flightCode,
            max_weight: parseFloat(allowedWeight),
            boarding_pass: boardingPass || `boarding_pass_${flightCode}_${flightDateTime.replace(/-/g, '')}.jpg`
        };

        console.log('📦 Dữ liệu gửi lên API:');
        console.log(JSON.stringify(flightData, null, 2));

        setIsSubmitting(true);
        console.log('⏳ Đang gửi request...');

        try {
            const response = await api.post('flights/store', flightData);

            console.log('✅ API Response nhận được:');
            console.log(JSON.stringify(response.data, null, 2));
            console.log('Status code:', response.status);

            if (response.data.status === 'success') {
                console.log('🎉 Đăng chuyến bay thành công!');
                
                Alert.alert(
                    'Thành công',
                    'Chuyến bay đã được đăng thành công!',
                    [
                        {
                            text: 'OK',
                            onPress: () => {
                                console.log('🔄 Reset form và chuyển trang...');
                                
                                // Reset form
                                setDepartureAirport({ value: '', label: '' });
                                setArrivalAirport({ value: '', label: '' });
                                setFlightDateTime('');
                                setAirline('');
                                setFlightCode('');
                                setAllowedWeight('');
                                setBoardingPass('');
                                
                                // Navigate to success screen
                                router.push('flight_posted_success');
                            }
                        }
                    ]
                );
            } else {
                console.log('⚠️ API trả về status khác success:', response.data.status);
            }
        } catch (err: any) {
            console.error('❌ LỖI KHI GỌI API:');
            console.error('Error object:', err);
            console.error('Error response:', err.response);
            console.error('Error response data:', err.response?.data);
            console.error('Error message:', err.message);
            console.error('Error status:', err.response?.status);
            
            const errorMessage = 
                err.response?.data?.message || 
                err.message || 
                'Có lỗi xảy ra khi đăng chuyến bay';
            
            console.log('📢 Hiển thị lỗi cho user:', errorMessage);
            Alert.alert('Lỗi', errorMessage);
        } finally {
            setIsSubmitting(false);
            console.log('=== KẾT THÚC SUBMIT ===\n');
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 pt-4 pb-2 bg-background-light dark:bg-background-dark sticky top-0 z-10">
                <View className="w-12" />
                <Text className="text-lg font-bold text-text-dark-gray dark:text-white">Trang chủ</Text>
                <TouchableOpacity className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-sm justify-center items-center">
                    <MaterialIcons name="notifications" size={24} color="#1F2937" className="dark:text-white" />
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
                {/* Greeting */}
                <Text className="text-[32px] font-bold text-text-dark-gray dark:text-white pt-4">
                    Xin chào, David!
                </Text>
                <Text className="text-base text-text-dark-gray/80 dark:text-white/80 pb-6">
                    Chia sẻ chuyến bay, kiếm thêm thu nhập.
                </Text>

                {/* Form đăng chuyến bay */}
                <View className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-8">
                    <Text className="text-lg font-bold text-text-dark-gray dark:text-white mb-4">
                        Thêm chuyến bay của bạn
                    </Text>

                    <View className="grid grid-cols-2 gap-4 mb-4">
                        {/* Sân bay đi */}
                        <View className="col-span-1">
                            <Text className="text-sm font-medium text-text-dark-gray dark:text-white/90 pb-2">
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
                            <Text className="text-sm font-medium text-text-dark-gray dark:text-white/90 pb-2">
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

                    <View className="grid grid-cols-2 gap-4 mb-4">
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
                        <Text className="text-sm font-medium text-text-dark-gray dark:text-white/90 pb-2">
                            Tải lên vé máy bay / boarding pass
                        </Text>
                        <TouchableOpacity className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 items-center bg-gray-50 dark:bg-gray-900">
                            <MaterialIcons name="cloud-upload" size={48} color="#9CA3AF" />
                            <Text className="text-sm text-gray-500 mt-2">Kéo thả hoặc nhấn để chọn tệp</Text>
                        </TouchableOpacity>
                        <Text className="text-sm text-gray-600 dark:text-gray-400 mt-2">
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
                        className={`mt-6 h-14 rounded-lg justify-center items-center ${
                            isSubmitting ? 'bg-gray-400' : 'bg-primary'
                        }`}
                    >
                        {isSubmitting ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text className="text-white text-base font-bold">Đăng chuyến bay</Text>
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
                            <Text className="mt-2 text-xs italic text-gray-500 dark:text-gray-500">
                                API endpoint: POST /api/flights/store
                            </Text>
                        </View>
                    )}
                </View>

                {/* Yêu cầu Ưu tiên – Scroll ngang */}
                <Text className="text-xl font-bold text-text-dark-gray dark:text-white mb-4">
                    Yêu cầu Ưu tiên
                </Text>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={priorityRequests}
                    keyExtractor={(_, i) => i.toString()}
                    renderItem={({ item }) => (
                        <View className="w-72 mr-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                            <View className="flex-row items-center gap-3">
                                <Image source={{ uri: item.avatar }} className="w-10 h-10 rounded-full" />
                                <View>
                                    <Text className="font-bold text-text-dark-gray dark:text-white">{item.name}</Text>
                                    <Text className="text-sm text-gray-500">{item.item}</Text>
                                </View>
                            </View>
                            <View className="mt-4">
                                <Text className="font-semibold text-lg text-text-dark-gray dark:text-white">
                                    {item.route}
                                </Text>
                                <Text className="text-base font-bold text-primary mt-1">+ {item.reward}</Text>
                            </View>
                            <TouchableOpacity 
                                onPress={() => router.push('order_accepted_success')} 
                                className="mt-4 bg-secondary rounded-lg py-2.5 items-center"
                            >
                                <Text className="text-white font-bold text-sm">Nhận ngay</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                    contentContainerStyle={{ paddingHorizontal: 4, paddingBottom: 16 }}
                />

                {/* Yêu cầu phù hợp */}
                <Text className="text-xl font-bold text-text-dark-gray dark:text-white mt-8 mb-4">
                    Các yêu cầu gửi phù hợp
                </Text>
                <View className="gap-4 pb-32">
                    {regularRequests.map((req, i) => (
                        <View key={i} className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                            <View className="flex-row items-start justify-between">
                                <View className="flex-row items-center gap-3">
                                    <Image source={{ uri: priorityRequests[0].avatar }} className="w-10 h-10 rounded-full" />
                                    <View>
                                        <Text className="font-bold text-text-dark-gray dark:text-white">{req.name}</Text>
                                        <Text className="text-sm text-gray-500">{req.item}</Text>
                                    </View>
                                </View>
                                {req.urgent && (
                                    <View className="bg-secondary/10 px-2.5 py-1 rounded-full">
                                        <Text className="text-xs font-bold text-secondary">Yêu cầu khẩn</Text>
                                    </View>
                                )}
                            </View>
                            <View className="flex-row items-center justify-between mt-4">
                                <View>
                                    <Text className="font-semibold text-text-dark-gray dark:text-white">{req.route}</Text>
                                    <Text className="text-sm font-bold text-primary">+ {req.reward}</Text>
                                </View>
                                <TouchableOpacity className="bg-primary/10 px-6 py-2.5 rounded-lg">
                                    <Text className="text-primary font-bold text-sm">Nhận mang hộ</Text>
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
    onChangeText 
}: { 
    label: string; 
    placeholder: string; 
    keyboardType?: any;
    value?: string;
    onChangeText?: (text: string) => void;
}) => (
    <View>
        <Text className="text-sm font-medium text-text-dark-gray dark:text-white/90 pb-2">{label}</Text>
        <TextInput
            placeholder={placeholder}
            keyboardType={keyboardType}
            value={value}
            onChangeText={onChangeText}
            className="h-12 px-3 rounded-lg border border-[#dbdee6] dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-text-dark-gray dark:text-white"
        />
    </View>
);
