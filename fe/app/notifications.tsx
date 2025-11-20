import React, { useState } from "react";
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

export default function NotificationScreen() {
    const [filter, setFilter] = useState<"all" | "unread">("all");

    const notifications = [
        {
            id: 1,
            icon: "inventory_2",
            title: "Yêu cầu gửi hàng mới",
            message: "Hành khách ABC muốn gửi tài liệu đến XYZ.",
            time: "5 phút trước",
            unread: true,
            color: "bg-primary/10 text-primary",
        },
        {
            id: 2,
            icon: "chat_bubble",
            title: "Bạn có tin nhắn mới",
            message: "Từ Nguyễn Văn A: 'Tôi đã đến sân bay...'",
            time: "3 giờ trước",
            unread: true,
            color: "bg-secondary/10 text-secondary",
        },
        {
            id: 3,
            icon: "flight_takeoff",
            title: "Cập nhật trạng thái đơn #123",
            message: "Đơn hàng của bạn đã được hành khách nhận.",
            time: "1 ngày trước",
            unread: false,
        },
        {
            id: 4,
            icon: "campaign",
            title: "Cập nhật chính sách mới",
            message: "SkySend cập nhật biểu phí dịch vụ từ 01/10.",
            time: "3 ngày trước",
            unread: false,
        },
    ];

    const filteredNotifications =
        filter === "unread"
            ? notifications.filter((n) => n.unread)
            : notifications;

    const hasNotifications = filteredNotifications.length > 0;

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            {/* Top App Bar */}
            <View className="flex-row items-center justify-between px-4 pt-4 pb-2 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm">
                <TouchableOpacity>
                    <MaterialIcons name="arrow-back" size={30} color="#1F2937" className="dark:text-white" />
                </TouchableOpacity>
                <Text className="flex-1 text-center text-lg font-bold text-text-primary-light dark:text-text-primary-dark -ml-6">
                    Thông báo
                </Text>
                <TouchableOpacity>
                    <Text className="text-sm font-semibold text-primary">Đánh dấu đã đọc</Text>
                </TouchableOpacity>
            </View>

            {/* Segmented Control */}
            <View className="px-4 py-3">
                <View className="flex-row h-12 bg-slate-200/60 dark:bg-slate-800 rounded-xl p-1">
                    {(["Tất cả", "Chưa đọc"] as const).map((tab) => (
                        <TouchableOpacity
                            key={tab}
                            onPress={() => setFilter(tab === "Tất cả" ? "all" : "unread")}
                            className={`flex-1 justify-center items-center rounded-lg ${filter === (tab === "Tất cả" ? "all" : "unread")
                                ? "bg-card-light dark:bg-primary/30 shadow-sm"
                                : ""
                                }`}
                        >
                            <Text
                                className={`text-sm font-semibold ${filter === (tab === "Tất cả" ? "all" : "unread")
                                    ? "text-text-primary-light dark:text-text-primary-dark"
                                    : "text-text-secondary-light dark:text-text-secondary-dark"
                                    }`}
                            >
                                {tab}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Notification List */}
            <ScrollView className="flex-1">
                <View className="px-4 pb-6 space-y-3">
                    {hasNotifications ? (
                        filteredNotifications.map((notif) => (
                            <View
                                key={notif.id}
                                className={`flex-row justify-between p-4 rounded-xl shadow-sm ${notif.unread
                                    ? "bg-card-light dark:bg-card-dark"
                                    : "bg-card-light/50 dark:bg-card-dark/50"
                                    }`}
                            >
                                <View className="flex-row gap-4 flex-1">
                                    <View
                                        className={`w-12 h-12 rounded-full ${notif.color} justify-center items-center`}
                                    >
                                        <MaterialIcons name={notif.icon as any} size={24} color="currentColor" />
                                    </View>
                                    <View className="flex-1">
                                        <Text
                                            className={`font-semibold ${notif.unread
                                                ? "text-text-primary-light dark:text-text-primary-dark"
                                                : "text-text-primary-light/70 dark:text-text-primary-dark/70"
                                                }`}
                                        >
                                            {notif.title}
                                        </Text>
                                        <Text
                                            className={`text-sm mt-0.5 ${notif.unread
                                                ? "text-text-secondary-light dark:text-text-secondary-dark"
                                                : "text-text-secondary-light/80 dark:text-text-secondary-dark/80"
                                                }`}
                                        >
                                            {notif.message}
                                        </Text>
                                        <Text className="text-xs text-text-secondary-light/70 dark:text-text-secondary-dark/70 mt-1">
                                            {notif.time}
                                        </Text>
                                    </View>
                                </View>

                                {/* Unread dot */}
                                {notif.unread && (
                                    <View className="pt-1">
                                        <View className="w-3 h-3 items-center justify-center">
                                            <View className="w-2.5 h-2.5 rounded-full bg-primary" />
                                        </View>
                                    </View>
                                )}
                            </View>
                        ))
                    ) : (
                        /* Empty State */
                        <View className="items-center py-16">
                            <View className="w-24 h-24 rounded-full bg-slate-200/60 dark:bg-slate-800 justify-center items-center">
                                <MaterialIcons name="notifications" size={56} color="#94A3B8" />
                            </View>
                            <Text className="mt-6 text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
                                Chưa có thông báo nào
                            </Text>
                            <Text className="mt-2 text-sm text-text-secondary-light dark:text-text-secondary-dark text-center px-8">
                                Tất cả thông báo của bạn sẽ được hiển thị ở đây.
                            </Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}