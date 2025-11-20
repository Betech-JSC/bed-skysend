// app/(sender)/_layout.tsx
import { Tabs } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

export default function SenderLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: "#2563EB",
                tabBarInactiveTintColor: "#6B7280",
                tabBarStyle: { height: 70, paddingBottom: 20, paddingTop: 8 },
            }}
        >
            <Tabs.Screen name="home" options={{ title: "Trang chủ", tabBarIcon: ({ color }) => <MaterialIcons name="home" size={28} color={color} /> }} />
            <Tabs.Screen name="list_orders" options={{ title: "Đơn hàng", tabBarIcon: ({ color }) => <MaterialIcons name="work" size={28} color={color} /> }} />
            <Tabs.Screen name="wallet" options={{ title: "Ví tiền", tabBarIcon: ({ color }) => <MaterialIcons name="account-balance-wallet" size={28} color={color} /> }} />
            <Tabs.Screen name="profile" options={{ title: "Tài khoản", tabBarIcon: ({ color }) => <MaterialIcons name="person" size={28} color={color} /> }} />
        </Tabs>
    );
}