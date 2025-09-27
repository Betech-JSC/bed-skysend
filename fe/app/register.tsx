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
        <View className="space-y-[16px]">
          <Text className="text-center text-[28px]">Đăng ký</Text>
          <Text className="text-center text-[#3C3C43]">Please sign in to continue our app</Text>

          <View className="space-y-[16px] py-[32px]">
            <TextInput
              value={formData.username}
              onChangeText={(value) => handleInputChange("username", value)}
              className="bg-[#F2F2F7] p-4 border border-gray-300 rounded-[16px] text-lg w-full"
              placeholder="Số điện thoại"
            />
          </View>
          <Pressable onPress={handlePress} className="bg-[#0D6EFD] py-[14px] px-[32px] rounded-[14px]">
            <Text className="text-white text-center">Sign In</Text>
          </Pressable>
          <View className="flex-row justify-center">
            <View className="flex-row text-center space-x-[10px]">
              <Text>Don’t have an account?</Text>
              <Text className="text-[#0D6EFD]">Sign Up</Text>
            </View>
          </View>
        </View>
        <SocialMedia />
      </View>
    </>
  );
}

export default Register;
