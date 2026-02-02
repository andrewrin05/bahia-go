// Lightweight telemetry helpers. Swap implementations for Sentry/Analytics when available.
import { Platform } from 'react-native';
import Constants from 'expo-constants';

const IS_DEV = __DEV__;

const basePayload = () => ({
  platform: Platform.OS,
  appVersion: Constants.expoConfig?.version || 'unknown',
  build: Constants.expoConfig?.runtimeVersion || 'dev',
});

export const logEvent = (name, props = {}) => {
  if (IS_DEV) {
    console.log('[telemetry:event]', name, { ...basePayload(), ...props });
  }
  // Hook here a real analytics SDK when available.
};

export const logError = (error, context = {}) => {
  const payload = { ...basePayload(), ...context, message: error?.message, stack: error?.stack };
  console.warn('[telemetry:error]', payload);
  // Hook here Sentry/Bugsnag/etc.
};

export const logScreen = (screen, props = {}) => {
  if (IS_DEV) {
    console.log('[telemetry:screen]', screen, { ...basePayload(), ...props });
  }
};
