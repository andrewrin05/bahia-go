import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Text, Card, Button, FAB, ActivityIndicator, TextInput, Chip } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { boatsAPI, bookingsAPI, favoritesAPI } from '../../services/api';
import { useSettings } from '../providers/SettingsProvider';
import { logEvent, logError, logScreen } from '../../services/telemetry';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams();
  const [boat, setBoat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [checking, setChecking] = useState(false);
  const [availability, setAvailability] = useState(null);
  const [datePreset, setDatePreset] = useState('tomorrow');
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [guests, setGuests] = useState('4');
  const [notes, setNotes] = useState('');
  const [extras, setExtras] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const { appearance, paperTheme } = useSettings();
  const styles = useMemo(() => makeStyles(appearance, paperTheme), [appearance, paperTheme]);

  useEffect(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);
    setStartDate(tomorrow.toISOString());
    setEndDate(dayAfter.toISOString());
  }, []);

  useEffect(() => {
    logScreen('ListingDetail', { id });
    loadBoat();
  }, [id]);

  const loadBoat = async () => {
    try {
      setLoading(true);
      const response = await boatsAPI.getOne(id);
      setBoat(response.data);
      logEvent('boat_view', { boatId: id });
      await loadFavoriteStatus(response.data?.id);
    } catch (error) {
      logError('boat_load_error', error);
      Alert.alert('Error', 'No se pudo cargar la embarcación');
    } finally {
      setLoading(false);
    }
  };

  const loadFavoriteStatus = async (boatId) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setIsFavorite(false);
        return;
      }
      const res = await favoritesAPI.getAll();
      const favorites = res.data || [];
      const isFav = !!favorites.find((fav) => fav.boatId === boatId || fav.id === boatId);
      setIsFavorite(isFav);
    } catch (error) {
      logError('favorite_status_error', error);
    }
  };

  const extraOptions = useMemo(() => ([
    { id: 'snacks', label: 'Snacks y bebidas', price: 120000 },
    { id: 'music', label: 'Equipo de sonido premium', price: 90000 },
    { id: 'photography', label: 'Fotógrafo a bordo', price: 150000 },
  ]), []);

  const dayPlan = useMemo(() => ([
    { label: '08:00', value: 'Bienvenida en el muelle y briefing de seguridad' },
    { label: '09:00', value: 'Salida hacia las islas del Rosario' },
    { label: '12:30', value: 'Almuerzo y snorkel' },
    { label: '15:00', value: 'Playa tranquila y relax' },
    { label: '17:00', value: 'Regreso con atardecer' },
  ]), []);

  const includedItems = useMemo(() => ([
    'Capitán y marinero',
    'Hielo y botellas de agua',
    'Equipo de snorkel',
    'Chalecos salvavidas',
  ]), []);

  const meetingPoint = boat?.meetingPoint || 'Muelle La Bodeguita, Cartagena';
  const cancellationPolicy = boat?.cancellationPolicy || 'Cancelaciones gratuitas hasta 48h antes de la salida.';

  const applyPreset = (preset) => {
    const base = new Date();
    if (preset === 'tomorrow') {
      base.setDate(base.getDate() + 1);
      const end = new Date(base);
      end.setDate(end.getDate() + 1);
      setStartDate(base.toISOString());
      setEndDate(end.toISOString());
    } else if (preset === 'today') {
      const end = new Date(base);
      end.setDate(end.getDate() + 1);
      setStartDate(base.toISOString());
      setEndDate(end.toISOString());
    } else if (preset === 'weekend') {
      const day = base.getDay();
      const daysUntilSat = (6 - day + 7) % 7 || 7;
      base.setDate(base.getDate() + daysUntilSat);
      const end = new Date(base);
      end.setDate(end.getDate() + 2);
      setStartDate(base.toISOString());
      setEndDate(end.toISOString());
    }
    setDatePreset(preset);
    setAvailability(null);
  };

  const onStartDateChange = (_, selectedDate) => {
    setShowStartPicker(false);
    if (!selectedDate) return;
    const date = new Date(selectedDate);
    setStartDate(date.toISOString());
    if (endDate && new Date(endDate) <= date) {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      setEndDate(nextDay.toISOString());
    }
    setDatePreset(null);
    setAvailability(null);
  };

  const onEndDateChange = (_, selectedDate) => {
    setShowEndPicker(false);
    if (!selectedDate) return;
    const date = new Date(selectedDate);
    if (startDate && date <= new Date(startDate)) {
      Alert.alert('Rango inválido', 'La fecha de fin debe ser posterior a la de inicio');
      return;
    }
    setEndDate(date.toISOString());
    setDatePreset(null);
    setAvailability(null);
  };

  const toggleExtra = (extra) => {
    setExtras((prev) => {
      const exists = prev.find((e) => e.id === extra.id);
      if (exists) {
        return prev.filter((e) => e.id !== extra.id);
      }
      return [...prev, extra];
    });
  };

  const computedDays = useMemo(() => {
    if (!startDate || !endDate) return 1;
    const diff = new Date(endDate) - new Date(startDate);
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [startDate, endDate]);

  const extrasTotal = extras.reduce((sum, extra) => sum + (extra.price || 0), 0);
  const pricePerDay = boat?.pricePerDay || boat?.price || 0;
  const computedTotal = (pricePerDay + extrasTotal) * computedDays;

  const handleCheckAvailability = async () => {
    if (!startDate || !endDate) {
      Alert.alert('Selecciona fechas', 'Elige una fecha de inicio y fin antes de verificar');
      return;
    }

    try {
      setChecking(true);
      const response = await boatsAPI.checkAvailability(id, { startDate, endDate });
      setAvailability(response.data);
      if (response.data?.available) {
        Alert.alert('Disponible', 'Las fechas seleccionadas están disponibles');
      } else {
        const suggestion = response.data?.suggestion;
        const suggestionText = suggestion
          ? `Próximo rango: ${new Date(suggestion.startDate).toLocaleDateString()} → ${new Date(suggestion.endDate).toLocaleDateString()}`
          : 'Las fechas elegidas ya tienen reservas';
        Alert.alert('No disponible', suggestionText);
      }
    } catch (error) {
      logError('availability_error', error);
      Alert.alert('Error', 'No se pudo verificar disponibilidad');
    } finally {
      setChecking(false);
    }
  };

  const handleBook = async () => {
    if (!startDate || !endDate) {
      Alert.alert('Selecciona fechas', 'Define un rango de fechas antes de reservar');
      return;
    }
    try {
      setBooking(true);
      const payload = {
        boatId: id,
        startDate,
        endDate,
        guests: Number(guests) || 1,
        notes,
        extras: extras.map((e) => e.id),
      };
      const response = await bookingsAPI.create(payload);
      logEvent('booking_created', { boatId: id, bookingId: response.data?.id });
      Alert.alert('Reserva creada', 'Revisaremos disponibilidad y te avisaremos', [
        { text: 'Ver mis reservas', onPress: () => router.push('/(tabs)/bookings') },
        { text: 'Seguir navegando' },
      ]);
    } catch (error) {
      logError('booking_error', error);
      Alert.alert('Error', 'No se pudo crear la reserva');
    } finally {
      setBooking(false);
    }
  };

  const handleFavorite = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Inicia sesión', 'Crea una cuenta para guardar favoritos');
        return;
      }
      const nextState = !isFavorite;
      setIsFavorite(nextState);
      if (nextState) {
        await favoritesAPI.add(id);
        logEvent('favorite_add', { boatId: id });
      } else {
        await favoritesAPI.remove(id);
        logEvent('favorite_remove', { boatId: id });
      }
    } catch (error) {
      setIsFavorite((prev) => !prev);
      logError('favorite_toggle_error', error);
      Alert.alert('Error', 'No pudimos actualizar tu favorito');
    }
  };

  const handleMessage = () => {
    logEvent('message_start', { boatId: id });
    router.push({ pathname: '/messages/[boatId]', params: { boatId: id } });
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#00C853" />
      </View>
    );
  }

  if (!boat) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>Embarcación no encontrada</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card}>
          {((Array.isArray(boat.images) && boat.images[0]) || boat.imageUrl) ? (
            <Image
              source={{ uri: (Array.isArray(boat.images) && boat.images[0]) || boat.imageUrl }}
              style={styles.hero}
              accessibilityLabel={`Foto de ${boat.name}`}
            />
          ) : (
            <View style={[styles.hero, styles.heroPlaceholder]} />
          )}
          <Card.Content>
            <Text style={styles.name}>{boat.name}</Text>
            <Text style={styles.location}>{boat.location || 'Cartagena, Colombia'}</Text>
            <Text style={styles.price}>${pricePerDay}/día</Text>
            <Text style={styles.capacity}>Capacidad: {boat.capacity} personas</Text>
            {boat.description ? <Text style={styles.description}>{boat.description}</Text> : null}
            <View style={styles.badgeRow}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>+500 reservas</Text>
              </View>
              <View style={styles.badgeSecondary}>
                <Text style={styles.badgeSecondaryText}>Cancelación 48h</Text>
              </View>
              <View style={styles.badgeSecondary}>
                <Text style={styles.badgeSecondaryText}>Capitán incluido</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Qué incluye</Text>
            {includedItems.map((item, idx) => (
              <View key={`${item}-${idx}`} style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>{item}</Text>
              </View>
            ))}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Plan del día</Text>
            {dayPlan.map((step, idx) => (
              <View key={`${step.label}-${idx}`} style={styles.timelineRow}>
                <View style={styles.timelineDot} />
                <View style={styles.timelineBody}>
                  <Text style={styles.timelineLabel}>{step.label}</Text>
                  <Text style={styles.timelineValue}>{step.value}</Text>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Fechas y disponibilidad</Text>
            <View style={styles.presetRow}>
              <Button
                mode={datePreset === 'today' ? 'contained' : 'outlined'}
                onPress={() => applyPreset('today')}
                style={styles.presetButton}
              >
                Hoy
              </Button>
              <Button
                mode={datePreset === 'tomorrow' ? 'contained' : 'outlined'}
                onPress={() => applyPreset('tomorrow')}
                style={styles.presetButton}
              >
                Mañana
              </Button>
              <Button
                mode={datePreset === 'weekend' ? 'contained' : 'outlined'}
                onPress={() => applyPreset('weekend')}
                style={[styles.presetButton, { marginRight: 0 }]}
              >
                Fin de semana
              </Button>
            </View>
            <View style={styles.dateButtons}>
              <Button mode="outlined" onPress={() => setShowStartPicker(true)} style={styles.dateButton}>
                Inicio
              </Button>
              <Button mode="outlined" onPress={() => setShowEndPicker(true)} style={[styles.dateButton, { marginRight: 0 }]}>
                Fin
              </Button>
            </View>
            {startDate && endDate ? (
              <Text style={styles.dateLabel}>
                {new Date(startDate).toLocaleDateString()} → {new Date(endDate).toLocaleDateString()} ({computedDays} días)
              </Text>
            ) : null}
            <TextInput
              label="Pasajeros"
              value={guests}
              onChangeText={setGuests}
              keyboardType="number-pad"
              mode="outlined"
              style={styles.textInput}
              accessibilityLabel="Cantidad de pasajeros"
            />
            <View style={styles.extrasRow}>
              {extraOptions.map((extra) => (
                <Chip
                  key={extra.id}
                  selected={!!extras.find((e) => e.id === extra.id)}
                  onPress={() => toggleExtra(extra)}
                  style={styles.extraChip}
                  textStyle={styles.extraChipText}
                >
                  {extra.label} (+${extra.price}/día)
                </Chip>
              ))}
            </View>
            <TextInput
              label="Notas para el operador"
              value={notes}
              onChangeText={setNotes}
              mode="outlined"
              multiline
              style={styles.textInput}
              placeholder="Horarios, preferencias o requerimientos especiales"
              accessibilityLabel="Notas para el operador"
            />
            <Text style={styles.totalLabel}>Total estimado: ${computedTotal}</Text>
            <Text style={styles.breakdown}>${pricePerDay} x {computedDays} días</Text>
            {extras.length ? (
              <Text style={styles.breakdown}>
                Extras: {extras.map((e) => `${e.label} ($${e.price}/día)`).join(' · ')}
              </Text>
            ) : null}
            {availability ? (
              <Text style={[styles.availability, availability.available ? styles.available : styles.unavailable]}>
                {availability.available ? 'Disponible' : 'No disponible'}
              </Text>
            ) : null}
            {availability?.suggestion ? (
              <Text style={styles.suggestion}>
                Próximo rango: {new Date(availability.suggestion.startDate).toLocaleDateString()} → {new Date(availability.suggestion.endDate).toLocaleDateString()}
              </Text>
            ) : null}
            <Button
              mode="outlined"
              onPress={handleCheckAvailability}
              loading={checking}
              style={styles.checkButton}
            >
              Ver disponibilidad
            </Button>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Punto de encuentro</Text>
            <Text style={styles.description}>{meetingPoint}</Text>
          </Card.Content>
        </Card>

        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Política de cancelación</Text>
            <Text style={styles.description}>{cancellationPolicy}</Text>
          </Card.Content>
        </Card>

        <View style={styles.actions}>
          <Button
            mode="contained"
            onPress={handleBook}
            loading={booking}
            style={styles.bookButton}
          >
            Reservar Ahora
          </Button>
          <Button
            mode="outlined"
            onPress={handleFavorite}
            style={styles.favoriteButton}
            icon={isFavorite ? 'heart' : 'heart-outline'}
          >
            {isFavorite ? 'Quitar de Favoritos' : 'Agregar a Favoritos'}
          </Button>
          <Button
            mode="outlined"
            onPress={handleMessage}
            style={styles.messageButton}
          >
            Enviar Mensaje
          </Button>
        </View>
      </ScrollView>

      {showStartPicker && (
        <DateTimePicker
          value={startDate ? new Date(startDate) : new Date()}
          mode="date"
          display="default"
          onChange={onStartDateChange}
          minimumDate={new Date()}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          value={endDate ? new Date(endDate) : new Date()}
          mode="date"
          display="default"
          onChange={onEndDateChange}
          minimumDate={startDate ? new Date(startDate) : new Date()}
        />
      )}

      <FAB icon="arrow-left" style={styles.backFab} onPress={() => router.back()} />
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
  const accent = '#00C853';

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: background,
    },
    loading: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: background,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 32,
    },
    card: {
      backgroundColor: surface,
      marginBottom: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: border,
      overflow: 'hidden',
    },
    hero: {
      width: '100%',
      height: 240,
      backgroundColor: isDark ? '#0E1420' : '#F2F4F8',
    },
    heroPlaceholder: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    badgeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 8,
      gap: 6,
    },
    badge: {
      backgroundColor: isDark ? '#123322' : '#E8F5E9',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
    },
    badgeText: {
      color: isDark ? '#9BD26A' : '#1B5E20',
      fontWeight: '700',
      fontSize: 12,
    },
    badgeSecondary: {
      backgroundColor: isDark ? '#1B2435' : '#ECEFF1',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 12,
    },
    badgeSecondaryText: {
      color: secondaryText,
      fontWeight: '600',
      fontSize: 12,
    },
    name: {
      fontSize: 22,
      fontWeight: '700',
      color: primaryText,
      marginBottom: 4,
    },
    location: {
      color: secondaryText,
      marginBottom: 6,
    },
    price: {
      color: accent,
      fontSize: 20,
      fontWeight: '700',
    },
    capacity: {
      color: secondaryText,
      marginTop: 4,
    },
    description: {
      color: primaryText,
      marginTop: 8,
      lineHeight: 20,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      marginBottom: 12,
      color: primaryText,
    },
    bulletRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 6,
    },
    bulletDot: {
      marginRight: 8,
      color: accent,
      fontSize: 18,
    },
    bulletText: {
      color: primaryText,
      fontSize: 14,
      flex: 1,
    },
    timelineRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 10,
      gap: 10,
    },
    timelineDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: accent,
      marginTop: 5,
    },
    timelineBody: {
      flex: 1,
      gap: 2,
    },
    timelineLabel: {
      fontWeight: '700',
      color: primaryText,
    },
    timelineValue: {
      color: secondaryText,
    },
    presetRow: {
      flexDirection: 'row',
      marginBottom: 10,
      gap: 8,
    },
    presetButton: {
      flex: 1,
    },
    dateButtons: {
      flexDirection: 'row',
      marginTop: 8,
      marginBottom: 8,
      gap: 8,
    },
    dateButton: {
      flex: 1,
    },
    dateLabel: {
      color: secondaryText,
      marginBottom: 6,
    },
    textInput: {
      marginTop: 8,
    },
    extrasRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginTop: 8,
    },
    extraChip: {
      borderColor: border,
      backgroundColor: isDark ? '#141C2A' : '#F3F5F8',
    },
    extraChipText: {
      color: primaryText,
    },
    totalLabel: {
      color: accent,
      fontSize: 16,
      fontWeight: '700',
      marginTop: 8,
    },
    breakdown: {
      color: secondaryText,
    },
    availability: {
      marginTop: 8,
      fontWeight: '700',
    },
    available: {
      color: accent,
    },
    unavailable: {
      color: '#D32F2F',
    },
    suggestion: {
      color: secondaryText,
      marginTop: 4,
      marginBottom: 8,
    },
    checkButton: {
      marginTop: 8,
    },
    actions: {
      marginTop: 16,
      marginBottom: 24,
      gap: 12,
    },
    bookButton: {
      backgroundColor: accent,
    },
    favoriteButton: {
      borderColor: paperTheme.colors.primary,
    },
    messageButton: {
      borderColor: '#FF8A5C',
    },
    backFab: {
      position: 'absolute',
      margin: 16,
      left: 0,
      top: 40,
      backgroundColor: surface,
    },
    error: {
      color: '#D32F2F',
      textAlign: 'center',
      marginTop: 24,
    },
  });
};