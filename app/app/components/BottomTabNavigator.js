import React from 'react';
import { View, StyleSheet } from 'react-native';
import { BottomNavigation } from 'react-native-paper';
import { router } from 'expo-router';

const routes = [
  { key: 'home', title: 'Inicio', icon: 'home' },
  { key: 'favorites', title: 'Favoritos', icon: 'heart' },
  { key: 'bookings', title: 'Reservas', icon: 'calendar' },
  { key: 'messages', title: 'Mensajes', icon: 'message' },
  { key: 'profile', title: 'Perfil', icon: 'account' },
];

export default function BottomTabNavigator({ index, setIndex }) {
  const renderScene = BottomNavigation.SceneMap({
    home: () => null,
    favorites: () => null,
    bookings: () => null,
    messages: () => null,
    profile: () => null,
  });

  const handleIndexChange = (newIndex) => {
    setIndex(newIndex);
    const route = routes[newIndex];
    router.push(`/(tabs)/${route.key}`);
  };

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={handleIndexChange}
      renderScene={renderScene}
      barStyle={styles.bar}
      activeColor="#007AFF"
      inactiveColor="#8E8E93"
    />
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
  },
});