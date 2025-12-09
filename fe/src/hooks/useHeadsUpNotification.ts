import { useState, useEffect, useRef, useCallback } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { getDatabase, ref, onChildAdded, off } from "firebase/database";
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
            console.log("🔴 No user ID, skipping notification listener setup");
            // Reset state when no user
            lastNotificationIdRef.current = null;
            setCurrentNotification(null);
            setIsVisible(false);
            return;
        }

        console.log("🟢 Setting up notification listener for user:", user.id);
        const notificationsRef = ref(db, `notifications/${user.id}`);

        // Reset lastNotificationIdRef when user changes to allow showing first notification
        lastNotificationIdRef.current = null;

        // Listen for new child notifications (onChildAdded only triggers for new additions)
        const unsubscribe = onChildAdded(
            notificationsRef,
            (snapshot) => {
                const notifId = snapshot.key;
                const notifData = snapshot.val();

                if (!notifId || !notifData) {
                    console.log("⚠️ Received notification with missing ID or data");
                    return;
                }

                // Skip if this notification was already shown
                if (notifId === lastNotificationIdRef.current) {
                    console.log("⏭️ Skipping already shown notification:", notifId);
                    return;
                }

                // Build notification object
                const notif: Notification = {
                    id: notifId,
                    type: notifData.type || 'system',
                    title: notifData.title || 'Thông báo',
                    body: notifData.body || '',
                    timestamp: notifData.timestamp || Date.now() / 1000,
                    read: notifData.read === true || notifData.read === 'true',
                    data: notifData.data || {},
                };

                // Extract data fields if they're at root level (for backward compatibility)
                if (!notif.data.order_id && notifData.order_id) {
                    notif.data.order_id = notifData.order_id;
                }
                if (!notif.data.order_uuid && notifData.order_uuid) {
                    notif.data.order_uuid = notifData.order_uuid;
                }
                if (!notif.data.flight_id && notifData.flight_id) {
                    notif.data.flight_id = notifData.flight_id;
                }
                if (!notif.data.flight_uuid && notifData.flight_uuid) {
                    notif.data.flight_uuid = notifData.flight_uuid;
                }
                if (!notif.data.chat_id && notifData.chat_id) {
                    notif.data.chat_id = notifData.chat_id;
                }
                if (!notif.data.request_id && notifData.request_id) {
                    notif.data.request_id = notifData.request_id;
                }
                if (!notif.data.request_uuid && notifData.request_uuid) {
                    notif.data.request_uuid = notifData.request_uuid;
                }

                // Filter for relevant notification types
                const relevantTypes = ['chat_message', 'order_status', 'flight_status', 'new_request', 'request_accepted', 'request_declined'];
                const hasRelevantType = notif.type && relevantTypes.includes(notif.type);
                const isUnread = notif.read === false || (typeof notif.read === 'string' && notif.read === 'false') || notif.read === undefined;

                console.log("📨 New notification received:", {
                    id: notif.id,
                    type: notif.type,
                    title: notif.title,
                    body: notif.body,
                    read: notif.read,
                    timestamp: notif.timestamp,
                    hasRelevantType,
                    isUnread,
                    data: notif.data,
                });

                // Only show if it's a relevant type and unread
                if (hasRelevantType && isUnread) {
                    console.log("✅ Showing heads-up notification:", {
                        id: notif.id,
                        type: notif.type,
                        title: notif.title,
                        body: notif.body,
                        timestamp: notif.timestamp,
                        data: notif.data,
                    });

                    // Mark as shown
                    lastNotificationIdRef.current = notif.id;
                    setCurrentNotification(notif);
                    setIsVisible(true);
                } else {
                    console.log("⏭️ Skipping notification (not relevant type or already read):", {
                        id: notif.id,
                        type: notif.type,
                        hasRelevantType,
                        isUnread,
                    });
                }
            },
            (error) => {
                console.error("❌ Error listening to notifications:", error);
            }
        );

        listenerRef.current = () => {
            console.log("🧹 Cleaning up notification listener for user:", user.id);
            off(notificationsRef);
        };

        return () => {
            console.log("🔄 Cleanup: Removing notification listener for user:", user.id);
            if (listenerRef.current) {
                listenerRef.current();
                listenerRef.current = null;
            }
            // Reset state on cleanup
            lastNotificationIdRef.current = null;
            setCurrentNotification(null);
            setIsVisible(false);
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

