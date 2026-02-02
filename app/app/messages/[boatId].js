import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, FlatList, Alert } from 'react-native';
import { Text, TextInput, Button, Card, FAB, ActivityIndicator } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../../services/api';
import { useSettings } from '../../providers/SettingsProvider';
import { logEvent, logError, logScreen } from '../../services/telemetry';

export default function MessagesScreen() {
  const { boatId, title } = useLocalSearchParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { appearance, paperTheme } = useSettings();
  const styles = useMemo(() => makeStyles(appearance, paperTheme), [appearance, paperTheme]);

  useEffect(() => {
    loadMessages();
    logScreen('messages_detail', { boatId });
  }, [boatId]);

  const loadMessages = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Inicia sesión', 'Debes iniciar sesión para ver mensajes', [
        { text: 'Cancelar', style: 'cancel', onPress: () => router.back() },
        { text: 'Iniciar sesión', onPress: () => router.push('/auth') },
      ]);
      return;
    }
    try {
      const response = await api.get(`/messages/${boatId}`);
      setMessages(response.data || []);
      if (!response.data?.length) {
        logEvent('messages_empty', { boatId });
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      logError(error, { boatId, stage: 'load_messages' });
      Alert.alert('Error', 'No se pudieron cargar los mensajes');
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const token = await AsyncStorage.getItem('token');
    if (!token) {
      Alert.alert('Inicia sesión', 'Debes iniciar sesión para enviar mensajes', [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Iniciar sesión', onPress: () => router.push('/auth') },
      ]);
      return;
    }

    setLoading(true);
    try {
      await api.post('/messages', {
        boatId,
        content: newMessage,
      });
      setNewMessage('');
      loadMessages(); // Reload messages
      logEvent('message_send', { boatId });
    } catch (error) {
      console.error('Error sending message:', error);
      logError(error, { boatId, stage: 'send_message' });
      Alert.alert('Error', 'No se pudo enviar el mensaje');
    }
    setLoading(false);
  };

  const renderMessage = ({ item }) => (
    <Card style={styles.messageCard}>
      <Card.Content>
        <Text style={styles.sender}>{item.sender.email}</Text>
        <Text style={styles.content}>{item.content}</Text>
        <Text style={styles.timestamp}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{title || 'Chat con operador'}</Text>
      </View>

      <FlatList
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        inverted={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            {loading ? (
              <ActivityIndicator animating color={paperTheme.colors.primary} />
            ) : (
              <Text style={styles.emptyText}>Comienza la conversación con el operador.</Text>
            )}
          </View>
        }
      />

      <View style={styles.inputContainer}>
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Escribe un mensaje..."
          mode="outlined"
          style={styles.input}
          multiline
        />
        <Button
          mode="contained"
          onPress={sendMessage}
          loading={loading}
          style={styles.sendButton}
        >
          Enviar
        </Button>
      </View>

      <FAB
        icon="arrow-left"
        style={styles.backFab}
        onPress={() => router.back()}
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

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: background,
    },
    header: {
      padding: 16,
      paddingTop: 50,
      backgroundColor: background,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: primaryText,
      textAlign: 'center',
    },
    messagesList: {
      padding: 16,
      paddingBottom: 100,
    },
    messageCard: {
      marginBottom: 8,
      backgroundColor: surface,
      borderWidth: 1,
      borderColor: border,
      borderRadius: 12,
    },
    sender: {
      fontSize: 14,
      fontWeight: 'bold',
      color: paperTheme.colors.primary,
      marginBottom: 4,
    },
    content: {
      fontSize: 16,
      color: primaryText,
      marginBottom: 4,
    },
    timestamp: {
      fontSize: 12,
      color: secondaryText,
    },
    inputContainer: {
      flexDirection: 'row',
      padding: 16,
      paddingBottom: 32,
      backgroundColor: background,
      gap: 8,
    },
    input: {
      flex: 1,
      backgroundColor: surface,
    },
    sendButton: {
      backgroundColor: paperTheme.colors.primary,
    },
    empty: {
      padding: 32,
      alignItems: 'center',
    },
    emptyText: {
      color: secondaryText,
    },
    backFab: {
      position: 'absolute',
      margin: 16,
      left: 0,
      top: 40,
      backgroundColor: surface,
    },
  });
};