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
      </View>
    </>
  )
}

export default Home;
