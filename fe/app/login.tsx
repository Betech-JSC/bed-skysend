import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { Stack, useRouter } from "expo-router";
import api from "@/api/api";
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

import { useSelector, useDispatch } from 'react-redux';
import { setUser } from "@/reducers/userSlice";
import { RootState } from "@/store";

function Login() {

  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  const updateUser = () => {
    dispatch(setUser({ id: '1', name: 'John Doe', email: 'john@example.com', 'role': 'sender' }));
  };

  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "john@example.com",
    password: "password123",
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
        const response = await api.post("login", {
          email,
          password,
        });

        if (response.status === 200) {
          const { user } = response.data.data;

          await AsyncStorage.setItem('user', JSON.stringify(user));
          await AsyncStorage.setItem('role', 'sender');

          // Cập nhật Redux store
          dispatch(setUser(user));

          // Điều hướng đến màn hình chính
          router.push("/home");

        } else {
          Alert.alert("Đăng nhập thất bại", response.data.message || "Vui lòng thử lại.");
        }
      } catch (error) {
        console.log(error);
        Alert.alert("Lỗi mạng", "Không thể kết nối đến server. Vui lòng thử lại.");
      }
    } else {
      Alert.alert("Vui lòng điền đầy đủ thông tin");
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Login",
        }}
      />
      <View className="px-[20px] py-[32px] bg-white h-full">
        <Text className="text-[24px] font-bold py-[16px]">Đăng nhập</Text>
        <View className="space-y-[24px]">
          <View className="space-y-[4px]">
            <Text>Tên tài khoản</Text>
            <TextInput
              className="p-4 border border-gray-300 rounded-[16px] text-lg w-full"
              placeholder="Nhập tên tài khoản"
              value={formData.email}
              onChangeText={(value) => handleInputChange("email", value)}
            />
          </View>
          <View className="space-y-[4px]">
            <Text>Mật khẩu</Text>
            <TextInput
              className="p-4 border border-gray-300 rounded-[16px] text-lg w-full"
              placeholder="Nhập mật khẩu"
              secureTextEntry
              value={formData.password}
              onChangeText={(value) => handleInputChange("password", value)}
            />
          </View>
          <View className="mt-[24px]">
            <Pressable
              onPress={handlePress}
              className="bg-[#0D6EFD] w-full py-[14px] px-[32px] rounded-[14px]"
            >
              <Text className="text-center text-white">Đăng nhập</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </>
  );
}

export default Login;
