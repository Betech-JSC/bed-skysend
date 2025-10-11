import { View, Text } from 'react-native'
import React from 'react'

const Profile = () => {
    return (
        <View>
            <Text>Profile</Text>
            <View className='flex-row space-x-[12px]'>
                <View>Thay đổi vai trò</View>
                <View>Xem hồ sơ</View>
            </View>
        </View>
    )
}

export default Profile