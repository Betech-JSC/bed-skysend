import React from "react";
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    Image,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function PassengerSearchResultsScreen() {
    const router = useRouter();

    const passengers = [
        {
            name: "Nguyễn Văn A",
            rating: 4.8,
            flight: "VJ123: SGN → HAN",
            luggage: "1.5 kg",
            time: "Thứ Hai, 25/12/2024 • 08:30",
            avatar:
                "https://lh3.googleusercontent.com/aida-public/AB6AXuAIPP_uTLatJh2234fbe90coz_vpeuryM4KjTwvkTKCMFE5UKkV2q45grtyGqLqlBCxje7sETwoRkcpBhDaENDcp7HOMvW7jGVn6BB5OtcknL2bTQgtv340T4mHZP8f2UcuHNWyCxP5-rsr9xL1Fhv8xu4FVvLg2mDC4l-zVFym8aOFe_1UttECAExfyI_88BP1VAGu_UGcUG1WE6pyyBWk5_Cv0ggWyE2klNaIYajcrNyRutxCShw_R_D5_tDJgFJ77WItReCkumZB",
        },
        {
            name: "Trần Thị B",
            rating: 5.0,
            flight: "VN218: SGN → HAN",
            luggage: "2.0 kg",
            time: "Thứ Hai, 25/12/2024 • 09:15",
            avatar:
                "https://lh3.googleusercontent.com/aida-public/AB6AXuB31lpf_8XsCi2BpqqJCc_ugXbsLhQMBfiNppXCkYnx-Iz5HWYf0WlXBR2CBKQPqKB2syfE6FxsuU1DUpi7jF1ksfldfqURvZuHR8IKh2eP_OjcTgoB9whLbkrmomFiOG5dpev2S3GAtOcvKCwgklZm41cDrbWtltntV7khXC5FM0Pix4jQlWLUMLfJPYJL7ZOh8wauhoShdat3k14Zm-C8rIuTOqSfTojIPuUL61ndL_LF_I7cpB1LCCcp1IpaTWMrJk3Adbt2uGFC",
        },
        {
            name: "Lê Minh C",
            rating: 4.5,
            flight: "QH202: SGN → HAN",
            luggage: "5.0 kg",
            time: "Thứ Hai, 25/12/2024 • 10:00",
            avatar:
                "https://lh3.googleusercontent.com/aida-public/AB6AXuBNW2N6z2SIUVZ4iolMW-vdNtAM_EwvUDBRY0ONawwv3rwmg1MIR_M3dUvxCypYEFKkCHQKiI742nmw8oA-u_38VAYwdwFNsedfZM4A6uNURhMI6zYRtYp_3Apz3yyZLg9ihI7RELgQ4hATAvE9Di8Vgmk9r41Mr6PdKtg-ahQiZbB6lchUI4AktLWbNt7_2RMzBjYigEzfoDxvakR85WZpcRAYKuXjamcC63r38iEO2l4l6U6IBssWw59IZilV1qMgPiyGIDXkRvBH",
        },
    ];

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            {/* Top App Bar */}
            <View className="bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm sticky top-0 z-10">
                <View className="flex-row items-center justify-between px-4 pt-4 pb-2">
                    <TouchableOpacity onPress={() => router.back()}>
                        <View className="w-12 h-12 rounded-full justify-center items-center">
                            <MaterialIcons name="arrow-back" size={24} color="#1F2937" className="dark:text-white" />
                        </View>
                    </TouchableOpacity>

                    <Text className="flex-1 text-center text-lg font-bold text-text-dark-gray dark:text-white -ml-12">
                        Kết quả tìm kiếm
                    </Text>

                    <View className="w-12" />
                </View>
            </View>

            {/* Filter Summary Bar */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="px-4 py-3"
            >
                <View className="flex-row gap-2">
                    {[
                        { icon: "flight-takeoff", text: "SGN → HAN" },
                        { icon: "calendar-month", text: "25/12/2024" },
                        { icon: "luggage", text: "1-2kg" },
                    ].map((item, i) => (
                        <View
                            key={i}
                            className="flex-row items-center h-10 rounded-full bg-white dark:bg-slate-800 px-4 shadow-sm gap-2"
                        >
                            <MaterialIcons name={item.icon as any} size={18} color="#2563EB" />
                            <Text className="text-sm font-medium text-text-dark-gray dark:text-gray-200">
                                {item.text}
                            </Text>
                        </View>
                    ))}

                    {/* Nút filter */}
                    <TouchableOpacity className="ml-auto w-10 h-10 rounded-full bg-primary/20 dark:bg-primary/30 justify-center items-center shadow-sm">
                        <MaterialIcons name="filter-list" size={22} color="#2563EB" />
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Danh sách hành khách */}
            <ScrollView className="px-4 mt-4">
                <View className="gap-4 pb-6">
                    {passengers.map((passenger, index) => (
                        <View
                            key={index}
                            className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm"
                        >
                            {/* Header: Avatar + tên + rating */}
                            <View className="flex-row items-center gap-3">
                                <Image
                                    source={{ uri: passenger.avatar }}
                                    className="w-12 h-12 rounded-full"
                                    resizeMode="cover"
                                />
                                <View className="flex-1">
                                    <Text className="text-base font-bold text-text-dark-gray dark:text-white">
                                        {passenger.name}
                                    </Text>
                                    <View className="flex-row items-center gap-2 mt-1">
                                        {/* Rating */}
                                        <View className="flex-row items-center gap-0.5">
                                            <MaterialIcons name="star" size={16} color="#F97316" style={{ fontVariationSettings: "'FILL' 1" }} />
                                            <Text className="text-sm font-semibold text-secondary">
                                                {passenger.rating}
                                            </Text>
                                        </View>

                                        {/* Verified badge */}
                                        <View className="flex-row items-center gap-1 bg-primary/10 dark:bg-primary/20 px-2 py-0.5 rounded-full">
                                            <MaterialIcons name="verified" size={14} color="#2563EB" />
                                            <Text className="text-xs font-medium text-primary dark:text-blue-300">
                                                Vé đã xác thực
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </View>

                            <View className="h-px bg-gray-200 dark:bg-slate-700 my-4" />

                            {/* Thông tin chi tiết */}
                            <View className="grid grid-cols-2 gap-4 mb-3">
                                <View>
                                    <Text className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Chuyến bay
                                    </Text>
                                    <Text className="text-sm font-semibold text-text-dark-gray dark:text-white mt-0.5">
                                        {passenger.flight}
                                    </Text>
                                </View>
                                <View>
                                    <Text className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                        Hành lý trống
                                    </Text>
                                    <Text className="text-sm font-semibold text-text-dark-gray dark:text-white mt-0.5">
                                        {passenger.luggage}
                                    </Text>
                                </View>
                            </View>

                            <View className="mb-4">
                                <Text className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                                    Thời gian
                                </Text>
                                <Text className="text-sm font-semibold text-text-dark-gray dark:text-white mt-0.5">
                                    {passenger.time}
                                </Text>
                            </View>

                            {/* Nút gửi yêu cầu */}
                            <TouchableOpacity className="h-11 rounded-full bg-primary justify-center items-center">
                                <Text className="text-white text-sm font-bold">
                                    Gửi yêu cầu
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}