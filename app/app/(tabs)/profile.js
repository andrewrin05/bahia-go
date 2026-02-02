import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, Alert, ScrollView, Pressable } from 'react-native';
import { Text, Button, Avatar } from 'react-native-paper';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../services/api';
import { useSettings } from '../../providers/SettingsProvider';

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const {
    language,
    currency,
    appearance,
    toggleLanguage,
    toggleCurrency,
    toggleAppearance,
    t,
  } = useSettings();

  const styles = useMemo(() => makeStyles(appearance), [appearance]);
  const isDark = appearance === 'dark';

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }
      setIsLoggedIn(true);
      const response = await api.get('/auth/profile');
      if (response.data) {
        setUser(response.data);
      } else {
        console.warn('Invalid profile response:', response.data);
        setUser(null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      Alert.alert(t('errorProfileTitle'), t('errorProfileBody'));
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      t('logoutConfirmTitle'),
      t('logoutConfirmBody'),
      [
        { text: t('logoutCancel'), style: 'cancel' },
        {
          text: t('logoutConfirm'),
          onPress: async () => {
            await AsyncStorage.removeItem('token');
            router.push('/auth');
          },
        },
      ]
    );
  };

  const handleToggleLanguage = () => {
    const next = language === 'es' ? 'en' : 'es';
    toggleLanguage();
    Alert.alert(t('languageLabel'), next === 'es' ? t('languageSelectedES') : t('languageSelectedEN'));
  };

  const handleToggleCurrency = () => {
    const next = currency === 'COP' ? 'USD' : 'COP';
    toggleCurrency();
    Alert.alert(t('currencyLabel'), next === 'COP' ? t('currencySelectedCOP') : t('currencySelectedUSD'));
  };

  const handleToggleAppearance = () => {
    const next = appearance === 'dark' ? 'light' : 'dark';
    toggleAppearance();
    Alert.alert(t('appearanceLabel'), next === 'dark' ? t('appearanceSelectedDark') : t('appearanceSelectedLight'));
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.muted}>{t('loadingProfile')}</Text>
      </View>
    );
  }

  const renderSettingRow = (label, value, onPress) => (
    <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]} onPress={onPress}>
      <Text style={styles.rowLabel}>{label}</Text>
      <View style={styles.rowRight}>
        <Text style={styles.rowValue}>{value}</Text>
        <MaterialCommunityIcons name="chevron-right" size={22} color="#8D93A5" />
      </View>
    </Pressable>
  );

  const renderHelpRow = (label, onPress) => (
    <Pressable style={({ pressed }) => [styles.row, pressed && styles.rowPressed]} onPress={onPress}>
      <Text style={styles.rowLabel}>{label}</Text>
      <MaterialCommunityIcons name="chevron-right" size={22} color="#8D93A5" />
    </Pressable>
  );

  const HeaderHero = () => (
    <View style={styles.hero}>
      <Text style={styles.heroTitle}>{t('profileTitle')}</Text>
      <Text style={styles.heroSubtitle}>{t('profileSubtitle')}</Text>
      {!isLoggedIn ? (
        <Button
          mode="contained"
          onPress={() => router.push('/auth')}
          style={styles.ctaButton}
          buttonColor={isDark ? '#4DA3FF' : '#007AFF'}
          textColor={isDark ? '#0B0E14' : '#FFFFFF'}
        >
          {t('ctaLogin')}
        </Button>
      ) : (
        <View style={styles.userCard}>
          <Avatar.Text
            size={64}
            label={user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            style={styles.avatar}
            color="#0B0E14"
          />
          <View style={styles.userInfo}>
            <Text style={styles.name}>{user?.name || t('userFallback')}</Text>
            <Text style={styles.email}>{user?.email || t('emailUnavailable')}</Text>
            <Text style={styles.phone}>{user?.phone ? `+${user.phone}` : t('phoneUnavailable')}</Text>
            {user?.role ? <Text style={styles.role}>{`${t('roleLabel')}: ${user.role}`}</Text> : null}
          </View>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <HeaderHero />

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('settingsTitle')}</Text>
          {renderSettingRow(t('currencyLabel'), currency === 'COP' ? t('currencyCOP') : t('currencyUSD'), handleToggleCurrency)}
          {renderSettingRow(t('languageLabel'), language === 'es' ? t('languageES') : t('languageEN'), handleToggleLanguage)}
          {renderSettingRow(t('appearanceLabel'), appearance === 'dark' ? t('appearanceDark') : t('appearanceLight'), handleToggleAppearance)}
          {renderSettingRow(t('notificationsLabel'), t('notificationsSoon'), () => Alert.alert(t('notificationsLabel'), t('notificationsSoon')))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{t('helpTitle')}</Text>
          {renderHelpRow(t('aboutLegal'), () => router.push('/about'))}
          {renderHelpRow(t('helpCenter'), () => Alert.alert(t('helpCenter'), t('helpCenterBody')))}
        </View>

        {isLoggedIn ? (
          <View style={styles.section}>
            <Button
              mode="contained"
              onPress={handleLogout}
              style={styles.logoutButton}
              buttonColor="#FF5555"
            >
              {t('logout')}
            </Button>
            {user?.role === 'ADMIN' && (
              <Button
                mode="contained"
                onPress={() => router.push('/admin/boats/create')}
                style={styles.adminButton}
                buttonColor="#4DA3FF"
                textColor="#0B0E14"
              >
                {t('adminPublish')}
              </Button>
            )}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const makeStyles = (mode) => {
  const isDark = mode === 'dark';
  const background = isDark ? '#0B0E14' : '#FFFFFF';
  const surface = isDark ? '#10141D' : '#F2F4F7';
  const border = isDark ? '#1C2331' : '#E3E6ED';
  const primaryText = isDark ? '#F7F8FA' : '#0B0E14';
  const secondaryText = isDark ? '#C3C7D3' : '#4A4F5C';
  const mutedText = isDark ? '#9FA5B5' : '#6C7280';
  const pressed = isDark ? '#121826' : '#E9ECF5';

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: background,
    },
    scrollContent: {
      padding: 20,
      paddingBottom: 96,
    },
    hero: {
      backgroundColor: surface,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: border,
    },
    heroTitle: {
      color: primaryText,
      fontSize: 28,
      fontWeight: '800',
      marginBottom: 10,
    },
    heroSubtitle: {
      color: secondaryText,
      fontSize: 15,
      lineHeight: 22,
      marginBottom: 16,
    },
    ctaButton: {
      borderRadius: 14,
      paddingVertical: 4,
    },
    userCard: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    avatar: {
      backgroundColor: '#4DA3FF',
      marginRight: 12,
    },
    userInfo: {
      flex: 1,
    },
    name: {
      color: primaryText,
      fontSize: 18,
      fontWeight: '700',
    },
    email: {
      color: secondaryText,
      marginTop: 4,
    },
    phone: {
      color: mutedText,
      marginTop: 2,
    },
    role: {
      color: '#9BD26A',
      marginTop: 4,
    },
    section: {
      backgroundColor: surface,
      borderRadius: 16,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: border,
    },
    sectionLabel: {
      color: primaryText,
      fontSize: 16,
      fontWeight: '700',
      marginBottom: 6,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderColor: border,
    },
    rowPressed: {
      backgroundColor: pressed,
    },
    rowLabel: {
      color: primaryText,
      fontSize: 15,
    },
    rowRight: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    rowValue: {
      color: mutedText,
      fontSize: 14,
      marginRight: 6,
    },
    logoutButton: {
      marginTop: 4,
      borderRadius: 12,
    },
    adminButton: {
      marginTop: 10,
      borderRadius: 12,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: background,
      padding: 24,
    },
    muted: {
      color: mutedText,
    },
  });
};