import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Image } from "react-native";
import { Stack, useRouter } from "expo-router";
import SocialMedia from "./components/SocialMedia";

function Login() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const handleInputChange = (name: any, value: any) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePress = () => {
    const { username, password } = formData;
    if (username && password) {
      alert("Login Successful");
    } else {
      alert("Please fill in both fields");
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
              className=" p-4 border border-gray-300 rounded-[16px]  text-lg w-full"
              placeholder="Nhập tên tài khoản"
            />
          </View>
          <View className="space-y-[4px]">
            <Text>Số điện thoại</Text>
            <TextInput
              className=" p-4 border border-gray-300 rounded-[16px]  text-lg w-full"
              placeholder="Nhập số điện thoại"
            />
          </View>
          <View className="space-y-[4px]">
            <Text>Mật khẩu</Text>
            <TextInput
              className=" p-4 border border-gray-300 rounded-[16px]  text-lg w-full"
              placeholder="Nhập mật khẩu"
            />
          </View>
          <View className="mt-[24px]">
            <Pressable onPress={() => router.push("/receiver/index")} className="bg-[#0D6EFD] w-full  py-[14px] px-[32px] rounded-[14px]">
              <Text className="text-center text-white">Đăng nhập</Text>
            </Pressable>
          </View>
        </View>
      </View >
    </>
  );
}

export default Login;
