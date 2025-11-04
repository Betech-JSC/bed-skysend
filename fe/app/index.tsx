import { useRouter } from "expo-router";
import { Image, Pressable, Text, View } from "react-native";

import '../global.css';

export default function Page() {

  const router = useRouter();

  const handlePress = () => {
    router.push("roles");
  };

  return (
    <View className="container p-[20px] bg-white h-full gap-y-[20px]">
      <View className="flex-row items-center justify-between">
        <View>
          <Image className="w-[50px] h-[50px]" source={require("../assets/icon.png")} />
        </View>
        <View className="gap-x-[10px] flex-row">
          <View className="w-[20px] h-[2px] bg-[#0D6EFD]"></View>
          <View className="w-[20px] h-[2px] bg-gray-300"></View>
          <View className="w-[20px] h-[2px] bg-gray-300"></View>
        </View>
      </View>
      <View className="overflow-hidden">
        <Image source={require("../assets/images/onboard/onboard.png")} className="w-full h-auto max-h-[600px] object-cover object-bottom" />
      </View>
      <View>
        <Text className="font-bold text-[#1B1B1B] text-[24px]">Welcome to our skysend. we help you with your luggage</Text>
      </View>
      <View className="flex-row items-center justify-between gap-y-[40px]">
        <Pressable
          onPress={() => router.push("/home")}
        >
        </Pressable>
        <Pressable
          onPress={handlePress}
          className="bg-[#0D6EFD]  py-[14px] px-[32px] rounded-[14px]"
        >
          <Text className="text-white">Next</Text>
        </Pressable>
      </View>
    </View>
  );
}


