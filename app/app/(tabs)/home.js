import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, Alert, ScrollView } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Card, Button, Searchbar, Chip, IconButton, TextInput } from 'react-native-paper';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api, { boatsAPI, savedSearchesAPI, favoritesAPI } from '../../services/api';
import { useSettings } from '../../providers/SettingsProvider';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { appearance, paperTheme, language } = useSettings();
  const styles = useMemo(() => makeStyles(appearance, paperTheme), [appearance, paperTheme]);
  const [boats, setBoats] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  const [minCapacity, setMinCapacity] = useState(1);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [datePreset, setDatePreset] = useState(null);
  const [savedSearches, setSavedSearches] = useState([]);
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [activeSavedId, setActiveSavedId] = useState(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [favoriteIds, setFavoriteIds] = useState([]);

  useEffect(() => {
    checkLoginStatus();
    loadBoats();
  }, []);

  useEffect(() => {
    loadBoats();
  }, [searchQuery, priceRange, minCapacity, selectedTypes, startDate, endDate]);

  useEffect(() => {
    if (isLoggedIn) {
      loadSavedSearches();
      loadFavorites();
    } else {
      setSavedSearches([]);
      setFavoriteIds([]);
    }
  }, [isLoggedIn]);

  const checkLoginStatus = async () => {
    const token = await AsyncStorage.getItem('token');
    setIsLoggedIn(!!token);
  };

  const loadBoats = async () => {
    try {
      const params = {
        search: searchQuery || undefined,
        minPrice: priceRange?.[0] ?? undefined,
        maxPrice: priceRange?.[1] ?? undefined,
        minCapacity: minCapacity || undefined,
        types: selectedTypes.length ? selectedTypes.join(',') : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      };
      const response = await boatsAPI.search(params);
      if (response && response.data) {
        const list = Array.isArray(response.data) ? response.data : [];
        setBoats(list);
      } else {
        console.warn('API response is invalid:', response);
        setBoats([]);
      }
    } catch (error) {
      console.error('Error loading boats:', error);
      // Fallback to mock data
      setBoats([
        {
          id: '1',
          name: 'Isla Barú Cruiser',
          type: 'speedboat',
          pricePerDay: 180,
          location: 'Cartagena · Muelle La Bodeguita',
          capacity: 8,
          images: ['https://images.unsplash.com/photo-1505735191847-37aa1c220871?auto=format&fit=crop&w=1200&q=80'],
          description: 'Lancha rápida con capitán para Rosario y Barú (day trip).',
        },
        {
          id: '2',
          name: 'Catamarán Rosario',
          type: 'catamaran',
          pricePerDay: 620,
          location: 'Cartagena · Club Náutico',
          capacity: 14,
          images: ['https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80'],
          description: 'Catamarán estable con música y nevera. Ideal para grupos grandes.',
        },
      ]);
    }
    setLoading(false);
  };

  const loadSavedSearches = async () => {
    try {
      const response = await savedSearchesAPI.getAll();
      const list = Array.isArray(response?.data) ? response.data : [];
      setSavedSearches(list);
    } catch (error) {
      console.warn('Error loading saved searches', error?.response?.data || error?.message);
    }
  };

  const loadFavorites = async () => {
    try {
      const response = await favoritesAPI.getAll();
      const ids = Array.isArray(response?.data) ? response.data.map((f) => f.boat?.id).filter(Boolean) : [];
      setFavoriteIds(ids);
    } catch (error) {
      console.warn('Error loading favorites', error?.response?.data || error?.message);
    }
  };

  const list = Array.isArray(boats) ? boats : [];
  const filteredBoats = list;

  const applyDatePreset = (preset) => {
    setDatePreset(preset);
    const now = new Date();

    if (preset === 'today') {
      const start = new Date(now);
      const end = new Date(now);
      end.setDate(end.getDate() + 1);
      setStartDate(start.toISOString());
      setEndDate(end.toISOString());
      return;
    }

    if (preset === 'tomorrow') {
      const start = new Date(now);
      start.setDate(start.getDate() + 1);
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      setStartDate(start.toISOString());
      setEndDate(end.toISOString());
      return;
    }

    if (preset === 'weekend') {
      const start = new Date(now);
      const day = start.getDay();
      const daysUntilSaturday = (6 - day + 7) % 7;
      start.setDate(start.getDate() + daysUntilSaturday);
      const end = new Date(start);
      end.setDate(end.getDate() + 2);
      setStartDate(start.toISOString());
      setEndDate(end.toISOString());
      return;
    }

    setStartDate(null);
    setEndDate(null);
  };

  const toggleType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const onStartDateChange = (_event, date) => {
    setShowStartPicker(false);
    if (date) {
      const iso = date.toISOString();
      setStartDate(iso);
      setDatePreset(null);
      if (endDate && new Date(endDate) <= date) {
        const next = new Date(date);
        next.setDate(next.getDate() + 1);
        setEndDate(next.toISOString());
      }
    }
  };

  const onEndDateChange = (_event, date) => {
    setShowEndPicker(false);
    if (date) {
      if (startDate && date <= new Date(startDate)) {
        Alert.alert('Rango inválido', 'La fecha de fin debe ser posterior a la de inicio');
        return;
      }
      setEndDate(date.toISOString());
      setDatePreset(null);
    }
  };

  const handleSaveSearch = async () => {
    if (!isLoggedIn) {
      Alert.alert('Inicia sesión', 'Debes iniciar sesión para guardar búsquedas', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Iniciar sesión', onPress: () => router.push('/auth') },
      ]);
      return;
    }

    try {
      const payload = {
        label: searchQuery || 'Búsqueda',
        search: searchQuery,
        minPrice: priceRange?.[0] ?? 0,
        maxPrice: priceRange?.[1] ?? 1000,
        minCapacity,
        types: selectedTypes,
        startDate,
        endDate,
      };
      const response = await savedSearchesAPI.create({ query: JSON.stringify(payload) });
      setActiveSavedId(response?.data?.id || null);
      setRenameDraft(payload.label || '');
      await loadSavedSearches();
      Alert.alert('Guardada', 'Búsqueda guardada');
    } catch (error) {
      console.warn('Error saving search', error?.response?.data || error?.message);
      Alert.alert('Error', 'No se pudo guardar la búsqueda');
    }
  };

  const applySavedSearch = (entry) => {
    let parsed = null;
    if (entry?.query) {
      try {
        parsed = JSON.parse(entry.query);
      } catch (e) {
        parsed = null;
      }
    }

    if (!parsed) {
      return;
    }

    setSearchQuery(parsed.search || '');
    setPriceRange([parsed.minPrice ?? 0, parsed.maxPrice ?? 1000]);
    setMinCapacity(parsed.minCapacity ?? 1);
    setSelectedTypes(Array.isArray(parsed.types) ? parsed.types : []);

    if (parsed.startDate && parsed.endDate) {
      setStartDate(parsed.startDate);
      setEndDate(parsed.endDate);
      setDatePreset(null);
    } else {
      applyDatePreset(null);
    }

    setShowFilters(false);
    setActiveSavedId(entry.id);
    setRenameDraft(parsed.label || '');
  };

  const handleDeleteSaved = async (id) => {
    try {
      await savedSearchesAPI.delete(id);
      setActiveSavedId(null);
      setRenameDraft('');
      await loadSavedSearches();
    } catch (error) {
      console.warn('Error deleting saved search', error?.response?.data || error?.message);
      Alert.alert('Error', 'No se pudo borrar la búsqueda');
    }
  };

  const handleRenameSaved = async () => {
    if (!activeSavedId) return;
    const target = savedSearches.find((s) => s.id === activeSavedId);
    if (!target) return;

    let parsed = null;
    try {
      parsed = JSON.parse(target.query || '{}');
    } catch (e) {
      parsed = {};
    }

    const newLabel = renameDraft?.trim();
    if (!newLabel) {
      Alert.alert('Sin nombre', 'Ingresa un nombre para renombrar');
      return;
    }

    try {
      await savedSearchesAPI.create({ query: JSON.stringify({ ...parsed, label: newLabel }) });
      await savedSearchesAPI.delete(target.id);
      setActiveSavedId(null);
      setRenameDraft('');
      await loadSavedSearches();
      Alert.alert('Listo', 'Búsqueda renombrada');
    } catch (error) {
      console.warn('Error renaming saved search', error?.response?.data || error?.message);
      Alert.alert('Error', 'No se pudo renombrar');
    }
  };

  const renderBoat = ({ item }) => {
    if (!item) return null;

    const thumb = (Array.isArray(item.images) && item.images[0]) || item.imageUrl || 'https://via.placeholder.com/300';
    const price = item.pricePerDay || item.price || 0;
    const isFavorite = favoriteIds.includes(item.id);

    const typeLabels = {
      speedboat: 'Lancha rápida',
      yacht: 'Yate',
      catamaran: 'Catamarán',
      sailboat: 'Velero',
      boat: 'Embarcación',
    };
    const typeKey = (item.type || '').toLowerCase();
    const typeDisplay = typeLabels[typeKey] || item.type || 'Embarcación';
    const capacity = item.capacity || 0;
    const peopleLabel = capacity === 1 ? 'persona' : 'personas';
    const capacityDisplay = `${capacity} ${peopleLabel}`;

    return (
      <Card style={styles.boatCard} onPress={() => router.push(`/listings/${item.id}`)}>
        <Card.Cover source={{ uri: thumb }} />
        <IconButton
          icon={isFavorite ? 'heart' : 'heart-outline'}
          iconColor={isFavorite ? '#FF4D67' : paperTheme.colors.primary}
          size={22}
          style={styles.favoriteIcon}
          onPress={() => toggleFavorite(item.id)}
          accessibilityLabel={isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        />
        <Card.Content>
          <Text style={styles.boatName}>{item.name || 'Sin nombre'}</Text>
          <Text style={styles.boatType}>{item.location || 'Sin ubicación'}</Text>
          <Text style={styles.boatPrice}>${price}/día</Text>
          <View style={styles.badgesRow}>
            <Chip style={styles.miniChip} icon="sail-boat">
              {typeDisplay}
            </Chip>
            <Chip style={styles.miniChip} icon="account-group">
              {capacityDisplay}
            </Chip>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const toggleFavorite = async (boatId) => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Inicia sesión', 'Debes iniciar sesión para guardar en favoritos', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Iniciar sesión', onPress: () => router.push('/auth') },
      ]);
      return;
    }
    const isFav = favoriteIds.includes(boatId);
    try {
      if (isFav) {
        await favoritesAPI.remove(boatId);
        setFavoriteIds((prev) => prev.filter((id) => id !== boatId));
      } else {
        await favoritesAPI.add(boatId);
        setFavoriteIds((prev) => [...prev, boatId]);
      }
    } catch (error) {
      console.warn('Favoritos error', error?.response?.data || error?.message);
      Alert.alert('Error', 'No se pudo actualizar favoritos');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
    router.replace('/auth');
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.brandTitle}>BAHIA GO</Text>
        {isLoggedIn && (
          <Button
            mode="text"
            onPress={handleLogout}
            textColor={paperTheme.colors.primary}
            style={styles.logoutButton}
            contentStyle={styles.logoutButtonContent}
          >
            Salir
          </Button>
        )}
      </View>

      <Searchbar
        placeholder="Buscar embarcaciones..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={styles.searchbar}
        inputStyle={styles.searchInput}
        iconColor={paperTheme.colors.primary}
        accessibilityLabel="Buscar embarcaciones"
      />

      <View style={styles.filterRow}>
        <Button
          mode="outlined"
          onPress={() => setShowFilters(!showFilters)}
          style={styles.filterButton}
          icon={showFilters ? "chevron-up" : "chevron-down"}
          textColor={paperTheme.colors.primary}
        >
          Filtros
        </Button>
        {(priceRange[0] > 0 || priceRange[1] < 1000 || minCapacity > 1 || selectedTypes.length || startDate) && (
          <Button
            mode="text"
            onPress={() => {
              setPriceRange([0, 1000]);
              setMinCapacity(1);
              setSelectedTypes([]);
              applyDatePreset(null);
            }}
            textColor={paperTheme.colors.primary}
          >
            Limpiar
          </Button>
        )}
        <IconButton
          icon="content-save"
          size={20}
          onPress={handleSaveSearch}
          iconColor={paperTheme.colors.primary}
          accessibilityLabel="Guardar búsqueda"
        />
      </View>

      {isLoggedIn && savedSearches.length > 0 && (
        <Card style={styles.savedCard}>
          <Card.Content>
            <Text style={styles.savedTitle}>Búsquedas guardadas</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.savedChips}>
              {savedSearches.map((s) => {
                let label = 'Guardada';
                let summary = '';
                try {
                  const parsed = JSON.parse(s.query || '{}');
                  label = parsed.label || parsed.search || parsed.location || 'Guardada';
                  const pricePart = parsed.minPrice || parsed.maxPrice ? `$${parsed.minPrice || 0}-${parsed.maxPrice || ''}` : '';
                  const capPart = parsed.minCapacity ? `Cap ${parsed.minCapacity}+` : '';
                  const datePart = parsed.startDate && parsed.endDate
                    ? `${new Date(parsed.startDate).toLocaleDateString()} → ${new Date(parsed.endDate).toLocaleDateString()}`
                    : '';
                  summary = [pricePart, capPart, datePart].filter(Boolean).join(' · ');
                } catch (e) {
                  label = 'Guardada';
                  summary = '';
                }
                return (
                  <Chip
                    key={s.id}
                    onPress={() => applySavedSearch(s)}
                    onClose={() => handleDeleteSaved(s.id)}
                    closeIcon="close"
                    selected={activeSavedId === s.id}
                    style={styles.chip}
                  >
                    {summary ? `${label} • ${summary}` : label}
                  </Chip>
                );
              })}
            </ScrollView>
            {activeSavedId ? (
              <View style={styles.renameRow}>
                <TextInput
                  value={renameDraft}
                  onChangeText={setRenameDraft}
                  mode="outlined"
                  dense
                  style={styles.renameInput}
                  placeholder="Nuevo nombre"
                />
                <Button mode="contained" onPress={handleRenameSaved}>
                  Renombrar
                </Button>
              </View>
            ) : null}
          </Card.Content>
        </Card>
      )}

      {showFilters && (
        <Card style={styles.filterCard}>
          <Card.Content>
            <Text style={styles.filterTitle}>Precio por día</Text>
            <View style={styles.priceRange}>
              <Chip
                selected={priceRange[0] === 0 && priceRange[1] === 200}
                onPress={() => setPriceRange([0, 200])}
                style={styles.chip}
              >
                $0 - $200
              </Chip>
              <Chip
                selected={priceRange[0] === 200 && priceRange[1] === 500}
                onPress={() => setPriceRange([200, 500])}
                style={styles.chip}
              >
                $200 - $500
              </Chip>
              <Chip
                selected={priceRange[0] === 500 && priceRange[1] === 1000}
                onPress={() => setPriceRange([500, 1000])}
                style={styles.chip}
              >
                $500+
              </Chip>
            </View>

            <Text style={styles.filterTitle}>Capacidad mínima</Text>
            <View style={styles.capacityRow}>
              <Chip
                selected={minCapacity === 1}
                onPress={() => setMinCapacity(1)}
                style={styles.chip}
              >
                1+ persona
              </Chip>
              <Chip
                selected={minCapacity === 4}
                onPress={() => setMinCapacity(4)}
                style={styles.chip}
              >
                4+ personas
              </Chip>
              <Chip
                selected={minCapacity === 8}
                onPress={() => setMinCapacity(8)}
                style={styles.chip}
              >
                8+ personas
              </Chip>
            </View>

            <Text style={[styles.filterTitle, { marginTop: 12 }]}>Tipo de embarcación</Text>
            <View style={styles.typeRow}>
              {['yacht', 'speedboat', 'sailboat', 'jetski'].map((type) => (
                <Chip
                  key={type}
                  selected={selectedTypes.includes(type)}
                  onPress={() => toggleType(type)}
                  style={styles.chip}
                >
                  {type}
                </Chip>
              ))}
            </View>

            <Text style={[styles.filterTitle, { marginTop: 12 }]}>Fechas</Text>
            <View style={styles.capacityRow}>
              <Chip
                selected={datePreset === 'today'}
                onPress={() => applyDatePreset('today')}
                style={styles.chip}
              >
                Hoy
              </Chip>
              <Chip
                selected={datePreset === 'tomorrow'}
                onPress={() => applyDatePreset('tomorrow')}
                style={styles.chip}
              >
                Mañana
              </Chip>
              <Chip
                selected={datePreset === 'weekend'}
                onPress={() => applyDatePreset('weekend')}
                style={styles.chip}
              >
                Fin de semana
              </Chip>
              <Chip
                selected={!datePreset && startDate === null}
                onPress={() => applyDatePreset(null)}
                style={styles.chip}
              >
                Sin fecha
              </Chip>
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
              <Text style={styles.selectedDate}>
                {new Date(startDate).toLocaleDateString()} → {new Date(endDate).toLocaleDateString()}
              </Text>
            ) : null}
          </Card.Content>
        </Card>
      )}
      <FlatList
        data={filteredBoats}
        renderItem={renderBoat}
        keyExtractor={(item, index) => item?.id || `boat-${index}`}
        contentContainerStyle={styles.list}
        refreshing={loading}
        onRefresh={loadBoats}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={10}
        removeClippedSubviews
        ListEmptyComponent={!loading ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="sail-boat" size={48} color={paperTheme.colors.primary} />
            <Text style={styles.emptyTitle}>No hay embarcaciones</Text>
            <Text style={styles.emptySubtitle}>Ajusta los filtros o intenta más tarde.</Text>
            <Button mode="contained" onPress={loadBoats} style={{ marginTop: 8 }}>
              Reintentar
            </Button>
          </View>
        ) : null}
      />

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
    </View>
  );
}

const makeStyles = (mode, paperTheme) => {
    const isDark = mode === 'dark';
    const background = paperTheme.colors.background || (isDark ? '#0B0E14' : '#FFFFFF');
    const surface = paperTheme.colors.surface || (isDark ? '#10141D' : '#F2F4F7');
    const primaryText = paperTheme.colors.onSurface || (isDark ? '#F7F8FA' : '#0B0E14');
    const secondaryText = isDark ? '#9FA5B5' : '#4A4F5C';
    const cardText = isDark ? '#E6E8EE' : '#1C1C1E';

    return StyleSheet.create({
      container: {
        flex: 1,
        backgroundColor: background,
      },
      header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 8,
        backgroundColor: background,
      },
      brandTitle: {
        flexGrow: 1,
        fontSize: 28,
        fontWeight: '700',
        color: '#FF8A5C',
        letterSpacing: 2,
      },
      logoutButton: {
        marginLeft: 12,
        alignSelf: 'flex-end',
      },
      logoutButtonContent: {
        paddingHorizontal: 0,
      },
      searchbar: {
        margin: 16,
        backgroundColor: surface,
      },
      searchInput: {
        color: primaryText,
      },
      filterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 8,
      },
      filterButton: {
        borderColor: paperTheme.colors.primary,
      },
      filterCard: {
        margin: 16,
        backgroundColor: surface,
      },
      savedCard: {
        marginHorizontal: 16,
        marginBottom: 8,
        backgroundColor: surface,
      },
      savedTitle: {
        fontWeight: '700',
        marginBottom: 8,
        color: primaryText,
      },
      savedChips: {
        flexDirection: 'row',
        alignItems: 'center',
      },
      renameRow: {
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
      },
      renameInput: {
        flex: 1,
        marginRight: 8,
      },
      filterTitle: {
        fontWeight: '700',
        marginBottom: 8,
        color: primaryText,
      },
      priceRange: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
      },
      capacityRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
      },
      typeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 4,
      },
      dateButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
      },
      dateButton: {
        flex: 1,
        marginRight: 8,
      },
      chip: {
        marginRight: 8,
      },
      selectedDate: {
        marginTop: 8,
        color: secondaryText,
      },
      list: {
        padding: 16,
        paddingBottom: 40,
      },
      boatCard: {
        marginBottom: 16,
        backgroundColor: surface,
      },
      boatName: {
        fontWeight: '700',
        fontSize: 16,
        marginBottom: 4,
        color: cardText,
      },
      boatType: {
        color: secondaryText,
        marginBottom: 4,
      },
      boatPrice: {
        color: paperTheme.colors.primary,
        fontWeight: '700',
        marginBottom: 4,
      },
      badgesRow: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginTop: 6,
      },
      miniChip: {
        marginRight: 8,
        marginBottom: 4,
      },
      favoriteIcon: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: surface,
      },
      emptyState: {
        alignItems: 'center',
        padding: 24,
      },
      emptyTitle: {
        marginTop: 12,
        fontWeight: '700',
        color: primaryText,
      },
      emptySubtitle: {
        marginTop: 4,
        color: secondaryText,
      },
    });
  };
