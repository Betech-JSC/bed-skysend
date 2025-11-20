import { Tabs } from "expo-router";
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import { useSelector } from "react-redux";

export default function TabsLayout() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useSelector((state: any) => state.user);
  const role = user?.role || "customer";

  // Cấu hình tab riêng cho từng role
  const senderTabs = [
    { route: "/home", icon: "home", label: "Trang chủ" },
    { route: "/list_orders", icon: "work", label: "Đơn hàng" },
    { route: "/wallet", icon: "account-balance-wallet", label: "Ví tiền" },
    { route: "/profile", icon: "person", label: "Tài khoản" },
  ];

  const customerTabs = [
    { route: "/home_customer", icon: "home", label: "Trang chủ" },
    { route: "/flight-history-customer", icon: "work", label: "Chuyến bay" },
    { route: "/create_order", icon: "add", label: "", isFloating: true }, // nút nổi giữa
    { route: "/wallet", icon: "account-balance-wallet", label: "Ví tiền" },
    { route: "/profile", icon: "person", label: "Tài khoản" },
  ];

  const tabs = role === "sender" ? senderTabs : customerTabs;

  // Xác định tab hiện tại (fix lỗi khi pathname là "/")
  const currentPath = pathname === "/"
    ? (role === "sender" ? "/home" : "/home_customer")
    : pathname;

  const activeIndex = tabs.findIndex(tab => tab.route === currentPath);

  return (
    <>
      {/* Ẩn tab bar mặc định của Expo Router */}
      <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: "none" } }}>
        <Tabs.Screen name="home" />
        <Tabs.Screen name="home_customer" />
        <Tabs.Screen name="list_orders" />
        <Tabs.Screen name="flight-history-customer" />
        <Tabs.Screen name="create_order" />
        <Tabs.Screen name="wallet" />
        <Tabs.Screen name="profile" />
        <Tabs.Screen name="chat" />
      </Tabs>

      {/* Custom Bottom Navigation */}
      <View
        style={styles.bottomNav}
        className="border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-2xl"
      >
        <View className="flex-row justify-between items-center h-16 px-2">
          {tabs.map((tab, index) => {
            const isActive = activeIndex === index;
            const isFloating = tab.isFloating;

            // Nút tạo đơn nổi (chỉ dành cho customer)
            if (isFloating) {
              return (
                <View key={index} className="relative">
                  <TouchableOpacity
                    onPress={() => router.push(tab.route)}
                    className="absolute -top-7 left-1/2 -translate-x-1/2"
                  >
                    <View className="w-16 h-16 rounded-full bg-primary shadow-2xl shadow-primary/60 justify-center items-center border-4 border-white dark:border-gray-900">
                      <MaterialIcons name="add" size={36} color="white" />
                    </View>
                  </TouchableOpacity>
                </View>
              );
            }

            // Các tab thường
            return (
              <TouchableOpacity
                key={index}
                onPress={() => router.push(tab.route)}
                className="flex-1 items-center justify-center py-3"
              >
                <MaterialIcons
                  name={tab.icon as any}
                  size={28}
                  color={isActive ? "#2563EB" : "#6B7280"}
                  style={isActive ? { fontVariationSettings: "'FILL' 1" } : {}}
                />
                {tab.label ? (
                  <Text
                    className={`text-xs mt-1 font-${isActive ? "bold" : "medium"
                      } ${isActive ? "text-primary" : "text-gray-500 dark:text-gray-400"}`}
                  >
                    {tab.label}
                  </Text>
                ) : null}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingBottom: Platform.OS === "ios" ? 34 : 20, // Safe area cho iPhone có notch
    paddingTop: 8,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
});