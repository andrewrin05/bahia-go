import { MD3LightTheme } from 'react-native-paper';

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#007AFF', // GetYourGuide blue
    secondary: '#5AC8FA', // Light blue accent
    background: '#FFFFFF', // White background
    surface: '#F8F9FA', // Light gray surface
    surfaceVariant: '#E9ECEF', // Lighter gray for cards
    onSurface: '#1C1C1E', // Dark text
    onSurfaceVariant: '#3C3C43', // Medium gray text
    text: '#1C1C1E', // Dark text
    onPrimary: '#FFFFFF', // White text on blue
    onSecondary: '#FFFFFF', // White text on light blue
    outline: '#C6C6C8', // Light border color
    outlineVariant: '#D1D1D6', // Lighter border
  },
};