import { Stack, useRouter } from "expo-router";
import { Button, Image, Pressable, Text, View } from "react-native";

function ItemOrder({ item }: any) {

    const router = useRouter();

    return (
        <Pressable onPress={() => router.push("/orders_details")}>
            <View className="bg-white p-[20px] mb-[12px] rounded-[12px] gap-y-[12px]">
                <View className="gap-y-[12px]">
                    <View className="flex-row items-start justify-between ">
                        <View className="gap-x-[12px] flex-row items-center">
                            <View>
                                <Image source={require("../../assets/images/avatar.webp")} className="w-[48px] h-[48px]" />
                            </View>
                            <View className="flex-row">
                                <View>
                                    <View className="flex-row items-center gap-x-2">
                                        <Text className="text-[#1B1B1B] font-semibold">Tony Trần</Text>
                                    </View>
                                    <View className="flex-row items-center gap-x-[2px] ">
                                        <Image source={require("../../assets/images/star.png")} className="w-[10px] h-[10px]" />
                                        <Image source={require("../../assets/images/star.png")} className="w-[10px] h-[10px]" />
                                        <Image source={require("../../assets/images/star.png")} className="w-[10px] h-[10px]" />
                                        <Image source={require("../../assets/images/star.png")} className="w-[10px] h-[10px]" />
                                        <Image source={require("../../assets/images/star.png")} className="w-[10px] h-[10px]" />
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View className="bg-[#2DD4BF]  rounded-[80px]">
                            <Text className="text-white py-[2px] px-[6px]  text-center"> {item.status} </Text>
                        </View>
                    </View>
                    <View className="gap-y-4">
                        <View>
                            <Text className="font-medium text-[16px]">Parcel {item.id} </Text>
                        </View>
                        <View className="flex-row items-center gap-x-2">
                            <View className="w-3 h-3 bg-blue-500 rounded-full" />
                            <View className="flex-1">
                                <Text className="font-semibold"> {item.pickup_location?.name} </Text>
                                <Text className="text-gray-600">10.08.2025, 10:00</Text>
                            </View>
                        </View>

                        <View className="flex-row items-center gap-x-2">

                            <View className="w-3 h-3 bg-blue-900 rounded-full" />
                            <View className="flex-1">
                                <Text className="font-semibold"> {item.delivery_location?.name} </Text>
                                <Text className="text-gray-600">10.08.2025, 15:00</Text>
                            </View>
                        </View>
                        <View className="flex-row items-center gap-x-[8px]">
                            <View className="rounded-[80px]">
                                <Text className="py-[2px] px-[6px] bg-[#DCEDFF] ">{item.package_weight} </Text>
                            </View>
                            <View className="rounded-[80px]">
                                <Text className="py-[2px] px-[6px] bg-[#DCEDFF] "> {item.package_dimensions} </Text>
                            </View>
                        </View>
                        <View className="flex-row items-center gap-x-[8px]">
                            <View className="rounded-[80px]">
                                <Text className="py-[2px] px-[6px] bg-[#DCEDFF] ">{item.shipment_description} </Text>
                            </View>
                        </View>
                    </View>
                </View>
            </View>
        </Pressable>
    )
}

export default ItemOrder