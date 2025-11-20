import React, { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    TextInput,
    Image,
    Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

export default function ConfirmRequestScreen() {
    const [images, setImages] = useState<string[]>([]);
    const [description, setDescription] = useState("");
    const [terms1, setTerms1] = useState(false);
    const [terms2, setTerms2] = useState(false);

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            allowsMultipleSelection: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            const uris = result.assets.map((asset) => asset.uri);
            setImages((prev) => [...prev, ...uris]);
        }
    };

    const canSubmit = terms1 && terms2;

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            {/* Top App Bar */}
            <View className="flex-row items-center px-4 py-3 bg-background-light dark:bg-background-dark">
                <TouchableOpacity>
                    <MaterialIcons name="arrow-back" size={28} color="#2563EB" />
                </TouchableOpacity>
                <Text className="flex-1 text-center text-lg font-bold text-text-primary dark:text-white -ml-10">
                    Xác nhận yêu cầu
                </Text>
            </View>

            <ScrollView className="flex-1 px-4 pb-48">
                {/* Thông tin tóm tắt */}
                <View className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm">
                    <View className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-5">
                        {[
                            { icon: "flight-takeoff", label: "Tuyến đường", value: "Hà Nội (HAN) → TP. Hồ Chí Minh (SGN)" },
                            { icon: "calendar-month", label: "Ngày gửi", value: "25/12/2023" },
                            { icon: "description", label: "Loại tài liệu", value: "Hợp đồng kinh doanh" },
                            { icon: "payments", label: "Giá trị khai báo", value: "10.000.000 VNĐ" },
                        ].map((item, i) => (
                            <React.Fragment key={i}>
                                <View className="w-10 h-10 rounded-full bg-primary/10 justify-center items-center">
                                    <MaterialIcons name={item.icon as any} size={22} color="#2563EB" />
                                </View>
                                <View>
                                    <Text className="text-sm text-text-secondary dark:text-gray-400">
                                        {item.label}
                                    </Text>
                                    <Text className="text-base font-semibold text-text-primary dark:text-white">
                                        {item.value}
                                    </Text>
                                </View>
                            </React.Fragment>
                        ))}
                    </View>
                </View>

                {/* Upload ảnh + mô tả */}
                <View className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm mt-4">
                    {/* Upload area */}
                    <TouchableOpacity
                        onPress={pickImage}
                        className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl px-6 py-10 items-center"
                    >
                        <View className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-700 justify-center items-center">
                            <MaterialIcons name="photo-camera" size={32} color="#9CA3AF" />
                        </View>
                        <Text className="mt-4 text-base font-bold text-text-primary dark:text-white">
                            Thêm hình ảnh tài liệu
                        </Text>
                        <Text className="mt-1 text-sm text-text-secondary dark:text-gray-400 text-center px-8">
                            Nếu tài liệu nhạy cảm, bạn có thể chỉ upload trang bìa hoặc mô tả chung.
                        </Text>
                        <View className="mt-4 px-6 py-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <Text className="text-sm font-bold text-text-primary dark:text-white">
                                Upload
                            </Text>
                        </View>
                    </TouchableOpacity>

                    {/* Hiển thị ảnh đã chọn */}
                    {images.length > 0 && (
                        <View className="flex-row flex-wrap gap-3 mt-4">
                            {images.map((uri, i) => (
                                <Image
                                    key={i}
                                    source={{ uri }}
                                    className="w-24 h-24 rounded-lg"
                                    resizeMode="cover"
                                />
                            ))}
                        </View>
                    )}

                    {/* Mô tả */}
                    <View className="mt-6">
                        <Text className="text-sm font-medium text-text-primary dark:text-white mb-2">
                            Mô tả tài liệu
                        </Text>
                        <TextInput
                            multiline
                            numberOfLines={4}
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Mô tả ngắn gọn về tài liệu..."
                            placeholderTextColor="#9CA3AF"
                            className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 rounded-lg px-4 py-3 text-sm text-text-primary dark:text-white min-h-24"
                        />
                    </View>
                </View>

                {/* Điều khoản */}
                <View className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm mt-4">
                    <TouchableOpacity
                        onPress={() => setTerms1(!terms1)}
                        className="flex-row items-start gap-3 mb-3"
                    >
                        <View
                            className={`w-5 h-5 rounded border-2 mt-0.5 ${terms1
                                ? "bg-primary border-primary"
                                : "border-gray-300 dark:border-gray-600"
                                } justify-center items-center`}
                        >
                            {terms1 && (
                                <MaterialIcons name="check" size={16} color="white" />
                            )}
                        </View>
                        <Text className="flex-1 text-sm text-text-primary dark:text-white">
                            Tôi xác nhận thông tin cung cấp là chính xác.
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setTerms2(!terms2)}
                        className="flex-row items-start gap-3"
                    >
                        <View
                            className={`w-5 h-5 rounded border-2 mt-0.5 ${terms2
                                ? "bg-primary border-primary"
                                : "border-gray-300 dark:border-gray-600"
                                } justify-center items-center`}
                        >
                            {terms2 && (
                                <MaterialIcons name="check" size={16} color="white" />
                            )}
                        </View>
                        <Text className="flex-1 text-sm text-text-primary dark:text-white">
                            Tôi đã đọc và đồng ý với các điều khoản.
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity className="mt-3">
                        <Text className="text-sm font-semibold text-secondary">
                            Xem hợp đồng mẫu
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Footer cố định */}
            <View className="absolute bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4 shadow-lg">
                <View className="max-w-lg mx-auto">
                    <View className="space-y-2 mb-4 text-sm">
                        <View className="flex-row justify-between">
                            <Text className="text-text-secondary dark:text-gray-400">
                                Phí dịch vụ SkySend:
                            </Text>
                            <Text className="font-semibold text-text-primary dark:text-white">
                                50.000đ
                            </Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-text-secondary dark:text-gray-400">
                                Dự kiến trả cho hành khách:
                            </Text>
                            <Text className="font-semibold text-text-primary dark:text-white">
                                300.000đ
                            </Text>
                        </View>
                    </View>

                    <TouchableOpacity
                        disabled={!canSubmit}
                        className={`h-12 rounded-lg justify-center items-center ${canSubmit ? "bg-primary" : "bg-gray-400"
                            }`}
                        onPress={() => canSubmit && Alert.alert("Thành công", "Yêu cầu đã được gửi!")}
                    >
                        <Text className="text-white font-bold text-base">
                            Gửi yêu cầu đến hành khách
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}