import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, FlatList, StyleSheet, Alert, Linking } from 'react-native';
import Constants from 'expo-constants';
import { Text, Card, Chip, Button } from 'react-native-paper';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../services/api';
import { useSettings } from '../../providers/SettingsProvider';
import { paymentsAPI } from '../../services/api';
import EmptyState from '../components/EmptyState';

export default function BookingsScreen() {
  const { appearance, paperTheme, t, currency, language } = useSettings();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const styles = useMemo(() => makeStyles(appearance, paperTheme), [appearance, paperTheme]);
  const [payingId, setPayingId] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }
      setIsLoggedIn(true);
      const response = await api.get('/bookings');
      if (response && response.data) {
        setBookings(response.data);
      } else {
        console.warn('API response is invalid:', response);
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      Alert.alert('Error', 'No se pudieron cargar las reservas');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#00C853';
      case 'pending': return '#FF9800';
      case 'cancelled': return '#FF4444';
      default: return '#CCCCCC';
    }
  };

  const getPaymentStatus = (booking) => booking?.paymentStatus || 'pending';

  const getPaymentColor = (paymentStatus) => {
    switch (paymentStatus) {
      case 'paid': return '#00C853';
      case 'failed': return '#FF4444';
      case 'cancelled': return '#FF4444';
      case 'pending_payment': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const redirectUrl = `${Constants.expoConfig?.scheme || 'bahia-go'}://payment-return`;

  const startPayment = useCallback(async (booking) => {
    try {
      setPayingId(booking.id);
      const resp = await paymentsAPI.createWompiCheckout(booking.id, { redirectUrl });
      const url = resp?.data?.checkoutUrl;
      if (url) {
        Linking.openURL(url);
      } else {
        Alert.alert(t('paymentError'));
      }
    } catch (error) {
      console.error('Error starting payment', error);
      Alert.alert(t('paymentError'));
    } finally {
      setPayingId(null);
    }
  }, [redirectUrl, t]);

  const renderBooking = useCallback(({ item }) => {
    if (!item || !item.boat) return null;

    const formatPrice = (value) => {
      try {
        return new Intl.NumberFormat(language === 'es' ? 'es-CO' : 'en-US', {
          style: 'currency',
          currency: currency === 'USD' ? 'USD' : 'COP',
          maximumFractionDigits: 0,
        }).format(value || 0);
      } catch (error) {
        return `${currency === 'USD' ? '$' : 'COP $'}${value || 0}`;
      }
    };

    const paymentStatus = getPaymentStatus(item);

    return (
      <Card
        style={styles.card}
        onPress={() => router.push(`/listings/${item.boat.id}`)}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`Ver reserva de ${item.boat.name || 'embarcación'}`}
      >
        <Card.Cover source={{ uri: item.boat.images && item.boat.images[0] || 'https://via.placeholder.com/300' }} />
        <Card.Content>
          <Text variant="titleMedium" style={styles.title}>{item.boat.name || 'Sin nombre'}</Text>
          <Text variant="bodyMedium" style={styles.location}>{item.boat.location || 'Sin ubicación'}</Text>
          <Text variant="bodyMedium" style={styles.dates}>
            {item.startDate ? new Date(item.startDate).toLocaleDateString() : 'Fecha no disponible'} - {item.endDate ? new Date(item.endDate).toLocaleDateString() : 'Fecha no disponible'}
          </Text>
          <Text variant="bodyMedium" style={styles.price}>{t('bookingsTotal')}: {formatPrice(item.totalPrice)}</Text>
          <Chip
            style={[styles.status, { backgroundColor: getStatusColor(item.status) }]}
            textStyle={{ color: '#FFFFFF' }}
          >
            {item.status === 'confirmed' ? 'Confirmada' :
             item.status === 'pending' ? 'Pendiente' :
             item.status === 'cancelled' ? 'Cancelada' : item.status || 'Desconocido'}
          </Chip>
          <Chip
            style={[styles.status, { backgroundColor: getPaymentColor(paymentStatus) }]}
            textStyle={{ color: '#FFFFFF' }}
          >
            {paymentStatus === 'paid' ? t('paymentPaid') :
             paymentStatus === 'failed' ? t('paymentFailed') :
             paymentStatus === 'pending_payment' ? t('paymentPending') : paymentStatus}
          </Chip>
        </Card.Content>
        {paymentStatus !== 'paid' && (
          <Card.Actions>
            <Button
              mode="contained"
              onPress={() => startPayment(item)}
              loading={payingId === item.id}
              disabled={payingId !== null}
              buttonColor={paperTheme.colors.primary}
              textColor={paperTheme.colors.onPrimary || '#0B0E14'}
              accessibilityLabel="Pagar reserva"
            >
              {t('payWithWompi')}
            </Button>
          </Card.Actions>
        )}
      </Card>
    );
  }, [currency, language, paperTheme.colors.onPrimary, paperTheme.colors.primary, startPayment, t]);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.secondaryText}>{t('bookingsLoading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={bookings}
        renderItem={renderBooking}
        keyExtractor={(item, index) => item?.id?.toString() || `booking-${index}`}
        contentContainerStyle={styles.list}
        initialNumToRender={6}
        windowSize={8}
        removeClippedSubviews
        getItemLayout={(_, index) => ({ length: 360, offset: 360 * index, index })}
        ListEmptyComponent={
          isLoggedIn ? (
            <EmptyState
              title={t('bookingsEmpty')}
              description={t('bookingsEmpty')}
              ctaLabel={t('bookingsLoading')}
              onPress={fetchBookings}
              testID="bookings-empty"
            />
          ) : (
            <EmptyState
              title={t('bookingsLoginTitle')}
              description={t('bookingsLoginSubtitle')}
              ctaLabel={t('bookingsLoginTitle')}
              onPress={() => router.push('/auth')}
              testID="bookings-login-empty"
            />
          )
        }
      />
    </View>
  );
}

const makeStyles = (mode, paperTheme) => {
  const isDark = mode === 'dark';
  const background = paperTheme.colors.background || (isDark ? '#0B0E14' : '#FFFFFF');
  const surface = paperTheme.colors.surface || (isDark ? '#10141D' : '#FFFFFF');
  const primaryText = paperTheme.colors.onSurface || (isDark ? '#F7F8FA' : '#1C1C1E');
  const secondaryText = isDark ? '#C3C7D3' : '#3C3C43';
  const border = paperTheme.colors.outline || (isDark ? '#1C2331' : '#E9ECEF');
  const accent = paperTheme.colors.primary || '#007AFF';

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: background,
    },
    list: {
      padding: 16,
      paddingBottom: 80,
    },
    card: {
      marginBottom: 16,
      backgroundColor: surface,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: border,
      shadowColor: isDark ? '#000000' : '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: isDark ? 0.4 : 0.1,
      shadowRadius: 6,
      elevation: 3,
    },
    title: {
      color: primaryText,
      marginBottom: 4,
    },
    location: {
      color: secondaryText,
      marginBottom: 4,
    },
    dates: {
      color: secondaryText,
      marginBottom: 4,
    },
    price: {
      color: accent,
      fontWeight: 'bold',
      marginBottom: 8,
    },
    status: {
      alignSelf: 'flex-start',
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: background,
      paddingHorizontal: 24,
    },
    loginText: {
      color: primaryText,
      fontSize: 18,
      marginBottom: 8,
      textAlign: 'center',
    },
    loginSubtext: {
      color: accent,
      fontSize: 16,
      textDecorationLine: 'underline',
      textAlign: 'center',
    },
    secondaryText: {
      color: secondaryText,
    },
  });
};