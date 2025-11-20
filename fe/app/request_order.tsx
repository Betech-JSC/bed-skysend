// app/(customer)/create_order_confirm.tsx
import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Alert,
    Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';

export default function CreateOrderConfirmScreen() {
    const router = useRouter();
    const [description, setDescription] = useState('');
    const [terms1, setTerms1] = useState(false);
    const [terms2, setTerms2] = useState(false);

    const handleSubmit = () => {
        router.push('/requetes_order_detail')
    };

    return (
        <View className="flex-1 bg-background-light dark:bg-background-dark">
            {/* Top App Bar */}
            <View className="sticky top-0 z-50 flex-row items-center bg-background-light dark:bg-background-dark px-4 py-3">
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={28} color="#1F2937" className="dark:text-white" />
                </TouchableOpacity>
                <Text className="flex-1 text-center text-lg font-bold text-text-primary dark:text-white pr-10">
                    Xác nhận yêu cầu
                </Text>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                <View className="p-4 gap-y-4 pb-48">
                    {/* Thông tin tóm tắt */}
                    <View className="rounded-xl bg-white dark:bg-gray-800 p-5 shadow-sm">
                        <View className="grid grid-cols-2 gap-5">
                            {/* Tuyến đường */}
                            <View className="flex-row items-center gap-4">
                                <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                    <MaterialIcons name="flight-takeoff" size={24} color="#2563EB" />
                                </View>
                                <View>
                                    <Text className="text-sm text-text-secondary dark:text-gray-400">Tuyến đường</Text>
                                    <Text className="font-semibold text-text-primary dark:text-white">
                                        Hà Nội (HAN) → TP. HCM (SGN)
                                    </Text>
                                </View>
                            </View>

                            {/* Ngày gửi */}
                            <View className="flex-row items-center gap-4">
                                <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                    <MaterialIcons name="calendar-month" size={24} color="#2563EB" />
                                </View>
                                <View>
                                    <Text className="text-sm text-text-secondary dark:text-gray-400">Ngày gửi</Text>
                                    <Text className="font-semibold text-text-primary dark:text-white">25/12/2023</Text>
                                </View>
                            </View>

                            {/* Loại tài liệu */}
                            <View className="flex-row items-center gap-4">
                                <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                    <MaterialIcons name="description" size={24} color="#2563EB" />
                                </View>
                                <View>
                                    <Text className="text-sm text-text-secondary dark:text-gray-400">Loại tài liệu</Text>
                                    <Text className="font-semibold text-text-primary dark:text-white">
                                        Hợp đồng kinh doanh
                                    </Text>
                                </View>
                            </View>

                            {/* Giá trị */}
                            <View className="flex-row items-center gap-4">
                                <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                                    <MaterialIcons name="payments" size={24} color="#2563EB" />
                                </View>
                                <View>
                                    <Text className="text-sm text-text-secondary dark:text-gray-400">Giá trị khai báo</Text>
                                    <Text className="font-semibold text-text-primary dark:text-white">
                                        10.000.000 VNĐ
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Upload ảnh + mô tả */}
                    <View className="rounded-xl bg-white dark:bg-gray-800 p-5 shadow-sm gap-y-5">
                        {/* Upload khu vực */}
                        <TouchableOpacity className="items-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 px-6 py-10">
                            <View className="h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                                <MaterialIcons name="photo-camera" size={32} color="#6B7280" />
                            </View>
                            <Text className="mt-4 text-base font-bold text-text-primary dark:text-white">
                                Thêm hình ảnh tài liệu
                            </Text>
                            <Text className="mt-2 text-center text-sm text-text-secondary dark:text-gray-400 px-8">
                                Nếu tài liệu nhạy cảm, bạn có thể chỉ upload trang bìa hoặc mô tả chung.
                            </Text>
                            <View className="mt-4 rounded-lg bg-gray-100 dark:bg-gray-700 px-6 py-3">
                                <Text className="text-sm font-bold text-text-primary dark:text-white">Upload</Text>
                            </View>
                        </TouchableOpacity>

                        {/* Mô tả */}
                        <View>
                            <Text className="mb-2 text-sm font-medium text-text-primary dark:text-white">
                                Mô tả tài liệu
                            </Text>
                            <TextInput
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Mô tả ngắn gọn về tài liệu..."
                                placeholderTextColor="#9CA3AF"
                                multiline
                                numberOfLines={4}
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-text-primary dark:text-white min-h-24"
                            />
                        </View>
                    </View>

                    {/* Điều khoản */}
                    <View className="rounded-xl bg-white dark:bg-gray-800 p-5 shadow-sm gap-y-4">
                        <TouchableOpacity
                            onPress={() => setTerms1(!terms1)}
                            className="flex-row items-start gap-3"
                        >
                            <View className={`h-5 w-5 rounded border-2 mt-0.5 ${terms1 ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-600 bg-transparent'}`}>
                                {terms1 && <MaterialIcons name="check" size={16} color="white" className="self-center mt-0.5" />}
                            </View>
                            <Text className="flex-1 text-sm text-text-primary dark:text-white">
                                Tôi xác nhận thông tin cung cấp là chính xác.
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            onPress={() => setTerms2(!terms2)}
                            className="flex-row items-start gap-3"
                        >
                            <View className={`h-5 w-5 rounded border-2 mt-0.5 ${terms2 ? 'bg-primary border-primary' : 'border-gray-300 dark:border-gray-600 bg-transparent'}`}>
                                {terms2 && <MaterialIcons name="check" size={16} color="white" className="self-center mt-0.5" />}
                            </View>
                            <Text className="flex-1 text-sm text-text-primary dark:text-white">
                                Tôi đã đọc và đồng ý với các điều khoản.
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity>
                            <Text className="text-sm font-bold text-secondary underline">
                                Xem hợp đồng mẫu
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Sticky Footer */}
            <View className="fixed bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-2xl">
                <View className="p-2 gap-y-3">
                    <View className="gap-y-1.5 text-sm">
                        <View className="flex justify-between">
                            <Text className="text-text-secondary dark:text-gray-400">Phí dịch vụ SkySend:</Text>
                            <Text className="font-semibold text-text-primary dark:text-white">50.000đ</Text>
                        </View>
                        <View className="flex justify-between">
                            <Text className="text-text-secondary dark:text-gray-400">Dự kiến trả cho hành khách:</Text>
                            <Text className="font-semibold text-text-primary dark:text-white">300.000đ</Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleSubmit}
                        className={`w-full rounded-lg py-4 bg-primary shadow-lg`}
                    >
                        <Text className="text-center text-base font-bold text-white">
                            Gửi yêu cầu đến hành khách
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}