// app/index.tsx
import React, { useEffect } from "react";
import { View, Text, Image, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useSelector } from "react-redux";
import '../global.css';

export default function Onboarding() {
  const router = useRouter();
  const user = useSelector((state: any) => state.user);

  // DÙNG useEffect ĐỂ REDIRECT → KHÔNG GÂY LỖI RENDER
  useEffect(() => {
    if (user?.role === "sender") {
      router.replace("/(sender)/home");
    } else if (user?.role === "customer") {
      router.replace("/(customer)/home_customer");
    }
  }, [user, router]);

  // Nếu đã đăng nhập → không hiện gì (để redirect)
  if (user?.role) {
    return null;
  }

  return (
    <View className="flex-1 bg-white px-6 pt-12 justify-between">
      <View>
        <Image source={require("../assets/icon.png")} className="w-16 h-16 mb-10" />
        <Image source={require("../assets/images/onboard/onboard.png")} className="w-full h-80" resizeMode="contain" />
        <Text className="text-3xl font-bold text-center mt-12">SkySend</Text>
        <Text className="text-lg text-center text-gray-600 mt-4 px-4">
          Mang đồ giúp người khác – Kiếm tiền dễ dàng{'\n'}
          Gửi đồ nhanh chóng – Tiết kiệm chi phí
        </Text>
      </View>

      <View className="mb-12">
        <Pressable
          onPress={() => router.push("/roles")}
          className="bg-primary py-5 rounded-2xl"
        >
          <Text className="text-white text-center text-xl font-bold">
            Bắt đầu ngay
          </Text>
        </Pressable>
      </View>
    </View>
  );
}