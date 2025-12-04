// app/login.tsx  (hoặc app/(auth)/login.tsx)
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import api from "@/api/api";
import { useLocalSearchParams, router } from "expo-router";
import { useDispatch } from "react-redux";
import { setUser } from "@/reducers/userSlice";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { getDatabase, ref, set } from "firebase/database";
import { app } from "@/firebaseConfig";
import SocialMedia from "./components/SocialMedia";

export default function Login() {
  const dispatch = useDispatch();
  const { role } = useLocalSearchParams<{ role?: string }>();

  const [formData, setFormData] = useState({
    email: role === "sender" ? "sender@gmail.com" : "customer@gmail.com",
    password: role === "sender" ? "sender@gmail.com" : "customer@gmail.com",
  });

  const [loading, setLoading] = useState(false);

  const handleInputChange = (name: "email" | "password", value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async () => {
    const { email, password } = formData;

    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ email và mật khẩu");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("login", { email, password });

      if (response.status === 200) {
        // Response structure: { status: 'success', data: { user: { ...user, token: "..." } } }
        const userData = response.data.data.user || response.data.data;
        const token = userData.token;
        const user = { ...userData };
        delete user.token; // Remove token from user object để lưu riêng

        // Gán role từ param (sender hoặc customer)
        const userWithRole = {
          ...user,
          role: role === "sender" ? "sender" : "customer", // ép kiểu rõ ràng
        };

        // Lấy Expo Push Token (chỉ trên thiết bị thật)
        let expoPushToken = "";
        try {
          if (Constants.isDevice) {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status === "granted") {
              expoPushToken = (await Notifications.getExpoPushTokenAsync()).data;
            }
          } else {
            // Emulator thì dùng token giả hoặc bỏ qua
            expoPushToken = "ExponentPushToken[emulator]";
          }
        } catch (error) {
          console.warn("Không lấy được push token:", error);
        }

        // Lưu token lên Firebase và database nếu có
        if (expoPushToken && user.id) {
          const db = getDatabase(app);
          await set(ref(db, `users/${user.id}/expo_push_token`), expoPushToken);

          // Lưu token vào Laravel database
          try {
            await api.post('/users/save-token', {
              user_id: user.id,
              token: expoPushToken,
            });
          } catch (error) {
            console.warn('Không thể lưu push token vào database:', error);
          }
        }

        // Lưu user vào Redux (bao gồm token)
        dispatch(setUser({
          ...userWithRole,
          token: token, // Token từ API response
        }));

        // QUAN TRỌNG: Redirect đúng theo role + cấu trúc folder mới
        if (userWithRole.role === "sender") {
          router.replace("/(tabs)/(sender)/home");
        } else {
          router.replace("/(tabs)/(customer)/home_customer");
        }
      } else {
        Alert.alert("Đăng nhập thất bại", response.data.message || "Sai email hoặc mật khẩu");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      Alert.alert(
        "Lỗi kết nối",
        error.response?.data?.message || "Không thể kết nối đến server"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-white"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <View className="flex-1 justify-center px-5 py-8">
          {/* Logo hoặc tiêu đề */}
          <Text className="text-3xl font-bold text-center text-primary mb-2">SkySend</Text>
          <Text className="text-lg text-center text-gray-600 mb-10">
            Đăng nhập {role === "sender" ? "người gửi" : "khách hàng"}
          </Text>

          {/* Form */}
          <View className="gap-y-6">
            <View>
              <Text className="text-gray-700 mb-2 font-medium">Email</Text>
              <TextInput
                className="border border-gray-300 rounded-2xl px-4 py-4 text-base"
                placeholder="nhập email"
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(v) => handleInputChange("email", v)}
                editable={!loading}
              />
            </View>

            <View>
              <Text className="text-gray-700 mb-2 font-medium">Mật khẩu</Text>
              <TextInput
                className="border border-gray-300 rounded-2xl px-4 py-4 text-base"
                placeholder="nhập mật khẩu"
                secureTextEntry
                value={formData.password}
                onChangeText={(v) => handleInputChange("password", v)}
                editable={!loading}
              />
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              className={`mt-6 py-4 rounded-2xl ${loading ? "bg-blue-400" : "bg-primary"
                }`}
            >
              <Text className="text-white text-center text-lg font-bold">
                {loading ? "Đang đăng nhập..." : "Đăng nhập"}
              </Text>
            </TouchableOpacity>

            {/* Social Login */}
            <View className="mt-6">
              <SocialMedia />
            </View>

            {/* Nút chuyển role (test nhanh) */}
            <View className="flex-row justify-center gap-4 mt-8">
              <TouchableOpacity
                onPress={() => router.push("/login?role=sender")}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                <Text>Test Sender</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.push("/login?role=customer")}
                className="px-4 py-2 bg-gray-200 rounded-lg"
              >
                <Text>Test Customer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}