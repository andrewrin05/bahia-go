import React, { useMemo, useState } from 'react';
import { ScrollView, View, StyleSheet, Alert } from 'react-native';
import { Text, Button, Card } from 'react-native-paper';
import { router } from 'expo-router';
import api from '../../services/api';
import { useSettings } from '../../providers/SettingsProvider';

const ACCENT = '#FF8A5C';

const trips = [
  {
    id: 'trip-1',
    title: 'Islas del Rosario + Barú',
    price: 420,
    duration: '10 horas',
    includes: ['Transporte ida y vuelta', 'Almuerzo típico', 'Cóctel de bienvenida', 'Guía local'],
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 'trip-2',
    title: 'Playa Blanca con plan premium',
    price: 380,
    duration: '8 horas',
    includes: ['Transporte climatizado', 'Zona VIP de playa', 'Almuerzo', 'Barra de cócteles'],
    image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=800&q=60',
  },
  {
    id: 'trip-3',
    title: 'Pasadía Cholon + Fiesta en el agua',
    price: 450,
    duration: '7 horas',
    includes: ['Lancha rápida', 'Cóctel de bienvenida', 'DJ y ambiente', 'Snacks y frutas'],
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=60',
  },
];

export default function DayTripsScreen() {
  const [submittingId, setSubmittingId] = useState(null);
  const { appearance, paperTheme } = useSettings();
  const styles = useMemo(() => makeStyles(appearance, paperTheme), [appearance, paperTheme]);

  const handleReserve = async (trip) => {
    if (submittingId) return;
    setSubmittingId(trip.id);
    try {
      await api.post('/daytrips/reservations', {
        tripId: trip.id,
        title: trip.title,
        price: trip.price,
      });
      Alert.alert(
        'Reserva recibida',
        'Un operador te contactará para confirmar transporte y horarios.',
        [{ text: 'Ok' }]
      );
    } catch (error) {
      if (error?.response?.status === 401) {
        Alert.alert('Inicia sesión', 'Debes iniciar sesión para reservar.', [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Iniciar sesión', onPress: () => router.push('/auth') },
        ]);
      } else {
        console.warn('Reserva daytrip (lista) error:', {
          status: error?.response?.status,
          data: error?.response?.data,
          message: error?.message,
          url: error?.config?.url,
        });
        const msg = error?.response?.data?.message || error?.message || 'No se pudo registrar la reserva. Inténtalo de nuevo.';
        Alert.alert('Error', msg);
      }
    }
    setSubmittingId(null);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.heading}>Pasadías con todo incluido</Text>

      {trips.map((trip) => (
        <Card key={trip.id} style={styles.card}>
          <Card.Cover source={{ uri: trip.image }} style={styles.cover} />
          <Card.Content>
            <Text style={styles.title}>{trip.title}</Text>
            <Text style={styles.duration}>{trip.duration}</Text>
            <Text style={styles.price}>${trip.price}/persona</Text>
            <View style={styles.includes}>
              {trip.includes.map((item, idx) => (
                <View key={idx} style={styles.bulletRow}>
                  <View style={styles.bullet} />
                  <Text style={styles.includeText}>{item}</Text>
                </View>
              ))}
            </View>
          </Card.Content>
          <Card.Actions style={styles.actions}>
            <Button
              mode="contained"
              buttonColor={ACCENT}
              textColor={paperTheme.colors.onPrimary || '#FFFFFF'}
              onPress={() => handleReserve(trip)}
              loading={submittingId === trip.id}
              disabled={!!submittingId}
            >
              Reservar ahora
            </Button>
            <Button
              mode="text"
              textColor={paperTheme.colors.primary}
              onPress={() => router.push({ pathname: '/daytrips/[id]', params: { id: trip.id } })}
            >
              Ver detalles
            </Button>
          </Card.Actions>
        </Card>
      ))}
    </ScrollView>
  );
}

const makeStyles = (mode, paperTheme) => {
  const isDark = mode === 'dark';
  const background = paperTheme.colors.background || (isDark ? '#0B0E14' : '#FFFFFF');
  const surface = paperTheme.colors.surface || (isDark ? '#10141D' : '#FFFFFF');
  const primaryText = paperTheme.colors.onSurface || (isDark ? '#F7F8FA' : '#1C1C1E');
  const secondaryText = isDark ? '#C3C7D3' : '#3C3C43';

  return StyleSheet.create({
    container: {
      padding: 16,
      backgroundColor: background,
    },
    heading: {
      fontSize: 26,
      fontWeight: '700',
      color: primaryText,
      marginBottom: 4,
    },
    subheading: {
      fontSize: 16,
      color: secondaryText,
      marginBottom: 16,
    },
    card: {
      marginBottom: 16,
      backgroundColor: surface,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: isDark ? '#1C2331' : '#E9ECEF',
    },
    cover: {
      height: 180,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: primaryText,
      marginTop: 12,
    },
    duration: {
      fontSize: 14,
      color: secondaryText,
      marginTop: 4,
    },
    price: {
      fontSize: 18,
      fontWeight: '700',
      color: ACCENT,
      marginTop: 6,
    },
    includes: {
      marginTop: 10,
      gap: 6,
    },
    bulletRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    bullet: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: ACCENT,
      marginRight: 8,
    },
    includeText: {
      fontSize: 14,
      color: primaryText,
    },
    actions: {
      justifyContent: 'space-between',
      paddingHorizontal: 8,
      paddingBottom: 12,
    },
  });
};
