import React, { useEffect, useState } from 'react'
import { View, Text, Image, ScrollView, ActivityIndicator, SafeAreaView, TouchableOpacity, TextInput } from "react-native";
import { useSelector } from 'react-redux';
import api from '@/api/api';
import ItemOrder from 'app/components/ItemOrder';
import { router } from 'expo-router';
import { MaterialIcons } from "@expo/vector-icons";
import { useOrderMatchList } from '@/hooks/useOrderMatchList';

const home = () => {

    const user = useSelector((state) => state.user);
    const role = user?.role;

    const [orders, setOrders] = useState([]);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {

            if (!role) return;

            try {
                const response = await api.get("orders", { params: { role } });

                if (response.data.status === "success") {
                    setOrders(response.data.data.orders.data);
                }
            } catch (err) {
                setError("Error fetching orders");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [role]);

    useOrderMatchList(
        orders.map(o => o.id),
        (chatId) => {
            router.push(`/chat/${chatId}`);
        }
    );

    if (loading) {
        return (
            <View className="flex-1 justify-center items-center">
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            {/* Header cố định */}
            <View className="bg-background-light dark:bg-background-dark px-4 pt-4 pb-2 sticky top-0 z-10 border-b border-gray-200 dark:border-gray-700">
                <View className="flex-row justify-between items-center h-12">
                    <Text className="text-3xl font-bold text-text-primary dark:text-white">
                        Xin chào, An
                    </Text>
                    <TouchableOpacity onPress={() => router.push('/notifications')}>
                        <MaterialIcons name="notifications" size={28} color="#2563EB" />
                    </TouchableOpacity>
                </View>
                <Text className="text-text-secondary dark:text-gray-400 mt-1">
                    Bạn cần gửi tài liệu đi đâu hôm nay?
                </Text>
            </View>

            <ScrollView className="flex-1 px-4 pb-32">
                {/* Form tìm hành khách */}
                <View className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mt-4">
                    <View className="grid grid-cols-2 gap-4">
                        {/* Thành phố đi */}
                        <View className="col-span-1">
                            <Text className="text-sm font-medium text-text-primary dark:text-gray-300 pb-2">
                                Thành phố đi
                            </Text>
                            <View className="relative">
                                <MaterialIcons
                                    name="flight-takeoff"
                                    size={20}
                                    className="absolute left-3 top-4 text-text-secondary dark:text-gray-400 z-10"
                                />
                                <TextInput
                                    placeholder="Ví dụ: Hà Nội"
                                    className="pl-10 pr-4 h-14 bg-background-light dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-base"
                                />
                            </View>
                        </View>

                        {/* Thành phố đến */}
                        <View className="col-span-1">
                            <Text className="text-sm font-medium text-text-primary dark:text-gray-300 pb-2">
                                Thành phố đến
                            </Text>
                            <View className="relative">
                                <MaterialIcons
                                    name="flight-land"
                                    size={20}
                                    className="absolute left-3 top-4 text-text-secondary dark:text-gray-400 z-10"
                                />
                                <TextInput
                                    placeholder="Ví dụ: TP. HCM"
                                    className="pl-10 pr-4 h-14 bg-background-light dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-base"
                                />
                            </View>
                        </View>

                        {/* Ngày gửi */}
                        <View className="col-span-1">
                            <Text className="text-sm font-medium text-text-primary dark:text-gray-300 pb-2">
                                Ngày gửi
                            </Text>
                            <View className="relative">
                                <MaterialIcons
                                    name="calendar-today"
                                    size={20}
                                    className="absolute left-3 top-4 text-text-secondary dark:text-gray-400 z-10"
                                />
                                <TextInput
                                    placeholder="Chọn ngày"
                                    className="pl-10 pr-4 h-14 bg-background-light dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-base"
                                />
                            </View>
                        </View>

                        {/* Khung giờ */}
                        <View className="col-span-1">
                            <Text className="text-sm font-medium text-text-primary dark:text-gray-300 pb-2">
                                Khung giờ ưu tiên
                            </Text>
                            <View className="relative">
                                <MaterialIcons
                                    name="schedule"
                                    size={20}
                                    className="absolute left-3 top-4 text-text-secondary dark:text-gray-400 z-10"
                                />
                                <TextInput
                                    placeholder="Buổi sáng (6h-12h)"
                                    className="pl-10 pr-4 h-14 bg-background-light dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-base"
                                />
                            </View>
                        </View>

                        {/* Loại tài liệu & Giá trị (full width) */}
                        <View className="col-span-2">
                            <Text className="text-sm font-medium text-text-primary dark:text-gray-300 pb-2">
                                Loại tài liệu
                            </Text>
                            <View className="relative">
                                <MaterialIcons
                                    name="description"
                                    size={20}
                                    className="absolute left-3 top-4 text-text-secondary dark:text-gray-400 z-10"
                                />
                                <TextInput
                                    placeholder="Tài liệu thông thường"
                                    className="pl-10 pr-4 h-14 bg-background-light dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-base"
                                />
                            </View>
                        </View>

                        <View className="col-span-2">
                            <Text className="text-sm font-medium text-text-primary dark:text-gray-300 pb-2">
                                Giá trị ước tính tài liệu (VND)
                            </Text>
                            <View className="relative">
                                <MaterialIcons
                                    name="payments"
                                    size={20}
                                    className="absolute left-3 top-4 text-text-secondary dark:text-gray-400 z-10"
                                />
                                <TextInput
                                    placeholder="Ví dụ: 5,000,000"
                                    keyboardType="numeric"
                                    className="pl-10 pr-4 h-14 bg-background-light dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-base"
                                />
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity onPress={() => router.push('/PassengerSearchResultsScreen')} className="mt-4 h-14 bg-primary rounded-lg justify-center items-center">
                        <Text className="text-white font-bold text-base">
                            Tìm hành khách phù hợp
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Đơn hàng nổi bật */}
                <View className="mt-8">
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-lg font-bold text-text-primary dark:text-white">
                            Đơn hàng Nổi bật dành cho bạn
                        </Text>
                        <Text className="text-sm font-semibold text-primary">Xem tất cả</Text>
                    </View>

                    <View className="gap-3">
                        {[
                            { title: "Tài liệu HN - SGN", time: "Giao trước 18:00 hôm nay", price: "250.000đ" },
                            { title: "Hợp đồng DAD - SGN", time: "Giao trong ngày mai", price: "300.000đ" },
                        ].map((item, i) => (
                            <View
                                key={i}
                                className="flex-row items-center bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm"
                            >
                                <View className="h-12 w-12 bg-blue-100 dark:bg-blue-900/40 rounded-lg justify-center items-center mr-4">
                                    <MaterialIcons name={i === 0 ? "description" : "folder-special"} size={28} color="#2563EB" />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-bold text-text-primary dark:text-white">{item.title}</Text>
                                    <Text className="text-sm text-text-secondary dark:text-gray-400">{item.time}</Text>
                                </View>
                                <View className="items-end">
                                    <Text className="font-bold text-secondary">{item.price}</Text>
                                    <Text className="text-xs text-text-secondary dark:text-gray-400">Đang tìm</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Hành khách sẵn có */}
                <View className="mt-8">
                    <Text className="text-lg font-bold text-text-primary dark:text-white mb-4">
                        Hành khách sẵn có cho bạn
                    </Text>

                    {/* Hành khách 1 */}
                    <View className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm mb-4">
                        <View className="flex-row items-center">
                            <Image
                                source={{ uri: "https://lh3.googleusercontent.com/... (link ảnh Bình An)" }}
                                className="w-14 h-14 rounded-full mr-4"
                            />
                            <View className="flex-1">
                                <Text className="font-bold text-text-primary dark:text-white">Bình An</Text>
                                <View className="flex-row items-center mt-1">
                                    <MaterialIcons name="star" size={16} color="#facc15" />
                                    <Text className="text-sm text-text-secondary dark:text-gray-400 ml-1">
                                        5.0 · 98% thành công
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity onPress={() => router.push('request_order')} className="bg-primary/10 dark:bg-primary/20 px-4 py-2 rounded-lg">
                                <Text className="text-primary dark:text-blue-400 font-bold text-sm">Gửi yêu cầu</Text>
                            </TouchableOpacity>
                        </View>

                        <View className="h-px bg-gray-200 dark:bg-gray-700 my-4" />

                        <View className="space-y-3">
                            <View className="flex-row items-center">
                                <MaterialIcons name="flight" size={20} color="#6B7280" />
                                <Text className="ml-2 text-sm text-text-secondary dark:text-gray-300">
                                    SGN → HAN   18:00 - 20:00
                                </Text>
                            </View>
                            <View className="flex-row items-center">
                                <MaterialIcons name="work" size={20} color="#6B7280" />
                                <Text className="ml-2 text-sm text-text-secondary dark:text-gray-300">
                                    Hành lý còn trống: <Text className="font-bold text-green-600 dark:text-green-400">2kg</Text>
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Hành khách 2 (tương tự) */}
                    {/* ... bạn có thể copy-paste và thay đổi dữ liệu */}
                </View>
            </ScrollView>
        </SafeAreaView>
    )
}

export default home