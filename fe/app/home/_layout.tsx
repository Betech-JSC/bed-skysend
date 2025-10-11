import { Tabs } from 'expo-router';
import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';
import { NativeWindStyleSheet } from 'nativewind';

NativeWindStyleSheet.setOutput({ default: 'native' });

export default function HomeTabsLayout() {
  return (
    <Tabs
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused, color, size }) => (
            <Image
              source={require('../../assets/images/navigation/home.webp')}
              style={{
                width: size,
                height: size,
                tintColor: color,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="list_orders"
        options={{
          title: 'Đơn hàng',
          tabBarIcon: ({ focused, color, size }) => (
            <Image
              source={require('../../assets/images/navigation/order.webp')}
              style={{
                width: size,
                height: size,
                tintColor: color,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="create_order"
        options={{
          tabBarIcon: () => (
            <View style={styles.plusButton}>
              <Text style={{ fontSize: 30, color: '#fff' }}>+</Text>
            </View>
          ),
          tabBarButton: (props) => (
            <TouchableOpacity {...props} style={styles.plusButtonContainer} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ focused, color, size }) => (
            <Image
              source={require('../../assets/images/navigation/chat.webp')}
              style={{
                width: size,
                height: size,
                tintColor: color,
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused, color, size }) => (
            <Image
              source={require('../../assets/images/navigation/user.webp')}
              style={{
                width: size,
                height: size,
                tintColor: color,
              }}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  plusButtonContainer: {
    top: -10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  plusButton: {
    width: 44,
    height: 44,
    borderRadius: 35,
    backgroundColor: '#FFD700',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 5,
  },
});