import { Stack, useRouter } from "expo-router";
import { Button, Image, Pressable, Text, View } from "react-native";

const Home = () => {

  const router = useRouter(); // Khởi tạo router

  const handlePress = () => {
    router.push('roles');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "On Board",
        }}
      />
      {/* <View className="container p-[20px]">
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
        <View className="overflow-hidden">
          <Image source={require("../assets/images/onboard/onboard.png")} className="w-full h-auto max-h-[600px] object-cover object-bottom" />
        </View>
        <View>
          <Text className="font-bold text-[#1B1B1B] text-[32px]">Welcome to our skysend. we help you with your luggage</Text>
        </View>
        <View className="flex-row items-center justify-between space-y-[40px]">
          <View className="flex-row items-center">
            <Text className="text-[#1B1B1B]">Skip</Text>
          </View>
          <Pressable
            onPress={handlePress}
            className="bg-[#0D6EFD]  py-[14px] px-[32px] rounded-[14px]"
          >
            <Text className="text-white">Next</Text>
          </Pressable>
        </View>
      </View> */}
      <View className="flex justify-between h-full">
        <View>
          <View className="relative">
            <Image source={require("../assets/images/banner-top.webp")} className="w-full" />
            <View className="p-[24px] absolute inset-x-0">
              <View className="flex-row justify-between items-center">
                <View className="flex-row space-x-[12px] items-center">
                  <View className="flex-row justify-center py-[48px]">
                    <Image source={require("../assets/images/avatar.webp")} className="w-[48px] h-[48px]" />
                  </View>
                  <View className="space-y-[2px]">
                    <Text className="text-[#0F172A] font-bold text-[18px]">Tony Trần</Text>
                    <Text className="text-[#344054]">Người vận chuyển</Text>
                  </View>
                </View>
                <Image source={require("../assets/images/bell.webp")} className="w-[20px] h-[20px]" />
              </View>
            </View>
          </View>
          <View className="p-[24px]">
            <View className="justify-between flex-row">
              <Text className="text-[#1B1B1B] font-semibold text-[16px]">
                Các đơn hàng hoạt động
              </Text>
              <Text className="text-[#109283] text-[14px]">
                Xem thêm
              </Text>
            </View>
            <View className="flex-col items-center py-[80px] space-y-[12px]">
              <Image source={require("../assets/images/create-order.webp")} className="w-[64px] h-[64px]" />
              <Text className="text-[#0F172A] font-semibold text-[16px]">
                Tạo hành trình đầu tiên
              </Text>
            </View>
          </View>
        </View>
        <View className="flex-row justify-between px-[24px] pt-[12px] pb-[60px] bg-white">
          <View className="flex-col items-center space-y-2">
            <Image source={require("../assets/images/navigation/home.webp")} className="w-[28px] h-[28px]" />
            <Text className="text-[10px]">Home</Text>
          </View>
          <View className="flex-col items-center space-y-2">
            <Image source={require("../assets/images/navigation/order.webp")} className="w-[28px] h-[28px]" />
            <Text className="text-[10px]">Đơn hàng</Text>
          </View>
          <View className="bg-yellow-400 rounded-full w-[44px] h-[44px] items-center justify-center">
            <Image source={require("../assets/images/plus.webp")} className="w-[16px] h-[16px]" />
          </View>
          <View className="flex-col items-center space-y-2">
            <Image source={require("../assets/images/navigation/chat.webp")} className="w-[28px] h-[28px]" />
            <Text className="text-[10px]">Chat</Text>
          </View>
          <View className="flex-col items-center space-y-2">
            <Image source={require("../assets/images/navigation/user.webp")} className="w-[28px] h-[28px]" />
            <Text className="text-[10px]">Profile</Text>
          </View>
        </View>
      </View>
    </>
  )
}

export default Home;
