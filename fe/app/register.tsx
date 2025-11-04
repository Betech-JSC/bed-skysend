import React, { useState } from "react";
import { View, Text, TextInput, Pressable, Alert } from "react-native";
import { Stack, useRouter } from "expo-router";
import api from "@/api/api";

function Register() {
  const router = useRouter();

  // Set up state for form data
  const [formData, setFormData] = useState({
    name: "toannguyen",
    email: "toan@gmail.com",
    password: "toan@gmail.com",
    confirmPassword: "toan@gmail.com",
  });

  const handleInputChange = (name, value) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
    try {
      const response = await api.post('/register', {
        first_name: "toan",
        last_name: "nguyen",
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      if (response.status === 200) {
        router.push('/login');
      }
    } catch (error) {
      console.log(error.response?.data?.message);
    }
  };


  return (
    <>
      <Stack.Screen
        options={{
          title: "Register",
        }}
      />
      <View className="px-[20px] py-[32px] bg-white h-full">
        <Text className="text-[24px] font-bold py-[16px]">Đăng ký</Text>
        <View className="gap-y-[12px]">
          {/* name */}
          <View className="gap-y-[4px]">
            <Text>Tên tài khoản</Text>
            <TextInput
              className="p-4 border border-gray-300 rounded-[16px] text-lg w-full"
              placeholder="Nhập tên tài khoản"
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
            />
          </View>

          {/* Email */}
          <View className="gap-y-[4px]">
            <Text>Email</Text>
            <TextInput
              className="p-4 border border-gray-300 rounded-[16px] text-lg w-full"
              placeholder="Nhập Email"
              value={formData.email}
              onChangeText={(text) => handleInputChange('email', text)}
            />
          </View>

          {/* Password */}
          <View className="gap-y-[4px]">
            <Text>Mật khẩu</Text>
            <TextInput
              className="p-4 border border-gray-300 rounded-[16px] text-lg w-full"
              placeholder="Nhập mật khẩu"
              secureTextEntry
              value={formData.password}
              onChangeText={(text) => handleInputChange('password', text)}
            />
          </View>

          {/* Confirm Password */}
          <View className="gap-y-[4px]">
            <Text>Nhập lại Mật khẩu</Text>
            <TextInput
              className="p-4 border border-gray-300 rounded-[16px] text-lg w-full"
              placeholder="Nhập lại mật khẩu"
              secureTextEntry
              value={formData.confirmPassword}
              onChangeText={(text) => handleInputChange('confirmPassword', text)}
            />
          </View>

          {/* Submit Button */}
          <View>
            <Pressable onPress={handleSubmit} className="bg-[#0D6EFD] w-full py-[14px] px-[32px] rounded-[14px]">
              <Text className="text-center text-white">Hoàn tất đăng ký</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </>
  );
}

export default Register;
