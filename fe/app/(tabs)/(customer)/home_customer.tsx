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
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";

export default function HomeScreen() {
    const router = useRouter();

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
                        <Input label="Sân bay đi" placeholder="SGN" />
                        <Input label="Sân bay đến" placeholder="HAN" />
                    </View>

                    <View className="mb-4">
                        <Text className="text-sm font-medium text-text-dark-gray dark:text-white/90 pb-2">
                            Ngày & giờ bay
                        </Text>
                        <View className="relative">
                            <TextInput
                                placeholder="Chọn ngày và giờ"
                                className="h-12 px-3 rounded-lg border border-[#dbdee6] dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-text-dark-gray dark:text-white"
                            />
                            <MaterialIcons name="calendar-today" size={20} color="#9CA3AF" className="absolute right-3 top-4" />
                        </View>
                    </View>

                    <View className="grid grid-cols-2 gap-4 mb-4">
                        <Input label="Hãng bay" placeholder="VD: VNA" />
                        <Input label="Mã chuyến bay" placeholder="VN123" />
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

                    <Input label="Khối lượng cho phép cho tài liệu (kg)" placeholder="VD: 5" keyboardType="numeric" />

                    <TouchableOpacity onPress={() => router.push('flight_posted_success')} className="mt-6 h-14 bg-primary rounded-lg justify-center items-center">
                        <Text className="text-white text-base font-bold">Đăng chuyến bay</Text>
                    </TouchableOpacity>
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
                            <TouchableOpacity onPress={() => router.push('order_accepted_success')} className="mt-4 bg-secondary rounded-lg py-2.5 items-center">
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
const Input = ({ label, placeholder, keyboardType }: { label: string; placeholder: string; keyboardType?: any }) => (
    <View>
        <Text className="text-sm font-medium text-text-dark-gray dark:text-white/90 pb-2">{label}</Text>
        <TextInput
            placeholder={placeholder}
            keyboardType={keyboardType}
            className="h-12 px-3 rounded-lg border border-[#dbdee6] dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-text-dark-gray dark:text-white"
        />
    </View>
);