import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSettings } from '../providers/SettingsProvider';

export default function PaymentReturnScreen() {
  const params = useLocalSearchParams();
  const { appearance, paperTheme, t } = useSettings();
  const styles = useMemo(() => makeStyles(appearance, paperTheme), [appearance, paperTheme]);
  const router = useRouter();

  const status = (params?.status || params?.transaction?.status || '').toString().toUpperCase();
  const reference = params?.reference || params?.id || params?.transaction_id || params?.transaction?.id;

  const getMessage = () => {
    if (status === 'APPROVED') return t('paymentReturnSuccess');
    if (status === 'PENDING') return t('paymentReturnPending');
    return t('paymentReturnFailed');
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{t('paymentReturnTitle')}</Text>
        <Text style={styles.body}>{getMessage()}</Text>
        {reference ? (
          <Text style={styles.reference}>{`${t('paymentReference')}: ${reference}`}</Text>
        ) : null}
        <Button
          mode="contained"
          style={styles.button}
          buttonColor={paperTheme.colors.primary}
          textColor={paperTheme.colors.onPrimary || '#0B0E14'}
          onPress={() => router.replace('/(tabs)/bookings')}
        >
          {t('goToBookings')}
        </Button>
      </View>
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
      justifyContent: 'center',
      alignItems: 'center',
      padding: 20,
      backgroundColor: background,
    },
    card: {
      width: '100%',
      backgroundColor: surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: border,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: primaryText,
      marginBottom: 10,
      textAlign: 'center',
    },
    body: {
      fontSize: 16,
      color: secondaryText,
      textAlign: 'center',
      marginBottom: 10,
    },
    reference: {
      fontSize: 14,
      color: secondaryText,
      textAlign: 'center',
      marginBottom: 16,
    },
    button: {
      borderRadius: 12,
      marginTop: 6,
    },
  });
};
