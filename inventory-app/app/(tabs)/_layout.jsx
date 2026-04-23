import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
//Ndodhet ne folder tabs qe ndodhet brenda folderit app
export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2f95dc',
        headerShown: true, 
      }}
    >
      <Tabs.Screen
        name="myinventory" 
        options={{
          title: 'My Inventory',
          tabBarIcon: ({ color }) => <Ionicons name="cube" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore" 
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <Ionicons name="search" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="order" 
        options={{
          title: 'Order',
          tabBarIcon: ({ color }) => <Ionicons name="cart" size={26} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings" 
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <Ionicons name="settings" size={26} color={color} />,
        }}
      />
    </Tabs>
  );
}