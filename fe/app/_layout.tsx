import React from "react";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store, persistor } from "@/store"; // import persistor
import { PersistGate } from "redux-persist/integration/react";
import { usePushNotifications } from "@/notifications/usePushNotifications";
import * as Notifications from 'expo-notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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

export default function Layout() {
  // Configure notification handler
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,   // Hiển thị banner khi foreground
      shouldPlaySound: true,   // Phát âm thanh khi foreground
      shouldSetBadge: true,    // Cập nhật badge
    }),
  });

  usePushNotifications();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <AppContent />
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}
