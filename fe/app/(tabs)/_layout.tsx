import { Tabs } from 'expo-router';
import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';

export default function HomeTabsLayout() {
  return (
    <Tabs>
      {/* Home Tab */}
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('@assets/images/navigation/home.webp')}
              style={{ width: size, height: size, tintColor: color }}
            />
          ),
        }}
      />

      {/* List Orders Tab */}
      <Tabs.Screen
        name="list_orders"
        options={{
          title: 'Đơn hàng',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('@assets/images/navigation/order.webp')}
              style={{ width: size, height: size, tintColor: color }}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="create_order"
        options={{
          tabBarLabel: () => null,
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

      {/* Chat Tab */}
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('@assets/images/navigation/chat.webp')}
              style={{ width: size, height: size, tintColor: color }}
            />
          ),
        }}
      />

      {/* Profile Tab */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('@assets/images/navigation/user.webp')}
              style={{ width: size, height: size, tintColor: color }}
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
