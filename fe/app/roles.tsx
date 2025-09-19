import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import {  Image, Pressable, Text, View } from "react-native";

const Roles = () => {
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleSelectRole = (role: string) => {
    setSelectedRole(role);
  };

  const handlePress = () => {
    router.push("login");
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Roles",
        }}
      />
      <View className="container p-[20px]">
        <View className="flex-row items-center justify-between">
          <View>
            <Image source={require("../assets/images/logo.png")} />
          </View>
          <View className="space-x-[10px] flex-row">
            <View className="w-[20px] h-[2px] bg-[#0D6EFD]"></View>
            <View className="w-[20px] h-[2px] bg-gray-300"></View>
            <View className="w-[20px] h-[2px] bg-gray-300"></View>
          </View>
        </View>
        <View className="space-y-2">
          <Text className="text-[#1B1B1B] text-[16px] text-center">Vui lòng chọn vai trò</Text>

          <View className="bg-gray-200 p-2">
            {/* Sender */}
            <Pressable onPress={() => handleSelectRole("Sender")} className={`h-[128px] flex-col justify-center items-center ${selectedRole === "Sender" ? "bg-blue-500" : "bg-white"}`}>
              <Text className={`text-center ${selectedRole === "Sender" ? "text-white" : "text-black"}`}>Sender</Text>
            </Pressable>

            {/* Carrier */}
            <Pressable onPress={() => handleSelectRole("Carrier")} className={`h-[128px] flex-col justify-center items-center ${selectedRole === "Carrier" ? "bg-blue-500" : "bg-white"}`}>
              <Text className={`text-center ${selectedRole === "Carrier" ? "text-white" : "text-black"}`}>Carrier</Text>
            </Pressable>
          </View>
        </View>

        <View className="flex-row items-center justify-between space-y-[40px]">
          <View className="flex-row items-center">
            <Text className="text-[#1B1B1B]"></Text>
          </View>
          <Pressable onPress={handlePress} className="bg-[#0D6EFD]  py-[14px] px-[32px] rounded-[14px]">
            <Text className="text-white">Next</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
};

export default Roles;
