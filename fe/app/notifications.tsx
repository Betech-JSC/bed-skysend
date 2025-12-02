import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    SafeAreaView,
    ScrollView,
    View,
    Text,
    TouchableOpacity,
    Platform,
    ActivityIndicator,
    RefreshControl,
    Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getDatabase, ref, onValue, get, set, update, push } from "firebase/database";
import { app } from "@/firebaseConfig";
import api from "@/api/api";

interface FirebaseNotification {
    title: string;
    body: string;
    timestamp: number;
    read: boolean;
    type?: string;
    data?: any;
}

interface Notification {
    id: string;
    title: string;
    message: string;
    timestamp: number;
    unread: boolean;
    type?: string;
    data?: any;
}

interface NotificationItem {
    id: string;
    icon: string;
    title: string;
    message: string;
    time: string;
    unread: boolean;
    color: string;
    rawData: Notification;
}

export default function NotificationScreen() {
    const router = useRouter();
    const user = useSelector((state: RootState) => state.user);
    const [filter, setFilter] = useState<"all" | "unread">("all");
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const db = getDatabase(app);
    const listenerRef = useRef<(() => void) | null>(null);

    // Map notification type/icon
    const getNotificationIcon = (notification: Notification): string => {
        if (notification.type) {
            switch (notification.type) {
                case "order":
                case "request":
                    return "inventory_2";
                case "chat":
                case "message":
                    return "chat_bubble";
                case "flight":
                    return "flight_takeoff";
                case "system":
                    return "campaign";
                default:
                    return "notifications";
            }
        }

        // Fallback: detect từ title hoặc message
        const text = ((notification.title || "") + " " + (notification.message || "")).toLowerCase();
        if (text.includes("đơn hàng") || text.includes("yêu cầu") || text.includes("order") || text.includes("request")) {
            return "inventory_2";
        }
        if (text.includes("tin nhắn") || text.includes("chat") || text.includes("message")) {
            return "chat_bubble";
        }
        if (text.includes("chuyến bay") || text.includes("flight")) {
            return "flight_takeoff";
        }
        return "notifications";
    };

    const getNotificationColor = (icon: string): string => {
        switch (icon) {
            case "inventory_2":
                return "bg-primary/10 text-primary";
            case "chat_bubble":
                return "bg-secondary/10 text-secondary";
            case "flight_takeoff":
                return "bg-blue-500/10 text-blue-500";
            case "campaign":
                return "bg-orange-500/10 text-orange-500";
            default:
                return "bg-gray-500/10 text-gray-500";
        }
    };

    const formatTime = (timestamp: number): string => {
        // Firebase timestamp có thể là seconds hoặc milliseconds
        const date = new Date(timestamp > 10000000000 ? timestamp : timestamp * 1000);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return "Vừa xong";
        if (minutes < 60) return `${minutes} phút trước`;
        if (hours < 24) return `${hours} giờ trước`;
        if (days < 7) return `${days} ngày trước`;
        return date.toLocaleDateString("vi-VN");
    };

    const fetchNotifications = useCallback(() => {
        if (!user?.id) {
            setLoading(false);
            setRefreshing(false);
            return;
        }

        try {
            setLoading(true);
            const notificationsRef = ref(db, `notifications/${user.id}`);

            // Fetch initial data
            get(notificationsRef).then((snapshot) => {
                const data = snapshot.val() || {};
                const notificationsArray: NotificationItem[] = Object.entries(data)
                    .map(([id, notif]: [string, any]) => {
                        const icon = getNotificationIcon({
                            id,
                            title: notif.title,
                            message: notif.body,
                            timestamp: notif.timestamp,
                            unread: !notif.read,
                            type: notif.type,
                            data: notif.data,
                        });
                        const title = notif.title || "Thông báo";
                        const message = notif.body || "";
                        const time = formatTime(notif.timestamp || Date.now());
                        const unread = !notif.read;
                        const color = getNotificationColor(icon);

                        return {
                            id,
                            icon,
                            title,
                            message,
                            time,
                            unread,
                            color,
                            rawData: {
                                id,
                                title: notif.title,
                                message: notif.body,
                                timestamp: notif.timestamp,
                                unread: !notif.read,
                                type: notif.type,
                                data: notif.data,
                            },
                        };
                    })
                    .sort((a, b) => b.rawData.timestamp - a.rawData.timestamp); // Sort mới nhất trước

                setNotifications(notificationsArray);
                setLoading(false);
                setRefreshing(false);
            }).catch((error) => {
                console.error("Error fetching notifications:", error);
                Alert.alert("Lỗi", "Không thể tải danh sách thông báo");
                setLoading(false);
                setRefreshing(false);
            });

            // Setup realtime listener
            const unsubscribe = onValue(notificationsRef, (snapshot) => {
                const data = snapshot.val() || {};
                const notificationsArray: NotificationItem[] = Object.entries(data)
                    .map(([id, notif]: [string, any]) => {
                        const icon = getNotificationIcon({
                            id,
                            title: notif.title,
                            message: notif.body,
                            timestamp: notif.timestamp,
                            unread: !notif.read,
                            type: notif.type,
                            data: notif.data,
                        });
                        const title = notif.title || "Thông báo";
                        const message = notif.body || "";
                        const time = formatTime(notif.timestamp || Date.now());
                        const unread = !notif.read;
                        const color = getNotificationColor(icon);

                        return {
                            id,
                            icon,
                            title,
                            message,
                            time,
                            unread,
                            color,
                            rawData: {
                                id,
                                title: notif.title,
                                message: notif.body,
                                timestamp: notif.timestamp,
                                unread: !notif.read,
                                type: notif.type,
                                data: notif.data,
                            },
                        };
                    })
                    .sort((a, b) => b.rawData.timestamp - a.rawData.timestamp);

                setNotifications(notificationsArray);
            });

            listenerRef.current = unsubscribe;
        } catch (error: any) {
            console.error("Error setting up notifications listener:", error);
            Alert.alert("Lỗi", "Không thể kết nối đến Firebase");
            setLoading(false);
            setRefreshing(false);
        }
    }, [user?.id, db]);

    // Setup listeners cho các events: requests, orders, chats
    useEffect(() => {
        if (!user?.id) return;

        const eventListeners: (() => void)[] = [];

        // Helper function để tạo notification trên Firebase
        const createNotification = async (
            title: string,
            body: string,
            type: string,
            data?: any
        ) => {
            try {
                const notificationsRef = ref(db, `notifications/${user.id}`);
                await push(notificationsRef, {
                    title,
                    body,
                    timestamp: Date.now(),
                    read: false,
                    type,
                    data: data || {},
                });
            } catch (error) {
                console.error("Error creating notification:", error);
            }
        };

        // 1. Listen cho order status changes
        const setupOrderListeners = async () => {
            try {
                const response = await api.get("orders/getList");
                const ordersData = response.data?.data?.data || response.data?.data || [];

                ordersData.forEach((order: any) => {
                    if (!order.id) return;

                    // Store initial status để so sánh
                    let lastKnownStatus = order.status;

                    // Listen order status changes từ Firebase (nếu có) hoặc từ API
                    // Note: Orders có thể không có trên Firebase, nên sẽ listen từ API polling hoặc backend push notification
                    // Tạm thời sẽ được handle bởi backend khi update status
                });
            } catch (error) {
                console.error("Error setting up order listeners:", error);
            }
        };

        // 2. Listen cho chat messages mới
        const setupChatListeners = async () => {
            try {
                const response = await api.get("orders/getList");
                const ordersData = response.data?.data?.data || response.data?.data || [];
                const ordersWithChat = ordersData.filter((order: any) => order.chat_id);

                ordersWithChat.forEach((order: any) => {
                    if (!order.chat_id) return;

                    const messagesRef = ref(db, `chats/${order.chat_id}/messages`);
                    let lastMessageTimestamp = 0;
                    let processedMessageIds = new Set<string>();

                    const unsubscribe = onValue(messagesRef, (snapshot) => {
                        const messages = snapshot.val() || {};
                        const messagesArray = Object.entries(messages).map(([id, msg]: [string, any]) => ({
                            id,
                            ...msg,
                        }));

                        if (messagesArray.length > 0) {
                            // Sort và lấy messages mới
                            messagesArray.sort((a: any, b: any) => (b.timestamp || 0) - (a.timestamp || 0));

                            // Tìm message mới nhất từ đối phương
                            for (const message of messagesArray) {
                                if (
                                    message.sender_id !== user.id &&
                                    message.timestamp > lastMessageTimestamp &&
                                    !processedMessageIds.has(message.id)
                                ) {
                                    processedMessageIds.add(message.id);
                                    lastMessageTimestamp = message.timestamp;

                                    const messageText = message.text ||
                                        (message.image_url ? '📷 Đã gửi ảnh' :
                                            message.file_url ? '📎 Đã gửi file' : 'Tin nhắn mới');

                                    createNotification(
                                        'Tin nhắn mới',
                                        messageText,
                                        'chat',
                                        { chat_id: order.chat_id, order_id: order.id }
                                    );
                                    break; // Chỉ tạo 1 notification cho message mới nhất
                                }
                            }
                        }
                    });
                    eventListeners.push(unsubscribe);
                });
            } catch (error) {
                console.error("Error setting up chat listeners:", error);
            }
        };

        // 3. Listen cho requests được accept (từ sender perspective)
        // Note: Backend sẽ tự động tạo notification khi request được accept
        // Frontend chỉ cần listen notifications từ Firebase (đã có trong fetchNotifications)

        // Setup all listeners
        setupOrderListeners();
        setupChatListeners();

        return () => {
            // Cleanup all event listeners
            eventListeners.forEach((unsubscribe) => unsubscribe());
        };
    }, [user?.id, db]);

    useEffect(() => {
        fetchNotifications();

        return () => {
            // Cleanup notification listener
            if (listenerRef.current) {
                listenerRef.current();
                listenerRef.current = null;
            }
        };
    }, [fetchNotifications]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchNotifications();
    }, [fetchNotifications]);

    const handleMarkAsRead = async (notification: NotificationItem) => {
        if (!notification.unread || !user?.id) return;

        try {
            const notificationRef = ref(db, `notifications/${user.id}/${notification.id}/read`);
            await set(notificationRef, true);

            // State sẽ tự động update từ realtime listener
        } catch (error: any) {
            console.error("Error marking notification as read:", error);
            Alert.alert("Lỗi", "Không thể đánh dấu thông báo đã đọc");
        }
    };

    const handleMarkAllAsRead = async () => {
        const unreadNotifications = notifications.filter((n) => n.unread);
        if (unreadNotifications.length === 0) {
            Alert.alert("Thông báo", "Không có thông báo chưa đọc nào");
            return;
        }

        if (!user?.id) return;

        try {
            // Mark all unread notifications as read on Firebase
            const updates: { [key: string]: boolean } = {};
            unreadNotifications.forEach((n) => {
                updates[`notifications/${user.id}/${n.id}/read`] = true;
            });

            const rootRef = ref(db);
            await update(rootRef, updates);

            // State sẽ tự động update từ realtime listener
            Alert.alert("Thành công", "Đã đánh dấu tất cả thông báo đã đọc");
        } catch (error: any) {
            console.error("Error marking all as read:", error);
            Alert.alert("Lỗi", "Không thể đánh dấu tất cả thông báo đã đọc");
        }
    };

    const filteredNotifications =
        filter === "unread"
            ? notifications.filter((n) => n.unread)
            : notifications;

    const hasNotifications = filteredNotifications.length > 0;

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            {/* Top App Bar */}
            <View className="flex-row items-center justify-between px-4 pt-4 pb-2 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm">
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={30} color="#1F2937" className="dark:text-white" />
                </TouchableOpacity>
                <Text className="flex-1 text-center text-lg font-bold text-text-primary-light dark:text-text-primary-dark -ml-6">
                    Thông báo
                </Text>
                <TouchableOpacity onPress={handleMarkAllAsRead}>
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
            {loading && !refreshing ? (
                <View className="flex-1 justify-center items-center">
                    <ActivityIndicator size="large" color="#2563EB" />
                    <Text className="mt-4 text-text-secondary-light dark:text-text-secondary-dark">
                        Đang tải thông báo...
                    </Text>
                </View>
            ) : (
                <ScrollView
                    className="flex-1"
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    <View className="px-4 pb-6 gap-y-3">
                        {hasNotifications ? (
                            filteredNotifications.map((notif) => (
                                <TouchableOpacity
                                    key={notif.id}
                                    onPress={() => handleMarkAsRead(notif)}
                                    activeOpacity={0.7}
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
                                </TouchableOpacity>
                            ))
                        ) : (
                            /* Empty State */
                            <View className="items-center py-16">
                                <View className="w-24 h-24 rounded-full bg-slate-200/60 dark:bg-slate-800 justify-center items-center">
                                    <MaterialIcons name="notifications" size={56} color="#94A3B8" />
                                </View>
                                <Text className="mt-6 text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
                                    {filter === "unread" ? "Không có thông báo chưa đọc" : "Chưa có thông báo nào"}
                                </Text>
                                <Text className="mt-2 text-sm text-text-secondary-light dark:text-text-secondary-dark text-center px-8">
                                    {filter === "unread"
                                        ? "Tất cả thông báo của bạn đã được đọc."
                                        : "Tất cả thông báo của bạn sẽ được hiển thị ở đây."}
                                </Text>
                            </View>
                        )}
                    </View>
                </ScrollView>
            )}
        </SafeAreaView>
    );
}