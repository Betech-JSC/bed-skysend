import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import api from "@/api/api";
import { useLocalSearchParams, router } from "expo-router";
import { useDispatch } from 'react-redux';
import { setUser } from "@/reducers/userSlice";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";
import { getDatabase, ref, set } from "firebase/database";
import { app } from "@/firebaseConfig";

function Login() {
  const dispatch = useDispatch();
  const { role } = useLocalSearchParams<{ role?: string }>();

  const [formData, setFormData] = useState({
    email: "admin@gmail.com",
    password: "admin@gmail.com",
  });

  const handleInputChange = (name: any, value: any) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePress = async () => {
    const { email, password } = formData;

    if (email && password) {
      try {
        const response = await api.post("login", { email, password });

        if (response.status === 200) {
          const { user } = response.data.data;
          const userWithRole = { ...user, role: role || "sender" };

          // 1️⃣ Lấy expo push token
          let expoPushToken = '';
          // if (Constants.isDevice) {
          //   const { status: existingStatus } = await Notifications.getPermissionsAsync();
          //   let finalStatus = existingStatus;
          //   if (existingStatus !== 'granted') {
          //     const { status } = await Notifications.requestPermissionsAsync();
          //     finalStatus = status;
          //   }
          //   if (finalStatus === 'granted') {
          //     expoPushToken = (await Notifications.getExpoPushTokenAsync()).data;
          //   }
          // }

          expoPushToken = (await Notifications.getExpoPushTokenAsync()).data;

          // 2️⃣ Lưu token vào Firebase
          if (expoPushToken) {
            const db = getDatabase(app);
            await set(ref(db, `users/${user.id}/expo_push_token`), expoPushToken);

            // 3️⃣ Lưu vào redux và chuyển màn hình
            dispatch(setUser(userWithRole));
            router.push("/home");
          }

        } else {
          Alert.alert("Đăng nhập thất bại", response.data.message || "Vui lòng thử lại.");
        }
      } catch (error) {
        Alert.alert("Lỗi mạng", "Không thể kết nối đến server. Vui lòng thử lại.");
      }
    } else {
      Alert.alert("Vui lòng điền đầy đủ thông tin");
    }
  };

  return (
    <View className="px-[20px] py-[32px] bg-white h-full">
      <Text className="text-[24px] font-bold py-[16px]">Đăng nhập</Text>
      <View className="gap-y-[24px]">
        <View className="gap-y-[24px]">
          <View className="gap-y-[4px]">
            <Text>Tên tài khoản</Text>
            <TextInput
              className="p-4 border border-gray-300 rounded-[16px] text-lg w-full"
              placeholder="Nhập tên tài khoản"
              value={formData.email}
              onChangeText={(value) => handleInputChange("email", value)}
            />
          </View>
          <View className="gap-y-[4px]">
            <Text>Mật khẩu</Text>
            <TextInput
              className="p-4 border border-gray-300 rounded-[16px] text-lg w-full"
              placeholder="Nhập mật khẩu"
              secureTextEntry
              value={formData.password}
              onChangeText={(value) => handleInputChange("password", value)}
            />
          </View>
        </View>
        <View>
          <Pressable
            onPress={handlePress}
            className="bg-[#0D6EFD] w-full py-[14px] px-[32px] rounded-[14px]"
          >
            <Text className="text-center text-white">Đăng nhập</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default Login;
