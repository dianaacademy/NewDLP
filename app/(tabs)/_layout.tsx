// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarActiveTintColor: '#f3a683',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="Mylearning"
        options={{
          title: "Mylearning",
          tabBarActiveTintColor: '#f3a683',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="clipboard-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="Community"
        options={{
          title: "Community",
          tabBarActiveTintColor: '#f3a683',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="people-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarActiveTintColor: '#f3a683',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="person-outline" color={color} />,
        }}
      />
    </Tabs>
  );
}