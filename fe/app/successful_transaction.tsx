import React from 'react'
import { Image, Text, View, TextInput } from "react-native";

function successful_transaction() {
    return (
        <View className="container p-[20px] h-full">
            <View className="pt-[20px] space-y-[20px]">
                <View className="space-y-[16px] bg-[#ECFDF3] py-[12px] px-[24px] rounded-[24px]">
                    <Text className='text-[#0F172A] text-[14px] font-semibold text-center' >Đơn hàng đã giao dịch thành công!</Text>
                    <Text className='text-[#344054] text-[12px] text-center'>500.000 đã được chuyển cho người vận chuyển</Text>
                    <Text className='text-[#1B1B1B] font-medium text-center'>Tony Trần</Text>
                </View>
                <View className="bg-white py-[24px] px-[12px] rounded-[12px] space-y-[12px]">
                    <View className="flex-col justify-center items-center space-x-[12px]">
                        <View className="space-y-[32px]">
                            <View>
                                <Text className="text-[#189989] text-[28px] font-bold text-center">Hãy đánh giá {"\n"} trải nghiệm của bạn</Text>
                            </View>
                            <View className="flex-row justify-center  items-center space-x-[2px] ">
                                <Image source={require("../assets/images/star.png")} className="w-[36px] h-[36px]" />
                                <Image source={require("../assets/images/star.png")} className="w-[36px] h-[36px]" />
                                <Image source={require("../assets/images/star.png")} className="w-[36px] h-[36px]" />
                                <Image source={require("../assets/images/star.png")} className="w-[36px] h-[36px]" />
                                <Image source={require("../assets/images/star.png")} className="w-[36px] h-[36px]" />
                            </View>
                            <Text className='text-center text-[#0F172A] text-[16px]'>Tốt</Text>
                        </View>
                        <TextInput
                            multiline
                            className="w-full mt-[32px] p-4 border border-gray-300 rounded-lg text-gray-800 text-base"
                            placeholder="Chia sẻ nhận xét của bạn"
                            textAlignVertical="top"
                            style={{
                                height: 150, // Adjust this value based on your desired number of lines
                            }}
                        />
                    </View>
                </View>
            </View>

            <View className="absolute inset-x-0 bottom-0 space-y-[10px] px-[20px] bg-white py-[20px]">
                <View className="bg-[#F5F6FA] rounded-[12px] py-[16px]">
                    <Text className="font-semibold text-center text-[#0F172A]">Bỏ qua</Text>
                </View>
                <View className="bg-[#FFD700] rounded-[12px] py-[16px]">
                    <Text className="text-[#0F172A] font-semibold text-center">Gửi đánh giá</Text>
                </View>
            </View>
        </View>
    )
}

export default successful_transaction