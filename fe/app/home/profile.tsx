import { View, Text, ScrollView } from "react-native";
import React from "react";

const Profile = () => {
    return (
        <View className="">
            <View className="p-[16px] space-y-[12px]">
                <View className="p-[16px] bg-white rounded-[22px] space-y-[12px]">
                    <View className="space-y-[12px]">
                        <Text className="font-semibold">Nguyễn Văn Minh</Text>
                        <View className="flex-row space-x-[12px]">
                            <Text>051188005689</Text>
                            <Text>|</Text>
                            <Text>Người gửi hàng</Text>
                        </View>
                    </View>
                    <View className="flex-row space-x-[12px] ">
                        <View className="p-[10px]  rounded-[12px] bg-[#EFF8FF] w-1/2">
                            <Text className="text-center text-[#1570EF]">Thay đổi vai trò</Text>
                        </View>
                        <View className="p-[10px]  rounded-[12px] bg-[#FFFAEB] w-1/2">
                            <Text className="text-center text-[#F79009]">Xem hồ sơ</Text>
                        </View>
                    </View>
                </View>
                <View className="p-[16px] bg-white rounded-[22px] space-y-[12px]">
                    <View className="space-y-[12px]">
                        <Text className="font-semibold">Đơn hàng</Text>
                    </View>
                    <ScrollView
                        horizontal={true} // cuộn ngang
                        showsHorizontalScrollIndicator={false} // ẩn thanh cuộn
                    >
                        <View className="flex-row space-x-[12px]">
                            <Text className="text-center">Chờ xác nhận</Text>
                            <Text className="text-center">Chờ lấy hàng</Text>
                            <Text className="text-center">Đang vận chuyển</Text>
                            <Text className="text-center">Hoàn thành</Text>
                        </View>
                    </ScrollView>
                </View>
            </View>
        </View>
    );
};

export default Profile;
