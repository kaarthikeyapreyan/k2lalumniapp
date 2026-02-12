import { Tabs } from 'expo-router';
import React from 'react';
import { Icon } from '@rneui/themed';
import { View } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#007AFF',
        headerShown: true,
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Icon name="home" type="feather" color={color} />,
        }}
      />
      <Tabs.Screen
        name="directory"
        options={{
          title: 'Alumni',
          tabBarIcon: ({ color }) => <Icon name="users" type="feather" color={color} />,
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          title: 'Groups',
          tabBarIcon: ({ color }) => (
            <Icon name="users" type="feather" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="create-post"
        options={{
          title: '',
          tabBarIcon: ({ color }) => (
            <View style={{
              backgroundColor: '#007AFF',
              width: 50,
              height: 50,
              borderRadius: 25,
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: -10,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 4.65,
              elevation: 8,
            }}>
              <Icon name="plus" type="feather" color="white" size={30} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: 'Events',
          tabBarIcon: ({ color }) => <Icon name="calendar" type="feather" color={color} />,
        }}
      />
      <Tabs.Screen
        name="jobs"
        options={{
          title: 'Jobs',
          tabBarIcon: ({ color }) => <Icon name="briefcase" type="feather" color={color} />,
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Messages',
          tabBarIcon: ({ color }) => <Icon name="message-square" type="feather" color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Icon name="user" type="feather" color={color} />,
        }}
      />
    </Tabs>
  );
}
