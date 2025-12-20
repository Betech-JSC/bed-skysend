import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
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
    Modal,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { Stack, useRouter } from "expo-router";
import { usePathname } from "expo-router";
import { Swipeable } from "react-native-gesture-handler";
import { getDatabase, ref, onValue, off, set, remove } from "firebase/database";
import { app } from "@/firebaseConfig";
import BackButton from "./components/BackButton";

interface Notification {
    id: string;
    type: "chat_message" | "order_status" | "flight_status" | "new_request" | "request_accepted" | "request_declined" | "request_match" | "system";
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
        flight_uuid?: string;
        flight_number?: string;
        status?: string;
        [key: string]: any;
    };
}

interface NotificationGroup {
    key: string;
    type: Notification["type"];
    notifications: Notification[];
    unreadCount: number;
    latestTimestamp: number;
    groupTitle: string;
    groupBody: string;
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
            return { icon: "local-shipping", color: "#2563EB" }; // primary color
        case "flight_status":
            return { icon: "flight", color: "#F97316" }; // orange
        case "new_request":
            return { icon: "inventory-2", color: "#2563EB" }; // primary color
        case "request_accepted":
            return { icon: "check-circle", color: "#16A34A" }; // green
        case "request_declined":
            return { icon: "cancel", color: "#EF4444" }; // red
        case "request_match":
            return { icon: "people", color: "#10B981" }; // green
        case "system":
            return { icon: "campaign", color: "#6B7280" }; // gray
        default:
            return { icon: "notifications", color: "#6B7280" };
    }
}

// Helper function để tạo group key cho notification
function getGroupKey(notification: Notification): string {
    const { type, data } = notification;
    
    switch (type) {
        case "chat_message":
            return `chat_${data?.chat_id || 'unknown'}`;
        case "order_status":
            return `order_${data?.order_uuid || data?.order_id || data?.tracking_code || 'unknown'}`;
        case "flight_status":
            return `flight_${data?.flight_uuid || data?.flight_id || 'unknown'}`;
        case "new_request":
        case "request_accepted":
        case "request_declined":
            return `request_${data?.request_uuid || data?.request_id || 'unknown'}`;
        case "request_match":
            return `match_${data?.request_id || 'unknown'}`;
        case "system":
            // System notifications không nhóm, mỗi cái là riêng biệt
            return `system_${notification.id}`;
        default:
            return `unknown_${notification.id}`;
    }
}

// Helper function để tạo group title và body
function getGroupTitleAndBody(group: NotificationGroup): { title: string; body: string } {
    const { type, notifications, unreadCount } = group;
    const count = notifications.length;
    
    switch (type) {
        case "chat_message": {
            const latest = notifications[0];
            const senderName = latest.data?.sender_name || "Người dùng";
            if (count === 1) {
                return {
                    title: latest.title,
                    body: latest.body
                };
            }
            return {
                title: `${count} tin nhắn mới từ ${senderName}`,
                body: unreadCount > 0 ? `${unreadCount} tin nhắn chưa đọc` : "Tất cả đã đọc"
            };
        }
        case "order_status": {
            const latest = notifications[0];
            const orderId = latest.data?.order_uuid || latest.data?.tracking_code || latest.data?.order_id;
            const orderIdentifier = orderId ? `#${orderId}` : '';
            
            if (count === 1) {
                // Show specific order info if available
                if (orderIdentifier) {
                    return {
                        title: `Đơn hàng ${orderIdentifier}`,
                        body: latest.body || latest.title
                    };
                }
                return {
                    title: latest.title,
                    body: latest.body
                };
            }
            return {
                title: `Đơn hàng ${orderIdentifier || ''} - ${count} cập nhật`.trim(),
                body: latest.body || `Có ${count} thông báo mới về đơn hàng này`
            };
        }
        case "flight_status": {
            const latest = notifications[0];
            const flightNumber = latest.data?.flight_number;
            const flightInfo = flightNumber ? `Chuyến bay ${flightNumber}` : 'Chuyến bay';
            
            if (count === 1) {
                if (flightNumber) {
                    return {
                        title: `${flightInfo}`,
                        body: latest.body || latest.title
                    };
                }
                return {
                    title: latest.title,
                    body: latest.body
                };
            }
            return {
                title: `${flightInfo} - ${count} cập nhật`,
                body: latest.body || `Có ${count} thông báo mới về chuyến bay này`
            };
        }
        case "new_request":
        case "request_accepted":
        case "request_declined": {
            const latest = notifications[0];
            const requestId = latest.data?.request_uuid || latest.data?.request_id;
            const requestIdentifier = requestId ? `#${requestId}` : '';
            
            if (count === 1) {
                if (requestIdentifier) {
                    return {
                        title: `Yêu cầu ${requestIdentifier}`,
                        body: latest.body || latest.title
                    };
                }
                return {
                    title: latest.title,
                    body: latest.body
                };
            }
            return {
                title: `Yêu cầu ${requestIdentifier || ''} - ${count} cập nhật`.trim(),
                body: latest.body || `Có ${count} thông báo mới về yêu cầu này`
            };
        }
        case "request_match": {
            const latest = notifications[0];
            if (count === 1) {
                return {
                    title: latest.title,
                    body: latest.body
                };
            }
            return {
                title: `${count} yêu cầu khớp mới`,
                body: "Có nhiều yêu cầu khớp với chuyến bay của bạn"
            };
        }
        case "system": {
            const latest = notifications[0];
            return {
                title: latest.title,
                body: latest.body
            };
        }
        default: {
            const latest = notifications[0];
            return {
                title: latest.title,
                body: latest.body
            };
        }
    }
}

// Function để nhóm notifications
function groupNotifications(notifications: Notification[]): NotificationGroup[] {
    const groupMap = new Map<string, Notification[]>();
    
    // Nhóm notifications theo key
    notifications.forEach((notif) => {
        const key = getGroupKey(notif);
        if (!groupMap.has(key)) {
            groupMap.set(key, []);
        }
        groupMap.get(key)!.push(notif);
    });
    
    // Chuyển đổi thành NotificationGroup array
    const groups: NotificationGroup[] = Array.from(groupMap.entries()).map(([key, notifs]) => {
        // Sort notifications trong group theo timestamp (newest first)
        notifs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        
        const unreadCount = notifs.filter(n => !n.read).length;
        const latestTimestamp = notifs[0]?.timestamp || 0;
        
        const group: NotificationGroup = {
            key,
            type: notifs[0].type,
            notifications: notifs,
            unreadCount,
            latestTimestamp,
            groupTitle: "",
            groupBody: ""
        };
        
        const { title, body } = getGroupTitleAndBody(group);
        group.groupTitle = title;
        group.groupBody = body;
        
        return group;
    });
    
    // Sort groups theo latest timestamp (newest first)
    groups.sort((a, b) => b.latestTimestamp - a.latestTimestamp);
    
    return groups;
}

export default function NotificationScreen() {
    const user = useSelector((state: RootState) => state.user);
    const router = useRouter();
    const pathname = usePathname();
    const [filter, setFilter] = useState<"all" | "unread">("all");
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [markingAllAsRead, setMarkingAllAsRead] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<NotificationGroup | null>(null);
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

    // Group notifications
    const notificationGroups = useMemo(() => {
        const filtered = filter === "unread" 
            ? notifications.filter((n) => !n.read) 
            : notifications;
        return groupNotifications(filtered);
    }, [notifications, filter]);

    // Navigate based on notification type
    const handleNavigate = useCallback(
        (notification: Notification) => {
            try {
                const { type, data } = notification;

                switch (type) {
                    case "chat_message":
                        if (data?.chat_id) {
                            const chatId = String(data.chat_id).trim();
                            if (chatId) {
                                console.log('Navigating to chat:', chatId);
                                router.push(`/chat/${chatId}`);
                            } else {
                                console.warn('Invalid chat_id in notification');
                            }
                        } else {
                            console.warn('Notification chat_message missing chat_id');
                        }
                        break;
                    case "order_status":
                        // Navigate to order detail
                        try {
                            let orderIdentifier: string | null = null;

                            // Ưu tiên: order_uuid > order_id > tracking_code
                            if (data?.order_uuid) {
                                orderIdentifier = String(data.order_uuid).trim();
                            } else if (data?.order_id) {
                                orderIdentifier = String(data.order_id).trim();
                            } else if (data?.tracking_code) {
                                orderIdentifier = String(data.tracking_code).trim();
                            }

                            if (orderIdentifier) {
                                console.log('Navigating to order detail:', orderIdentifier);
                                router.push({
                                    pathname: '/orders_details',
                                    params: { orderId: orderIdentifier }
                                });
                            } else {
                                console.warn('Notification order_status missing order identifier, navigating to orders list');
                                // Điều hướng dựa trên role của user
                                const ordersListPath = user?.role === 'customer' 
                                    ? '/(tabs)/(customer)/list_orders_customer'
                                    : '/(tabs)/(sender)/list_orders';
                                router.push(ordersListPath);
                            }
                        } catch (navError) {
                            console.error('Error navigating to order detail:', navError);
                            // Fallback dựa trên role
                            const ordersListPath = user?.role === 'customer' 
                                ? '/(tabs)/(customer)/list_orders_customer'
                                : '/(tabs)/(sender)/list_orders';
                            router.push(ordersListPath);
                        }
                        break;
                    case "flight_status":
                        // Navigate to flight detail or flight list
                        try {
                            if (data?.flight_uuid) {
                                const flightId = String(data.flight_uuid).trim();
                                console.log('Navigating to flight detail:', flightId);
                                router.push({
                                    pathname: '/detail-flight-customer',
                                    params: { id: flightId }
                                });
                            } else if (data?.flight_id) {
                                const flightId = String(data.flight_id).trim();
                                console.log('Navigating to flight detail:', flightId);
                                router.push({
                                    pathname: '/detail-flight-customer',
                                    params: { id: flightId }
                                });
                            } else {
                                console.warn('Notification flight_status missing flight identifier, navigating to flights list');
                                router.push('/(tabs)/(customer)/flight-history-customer');
                            }
                        } catch (navError) {
                            console.error('Error navigating to flight detail:', navError);
                            router.push('/(tabs)/(customer)/flight-history-customer');
                        }
                        break;
                    case "new_request":
                    case "request_accepted":
                    case "request_declined":
                        // Navigate to request detail
                        try {
                            if (data?.request_uuid) {
                                const requestId = String(data.request_uuid).trim();
                                console.log('Navigating to request detail:', requestId);
                                router.push({
                                    pathname: '/private-requests/[id]',
                                    params: { id: requestId }
                                });
                            } else if (data?.request_id) {
                                const requestId = String(data.request_id).trim();
                                console.log('Navigating to request detail:', requestId);
                                router.push({
                                    pathname: '/private-requests/[id]',
                                    params: { id: requestId }
                                });
                            } else {
                                console.warn('Notification request missing request identifier');
                            }
                        } catch (navError) {
                            console.error('Error navigating to request detail:', navError);
                        }
                        break;
                    case "request_match":
                        // Navigate to matches detail
                        try {
                            if (data?.request_id) {
                                const requestId = String(data.request_id).trim();
                                console.log('Navigating to request matches:', requestId);
                                router.push(`/request_matches/${requestId}`);
                            } else {
                                console.warn('Notification request_match missing request_id');
                            }
                        } catch (navError) {
                            console.error('Error navigating to request matches:', navError);
                        }
                        break;
                    case "system":
                        // System notifications navigate to notifications screen
                        console.log('Navigating to notifications screen');
                        router.push('/notifications');
                        break;
                    default:
                        console.warn('Unknown notification type:', type);
                        router.push('/notifications');
                }
            } catch (error) {
                console.error("Navigation error:", error);
                // Fallback to notifications screen
                try {
                    router.push('/notifications');
                } catch (fallbackError) {
                    console.error('Failed to navigate to notifications screen:', fallbackError);
                }
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
                        className="bg-red-500 h-full justify-center items-center px-5 rounded-r-lg"
                        style={{ minWidth: 70 }}
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

    // Handle notification group click
    const handleGroupPress = useCallback(
        (group: NotificationGroup) => {
            // Nếu chỉ có 1 notification, navigate trực tiếp
            if (group.notifications.length === 1) {
                const notif = group.notifications[0];
                if (!notif.read) {
                    handleMarkAsRead(notif);
                }
                handleNavigate(notif);
            } else {
                // Nếu có nhiều notifications, mở modal để xem chi tiết
                setSelectedGroup(group);
            }
        },
        [handleMarkAsRead, handleNavigate]
    );

    // Mark all notifications in group as read (xóa các notifications)
    const handleMarkGroupAsRead = useCallback(
        async (group: NotificationGroup) => {
            if (!user?.id || !user?.token) {
                Alert.alert("Lỗi", "Vui lòng đăng nhập lại.");
                return;
            }

            const unreadInGroup = group.notifications.filter((n) => !n.read);
            if (unreadInGroup.length === 0) {
                // Nếu không có unread, đóng modal
                setSelectedGroup(null);
                return;
            }

            try {
                // Xóa tất cả notifications trong group
                await Promise.all(
                    unreadInGroup.map((notif) => {
                        return handleDeleteNotification(notif);
                    })
                );

                // Đóng modal sau khi xóa
                setSelectedGroup(null);
            } catch (error) {
                console.error("Error deleting group notifications:", error);
                Alert.alert("Lỗi", "Không thể xóa thông báo.");
            }
        },
        [user?.id, user?.token, handleDeleteNotification]
    );

    if (loading) {
        return (
            <>
                <Stack.Screen
                    options={{
                        headerShown: false,
                    }}
                />
                <SafeAreaView style={styles.container}>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#2563EB" />
                        <Text style={styles.loadingText}>Đang tải thông báo...</Text>
                    </View>
                </SafeAreaView>
            </>

        );
    }

    const hasNotifications = notificationGroups.length > 0;

    return (
        <>
            <Stack.Screen
                options={{
                    headerShown: false,
                }}
            />
            <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
                {/* Top App Bar - Compact */}
                <View className="flex-row items-center justify-between px-4 pt-3 pb-2 bg-background-light/80 dark:bg-background-dark/80">
                    <BackButton showText={true} className="bg-white dark:bg-gray-800 shadow-sm px-3 py-2 rounded-lg" />
                    <Text className="flex-1 text-center text-base font-bold text-text-primary-light dark:text-text-primary-dark -ml-10">
                        Thông báo
                    </Text>
                </View>

                {/* Tab Filter - Compact */}
                <View className="px-4 py-2">
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
                                    className={`flex-1 pb-2 items-center border-b-2 ${isActive
                                        ? "border-primary"
                                        : "border-transparent"
                                        }`}
                                >
                                    <Text
                                        className={`text-xs font-semibold ${isActive
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

                {/* Notification Groups List */}
                <FlatList
                    data={hasNotifications ? notificationGroups : []}
                    keyExtractor={(item) => item.key}
                    renderItem={({ item: group }) => {
                        const { icon, color } = getNotificationIcon(group.type);
                        const hasUnread = group.unreadCount > 0;
                        const isMultiple = group.notifications.length > 1;
                        
                        return (
                            <View className="px-3 mb-2">
                                <Swipeable
                                    renderRightActions={(progress) => {
                                        // Swipe to delete - delete all notifications in group
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
                                                            `Bạn có chắc chắn muốn xóa ${group.notifications.length} thông báo này?`,
                                                            [
                                                                { text: "Hủy", style: "cancel" },
                                                                {
                                                                    text: "Xóa",
                                                                    style: "destructive",
                                                                    onPress: async () => {
                                                                        // Delete all notifications in group
                                                                        for (const notif of group.notifications) {
                                                                            await handleDeleteNotification(notif);
                                                                        }
                                                                    },
                                                                },
                                                            ]
                                                        );
                                                    }}
                                                    className="bg-red-500 h-full justify-center items-center px-5 rounded-r-lg"
                                                    style={{ minWidth: 70 }}
                                                >
                                                    <Animated.View style={{ transform: [{ scale }] }}>
                                                        <MaterialIcons name="delete" size={24} color="#fff" />
                                                    </Animated.View>
                                                </TouchableOpacity>
                                            </View>
                                        );
                                    }}
                                    overshootRight={false}
                                    friction={2}
                                >
                                    <TouchableOpacity
                                        onPress={() => handleGroupPress(group)}
                                        activeOpacity={0.7}
                                        className={`flex-row items-center p-3 rounded-lg ${hasUnread
                                            ? "bg-card-light dark:bg-card-dark border-l-2 border-primary"
                                            : "bg-card-light/50 dark:bg-card-dark/50"
                                            }`}
                                    >
                                        {/* Icon - Compact */}
                                        <View
                                            style={{ backgroundColor: `${color}15` }}
                                            className="w-10 h-10 rounded-full justify-center items-center mr-3"
                                        >
                                            <MaterialIcons name={icon as any} size={20} color={color} />
                                        </View>

                                        {/* Content - Compact */}
                                        <View className="flex-1 mr-2">
                                            <View className="flex-row items-center justify-between mb-0.5">
                                                <Text
                                                    className={`text-sm font-semibold flex-1 ${hasUnread
                                                        ? "text-text-primary-light dark:text-text-primary-dark"
                                                        : "text-text-primary-light/70 dark:text-text-primary-dark/70"
                                                        }`}
                                                    numberOfLines={1}
                                                >
                                                    {group.groupTitle}
                                                </Text>
                                                <View className="flex-row items-center gap-1 ml-2">
                                                    {/* Badge count nếu có nhiều notifications */}
                                                    {isMultiple && (
                                                        <View className="bg-primary/20 px-2 py-0.5 rounded-full">
                                                            <Text className="text-xs font-bold text-primary">
                                                                {group.notifications.length}
                                                            </Text>
                                                        </View>
                                                    )}
                                                    {/* Unread dot */}
                                                    {hasUnread && (
                                                        <View className="w-2 h-2 rounded-full bg-primary" />
                                                )}
                                                </View>
                                            </View>
                                            <Text
                                                className={`text-xs ${hasUnread
                                                    ? "text-text-secondary-light dark:text-text-secondary-dark"
                                                    : "text-text-secondary-light/70 dark:text-text-secondary-dark/70"
                                                    }`}
                                                numberOfLines={2}
                                            >
                                                {group.groupBody}
                                            </Text>
                                            <Text className="text-xs text-text-secondary-light/60 dark:text-text-secondary-dark/60 mt-0.5">
                                                {formatTimeAgo(group.latestTimestamp)}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                </Swipeable>
                            </View>
                        );
                    }}
                    ListEmptyComponent={() => (
                        <View className="items-center py-12 px-4">
                            <View className="w-16 h-16 rounded-full bg-slate-200/60 dark:bg-slate-800 justify-center items-center">
                                <MaterialIcons name="notifications" size={40} color="#94A3B8" />
                            </View>
                            <Text className="mt-4 text-base font-bold text-text-primary-light dark:text-text-primary-dark">
                                {filter === "unread" ? "Không có thông báo chưa đọc" : "Chưa có thông báo nào"}
                            </Text>
                            <Text className="mt-1 text-xs text-text-secondary-light dark:text-text-secondary-dark text-center px-8">
                                {filter === "unread"
                                    ? "Tất cả thông báo của bạn đã được đọc."
                                    : "Tất cả thông báo của bạn sẽ được hiển thị ở đây."}
                            </Text>
                        </View>
                    )}
                    contentContainerStyle={{ paddingTop: 8, paddingBottom: 16 }}
                    ItemSeparatorComponent={() => <View style={{ height: 2 }} />}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                />

                {/* Modal hiển thị chi tiết nhóm notifications */}
                <Modal
                    visible={selectedGroup !== null}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setSelectedGroup(null)}
                >
                    <SafeAreaView className="flex-1 bg-black/50">
                        <View className="flex-1 bg-background-light dark:bg-background-dark mt-20 rounded-t-3xl">
                            {/* Header */}
                            <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                                <Text className="text-lg font-bold text-text-primary-light dark:text-text-primary-dark">
                                    Chi tiết thông báo
                                </Text>
                                <TouchableOpacity
                                    onPress={() => setSelectedGroup(null)}
                                    className="p-2"
                                >
                                    <MaterialIcons name="close" size={24} color="#6B7280" />
                                </TouchableOpacity>
                            </View>

                            {/* List notifications trong group */}
                            {selectedGroup && (
                                <FlatList
                                    data={selectedGroup.notifications}
                                    keyExtractor={(item) => item.id}
                                    renderItem={({ item: notif }) => {
                                        const { icon, color } = getNotificationIcon(notif.type);
                                        return (
                                            <TouchableOpacity
                                                onPress={() => {
                                                    if (!notif.read) {
                                                        handleMarkAsRead(notif);
                                                    }
                                                    setSelectedGroup(null);
                                                    handleNavigate(notif);
                                                }}
                                                activeOpacity={0.7}
                                                className={`flex-row items-center p-4 border-b border-gray-100 dark:border-gray-800 ${!notif.read
                                                    ? "bg-card-light dark:bg-card-dark"
                                                    : "bg-transparent"
                                                    }`}
                                            >
                                                <View
                                                    style={{ backgroundColor: `${color}15` }}
                                                    className="w-10 h-10 rounded-full justify-center items-center mr-3"
                                                >
                                                    <MaterialIcons name={icon as any} size={20} color={color} />
                                                </View>
                                                <View className="flex-1">
                                                    <View className="flex-row items-center justify-between mb-1">
                                                        <Text
                                                            className={`text-sm font-semibold flex-1 ${!notif.read
                                                                ? "text-text-primary-light dark:text-text-primary-dark"
                                                                : "text-text-primary-light/70 dark:text-text-primary-dark/70"
                                                                }`}
                                                        >
                                                            {notif.title}
                                                        </Text>
                                                        {!notif.read && (
                                                            <View className="w-2 h-2 rounded-full bg-primary ml-2" />
                                                        )}
                                                    </View>
                                                    <Text
                                                        className={`text-xs mb-1 ${!notif.read
                                                            ? "text-text-secondary-light dark:text-text-secondary-dark"
                                                            : "text-text-secondary-light/70 dark:text-text-secondary-dark/70"
                                                            }`}
                                                    >
                                                        {notif.body}
                                                    </Text>
                                                    <Text className="text-xs text-text-secondary-light/60 dark:text-text-secondary-dark/60">
                                                        {formatTimeAgo(notif.timestamp)}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        );
                                    }}
                                    ListEmptyComponent={() => (
                                        <View className="items-center py-12">
                                            <Text className="text-text-secondary-light dark:text-text-secondary-dark">
                                                Không có thông báo
                                            </Text>
                                        </View>
                                    )}
                                />
                            )}

                            {/* Footer - Delete all unread button */}
                            {selectedGroup && selectedGroup.unreadCount > 0 && (
                                <View className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                                    <TouchableOpacity
                                        onPress={() => {
                                            Alert.alert(
                                                "Xóa thông báo",
                                                `Bạn có chắc chắn muốn xóa ${selectedGroup.unreadCount} thông báo chưa đọc này?`,
                                                [
                                                    { text: "Hủy", style: "cancel" },
                                                    {
                                                        text: "Xóa",
                                                        style: "destructive",
                                                        onPress: () => handleMarkGroupAsRead(selectedGroup),
                                                    },
                                                ]
                                            );
                                        }}
                                        className="bg-primary py-3 rounded-lg items-center"
                                    >
                                        <Text className="text-white font-semibold">
                                            Xóa tất cả ({selectedGroup.unreadCount})
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </SafeAreaView>
                </Modal>
            </SafeAreaView>
        </>

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
