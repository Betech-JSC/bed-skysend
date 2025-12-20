// src/notifications/usePushNotifications.ts
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';

export function usePushNotifications() {
    const user = useSelector((state: RootState) => state.user);
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
                    case 'order_status':
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
                                    params: { orderId: orderIdentifier },
                                });
                            } else {
                                // Nếu không có order identifier, navigate đến danh sách đơn hàng dựa trên role
                                console.warn('Notification order_status missing order identifier, navigating to orders list');
                                const ordersListPath = user?.role === 'customer' 
                                    ? '/(tabs)/(customer)/list_orders_customer'
                                    : '/(tabs)/(sender)/list_orders';
                                router.push(ordersListPath);
                            }
                        } catch (navError) {
                            console.error('Error navigating to order detail:', navError);
                            // Fallback: navigate to orders list dựa trên role
                            const ordersListPath = user?.role === 'customer' 
                                ? '/(tabs)/(customer)/list_orders_customer'
                                : '/(tabs)/(sender)/list_orders';
                            router.push(ordersListPath);
                        }
                        break;
                    case 'flight_status':
                        try {
                            if (data?.flight_uuid) {
                                const flightId = String(data.flight_uuid).trim();
                                console.log('Navigating to flight detail:', flightId);
                                router.push({
                                    pathname: '/detail-flight-customer',
                                    params: { id: flightId },
                                });
                            } else if (data?.flight_id) {
                                const flightId = String(data.flight_id).trim();
                                console.log('Navigating to flight detail:', flightId);
                                router.push({
                                    pathname: '/detail-flight-customer',
                                    params: { id: flightId },
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
                    case 'new_request':
                    case 'request_accepted':
                    case 'request_declined':
                        try {
                            if (data?.request_uuid) {
                                const requestId = String(data.request_uuid).trim();
                                console.log('Navigating to request detail:', requestId);
                                router.push({
                                    pathname: '/private-requests/[id]',
                                    params: { id: requestId },
                                });
                            } else if (data?.request_id) {
                                const requestId = String(data.request_id).trim();
                                console.log('Navigating to request detail:', requestId);
                                router.push({
                                    pathname: '/private-requests/[id]',
                                    params: { id: requestId },
                                });
                            } else {
                                console.warn('Notification request missing request identifier');
                            }
                        } catch (navError) {
                            console.error('Error navigating to request detail:', navError);
                        }
                        break;
                    case 'request_match':
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
                    case 'system':
                        console.log('Navigating to notifications screen');
                        router.push('/notifications');
                        break;
                    default:
                        console.warn('Unknown notification type:', type);
                        router.push('/notifications');
                }
            } catch (error) {
                console.error('Navigation error from notification:', error);
                // Fallback to notifications screen
                try {
                    router.push('/notifications');
                } catch (fallbackError) {
                    console.error('Failed to navigate to notifications screen:', fallbackError);
                }
            }
        });

        return () => {
            foregroundSubscription.remove();
            responseSubscription.remove();
        };
    }, []);
}
