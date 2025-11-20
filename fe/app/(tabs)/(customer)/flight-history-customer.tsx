import React, { useState } from "react";
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

type TabType = "upcoming" | "completed";

export default function FlightHistoryScreen() {
    const [activeTab, setActiveTab] = useState<TabType>("upcoming");
    const router = useRouter();

    const flights = [
        {
            id: 1,
            airline: "Vietjet Air",
            logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuBJeLLtXw3RaMPI7anUIG2R-BFPzkoD9YlOMizR-u4IdmpBUEpNsj5H5NwGJAl9CZBxagUPgdFgbF5w2aERGRN7D95gUL5c7-5tfvtlF8Ahv1TKiahd45VEG_h_TbY-ut7Z_sGZqvJPBMKoiqy1YfjXZZLbkDTwaCjCpe9ZxvdEakrZkp96MqXNdawr98Ss4Vbcq0GblHkmU6olcbwlW3cdxUpp2OY3i8oQjf1mMKy6QqLlYM6Rg5HdVSKAYVzL6ChhhU3LgOGJx0Zf",
            code: "VJ152",
            from: "SGN",
            to: "HAN",
            date: "15/12/2023 - 08:30",
            status: "verified" as const,
            tab: "upcoming" as const,
        },
        {
            id: 2,
            airline: "Vietnam Airlines",
            logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuD--ikVFf76Dl3v4O3MYLEgktFLslC2UAR1992nAwuAtXF98O4roz7E5VecKoEShxgzKYDDwJeQ17DZ-sPT1BS255WllqXxhGsS0aroqZ9bq1ZChItL7cT6pSNaW9U36UZgYP_ts7NlYXmvLZB4dJNUb-TGbBVwpotL5cIWgnt8lKPwdBi7iwxM-lR8jmpMVr4e6hxTM0pzRXXLJX0NDV5fhcWotGwrPxw0RctnUqmgdRyaa4CoVA-NFLn5qFv8xx3aghUTjlx5CaCT",
            code: "VN240",
            from: "SGN",
            to: "HAN",
            date: "20/12/2023 - 14:00",
            status: "pending" as const,
            tab: "upcoming" as const,
        },
        {
            id: 3,
            airline: "Bamboo Airways",
            logo: "https://lh3.googleusercontent.com/aida-public/AB6AXuBvYhjKfxfzgFVXhV45yb5RynkV5bLo3MNL5anFbIGwinA8QQyH5T8ul_xFE0x_3pqwuAVVnCEYKdN7S4_rJ3iRlCOJ98XG61tbkSPH8EsamSYgdbFl3c-QNvMHlYeTifi8ew2o2Wg4aUR3FQvzPZnLwxvmeum-2ABXorVXikDDQRN97eK3V9mtnRVlGGwrxBInOtrq6IHt9QfQ0bwuVRTPRV7LM_7cZDjdU2irMdf6WHm3BBbUNzgz1CpE7QWCZd8ZA8s-WgQwUuMG",
            code: "QH202",
            from: "DAD",
            to: "SGN",
            date: "22/12/2023 - 19:45",
            status: "invalid" as const,
            tab: "upcoming" as const,
        },
    ];

    const filteredFlights = flights.filter((f) =>
        activeTab === "upcoming" ? f.tab === "upcoming" : f.tab === "completed"
    );

    const getStatusConfig = (status: typeof flights[0]["status"]) => {
        switch (status) {
            case "verified":
                return { icon: "check-circle", color: "text-success", filled: true, text: "Đã xác thực" };
            case "pending":
                return { icon: "hourglass-top", color: "text-warning", filled: false, text: "Đang xác thực" };
            case "invalid":
                return { icon: "cancel", color: "text-error", filled: true, text: "Vé không hợp lệ" };
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            {/* Header */}
            <View className="border-b border-gray-200 dark:border-gray-700/50 bg-background-light dark:bg-background-dark">
                <View className="flex-row items-center justify-between px-4 pt-4 pb-3">
                    <TouchableOpacity onPress={() => router.back()}>
                        <MaterialIcons name="arrow-back" size={24} color="#1F2937" className="dark:text-white/90" />
                    </TouchableOpacity>
                    <Text className="flex-1 text-center text-lg font-bold text-text-dark-gray dark:text-white/90 -ml-10">
                        Lịch sử Chuyến bay
                    </Text>
                    <View className="w-10" />
                </View>

                {/* Segmented Control */}
                <View className="px-4 pb-4">
                    <View className="flex-row h-11 bg-gray-200/60 dark:bg-white/5 rounded-full p-1">
                        {(["Sắp tới", "Đã hoàn thành"] as const).map((tab) => (
                            <TouchableOpacity
                                key={tab}
                                onPress={() => setActiveTab(tab === "Sắp tới" ? "upcoming" : "completed")}
                                className={`flex-1 h-full justify-center items-center rounded-full transition-all ${activeTab === (tab === "Sắp tới" ? "upcoming" : "completed")
                                    ? "bg-white dark:bg-gray-700 shadow-sm"
                                    : ""
                                    }`}
                            >
                                <Text
                                    className={`text-sm font-semibold ${activeTab === (tab === "Sắp tới" ? "upcoming" : "completed")
                                        ? "text-primary"
                                        : "text-gray-500 dark:text-gray-400"
                                        }`}
                                >
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>

            {/* Danh sách chuyến bay */}
            <ScrollView className="flex-1">
                <View className="p-4 gap-4">
                    {filteredFlights.map((flight) => {
                        const status = getStatusConfig(flight.status);

                        return (
                            <View
                                key={flight.id}
                                className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-lg"
                                style={{ shadowColor: "rgba(0,0,0,0.05)", shadowOpacity: 0.1, shadowRadius: 16, elevation: 5 }}
                            >
                                {/* Header: Logo + Mã chuyến + Trạng thái */}
                                <View className="flex-row items-center justify-between mb-4">
                                    <View className="flex-row items-center gap-2">
                                        <Image source={{ uri: flight.logo }} className="w-6 h-6" resizeMode="contain" />
                                        <Text className="text-sm font-bold text-text-dark-gray dark:text-white/90">
                                            {flight.code}
                                        </Text>
                                    </View>
                                    <View className="px-3 py-1 rounded-full bg-primary/10">
                                        <Text className="text-xs font-semibold text-primary">Sắp tới</Text>
                                    </View>
                                </View>

                                {/* Thông tin tuyến bay */}
                                <View className="border-y border-dashed border-gray-200 dark:border-gray-700 py-4">
                                    <Text className="text-sm text-gray-500 dark:text-gray-400">{flight.date}</Text>
                                    <Text className="text-2xl font-bold text-text-dark-gray dark:text-white/90 mt-1">
                                        {flight.from} to {flight.to}
                                    </Text>
                                    <Text className="text-sm text-gray-600 dark:text-gray-300">
                                        TP. Hồ Chí Minh to Hà Nội
                                    </Text>
                                </View>

                                {/* Footer: Trạng thái vé + Nút */}
                                <View className="flex-row items-center justify-between mt-4">
                                    <View className={`flex-row items-center gap-1.5 ${status.color}`}>
                                        <MaterialIcons
                                            name={status.icon as any}
                                            size={20}
                                            color="currentColor"
                                            style={status.filled ? { fontVariationSettings: "'FILL' 1" } : {}}
                                        />
                                        <Text className="text-sm font-semibold">{status.text}</Text>
                                    </View>

                                    <TouchableOpacity onPress={() => router.push('edit-flight-customer')} className="h-9 px-4 rounded-full bg-primary justify-center items-center shadow-sm">
                                        <Text className="text-white text-sm font-medium">Xem chi tiết</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}