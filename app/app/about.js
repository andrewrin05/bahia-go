import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet, Linking, TouchableOpacity } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useRouter } from 'expo-router';
import { useSettings } from '../providers/SettingsProvider';

const SUPPORT_EMAIL = 'soporte@bahiago.com';

export default function AboutScreen() {
  const { appearance, paperTheme, t } = useSettings();
  const styles = useMemo(() => makeStyles(appearance, paperTheme), [appearance, paperTheme]);
  const router = useRouter();

  const openLink = async (url) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.warn('No se pudo abrir el enlace', url, error);
    }
  };

  const appVersion = Constants.expoConfig?.version || Constants.manifest?.version || '1.0.0';

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={styles.headerTitle.color} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('aboutLegal')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('about')}</Text>
          <Text style={styles.body}>{t('aboutDescription')}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>{t('versionLabel')}</Text>
            <Text style={styles.metaValue}>{appVersion}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('supportTitle')}</Text>
          <Text style={styles.body}>{t('supportEmailLabel')} {SUPPORT_EMAIL}</Text>
          <Button
            mode="contained"
            style={styles.button}
            buttonColor={paperTheme.colors.primary}
            textColor={paperTheme.colors.onPrimary || '#0B0E14'}
            onPress={() => openLink(`mailto:${SUPPORT_EMAIL}`)}
          >
            {SUPPORT_EMAIL}
          </Button>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('legalTitle')}</Text>
          <Text style={styles.body}>{t('legalDisclaimer')}</Text>
          <Button
            mode="outlined"
            style={styles.button}
            textColor={paperTheme.colors.primary}
            onPress={() => router.push('/privacy')}
          >
            {t('privacyPolicy')}
          </Button>
          <Button
            mode="outlined"
            style={styles.button}
            textColor={paperTheme.colors.primary}
            onPress={() => router.push('/terms')}
          >
            {t('termsOfService')}
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

const makeStyles = (mode, paperTheme) => {
  const isDark = mode === 'dark';
  const background = paperTheme.colors.background || (isDark ? '#0B0E14' : '#FFFFFF');
  const surface = paperTheme.colors.surface || (isDark ? '#10141D' : '#FFFFFF');
  const border = paperTheme.colors.outline || (isDark ? '#1C2331' : '#E3E6ED');
  const primaryText = paperTheme.colors.onSurface || (isDark ? '#F7F8FA' : '#0B0E14');
  const secondaryText = isDark ? '#C3C7D3' : '#4A4F5C';

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderColor: border,
      backgroundColor: surface,
    },
    backButton: {
      padding: 6,
      borderRadius: 8,
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      color: primaryText,
      fontSize: 17,
      fontWeight: '700',
    },
    headerSpacer: {
      width: 32,
    },
    content: {
      padding: 16,
      paddingBottom: 48,
    },
    card: {
      backgroundColor: surface,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: border,
      marginBottom: 12,
    },
    cardTitle: {
      color: primaryText,
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 8,
    },
    body: {
      color: secondaryText,
      fontSize: 14,
      lineHeight: 20,
    },
    metaRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: 12,
    },
    metaLabel: {
      color: secondaryText,
      fontSize: 14,
    },
    metaValue: {
      color: primaryText,
      fontSize: 14,
      fontWeight: '600',
    },
    button: {
      marginTop: 10,
      borderRadius: 12,
    },
  });
};
