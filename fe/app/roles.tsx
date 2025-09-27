import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { Image, Pressable, Text, View } from "react-native";

const Roles = () => {
  const router = useRouter();

  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleSelectRole = (role: string) => {
    setSelectedRole(role);
  };

  const handlePress = () => {
    router.push("/login");
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Roles",
        }}
      />
      <View className="container py-[24px] px-[16px]">
        <View className="space-y-2">
          <Text className="text-[#1B1B1B] text-[16px] text-center text-[28px] text-primary-600 font-bold text-[#1570EF]">Chọn vai trò để bắt đầu</Text>
          <View className="flex-row justify-center py-[48px]">
            <Image source={require("../assets/images/role.webp")} className="w-[261px] h-[278px]" />
          </View>
        </View>
        <View className="w-full h-full space-y-[12px]">
          <View className="flex-row w-full justify-between">
            <View className="bg-[#0D6EFD] rounded-[12px] p-[12px] space-y-[8px] flex-1">
              <Text className="font-bold text-center text-white text-[20px]">Người Gửi</Text>
              <Text className="text-center text-white">
                Tạo yêu cầu vận chuyển, chờ người đi {'\n'} đường nhận giao.
              </Text>
            </View>
          </View>
          <View className="flex-row w-full justify-between">
            <View className="bg-[#0D6EFD] rounded-[12px] p-[12px] space-y-[8px] flex-1">
              <Text className="font-bold text-center text-white text-[20px]">Người vận chuyển</Text>
              <Text className="text-center text-white">
                Nhận đơn phù hợp với lịch trình, hỗ {'\n'} trợ giao hàng.
              </Text>
            </View>
          </View>
        </View>
        <View>
          <Pressable onPress={handlePress} className="bg-[#0D6EFD] w-full  py-[14px] px-[32px] rounded-[14px]">
            <Text className="text-center text-white">Tiếp tục</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
};

export default Roles;
