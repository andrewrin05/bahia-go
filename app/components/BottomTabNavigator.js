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
    router.push(`/${route.key}`);
  };

  return (
    <BottomNavigation
      navigationState={{ index, routes }}
      onIndexChange={handleIndexChange}
      renderScene={renderScene}
      barStyle={styles.bar}
      activeColor="#00C853"
      inactiveColor="#CCCCCC"
    />
  );
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: '#1E1E1E',
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
});