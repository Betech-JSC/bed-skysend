import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Image } from "react-native";
import { Stack, useRouter } from "expo-router";
import SocialMedia from "./components/SocialMedia";

function Register() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    username: "",
  });

  const handleInputChange = (name: any, value: any) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handlePress = () => {
    const { username } = formData;
    if (username) {
      alert('register Successful');

    } else {
      alert('Please fill in both fields');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Register",
        }}
      />
      <View className="flex-col justify-between  px-[20px] py-[32px] bg-white h-full">
        <View>
          <View className="space-y-[8px]">
            <Text className="text-black text-[24px] font-bold">
              Đăng ký
            </Text>
            <Text className="text-[#3C3C43]">
              Vui lòng nhập để tiếp tục
            </Text>
          </View>
          <View className="flex-row space-y-[8px]">
          </View>
          <View className="mt-[24px] space-y-[8px]">
            <Pressable onPress={handlePress} className="bg-[#0D6EFD] w-full  py-[14px] px-[32px] rounded-[14px]">
              <Text className="text-center text-white">Gửi mã xác nhận</Text>
            </Pressable>
            <View className="flex-row space-x-1 justify-center">
              <Text className="text-[#3C3C43]">Bạn đã có tài khoản</Text>
              <Pressable onPress={() => router.push("/login")}>
                <Text className="text-[#0D6EFD]">Đăng nhập</Text>
              </Pressable>
            </View>
          </View>
        </View>

      </View>
    </>
  );
}

export default Register;
