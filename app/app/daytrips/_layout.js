import { Stack } from 'expo-router';

export default function DaytripsLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTitleAlign: 'center',
        headerTintColor: '#007AFF',
        headerBackTitleVisible: false,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen
        name="index"
        options={{ title: 'Pasadías' }}
      />
      <Stack.Screen
        name="[id]"
        options={{ title: 'Detalle', gestureEnabled: true }}
      />
    </Stack>
  );
}
