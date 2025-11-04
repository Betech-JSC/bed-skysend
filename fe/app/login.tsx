import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { useRouter } from "expo-router";
import api from "@/api/api";

import { useDispatch } from 'react-redux';
import { setUser } from "@/reducers/userSlice";

function Login() {

  const dispatch = useDispatch();

  const router = useRouter();
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
        const response = await api.post("login", {
          email,
          password,
        });

        if (response.status === 200) {
          const { user } = response.data.data;

          const userWithRole = { ...user, role: 'sender' };

          dispatch(setUser(userWithRole));
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
    </>
  );
}

export default Login;
