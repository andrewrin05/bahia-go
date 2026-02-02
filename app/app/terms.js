import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSettings } from '../providers/SettingsProvider';

const SUPPORT_EMAIL = 'soporte@bahiago.com';

export default function TermsScreen() {
  const { appearance, paperTheme, t } = useSettings();
  const styles = useMemo(() => makeStyles(appearance, paperTheme), [appearance, paperTheme]);
  const router = useRouter();

  const section = (title, content) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      {Array.isArray(content)
        ? content.map((item, idx) => (
            <View key={idx} style={styles.bulletRow}>
              <View style={styles.bullet} />
              <Text style={styles.body}>{item}</Text>
            </View>
          ))
        : <Text style={styles.body}>{content}</Text>}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={22} color={styles.headerTitle.color} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('termsTitle')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t('termsTitle')}</Text>
          <Text style={styles.body}>{t('termsIntro')}</Text>
        </View>

        {section(t('termsScope'), t('termsScopeItems'))}
        {section(t('termsBookings'), t('termsBookingsItems'))}
        {section(t('termsPayments'), t('termsPaymentsItems'))}
        {section(t('termsConduct'), t('termsConductItems'))}
        {section(t('termsLiability'), t('termsLiabilityItems'))}
        {section(t('termsChanges'), t('termsChangesBody'))}
        {section(t('termsContact'), `${t('termsContactBody')} ${SUPPORT_EMAIL}`)}
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
      flex: 1,
    },
    bulletRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 8,
      marginBottom: 6,
    },
    bullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: paperTheme.colors.primary || '#007AFF',
      marginTop: 6,
    },
  });
};
