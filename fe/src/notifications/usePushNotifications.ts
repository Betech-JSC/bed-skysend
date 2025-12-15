// src/notifications/usePushNotifications.ts
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { router } from 'expo-router';

export function usePushNotifications() {
    useEffect(() => {
        // 1️⃣ App đang foreground - không hiển thị alert, để heads-up notification xử lý
        const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
            // Heads-up notification sẽ xử lý việc hiển thị
            console.log('Notification received in foreground:', notification.request.content);
        });

        // 2️⃣ App background / killed → user tap notification
        const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;
            const { type } = data || {};

            console.log('Notification tapped from background/killed state:', data);

            // Navigate based on notification type
            try {
                switch (type) {
                    case 'chat_message':
                        if (data?.chat_id) {
                            router.push(`/chat/${data.chat_id}`);
                        }
                        break;
                    case 'order_status':
                        // Navigate to order detail
                        try {
                            let orderIdentifier: string | null = null;

                            // Ưu tiên: order_uuid > order_id > tracking_code
                            if (data?.order_uuid) {
                                orderIdentifier = String(data.order_uuid);
                            } else if (data?.order_id) {
                                orderIdentifier = String(data.order_id);
                            } else if (data?.tracking_code) {
                                orderIdentifier = String(data.tracking_code);
                            }

                            if (orderIdentifier) {
                                // Thử dùng pathname với params (format chuẩn của expo-router)
                                router.push({
                                    pathname: '/orders_details',
                                    params: { orderId: orderIdentifier },
                                });
                            } else {
                                // Nếu không có order identifier, navigate đến danh sách đơn hàng
                                console.warn('Notification order_status missing order identifier, navigating to orders list');
                                router.push('/(tabs)/(sender)/list_orders');
                            }
                        } catch (navError) {
                            console.error('Error navigating to order detail:', navError);
                            // Fallback: navigate to orders list
                            router.push('/(tabs)/(sender)/list_orders');
                        }
                        break;
                    case 'flight_status':
                        if (data?.flight_uuid) {
                            router.push({
                                pathname: '/flights/[id]',
                                params: { id: data.flight_uuid },
                            });
                        } else if (data?.flight_id) {
                            router.push({
                                pathname: '/flights/[id]',
                                params: { id: String(data.flight_id) },
                            });
                        } else {
                            router.push('/flights');
                        }
                        break;
                    case 'new_request':
                    case 'request_accepted':
                    case 'request_declined':
                        if (data?.request_uuid) {
                            router.push({
                                pathname: '/private-requests/[id]',
                                params: { id: data.request_uuid },
                            });
                        } else if (data?.request_id) {
                            router.push({
                                pathname: '/private-requests/[id]',
                                params: { id: String(data.request_id) },
                            });
                        }
                        break;
                    case 'system':
                        router.push('/notifications');
                        break;
                }
            } catch (error) {
                console.error('Navigation error from notification:', error);
            }
        });

        return () => {
            foregroundSubscription.remove();
            responseSubscription.remove();
        };
    }, []);
}
