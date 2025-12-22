import React from "react";
import { Stack, usePathname } from "expo-router";
import { Provider } from "react-redux";
import { store, persistor } from "@/store"; // import persistor
import { PersistGate } from "redux-persist/integration/react";
import { usePushNotifications } from "@/notifications/usePushNotifications";
import * as Notifications from 'expo-notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LogBox } from 'react-native';
import ErrorBoundary from './components/ErrorBoundary';

// Ẩn console errors trên màn hình
// Có thể ignore specific errors bằng cách thêm patterns vào mảng
LogBox.ignoreAllLogs(true); // Ẩn tất cả logs
// Hoặc ignore specific errors:
// LogBox.ignoreLogs([
//   'Warning: ...',
//   'Error: ...',
// ]);

function AppContent() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTintColor: '#1F2937',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerBackTitleVisible: false,
        headerShadowVisible: true,
        animation: 'slide_from_right',
      }}
    />
  );
}

function NotificationHandler() {
  const pathname = usePathname();

  React.useEffect(() => {
    // Configure notification handler với dynamic check
    Notifications.setNotificationHandler({
      handleNotification: async (notification) => {
        const data = notification.request.content.data || {};
        const type = data.type;
        const chatId = data.chat_id;

        // Check nếu đang ở trong chat screen
        const isInChat = pathname?.startsWith('/chat/');

        // Extract chatId từ pathname nếu đang ở trong chat
        const currentChatId = isInChat ? pathname?.split('/chat/')[1]?.split('?')[0] : null;

        // Convert cả hai về string để so sánh
        const currentChatIdStr = currentChatId ? String(currentChatId) : null;
        const notificationChatIdStr = chatId ? String(chatId) : null;

        // Nếu đang ở trong chat và notification là chat_message từ cùng chat, không hiển thị
        if (isInChat && type === 'chat_message' && notificationChatIdStr && currentChatIdStr === notificationChatIdStr) {
          return {
            shouldShowAlert: false,  // Không hiển thị notification
            shouldPlaySound: false,  // Không phát âm thanh
            shouldSetBadge: true,    // Vẫn cập nhật badge
          };
        }

        // Các trường hợp khác: hiển thị bình thường
        return {
          shouldShowAlert: true,   // Hiển thị banner khi foreground
          shouldPlaySound: true,   // Phát âm thanh khi foreground
          shouldSetBadge: true,    // Cập nhật badge
        };
      },
    });
  }, [pathname]);

  return null;
}

function PushNotificationsWrapper() {
  usePushNotifications();
  return null;
}

export default function Layout() {
  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <NotificationHandler />
            <PushNotificationsWrapper />
            <AppContent />
          </PersistGate>
        </Provider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
