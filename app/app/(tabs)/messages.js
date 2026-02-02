import React, { useEffect, useMemo, useState } from 'react';
import { View, FlatList, StyleSheet, Alert } from 'react-native';
import { Text, Card, List } from 'react-native-paper';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../../services/api';
import { useSettings } from '../../providers/SettingsProvider';

export default function MessagesScreen() {
  const { appearance, paperTheme, t } = useSettings();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const styles = useMemo(() => makeStyles(appearance, paperTheme), [appearance, paperTheme]);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadConversations();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn]);

  const checkLoginStatus = async () => {
    const token = await AsyncStorage.getItem('token');
    setIsLoggedIn(!!token);
  };

  const loadConversations = async () => {
    try {
      // This would need to be implemented in the backend
      // For now, show empty state
      setConversations([]);
    } catch (error) {
      console.error('Error loading conversations:', error);
      Alert.alert('Error', 'No se pudieron cargar las conversaciones');
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <View style={styles.loginPrompt}>
          <MaterialCommunityIcons name="message" size={64} color={styles.icon.color} />
          <Text style={styles.loginText}>{t('messagesLoginTitle')}</Text>
          <Text style={styles.loginSubtext}>
            {t('messagesLoginBody')}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('messagesTitle')}</Text>
      {conversations.length === 0 ? (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="message-outline" size={64} color={styles.icon.color} />
          <Text style={styles.emptyText}>{t('messagesEmptyTitle')}</Text>
          <Text style={styles.emptySubtext}>
            {t('messagesEmptyBody')}
          </Text>
        </View>
      ) : (
        <FlatList
          data={conversations}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Card style={styles.conversationCard} onPress={() => router.push(`/messages/${item.boatId}`)}>
              <Card.Content>
                <List.Item
                  title={item.boatName}
                  description={item.lastMessage}
                  left={props => <List.Icon {...props} icon="sail-boat" />}
                  right={props => <Text style={styles.timeText}>{item.time}</Text>}
                />
              </Card.Content>
            </Card>
          )}
        />
      )}
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

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: background,
      padding: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: primaryText,
      marginBottom: 16,
    },
    loginPrompt: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 32,
    },
    loginText: {
      fontSize: 18,
      color: primaryText,
      textAlign: 'center',
      marginTop: 16,
      marginBottom: 8,
    },
    loginSubtext: {
      fontSize: 14,
      color: secondaryText,
      textAlign: 'center',
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 18,
      color: primaryText,
      textAlign: 'center',
      marginTop: 16,
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: secondaryText,
      textAlign: 'center',
    },
    conversationCard: {
      marginBottom: 8,
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
    timeText: {
      color: secondaryText,
      fontSize: 12,
    },
    icon: {
      color: secondaryText,
    },
  });
};