// src/notifications/usePushNotifications.ts
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import { Alert } from 'react-native';

export function usePushNotifications() {
    useEffect(() => {
        // 1️⃣ App đang foreground
        const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
            Alert.alert(notification.request.content.title || 'Thông báo', notification.request.content.body || '');
        });

        // 2️⃣ App background / killed → user tap notification
        const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
            const data = response.notification.request.content.data;
            console.log('Notification tapped, navigate:', data);
            // TODO: navigate tới chat room dựa vào data.chatId
        });

        return () => {
            foregroundSubscription.remove();
            responseSubscription.remove();
        };
    }, []);
}
