import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { Text, Card, IconButton, Button } from 'react-native-paper';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../services/api';
import { useSettings } from '../../providers/SettingsProvider';
import EmptyState from '../components/EmptyState';

export default function FavoritesScreen() {
  const { appearance, paperTheme, t, currency, language } = useSettings();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const styles = useMemo(() => makeStyles(appearance, paperTheme), [appearance, paperTheme]);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setIsLoggedIn(false);
        setLoading(false);
        return;
      }
      setIsLoggedIn(true);
      const response = await api.get('/favorites');
      if (response.data && Array.isArray(response.data)) {
        setFavorites(response.data);
      } else {
        console.warn('Invalid favorites response:', response.data);
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      Alert.alert('Error', 'No se pudieron cargar los favoritos');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (boatId) => {
    try {
      await api.delete(`/favorites/${boatId}`);
      setFavorites(favorites.filter(fav => fav.boat.id !== boatId));
      Alert.alert('Éxito', 'Removido de favoritos');
    } catch (error) {
      console.error('Error removing favorite:', error);
      Alert.alert('Error', 'No se pudo remover de favoritos');
    }
  };

  const formatPrice = useCallback((value) => {
    try {
      return new Intl.NumberFormat(language === 'es' ? 'es-CO' : 'en-US', {
        style: 'currency',
        currency: currency === 'USD' ? 'USD' : 'COP',
        maximumFractionDigits: 0,
      }).format(value || 0);
    } catch (error) {
      return `${currency === 'USD' ? '$' : 'COP $'}${value || 0}`;
    }
  }, [currency, language]);

  const renderFavorite = useCallback(({ item }) => {
    if (!item || !item.boat) {
      console.warn('Invalid favorite item:', item);
      return null;
    }

    return (
      <Card
        style={styles.card}
        onPress={() => router.push(`/listings/${item.boat.id}`)}
        accessible
        accessibilityRole="button"
        accessibilityLabel={`Ver ${item.boat.name || 'embarcación'}`}
      >
        <Card.Cover source={{ uri: item.boat.images && item.boat.images[0] ? item.boat.images[0] : 'https://via.placeholder.com/300' }} />
        <Card.Content>
          <Text variant="titleMedium" style={styles.title}>{item.boat.name || 'Nombre no disponible'}</Text>
          <Text variant="bodyMedium" style={styles.location}>{item.boat.location || 'Ubicación no disponible'}</Text>
          <Text variant="bodyMedium" style={styles.price}>{formatPrice(item.boat.pricePerDay)} / día</Text>
        </Card.Content>
        <Card.Actions>
          <IconButton
            icon="heart-off"
            iconColor={styles.removeIcon.color}
            onPress={() => removeFavorite(item.boat.id)}
            accessibilityLabel="Quitar de favoritos"
            accessibilityRole="button"
          />
        </Card.Actions>
      </Card>
    );
  }, [formatPrice, removeFavorite]);

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={styles.secondaryText}>{t('favoritesLoading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={favorites}
        renderItem={renderFavorite}
        keyExtractor={(item, index) => item?.id?.toString() || `favorite-${index}`}
        contentContainerStyle={styles.list}
        initialNumToRender={6}
        windowSize={8}
        removeClippedSubviews
        getItemLayout={(_, index) => ({ length: 320, offset: 320 * index, index })}
        ListEmptyComponent={
          isLoggedIn ? (
            <EmptyState
              title={t('favoritesEmpty')}
              description={t('favoritesEmpty')}
              ctaLabel={t('tabHome')}
              onPress={() => router.push('/home')}
              testID="favorites-empty"
            />
          ) : (
            <EmptyState
              title={t('favoritesLoginTitle')}
              description={t('favoritesLoginSubtitle')}
              ctaLabel={t('favoritesLoginTitle')}
              onPress={() => router.push('/auth')}
              testID="favorites-login-empty"
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
  const danger = '#FF4444';

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
    price: {
      color: accent,
      fontWeight: 'bold',
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
    removeIcon: {
      color: danger,
    },
  });
};