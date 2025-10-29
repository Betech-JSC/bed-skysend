import React from "react";
import { Stack } from "expo-router";
import { NativeWindStyleSheet } from "nativewind";
import { Provider } from "react-redux"; // Import Redux Provider
import { store } from "@/store";

// Set output for NativeWind to 'native'
NativeWindStyleSheet.setOutput({
  default: "native",
});

export default function Layout() {
  return (
    <Provider store={store}>
      <Stack />
    </Provider>
  );
}
