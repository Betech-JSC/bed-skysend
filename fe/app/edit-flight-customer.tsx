import React, { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function EditFlightScreen() {
    const router = useRouter();

    const [weight, setWeight] = useState("5");

    return (
        <SafeAreaView className="flex-1 bg-background">
            {/* Header */}
            <View className="h-16 flex-row items-center justify-between border-b border-gray-200 bg-white px-4">
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={24} color="#1F2937" />
                </TouchableOpacity>
                <Text className="flex-1 text-center text-lg font-bold text-text-primary -ml-10">
                    Chỉnh sửa chuyến bay
                </Text>
                <View className="w-10" />
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 120 }}>
                <View className="p-4 gap-4">

                    {/* Thông tin chuyến bay */}
                    <View className="bg-white rounded-xl p-4 shadow-sm">
                        <InputField label="Sân bay đi" value="Tân Sơn Nhất (SGN)" icon="unfold_more" />
                        <InputField label="Sân bay đến" value="Nội Bài (HAN)" icon="unfold_more" />
                        <InputField label="Ngày & giờ bay" value="25/12/2024 - 08:30" icon="calendar_month" />
                        <InputField label="Hãng bay" value="Vietnam Airlines" icon="unfold_more" />
                        <InputField label="Mã chuyến bay" value="VN242" uppercase />
                    </View>

                    {/* Vé máy bay */}
                    <View className="bg-white rounded-xl p-4 shadow-sm">
                        <Text className="text-base font-medium text-text-primary mb-3">Vé máy bay</Text>
                        <View className="flex-row items-center justify-between rounded-lg border border-dashed border-gray-300 p-4">
                            <View className="flex-row items-center gap-3">
                                <View className="w-10 h-10 rounded-full bg-green-100 justify-center items-center">
                                    <MaterialIcons name="verified" size={20} color="#10B981" />
                                </View>
                                <View>
                                    <Text className="font-medium text-text-primary">ticket_image.jpg</Text>
                                    <Text className="text-sm text-green-600">Đã xác thực</Text>
                                </View>
                            </View>
                            <TouchableOpacity className="flex-row items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                                <MaterialIcons name="upload" size={20} color="#1F2937" />
                                <Text className="text-sm font-semibold text-text-primary">Tải lên vé mới</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Khối lượng */}
                    <View className="bg-white rounded-xl p-4 shadow-sm">
                        <View className="relative">
                            <Text className="pb-2 text-base font-medium text-text-primary">
                                Khối lượng cho phép cho tài liệu (kg)
                            </Text>
                            <TextInput
                                value={weight}
                                onChangeText={setWeight}
                                keyboardType="numeric"
                                className="h-14 px-4 pr-12 rounded-lg border border-gray-200 bg-white text-base text-text-primary"
                                placeholder="5"
                            />
                            <MaterialIcons
                                name="weight"
                                size={24}
                                color="#6B7280"
                                className="absolute right-4 top-12"
                            />
                        </View>
                    </View>

                </View>
            </ScrollView>

            {/* Fixed Bottom Buttons */}
            <View className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-sm p-4 border-t border-gray-200">
                <View className="gap-3">
                    <TouchableOpacity className="h-14 rounded-full bg-primary justify-center items-center shadow-lg shadow-primary/30">
                        <Text className="text-white text-base font-bold">Lưu thay đổi</Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="h-14 rounded-full border border-gray-300 justify-center items-center">
                        <Text className="text-base font-bold text-text-secondary">Hủy chuyến bay</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

// Component con để tái sử dụng input
const InputField = ({ label, value, icon, uppercase = false }: {
    label: string;
    value: string;
    icon?: string;
    uppercase?: boolean;
}) => (
    <View className="mb-4">
        <Text className="pb-2 text-base font-medium text-text-primary">{label}</Text>
        <View className="relative">
            <TextInput
                value={value}
                editable={false}
                className={`h-14 px-4 pr-12 rounded-lg border border-gray-200 bg-white text-base ${uppercase ? "uppercase" : ""
                    } text-text-primary`}
            />
            {icon && (
                <MaterialIcons
                    name={icon as any}
                    size={24}
                    color="#6B7280"
                    className="absolute right-4 top-4"
                />
            )}
        </View>
    </View>
);