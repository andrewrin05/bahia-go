import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View } from 'react-native';
import { AppSettingsProvider, useSettings } from '../providers/SettingsProvider';

const ThemedShell = () => {
  const { paperTheme, statusBarStyle } = useSettings();
  return (
    <PaperProvider theme={paperTheme}>
      <View style={{ flex: 1, backgroundColor: paperTheme.colors.background }}>
        <Stack screenOptions={{ headerShown: false }} />
      </View>
      <StatusBar style={statusBarStyle} />
    </PaperProvider>
  );
};

export default function Layout() {
  return (
    <SafeAreaProvider>
      <AppSettingsProvider>
        <ThemedShell />
      </AppSettingsProvider>
    </SafeAreaProvider>
  );
}