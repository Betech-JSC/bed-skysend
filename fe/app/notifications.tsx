import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    SafeAreaView,
    FlatList,
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Alert,
    StyleSheet,
    Animated,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useRouter } from "expo-router";
import { Swipeable } from "react-native-gesture-handler";
import { getDatabase, ref, onValue, off, set, remove } from "firebase/database";
import { app } from "@/firebaseConfig";

interface Notification {
    id: string;
    type: "chat_message" | "order_status" | "new_request" | "request_accepted" | "request_declined" | "system";
    title: string;
    body: string;
    timestamp: number;
    read: boolean;
    data?: {
        chat_id?: string;
        order_id?: number;
        order_uuid?: string;
        tracking_code?: string;
        request_id?: number;
        request_uuid?: string;
        flight_id?: number;
        [key: string]: any;
    };
}

// Helper function để format thời gian
function formatTimeAgo(timestamp: number): string {
    const now = Date.now() / 1000;
    const diff = now - timestamp;

    if (diff < 60) {
        return "Vừa xong";
    } else if (diff < 3600) {
        const minutes = Math.floor(diff / 60);
        return `${minutes} phút trước`;
    } else if (diff < 86400) {
        const hours = Math.floor(diff / 3600);
        return `${hours} giờ trước`;
    } else if (diff < 604800) {
        const days = Math.floor(diff / 86400);
        return `${days} ngày trước`;
    } else {
        const date = new Date(timestamp * 1000);
        return date.toLocaleDateString("vi-VN", { day: "numeric", month: "short" });
    }
}

// Helper function để lấy icon và color cho notification type
function getNotificationIcon(type: Notification["type"]): { icon: string; color: string } {
    switch (type) {
        case "chat_message":
            return { icon: "chat-bubble", color: "#8B5CF6" }; // secondary color
        case "order_status":
            return { icon: "flight-takeoff", color: "#2563EB" }; // primary color
        case "new_request":
            return { icon: "inventory-2", color: "#2563EB" }; // primary color
        case "request_accepted":
            return { icon: "check-circle", color: "#16A34A" }; // green
        case "request_declined":
            return { icon: "cancel", color: "#EF4444" }; // red
        case "system":
            return { icon: "campaign", color: "#6B7280" }; // gray
        default:
            return { icon: "notifications", color: "#6B7280" };
    }
}

export default function NotificationScreen() {
    const user = useSelector((state: RootState) => state.user);
    const router = useRouter();
    const [filter, setFilter] = useState<"all" | "unread">("all");
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [markingAllAsRead, setMarkingAllAsRead] = useState(false);
    const db = getDatabase(app);
    const listenerRef = useRef<(() => void) | null>(null);

    // Listen Firebase real-time notifications
    useEffect(() => {
        if (!user?.id) {
            setLoading(false);
            return;
        }

        const notificationsRef = ref(db, `notifications/${user.id}`);

        // Listen for changes
        const unsubscribe = onValue(
            notificationsRef,
            (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    // Convert Firebase object to array
                    const notificationsList: Notification[] = Object.keys(data).map((key) => ({
                        id: key,
                        ...data[key],
                    }));

                    // Sort by timestamp (newest first)
                    notificationsList.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

                    setNotifications(notificationsList);
                } else {
                    setNotifications([]);
                }
                setLoading(false);
                setRefreshing(false);
            },
            (error) => {
                console.error("Error listening to notifications:", error);
                setLoading(false);
                setRefreshing(false);
            }
        );

        listenerRef.current = () => {
            off(notificationsRef);
        };

        return () => {
            if (listenerRef.current) {
                listenerRef.current();
            }
        };
    }, [user?.id, db]);

    // Filter notifications
    const filteredNotifications =
        filter === "unread" ? notifications.filter((n) => !n.read) : notifications;

    // Navigate based on notification type
    const handleNavigate = useCallback(
        (notification: Notification) => {
            try {
                const { type, data } = notification;

                switch (type) {
                    case "chat_message":
                        if (data?.chat_id) {
                            router.push(`/chat/${data.chat_id}`);
                        }
                        break;
                    case "order_status":
                        if (data?.order_uuid) {
                            router.push(`/orders_details?orderId=${data.order_uuid}`);
                        } else if (data?.order_id) {
                            router.push(`/orders_details?orderId=${data.order_id}`);
                        }
                        break;
                    case "new_request":
                    case "request_accepted":
                    case "request_declined":
                        if (data?.request_uuid) {
                            router.push(`/private-requests/${data.request_uuid}`);
                        } else if (data?.request_id) {
                            router.push(`/private-requests/${data.request_id}`);
                        }
                        break;
                    case "system":
                        // System notifications don't navigate
                        break;
                }
            } catch (error) {
                console.error("Navigation error:", error);
                // Không hiển thị lỗi cho user, chỉ log
            }
        },
        [router]
    );

    // Mark notification as read
    const handleMarkAsRead = useCallback(
        async (notification: Notification) => {
            if (notification.read) return;

            // Kiểm tra user hợp lệ trước khi thực hiện
            if (!user?.id || !user?.token) {
                Alert.alert("Lỗi", "Vui lòng đăng nhập lại.");
                return;
            }

            try {
                // Optimistic update
                setNotifications((prev) =>
                    prev.map((n) => (n.id === notification.id ? { ...n, read: true } : n))
                );

                // Update Firebase (source of truth - không cần sync với backend)
                const notificationRef = ref(db, `notifications/${user.id}/${notification.id}`);
                await set(notificationRef, {
                    ...notification,
                    read: true,
                });

                // Không tự động navigate khi mark as read
                // Chỉ navigate khi user thực sự click vào notification
            } catch (error) {
                console.error("Error marking notification as read:", error);
                // Revert optimistic update chỉ khi Firebase update thất bại
                setNotifications((prev) =>
                    prev.map((n) => (n.id === notification.id ? { ...n, read: false } : n))
                );
                Alert.alert("Lỗi", "Không thể đánh dấu thông báo là đã đọc.");
            }
        },
        [user?.id, user?.token, db, handleNavigate]
    );

    // Mark all as read
    const handleMarkAllAsRead = useCallback(async () => {
        if (markingAllAsRead) return;

        // Kiểm tra user hợp lệ
        if (!user?.id || !user?.token) {
            Alert.alert("Lỗi", "Vui lòng đăng nhập lại.");
            return;
        }

        const unreadNotifications = notifications.filter((n) => !n.read);
        if (unreadNotifications.length === 0) {
            Alert.alert("Thông báo", "Tất cả thông báo đã được đánh dấu đã đọc.");
            return;
        }

        try {
            setMarkingAllAsRead(true);

            // Update all in Firebase (source of truth - không cần sync với backend)
            await Promise.all(
                unreadNotifications.map((notif) => {
                    const notificationRef = ref(db, `notifications/${user.id}/${notif.id}`);
                    return set(notificationRef, { ...notif, read: true });
                })
            );

            Alert.alert("Thành công", `Đã đánh dấu ${unreadNotifications.length} thông báo là đã đọc.`);
        } catch (error) {
            console.error("Error marking all as read:", error);
            Alert.alert("Lỗi", "Không thể đánh dấu tất cả thông báo là đã đọc.");
        } finally {
            setMarkingAllAsRead(false);
        }
    }, [notifications, user?.id, user?.token, db, markingAllAsRead]);

    // Refresh
    const onRefresh = useCallback(() => {
        setRefreshing(true);
        // The Firebase listener will automatically update
    }, []);

    // Delete notification
    const handleDeleteNotification = useCallback(
        async (notification: Notification) => {
            if (!user?.id) return;

            try {
                // Optimistic update - remove from state immediately
                setNotifications((prev) => prev.filter((n) => n.id !== notification.id));

                // Delete from Firebase
                const notificationRef = ref(db, `notifications/${user.id}/${notification.id}`);
                await remove(notificationRef);
            } catch (error) {
                console.error("Error deleting notification:", error);
                // Revert optimistic update on error
                setNotifications((prev) => [...prev, notification].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0)));
                Alert.alert("Lỗi", "Không thể xóa thông báo.");
            }
        },
        [user?.id, db]
    );

    // Render right actions for swipe (delete button)
    const renderRightActions = useCallback(
        (notification: Notification, progress: Animated.AnimatedInterpolation<number>) => {
            const scale = progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0.8, 1],
            });

            return (
                <View className="flex-row items-center justify-end pr-4">
                    <TouchableOpacity
                        onPress={() => {
                            Alert.alert(
                                "Xóa thông báo",
                                "Bạn có chắc chắn muốn xóa thông báo này?",
                                [
                                    { text: "Hủy", style: "cancel" },
                                    {
                                        text: "Xóa",
                                        style: "destructive",
                                        onPress: () => handleDeleteNotification(notification),
                                    },
                                ]
                            );
                        }}
                        className="bg-red-500 h-full justify-center items-center px-6 rounded-r-xl"
                        style={{ minWidth: 80 }}
                    >
                        <Animated.View style={{ transform: [{ scale }] }}>
                            <MaterialIcons name="delete" size={24} color="#fff" />
                        </Animated.View>
                    </TouchableOpacity>
                </View>
            );
        },
        [handleDeleteNotification]
    );

    // Handle notification click
    const handleNotificationPress = useCallback(
        (notification: Notification) => {
            if (!notification.read) {
                handleMarkAsRead(notification);
            } else {
                handleNavigate(notification);
            }
        },
        [handleMarkAsRead, handleNavigate]
    );

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2563EB" />
                    <Text style={styles.loadingText}>Đang tải thông báo...</Text>
                </View>
            </SafeAreaView>
        );
    }

    const hasNotifications = filteredNotifications.length > 0;

    return (
        <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
            {/* Top App Bar */}
            <View className="flex-row items-center justify-between px-4 pt-4 pb-2 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-sm">
                <TouchableOpacity onPress={() => router.back()}>
                    <MaterialIcons name="arrow-back" size={30} color="#1F2937" />
                </TouchableOpacity>
                <Text className="flex-1 text-center text-lg font-bold text-text-primary-light dark:text-text-primary-dark -ml-6">
                    Thông báo
                </Text>
                <TouchableOpacity
                    onPress={handleMarkAllAsRead}
                    disabled={markingAllAsRead || filteredNotifications.filter((n) => !n.read).length === 0}
                >
                    <Text
                        className={`text-sm font-semibold ${markingAllAsRead || filteredNotifications.filter((n) => !n.read).length === 0
                            ? "text-gray-400"
                            : "text-primary"
                            }`}
                    >
                        {markingAllAsRead ? "Đang xử lý..." : "Đánh dấu đã đọc"}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Tab Filter */}
            <View className="px-4 py-3">
                <View className="flex-row border-b border-gray-200 dark:border-gray-700">
                    {(["Tất cả", "Chưa đọc"] as const).map((tab) => {
                        const isActive = filter === (tab === "Tất cả" ? "all" : "unread");
                        return (
                            <TouchableOpacity
                                key={tab}
                                activeOpacity={0.7}
                                onPress={() => {
                                    const newFilter = tab === "Tất cả" ? "all" : "unread";
                                    if (filter !== newFilter) {
                                        setFilter(newFilter);
                                    }
                                }}
                                className={`flex-1 pb-3 items-center border-b-2 ${isActive
                                    ? "border-primary"
                                    : "border-transparent"
                                    }`}
                            >
                                <Text
                                    className={`text-sm font-semibold ${isActive
                                        ? "text-primary"
                                        : "text-text-secondary-light dark:text-text-secondary-dark"
                                        }`}
                                >
                                    {tab}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Notification List */}
            <FlatList
                data={hasNotifications ? filteredNotifications : []}
                keyExtractor={(item) => item.id}
                renderItem={({ item: notif }) => {
                    const { icon, color } = getNotificationIcon(notif.type);
                    return (
                        <View className="px-4 mb-3">
                            <Swipeable
                                renderRightActions={(progress) => renderRightActions(notif, progress)}
                                overshootRight={false}
                                friction={2}
                            >
                                <TouchableOpacity
                                    onPress={() => handleNotificationPress(notif)}
                                    activeOpacity={0.7}
                                    className={`flex-row justify-between p-4 rounded-xl shadow-sm ${!notif.read
                                        ? "bg-card-light dark:bg-card-dark"
                                        : "bg-card-light/50 dark:bg-card-dark/50"
                                        }`}
                                >
                                    <View className="flex-row gap-4 flex-1">
                                        <View
                                            style={{ backgroundColor: `${color}20` }}
                                            className="w-12 h-12 rounded-full justify-center items-center"
                                        >
                                            <MaterialIcons name={icon as any} size={24} color={color} />
                                        </View>
                                        <View className="flex-1">
                                            <Text
                                                className={`font-semibold ${!notif.read
                                                    ? "text-text-primary-light dark:text-text-primary-dark"
                                                    : "text-text-primary-light/70 dark:text-text-primary-dark/70"
                                                    }`}
                                            >
                                                {notif.title}
                                            </Text>
                                            <Text
                                                className={`text-sm mt-0.5 ${!notif.read
                                                    ? "text-text-secondary-light dark:text-text-secondary-dark"
                                                    : "text-text-secondary-light/80 dark:text-text-secondary-dark/80"
                                                    }`}
                                            >
                                                {notif.body}
                                            </Text>
                                            <Text className="text-xs text-text-secondary-light/70 dark:text-text-secondary-dark/70 mt-1">
                                                {formatTimeAgo(notif.timestamp)}
                                            </Text>
                                        </View>
                                    </View>

                                    {/* Unread dot */}
                                    {!notif.read && (
                                        <View className="pt-1">
                                            <View className="w-3 h-3 items-center justify-center">
                                                <View className="w-2.5 h-2.5 rounded-full bg-primary" />
                                            </View>
                                        </View>
                                    )}
                                </TouchableOpacity>
                            </Swipeable>
                        </View>
                    );
                }}
                ListEmptyComponent={() => (
                    <View className="items-center py-16 px-4">
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
                contentContainerStyle={{ paddingBottom: 24 }}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f8f8",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#555",
    },
});
