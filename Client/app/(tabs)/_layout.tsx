import {Tabs, useRouter } from 'expo-router';
import { View, TouchableOpacity, Alert, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import {
  Menu,
  MenuOptions,
  MenuOption,
  MenuTrigger,
} from 'react-native-popup-menu';
import { handleLogoutofApp } from '@/Database/ChatQuery';

const MenuDropdown = () => {
  const router = useRouter();

  const handleLogout=async()=>{
    await handleLogoutofApp();
    router.replace('/login')
  }

  return (
    <Menu>
      <MenuTrigger>
        <Ionicons name="ellipsis-vertical" size={22} color="#fff" />
      </MenuTrigger>
      <MenuOptions
        customStyles={{
          optionsContainer: {
            marginTop: 30,
            padding: 5,
            borderRadius: 6,
          },
        }}
      >
        <MenuOption onSelect={() => router.push('/settings')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 3, gap: 10 }}>
            <Ionicons name="settings-outline" size={18} />
            <Text style={{ fontSize: 16 }}>Settings</Text>
          </View>
        </MenuOption>

        <MenuOption onSelect={() => {
          handleLogout();
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 3, gap: 10 }}>
            <Ionicons name="log-out-outline" size={18} />
            <Text style={{ fontSize: 16 }}>Logout</Text>
          </View>
        </MenuOption>
      </MenuOptions>
    </Menu>
  );
};



export default function TabLayout() {
  return (
    <Tabs
    screenOptions={{
      tabBarActiveTintColor: '#25D366',
      tabBarInactiveTintColor: '#aaa',
      headerStyle: { backgroundColor: '#25292e' },
      headerShadowVisible: false,
      headerTintColor: '#fff',
      tabBarStyle: { backgroundColor: '#25292e' },
      tabBarLabelStyle: { fontSize: 12 },
    }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Chats',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
              color={color}
              size={24}
            />
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 16, marginRight: 10 }}>
              <TouchableOpacity onPress={() => console.log('Camera pressed in Chats')}>
                <Ionicons name="camera-outline" size={22} color="#fff" />
              </TouchableOpacity>
              <MenuDropdown />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="Updates"
        options={{
          title: 'Updates',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'notifications' : 'notifications-outline'}
              color={color}
              size={24}
            />
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 16, marginRight: 10 }}>
              <TouchableOpacity onPress={() => console.log('Search pressed in Updates')}>
                <Ionicons name="search" size={22} color="#fff" />
              </TouchableOpacity>
              <MenuDropdown />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="Community"
        options={{
          title: 'Community',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'people' : 'people-outline'}
              color={color}
              size={24}
            />
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 16, marginRight: 10 }}>
              <MenuDropdown />
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="Call"
        options={{
          title: 'Calls',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'call' : 'call-outline'}
              color={color}
              size={24}
            />
          ),
          headerRight: () => (
            <View style={{ flexDirection: 'row', gap: 16, marginRight: 10 }}>
              <TouchableOpacity onPress={() => console.log('Search pressed in Calls')}>
                <Ionicons name="search" size={22} color="#fff" />
              </TouchableOpacity>
              <MenuDropdown />
            </View>
          ),
        }}
      />
  </Tabs>
);
}