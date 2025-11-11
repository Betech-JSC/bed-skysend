import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Image, Pressable, Text, View } from 'react-native';

const Roles = () => {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handlePress = () => {
    if (!selectedRole) {
      Alert.alert('Vui lòng chọn vai trò trước khi tiếp tục');
      return;
    }

    router.push({
      pathname: '/login',
      params: { role: selectedRole },
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Roles',
        }}
      />
      <View className="container bg-white h-full px-[16px] py-[24px]">
        <View className="gap-y-2">
          <Text className="text-primary-600 text-center text-[28px] font-bold text-[#1570EF]">
            Chọn vai trò để bắt đầu
          </Text>
          <View className="flex-row justify-center py-[48px]">
            <Image
              source={require('../assets/images/role.webp')}
              className="max-h-[278px] w-[261px]"
            />
          </View>
        </View>
        <View className="w-full gap-y-[12px]">
          <View className="w-full flex-row justify-between">
            <Pressable
              onPress={() => setSelectedRole('sender')}
              className={`flex-1 gap-y-[8px] rounded-[12px] p-[12px] ${selectedRole === 'sender' ? 'bg-[#0D6EFD]' : 'border bg-white text-[#0D6EFD]'
                }`}>
              <Text className="text-center text-[20px] font-bold">Người Gửi</Text>
              <Text className="text-center ">
                Tạo yêu cầu vận chuyển, chờ người đi {'\n'} đường nhận giao.
              </Text>
            </Pressable>
          </View>
          <View className="w-full flex-row justify-between">
            <Pressable
              onPress={() => setSelectedRole('carrier')}
              className={`flex-1 gap-y-[8px] rounded-[12px] p-[12px] ${selectedRole === 'carrier' ? 'bg-[#0D6EFD]' : 'border border-[#0D6EFD] bg-white'
                }`}>
              <Text className="text-center text-[20px] font-bold">Người Vận Chuyển</Text>
              <Text className="text-center ">
                Nhận đơn phù hợp với lịch trình, hỗ {'\n'} trợ giao hàng.
              </Text>
            </Pressable>
          </View>
        </View>
        <View className="mt-[24px]">
          <Pressable
            onPress={handlePress}
            className="w-full rounded-[14px]  bg-[#0D6EFD] px-[32px] py-[14px]">
            <Text className="text-center text-white">Tiếp tục</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
};

export default Roles;
