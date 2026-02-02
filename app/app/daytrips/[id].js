import React, { useMemo, useState } from 'react';
import { ScrollView, View, StyleSheet, Image, Alert } from 'react-native';
import { Text, Button, Card, Chip, Divider } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
    description:
      'Día completo con traslados, guía local y almuerzo típico. Tiempo libre para playa y snorkel en aguas cristalinas.',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'trip-2',
    title: 'Playa Blanca con plan premium',
    price: 380,
    duration: '8 horas',
    includes: ['Transporte climatizado', 'Zona VIP de playa', 'Almuerzo', 'Barra de cócteles'],
    description:
      'Relájate en zona VIP frente al mar, con barra de cócteles y almuerzo incluido. Ambiente chill para desconectar.',
    image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'trip-3',
    title: 'Pasadía Cholon + Fiesta en el agua',
    price: 450,
    duration: '7 horas',
    includes: ['Lancha rápida', 'Cóctel de bienvenida', 'DJ y ambiente', 'Snacks y frutas'],
    description:
      'Plan fiestero en lancha rápida con DJ, cóctel de bienvenida y snacks. Ideal para grupos que quieren diversión en el agua.',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  },
];

export default function DaytripDetailScreen() {
  const { id } = useLocalSearchParams();
  const [loadingReserve, setLoadingReserve] = useState(false);
  const { appearance, paperTheme } = useSettings();

  const styles = useMemo(() => makeStyles(appearance, paperTheme), [appearance, paperTheme]);

  const trip = useMemo(() => trips.find((t) => t.id === id), [id]);

  const handleReserve = () => {
    if (loadingReserve) return;
    setLoadingReserve(true);
    api
      .post('/daytrips/reservations', {
        tripId: trip.id,
        title: trip.title,
        price: trip.price,
      })
      .then(() => {
        Alert.alert(
          'Reserva recibida',
          'Un operador te contactará para confirmar transporte y horarios.',
          [{ text: 'Ok' }]
        );
      })
      .catch((error) => {
        if (error?.response?.status === 401) {
          Alert.alert('Inicia sesión', 'Debes iniciar sesión para reservar.', [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Iniciar sesión', onPress: () => router.push('/auth') },
          ]);
        } else {
          console.warn('Reserva daytrip (detalle) error:', {
            status: error?.response?.status,
            data: error?.response?.data,
            message: error?.message,
            url: error?.config?.url,
          });
          const msg = error?.response?.data?.message || error?.message || 'No se pudo registrar la reserva. Inténtalo de nuevo.';
          Alert.alert('Error', msg);
        }
      })
      .finally(() => setLoadingReserve(false));
  };

  const handleChat = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Inicia sesión', 'Debes iniciar sesión para chatear con el operador.', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Iniciar sesión', onPress: () => router.push('/auth') },
      ]);
      return;
    }

    try {
      // Crear o asegurar la conversación con el operador
      await api.post('/messages', {
        boatId: trip.id,
        content: `Hola, quiero reservar el pasadía: ${trip.title}`,
      });
    } catch (error) {
      console.warn('No se pudo iniciar el chat', error?.response?.data || error?.message);
    }

    router.push({ pathname: '/messages/[boatId]', params: { boatId: trip.id, title: trip.title } });
  };

  if (!trip) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Pasadía no encontrado</Text>
        <Button mode="text" onPress={() => router.back()} textColor={paperTheme.colors.primary}>
          Volver
        </Button>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image source={{ uri: trip.image }} style={styles.hero} />

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.title}>{trip.title}</Text>
          <Text style={styles.price}>${trip.price}/persona</Text>
        </View>
        <View style={styles.metaRow}>
          <Chip compact style={styles.chip} textStyle={styles.chipText}>
            Duración: {trip.duration}
          </Chip>
          <Chip compact style={styles.chip} textStyle={styles.chipText}>
            Confirmación inmediata
          </Chip>
        </View>
        <Text style={styles.description}>{trip.description}</Text>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Qué incluye</Text>
            {trip.includes.map((item, idx) => (
              <View key={idx} style={styles.bulletRow}>
                <View style={styles.bullet} />
                <Text style={styles.includeText}>{item}</Text>
              </View>
            ))}
            <Divider style={styles.divider} />
            <Text style={styles.sectionTitle}>Plan del día</Text>
            {trip.timeline?.map((item, idx) => (
              <View key={idx} style={styles.timelineRow}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineTextWrapper}>
                  <Text style={styles.timelineHour}>{item.time}</Text>
                  <Text style={styles.timelineText}>{item.label}</Text>
                </View>
              </View>
            )) || (
              <Text style={styles.muted}>Itinerario flexible según clima y grupo.</Text>
            )}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Punto de encuentro</Text>
            <Text style={styles.muted}>{trip.meetingPoint || 'Muelle La Bodeguita, 8:00 a.m. Presentarse 15 min antes.'}</Text>
            <Divider style={styles.divider} />
            <Text style={styles.sectionTitle}>Política de cancelación</Text>
            <Text style={styles.muted}>{trip.cancellation || 'Cancelación gratis hasta 48 horas antes. Luego aplica tarifa del operador.'}</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Detalle de precio</Text>
            <View style={styles.priceRow}>
              <Text style={styles.muted}>Tarifa por persona</Text>
              <Text style={styles.priceStrong}>${trip.price}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.muted}>Impuestos y cargos</Text>
              <Text style={styles.muted}>Incluidos</Text>
            </View>
            <Divider style={styles.divider} />
            <View style={styles.priceRow}>
              <Text style={styles.priceStrong}>Total estimado</Text>
              <Text style={styles.priceStrong}>${trip.price}</Text>
            </View>
          </Card.Content>
        </Card>

        <View style={styles.actions}>
          <Button
            mode="contained"
            buttonColor={ACCENT}
            textColor={paperTheme.colors.onPrimary || '#FFFFFF'}
            onPress={handleReserve}
            loading={loadingReserve}
            disabled={loadingReserve}
          >
            Reservar ahora
          </Button>
          <Button mode="outlined" textColor={paperTheme.colors.primary} style={styles.secondaryBtn} onPress={handleChat}>
            Chatear con el operador
          </Button>
        </View>
      </View>
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
      backgroundColor: background,
      paddingBottom: 32,
    },
    content: {
      paddingHorizontal: 16,
    },
    hero: {
      width: '100%',
      height: 260,
    },
    headerRow: {
      paddingTop: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 12,
    },
    title: {
      flex: 1,
      fontSize: 22,
      fontWeight: '700',
      color: primaryText,
    },
    price: {
      fontSize: 20,
      fontWeight: '700',
      color: ACCENT,
    },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 8,
    },
    chip: {
      backgroundColor: isDark ? '#162032' : '#F3F4F7',
      borderColor: isDark ? '#1C2331' : '#E0E6EF',
    },
    chipText: {
      color: primaryText,
      fontSize: 12,
    },
    description: {
      marginTop: 12,
      fontSize: 15,
      color: primaryText,
      lineHeight: 22,
    },
    card: {
      marginTop: 16,
      backgroundColor: surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? '#1C2331' : '#E9ECEF',
      overflow: 'hidden',
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: primaryText,
      marginBottom: 8,
    },
    bulletRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
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
    divider: {
      marginVertical: 12,
      backgroundColor: isDark ? '#1C2331' : '#E0E6EF',
    },
    timelineRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      marginBottom: 10,
    },
    timelineDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: ACCENT,
      marginTop: 4,
    },
    timelineTextWrapper: {
      flex: 1,
      gap: 2,
    },
    timelineHour: {
      fontSize: 12,
      color: secondaryText,
    },
    timelineText: {
      fontSize: 14,
      color: primaryText,
      lineHeight: 20,
    },
    muted: {
      fontSize: 14,
      color: secondaryText,
      lineHeight: 20,
    },
    priceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    priceStrong: {
      fontSize: 16,
      fontWeight: '700',
      color: primaryText,
    },
    actions: {
      marginTop: 20,
      gap: 12,
    },
    secondaryBtn: {
      borderColor: paperTheme.colors.primary,
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: background,
      padding: 24,
    },
    error: {
      fontSize: 16,
      color: primaryText,
      marginBottom: 12,
    },
  });
};
