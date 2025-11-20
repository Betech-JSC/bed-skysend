import React from "react";
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    ImageBackground,
} from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";

export default function OrderDetailScreen() {
    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            {/* Top App Bar */}
            <View className="flex-row items-center justify-between px-4 py-3 bg-card-light dark:bg-card-dark shadow-sm">
                <TouchableOpacity>
                    <MaterialIcons name="arrow-back" size={28} color="#2463EB" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
                    Chi tiết đơn hàng
                </Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1 px-4 pb-32">
                {/* Progress Bar */}
                <View className="bg-card-light dark:bg-card-dark rounded-xl p-4 shadow-sm mb-4">
                    <View className="flex-row justify-between mb-3">
                        <Text className="font-bold text-base">Đang vận chuyển</Text>
                        <Text className="text-sm font-medium text-secondary-light dark:text-secondary-dark">
                            3/4 bước
                        </Text>
                    </View>

                    <View className="h-2 bg-border-light dark:bg-border-dark rounded-full overflow-hidden">
                        <View className="h-full bg-primary rounded-full" style={{ width: "75%" }} />
                    </View>

                    <View className="flex-row justify-between mt-2 text-xs text-secondary-light dark:text-secondary-dark">
                        <Text>Tìm đối tác</Text>
                        <Text>Ghép nối</Text>
                        <Text className="font-bold text-primary">Vận chuyển</Text>
                        <Text>Hoàn thành</Text>
                    </View>
                </View>

                {/* Thông tin đơn hàng */}
                <View className="bg-card-light dark:bg-card-dark rounded-xl p-4 shadow-sm mb-4">
                    <Text className="text-lg font-bold mb-4">Thông tin đơn hàng</Text>
                    {[
                        { icon: "flight-takeoff", label: "Tuyến đường", value: "SGN → HAN" },
                        { icon: "schedule", label: "Thời gian", value: "10:00 - 12:00, 25/12/2023" },
                        { icon: "folder", label: "Loại tài liệu", value: "Hợp đồng kinh doanh" },
                        { icon: "payments", label: "Giá trị", value: "500.000 VNĐ" },
                    ].map((item, i) => (
                        <View key={i} className="flex-row items-center gap-3 mb-4 last:mb-0">
                            <MaterialIcons name={item.icon as any} size={24} color="#2463EB" />
                            <View>
                                <Text className="text-sm text-secondary-light dark:text-secondary-dark">
                                    {item.label}
                                </Text>
                                <Text className="font-semibold text-base">{item.value}</Text>
                            </View>
                        </View>
                    ))}
                </View>

                {/* Thông tin đối tác */}
                <View className="flex-row bg-card-light dark:bg-card-dark rounded-xl p-4 shadow-sm mb-4 gap-4">
                    <View className="flex-1">
                        <Text className="text-lg font-bold mb-1">Thông tin đối tác</Text>
                        <Text className="font-semibold text-base">Nguyễn Văn An</Text>
                        <View className="flex-row items-center gap-1 mt-1 text-sm text-secondary-light dark:text-secondary-dark">
                            <FontAwesome5 name="star" size={16} color="#facc15" solid />
                            <Text className="font-medium text-text-primary-light dark:text-text-primary-dark">
                                4.9
                            </Text>
                            <Text>• Đã hoàn thành 25 chuyến</Text>
                        </View>
                        <TouchableOpacity className="mt-3 px-4 py-2 border border-border-light dark:border-border-dark rounded-lg">
                            <Text className="text-sm font-semibold text-primary">Xem hồ sơ</Text>
                        </TouchableOpacity>
                    </View>

                    <ImageBackground
                        source={{
                            uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCFo5XDeGQQixCh592qCFO1BMjesd1MZYmbBe-vvMxPKdvwpOWnDZAf5B4lVwDge5nGrI1PY0IPj_XlKGudJV8BR605QD4mXxJaoSOnCLFtAXAmsiP_UdmQjyLOiDIgnX9oYHMVaGN5ze6QFC1b8CFh14sj4c_4lKg8Mf8c4JjN8WZENlqsB9wXW4IZl4WpLGmxR6I75Qla6G9TDvud5DkN3GExhodb6zDKbwkb3HHyphaWXV_7ONs_JyP_blfhAUjgxop2VuqCcrrC",
                        }}
                        className="w-20 h-20 rounded-full overflow-hidden"
                        resizeMode="cover"
                    />
                </View>

                {/* Thanh toán */}
                <View className="bg-card-light dark:bg-card-dark rounded-xl p-4 shadow-sm">
                    <Text className="text-lg font-bold mb-3">Thanh toán</Text>
                    <View className="flex-row gap-3">
                        <MaterialIcons name="lock" size={20} color="#F97316" className="mt-1" />
                        <View className="flex-1">
                            <Text className="font-semibold text-base">
                                Tiền đang được SkySend giữ
                            </Text>
                            <Text className="text-sm text-secondary-light dark:text-secondary-dark mt-1">
                                Trạng thái này đảm bảo an toàn cho cả hai bên. Tiền sẽ được chuyển cho đối tác khi đơn hàng hoàn thành.
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity className="mt-3 px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-lg self-start">
                        <Text className="text-primary font-semibold text-sm">
                            Xem chi tiết giao dịch
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Floating Action Button */}
            <View className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background-light dark:from-background-dark to-transparent pointer-events-none">
                <View className="pointer-events-auto">
                    <TouchableOpacity className="flex-row items-center justify-center bg-primary h-12 rounded-xl shadow-lg shadow-primary/30 mx-4">
                        <MaterialIcons name="chat" size={20} color="white" />
                        <Text className="text-white font-bold text-base ml-2">
                            Mở chat với Nguyễn Văn An
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}