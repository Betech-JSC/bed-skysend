import { router } from "expo-router";
import { Image, Pressable, Text, View, Platform, Button } from "react-native";
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import * as Notifications from 'expo-notifications';
import * as Permissions from 'expo-permissions';

import '../global.css';
import { NotificationService } from "@/NotificationService";

export default function Page() {

  useEffect(() => {
    NotificationService.setup();
  }, []);

  useEffect(() => {

    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification received:', notification);
    });

    return () => subscription.remove();
  }, []);

  const sendTest = async () => {
    await NotificationService.sendLocalNotification({
      title: "SkySend",
      body: "Bạn có thông báo mới!",
      attachments: [{ url: "@assets/icon.png" }], // hình lớn notification
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      <View className="flex-1 justify-center p-[20px] bg-white h-full gap-y-[20px]">
        <View className="flex-row items-center justify-between">
          <View>
            <Image className="w-[50px] h-[50px]" source={require("../assets/icon.png")} />
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
            onPress={() => router.push("roles")}
            className="bg-[#0D6EFD]  py-[14px] px-[32px] rounded-[14px]"
          >
            <Text className="text-white">Next</Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}


