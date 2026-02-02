import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, Card, SegmentedButtons, HelperText, ActivityIndicator } from 'react-native-paper';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';
import { useSettings } from './providers/SettingsProvider';
import { logEvent, logError, logScreen } from '../services/telemetry';

export default function AuthScreen() {
  const { paperTheme, appearance } = useSettings();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordRepeat, setPasswordRepeat] = useState('');
  const [step, setStep] = useState('email'); // 'email' or 'code'
  const [mode, setMode] = useState('otp'); // 'otp', 'login', 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const styles = useMemo(() => makeStyles(appearance), [appearance]);

  React.useEffect(() => {
    logScreen('auth', { mode });
  }, [mode]);

  const handleRequestOtp = async () => {
    if (!email) {
      Alert.alert('Error', 'Por favor ingresa tu email');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await authAPI.requestOtp(email);
      setStep('code');
      Alert.alert('Código enviado', 'Revisa tu email para el código de verificación');
      logEvent('auth_request_otp_success');
    } catch (error) {
      setError('No se pudo enviar el código');
      logError(error, { stage: 'request_otp' });
      Alert.alert('Error', 'No se pudo enviar el código');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async () => {
    if (!code) {
      Alert.alert('Error', 'Por favor ingresa el código');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await authAPI.verifyOtp(email, code);
      await AsyncStorage.setItem('token', response.data.access_token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      router.replace('/home');
      logEvent('auth_verify_success');
    } catch (error) {
      setError('Código inválido');
      logError(error, { stage: 'verify_otp' });
      Alert.alert('Error', 'Código inválido');
    }
    setLoading(false);
  };

  const handleLoginPassword = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Ingresa email y contraseña');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await authAPI.loginPassword(email, password);
      await AsyncStorage.setItem('token', response.data.access_token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      router.replace('/home');
      logEvent('auth_login_success');
    } catch (error) {
      setError('Credenciales inválidas');
      logError(error, { stage: 'login_password' });
      Alert.alert('Error', 'Credenciales inválidas');
    }
    setLoading(false);
  };

  const handleRegisterPassword = async () => {
    if (!email || !password || !passwordRepeat) {
      Alert.alert('Error', 'Completa email y contraseña');
      return;
    }
    if (password !== passwordRepeat) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await authAPI.registerPassword(email, password);
      await AsyncStorage.setItem('token', response.data.access_token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      router.replace('/home');
      logEvent('auth_register_success');
    } catch (error) {
      setError('No se pudo registrar (¿ya tienes contraseña?)');
      logError(error, { stage: 'register_password' });
      Alert.alert('Error', 'No se pudo registrar (¿ya tienes contraseña?)');
    }
    setLoading(false);
  };

  const renderOtp = () => (
    <>
      {step === 'email' ? (
        <>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            mode="outlined"
            keyboardType="email-address"
            autoCapitalize="none"
            style={styles.input}
          />
          <Button
            mode="contained"
            onPress={handleRequestOtp}
            loading={loading}
            style={styles.button}
          >
            Enviar Código
          </Button>
        </>
      ) : (
        <>
          <TextInput
            label="Código de verificación"
            value={code}
            onChangeText={setCode}
            mode="outlined"
            keyboardType="numeric"
            style={styles.input}
          />
          <Button
            mode="contained"
            onPress={handleVerifyOtp}
            loading={loading}
            style={styles.button}
          >
            Verificar
          </Button>
          <Button
            mode="text"
            onPress={() => setStep('email')}
            style={styles.backButton}
          >
            Cambiar Email
          </Button>
        </>
      )}
    </>
  );

  const renderLogin = () => (
    <>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        mode="outlined"
        secureTextEntry
        style={styles.input}
      />
      <Button mode="contained" onPress={handleLoginPassword} loading={loading} style={styles.button}>
        Iniciar sesión
      </Button>
    </>
  );

  const renderRegister = () => (
    <>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        mode="outlined"
        secureTextEntry
        style={styles.input}
      />
      <TextInput
        label="Repetir contraseña"
        value={passwordRepeat}
        onChangeText={setPasswordRepeat}
        mode="outlined"
        secureTextEntry
        style={styles.input}
      />
      <Button mode="contained" onPress={handleRegisterPassword} loading={loading} style={styles.button}>
        Registrarme
      </Button>
    </>
  );

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.brandTitle}>BAHIA GO</Text>
          <Text style={styles.subtitle}>Alquiler de embarcaciones en Cartagena</Text>

          <SegmentedButtons
            value={mode}
            onValueChange={setMode}
            buttons={[
              { value: 'otp', label: 'OTP' },
              { value: 'login', label: 'Contraseña' },
              { value: 'register', label: 'Crear cuenta' },
            ]}
            style={{ marginBottom: 16 }}
          />

          {mode === 'otp' && renderOtp()}
          {mode === 'login' && renderLogin()}
          {mode === 'register' && renderRegister()}

          {!!error && <HelperText type="error" visible>{error}</HelperText>}
          {loading && (
            <View style={styles.loadingRow}>
              <ActivityIndicator animating color={paperTheme.colors.primary} />
              <Text style={styles.loadingText}>Procesando...</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </View>
  );
}

const makeStyles = (mode) => {
  const isDark = mode === 'dark';
  const background = isDark ? '#0B0E14' : '#FFFFFF';
  const surface = isDark ? '#10141D' : '#FFFFFF';
  const border = isDark ? '#1C2331' : '#E9ECEF';
  const primary = isDark ? '#FF8A5C' : '#FF8A5C';
  const secondary = isDark ? '#C3C7D3' : '#3C3C43';
  const text = isDark ? '#F7F8FA' : '#0B0E14';

  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      padding: 20,
      backgroundColor: background,
    },
    card: {
      backgroundColor: surface,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.4 : 0.1,
      shadowRadius: 4,
      elevation: 3,
      borderWidth: 1,
      borderColor: border,
    },
    brandTitle: {
      textAlign: 'center',
      fontSize: 32,
      fontWeight: '700',
      color: primary,
      letterSpacing: 2,
      marginTop: 16,
      marginBottom: 16,
    },
    subtitle: {
      fontSize: 16,
      textAlign: 'center',
      color: secondary,
      marginBottom: 32,
    },
    input: {
      marginBottom: 16,
    },
    button: {
      marginTop: 16,
    },
    backButton: {
      marginTop: 8,
    },
    loadingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 12,
    },
    loadingText: {
      color: text,
    },
  });
};