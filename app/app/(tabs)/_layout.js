import { Tabs } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSettings } from '../../providers/SettingsProvider';

export default function TabsLayout() {
  const { paperTheme, appearance, t } = useSettings();
  const isDark = appearance === 'dark';
  const bg = paperTheme.colors.surface || (isDark ? '#10141D' : '#FFFFFF');
  const border = paperTheme.colors.outline || (isDark ? '#1C2331' : '#E9ECEF');
  const headerBg = paperTheme.colors.background || (isDark ? '#0B0E14' : '#FFFFFF');
  const headerText = paperTheme.colors.onSurface || (isDark ? '#F7F8FA' : '#1C1C1E');
  const active = paperTheme.colors.primary || '#007AFF';
  const inactive = isDark ? '#9FA5B5' : '#8E8E93';

  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        sceneStyle: {
          backgroundColor: paperTheme.colors.background || (isDark ? '#0B0E14' : '#FFFFFF'),
        },
        tabBarStyle: {
          backgroundColor: bg,
          borderTopWidth: 1,
          borderTopColor: border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 8,
        },
        tabBarActiveTintColor: active,
        tabBarInactiveTintColor: inactive,
        headerStyle: {
          backgroundColor: headerBg,
          borderBottomWidth: 1,
          borderBottomColor: border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: isDark ? 0.25 : 0.1,
          shadowRadius: isDark ? 6 : 4,
          elevation: isDark ? 6 : 4,
        },
        headerTintColor: headerText,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 17,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="home" color={color} size={size} />
          ),
          title: t('tabHome'),
        }}
      />
      <Tabs.Screen
        name="daytrips"
        options={{
          title: t('tabDaytrips'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="beach" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: t('tabBookings'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="calendar-check" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: t('tabFavorites'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="heart" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: t('tabMessages'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="message" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('tabProfile'),
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="account" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}