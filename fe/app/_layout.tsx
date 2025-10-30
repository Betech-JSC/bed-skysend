import React from "react";
import { Stack } from "expo-router";
import { NativeWindStyleSheet } from "nativewind";
import { Provider } from "react-redux";
import { store, persistor } from "@/store"; // import persistor
import { PersistGate } from "redux-persist/integration/react";

// Set output for NativeWind to 'native'
NativeWindStyleSheet.setOutput({
  default: "native",
});

export default function Layout() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Stack />
      </PersistGate>
    </Provider>
  );
}
