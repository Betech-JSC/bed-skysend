import { Tabs } from 'expo-router';
import { TouchableOpacity, View, Text, StyleSheet, Image } from 'react-native';

export default function HomeTabsLayout() {
  return (
    <Tabs
    >

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