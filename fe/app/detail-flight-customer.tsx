import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    Image,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { useColorScheme } from 'nativewind';
import { MaterialIcons } from '@expo/vector-icons';

export default function FlightDetailScreen({ navigation }: any) {
    const { colorScheme } = useColorScheme();
    const [checked, setChecked] = React.useState(true);

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

            {/* Header */}
            <View className="sticky top-0 z-10 flex-row items-center justify-between bg-background-light/80 px-4 py-4 backdrop-blur-sm dark:bg-background-dark/80">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm dark:bg-gray-800"
                >
                    <MaterialIcons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text className="flex-1 text-center text-lg font-bold text-text-dark-gray dark:text-white -ml-10">
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
                                    source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDStezHastB7_Fl09lOcS2Gy4d2X2v1puZpcExrVsI2VLGXvslaV1HK_j0rIjfxCnkEToZA9Jd3HMJr2OBcVAO3mssndjeV3vaDMaSEsdL6bITAQOObnicMdzXTTDaaQUJTGSIYIf8XHGOYGvozipARQqOl-515oe2y3AuSwveURfi-BqfDwhB1yrfOrJ9QIYLZD5J0NsNVt_wJh7zC8xNtAgv1kzxh8hmoQqk5Z9lvnKVkmP6t3ON059Nr97zJhHWcxZC7nDDkvlvI' }}
                                    className="h-10 w-10"
                                    resizeMode="contain"
                                />
                                <View>
                                    <Text className="text-base font-bold text-text-dark-gray dark:text-white">
                                        Vietnam Airlines
                                    </Text>
                                    <Text className="text-sm text-gray-500">VN 244</Text>
                                </View>
                            </View>
                            <View className="rounded-full bg-secondary/10 px-3 py-1">
                                <Text className="text-sm font-semibold text-secondary">Đang xác thực (hourglass)</Text>
                            </View>
                        </View>

                        {/* Tuyến bay */}
                        <View className="relative flex-row items-center justify-between py-4">
                            <View className="items-start">
                                <Text className="text-3xl font-bold text-text-dark-gray dark:text-white">SGN</Text>
                                <Text className="text-sm text-gray-500">14:30</Text>
                            </View>
                            <View className="flex-1 flex-row items-center px-4">
                                <View className="flex-1 border-t-2 border-gray-300 dark:border-gray-600" />
                                <MaterialIcons name="flight-takeoff" size={28} color="#2563EB" />
                                <View className="flex-1 border-t-2 border-gray-300 dark:border-gray-600" />
                            </View>
                            <View className="items-end">
                                <Text className="text-3xl font-bold text-text-dark-gray dark:text-white">HAN</Text>
                                <Text className="text-sm text-gray-500">16:40</Text>
                            </View>
                        </View>

                        <View className="flex-row justify-between text-xs text-gray-400 mt-1">
                            <Text>TP. Hồ Chí Minh</Text>
                            <Text>Hà Nội</Text>
                        </View>

                        <View className="mt-4 border-t border-dashed border-gray-200 pt-4 dark:border-gray-700">
                            <Text className="text-sm text-gray-500">Ngày bay</Text>
                            <Text className="font-bold text-text-dark-gray dark:text-white">Thứ Năm, 28/08/2024</Text>
                        </View>
                    </View>

                    {/* Vé máy bay */}
                    <View className="rounded-xl bg-white p-5 shadow-lg dark:bg-gray-800">
                        <Text className="text-base font-bold text-text-dark-gray dark:text-white">Vé máy bay của bạn</Text>
                        <View className="mt-3 flex-row items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-700">
                            <View className="flex-row items-center gap-3">
                                <Image
                                    source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCMmoXMWrZ17Kce9DnQ2Pdn9jvOyJk3ucSKMmV6DkMnl20VRUWmK2bGiCPxLarlXkhLEyhqFe52115wVeJdtkOdZ0L5x2j_iUuUuZBDGKV6KpparMlRqkmViznFt8yhJJypgSdX4CKunmJ1bnwCK9uIVpKDBSGQc0W63-XA116lfGUAz58dWN-ZQfrLJlFWEfVhfPIaUidPhxRs3PK_eqpsFamYy3qbykgTMR-zC2Hwvf4JUqXkY_CgpResWN3iJv2rP-TJVyAMpT67' }}
                                    className="h-14 w-14 rounded-lg"
                                    resizeMode="cover"
                                />
                                <View>
                                    <Text className="font-semibold text-text-dark-gray dark:text-white">boarding-pass.pdf</Text>
                                    <Text className="text-sm text-gray-500">2.1MB</Text>
                                </View>
                            </View>
                            <TouchableOpacity className="rounded-lg bg-primary/10 px-4 py-2">
                                <Text className="text-sm font-bold text-primary">Xem chi tiết</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Cam kết */}
                    <View className="rounded-xl bg-white p-5 shadow-lg dark:bg-gray-800">
                        <Text className="text-base font-bold text-text-dark-gray dark:text-white">Thông tin mang tài liệu</Text>
                        <View className="mt-3 flex-row justify-between">
                            <Text className="text-sm text-gray-600">Tối đa số bộ tài liệu nhận</Text>
                            <Text className="font-bold text-text-dark-gray dark:text-white">5 bộ</Text>
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
                <TouchableOpacity className="h-14 w-full rounded-lg bg-primary justify-center items-center mb-3">
                    <Text className="text-base font-bold text-white">Chỉnh sửa chuyến bay</Text>
                </TouchableOpacity>
                <TouchableOpacity className="h-14 w-full rounded-lg border border-red-600 justify-center items-center">
                    <Text className="text-base font-bold text-red-600">Hủy chuyến bay</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}