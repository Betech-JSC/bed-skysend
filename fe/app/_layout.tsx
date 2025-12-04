import React from "react";
import { Stack } from "expo-router";
import { Provider } from "react-redux";
import { store, persistor } from "@/store"; // import persistor
import { PersistGate } from "redux-persist/integration/react";
import { usePushNotifications } from "@/notifications/usePushNotifications";
import * as Notifications from 'expo-notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function Layout() {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,   // hiển thị alert
      shouldPlaySound: true,   // phát sound
      shouldSetBadge: false,
    }),
  });

  usePushNotifications();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Stack />
        </PersistGate>
      </Provider>
    </GestureHandlerRootView>
  );
}
