import React, { useState } from "react";
import ItemOrder from "./components/ItemOrder";
import { Stack, useRouter } from "expo-router";
import { View, Text, TouchableOpacity } from "react-native";

import DateTimePicker from "@react-native-community/datetimepicker";
import { MaterialIcons, Entypo } from '@expo/vector-icons'; // Icons


function create_order() {

    const [date, setDate] = useState(new Date());
    const [showDate, setShowDate] = useState(false);
    const [showTime, setShowTime] = useState(false);

    const onChange = (event, selectedDate) => {
        const currentDate = selectedDate || date;
        setDate(currentDate);

        if (event.type === "set") {
            setShowDate(false);  // Close Date picker after selection
            setShowTime(false);  // Close Time picker after selection
        }
    };

    return (
        <>
            <Stack.Screen
                options={{
                    title: "Login",
                }}
            />
            <View className="p-4">
                <Text className="text-lg font-bold mb-2">Thời gian khởi hành</Text>
                <View>
                    <View className="flex-row justify-between">
                        {/* Date Picker Button */}
                        <TouchableOpacity
                            className="flex-row items-center justify-center bg-gray-200 p-3 rounded-xl w-1/2 mr-2"
                            onPress={() => setShowDate(true)} // Show Date picker when pressed
                        >
                            <MaterialIcons name="calendar-today" size={24} color="blue" />
                            <Text className="ml-2 text-base text-gray-800">Ngày</Text>
                        </TouchableOpacity>

                        {/* Time Picker Button */}
                        <TouchableOpacity
                            className="flex-row items-center justify-center bg-gray-200 p-3 rounded-xl w-1/2 ml-2"
                            onPress={() => setShowTime(true)} // Show Time picker when pressed
                        >
                            <Entypo name="clock" size={24} color="blue" />
                            <Text className="ml-2 text-base text-gray-800">Giờ</Text>
                        </TouchableOpacity>
                    </View>
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        onChange={onChange} // This will close the picker after selection
                    />
                    <DateTimePicker
                        value={date}
                        mode="time"
                        display="default"
                        onChange={onChange} // This will close the picker after selection
                    />
                </View>
                <View>
                    <View className="flex-row justify-between">
                        {/* Date Picker Button */}
                        <TouchableOpacity
                            className="flex-row items-center justify-center bg-gray-200 p-3 rounded-xl w-1/2 mr-2"
                            onPress={() => setShowDate(true)} // Show Date picker when pressed
                        >
                            <MaterialIcons name="calendar-today" size={24} color="blue" />
                            <Text className="ml-2 text-base text-gray-800">Ngày</Text>
                        </TouchableOpacity>

                        {/* Time Picker Button */}
                        <TouchableOpacity
                            className="flex-row items-center justify-center bg-gray-200 p-3 rounded-xl w-1/2 ml-2"
                            onPress={() => setShowTime(true)} // Show Time picker when pressed
                        >
                            <Entypo name="clock" size={24} color="blue" />
                            <Text className="ml-2 text-base text-gray-800">Giờ</Text>
                        </TouchableOpacity>
                    </View>
                    <DateTimePicker
                        value={date}
                        mode="date"
                        display="default"
                        onChange={onChange} // This will close the picker after selection
                    />
                    <DateTimePicker
                        value={date}
                        mode="time"
                        display="default"
                        onChange={onChange} // This will close the picker after selection
                    />
                </View>
            </View>
        </>
    )
}

export default create_order