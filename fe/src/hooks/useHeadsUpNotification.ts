import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getDatabase, ref, onValue, off } from "firebase/database";
import { app } from "@/firebaseConfig";
import { useRouter } from "expo-router";

interface Notification {
    id: string;
    type: "chat_message" | "order_status" | "flight_status" | "new_request" | "request_accepted" | "request_declined" | "system";
    title: string;
    body: string;
    timestamp: number;
    read: boolean;
    data?: {
        chat_id?: string;
        order_id?: number;
        order_uuid?: string;
        request_id?: number;
        request_uuid?: string;
        flight_id?: number;
        flight_uuid?: string;
        [key: string]: any;
    };
}

export function useHeadsUpNotification() {
    const user = useSelector((state: RootState) => state.user);
    const router = useRouter();
    const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const db = getDatabase(app);
    const lastNotificationIdRef = useRef<string | null>(null);
    const listenerRef = useRef<(() => void) | null>(null);

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
                            router.push({
                                pathname: "/orders_details",
                                params: { orderId: data.order_uuid },
                            });
                        } else if (data?.order_id) {
                            router.push({
                                pathname: "/orders_details",
                                params: { orderId: String(data.order_id) },
                            });
                        }
                        break;
                    case "flight_status":
                        if (data?.flight_uuid) {
                            router.push({
                                pathname: "/flights/[id]",
                                params: { id: data.flight_uuid },
                            });
                        } else if (data?.flight_id) {
                            router.push({
                                pathname: "/flights/[id]",
                                params: { id: String(data.flight_id) },
                            });
                        } else {
                            router.push("/flights");
                        }
                        break;
                    case "new_request":
                    case "request_accepted":
                    case "request_declined":
                        if (data?.request_uuid) {
                            router.push({
                                pathname: "/private-requests/[id]",
                                params: { id: data.request_uuid },
                            });
                        } else if (data?.request_id) {
                            router.push({
                                pathname: "/private-requests/[id]",
                                params: { id: String(data.request_id) },
                            });
                        }
                        break;
                    case "system":
                        // Navigate to notifications screen
                        router.push("/notifications");
                        break;
                }
            } catch (error) {
                console.error("Navigation error:", error);
            }
        },
        [router]
    );

    // Listen for new notifications
    useEffect(() => {
        if (!user?.id) {
            return;
        }

        const notificationsRef = ref(db, `notifications/${user.id}`);

        // Listen for changes
        const unsubscribe = onValue(
            notificationsRef,
            (snapshot) => {
                const data = snapshot.val();
                if (data) {
                    // Convert to array and sort by timestamp
                    const notificationsList: Notification[] = Object.keys(data)
                        .map((key) => {
                            const notif = {
                                id: key,
                                ...data[key],
                            };
                            // Debug: log raw notification data
                            if (notif.type === 'flight_status') {
                                console.log("🔍 Flight status notification found:", {
                                    id: notif.id,
                                    type: notif.type,
                                    title: notif.title,
                                    body: notif.body,
                                    read: notif.read,
                                    timestamp: notif.timestamp,
                                    data: notif.data,
                                });
                            }
                            return notif;
                        })
                        .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

                    // Get the latest unread notification
                    const latestUnread = notificationsList.find((n) => !n.read && n.type);

                    console.log("📊 Notifications check:", {
                        total: notificationsList.length,
                        unreadCount: notificationsList.filter((n) => !n.read).length,
                        flightStatusCount: notificationsList.filter((n) => n.type === 'flight_status').length,
                        latestUnread: latestUnread ? {
                            id: latestUnread.id,
                            type: latestUnread.type,
                            title: latestUnread.title,
                            read: latestUnread.read,
                            timestamp: latestUnread.timestamp,
                        } : null,
                        lastShownId: lastNotificationIdRef.current,
                        isVisible,
                    });

                    if (latestUnread && latestUnread.id !== lastNotificationIdRef.current) {
                        console.log("✅ Showing heads-up notification:", {
                            id: latestUnread.id,
                            type: latestUnread.type,
                            title: latestUnread.title,
                            body: latestUnread.body,
                            timestamp: latestUnread.timestamp,
                        });

                        // Always show the latest notification, even if one is currently visible
                        // This will replace the current notification with the new one
                        lastNotificationIdRef.current = latestUnread.id;
                        setCurrentNotification(latestUnread);
                        setIsVisible(true);
                    } else if (latestUnread && latestUnread.id === lastNotificationIdRef.current) {
                        console.log("⚠️ Notification already shown:", latestUnread.id);
                    } else if (!latestUnread) {
                        console.log("ℹ️ No unread notifications found");
                        // Debug: show all notifications to see what's wrong
                        const allNotifications = notificationsList.map(n => ({
                            id: n.id,
                            type: n.type,
                            read: n.read,
                            title: n.title,
                        }));
                        console.log("📋 All notifications:", allNotifications);
                    }
                } else {
                    // No notifications, reset state
                    console.log("ℹ️ No notifications in Firebase");
                    if (isVisible) {
                        setIsVisible(false);
                        setCurrentNotification(null);
                    }
                    lastNotificationIdRef.current = null;
                }
            },
            (error) => {
                console.error("Error listening to notifications:", error);
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

    const handleDismiss = useCallback(() => {
        setIsVisible(false);
        // Reset after a short delay to allow next notification to show
        setTimeout(() => {
            setCurrentNotification(null);
        }, 300);
        // Note: We don't reset lastNotificationIdRef here because each notification has a unique ID
        // from Firebase push, so we won't accidentally re-show the same notification
    }, []);

    const handlePress = useCallback(() => {
        if (currentNotification) {
            handleNavigate(currentNotification);
            handleDismiss();
        }
    }, [currentNotification, handleNavigate, handleDismiss]);

    return {
        notification: currentNotification,
        isVisible,
        onDismiss: handleDismiss,
        onPress: handlePress,
    };
}

