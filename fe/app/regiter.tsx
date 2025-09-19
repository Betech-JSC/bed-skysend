import React, { useState } from "react";
import { View, Text, TextInput, Pressable } from "react-native";
import { Stack, useRouter } from "expo-router";

function Register() {
  const router = useRouter();

  const [text, setText] = useState("");

  const handlePress = () => {
    alert('Login');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Login",
        }}
      />
      <View className="space-y-[16px] px-[20px] py-[32px]">
        <Text className="text-center text-[28px]">Đăng nhập</Text>
        <Text className="text-center text-[#3C3C43]">Please sign in to continue our app</Text>

        <View className="space-y-[16px]">
          <TextInput
            value={text}
            onChangeText={setText} 
            className="bg-[#F2F2F7] p-4 border border-gray-300 rounded-[16px]  text-lg w-full"
            placeholder="Enter your name"
          />
          <TextInput
            value={text}
            onChangeText={setText} 
            className="bg-[#F2F2F7] p-4 border border-gray-300 rounded-[16px]  text-lg w-full"
            placeholder="Enter your Password"
          />
        </View>
        <Pressable onPress={handlePress} className="bg-[#0D6EFD]  py-[14px] px-[32px] rounded-[14px] ">
          <Text className="text-white text-center">Sign In</Text>
        </Pressable>
      </View>
    </>
  );
}

export default Register;
