import React, { useState } from 'react';
import { ScrollView, View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button, Switch, HelperText, Divider } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import api from '../../../services/api';

export default function AdminCreateBoatScreen() {
  const [name, setName] = useState('');
  const [type, setType] = useState('yacht');
  const [location, setLocation] = useState('Cartagena');
  const [capacity, setCapacity] = useState('8');
  const [pricePerDay, setPricePerDay] = useState('500');
  const [description, setDescription] = useState('');
  const [image1, setImage1] = useState('');
  const [image2, setImage2] = useState('');
  const [published, setPublished] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!name.trim() || !type.trim() || !location.trim()) {
      Alert.alert('Faltan datos', 'Nombre, tipo y ubicación son obligatorios');
      return;
    }
    const priceNumber = parseFloat(pricePerDay) || 0;
    const capacityNumber = parseInt(capacity, 10) || 0;
    const images = [image1, image2].filter((v) => v && v.trim());

    setSubmitting(true);
    try {
      await api.post('/boats', {
        name,
        type,
        location,
        capacity: capacityNumber,
        price: priceNumber,
        pricePerDay: priceNumber,
        description,
        imageUrl: images[0] || null,
        images,
        published,
      });
      Alert.alert('Guardado', 'Embarcación creada', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch (error) {
      console.warn('Error creando boat', error?.response?.data || error?.message);
      const msg = error?.response?.data?.message || 'No se pudo crear (¿tienes rol admin?)';
      Alert.alert('Error', msg);
    } finally {
      setSubmitting(false);
    }
  };

  const pickImage = async (setter) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso requerido', 'Habilita acceso a fotos para seleccionar una imagen.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets && result.assets[0]) {
      const asset = result.assets[0];
      const dataUri = asset.base64
        ? `data:${asset.mimeType || 'image/jpeg'};base64,${asset.base64}`
        : asset.uri;
      setter(dataUri);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Admin: Crear Embarcación</Text>
      <HelperText type="info">Solo usuarios ADMIN pueden guardar.</HelperText>
      <TextInput label="Nombre" value={name} onChangeText={setName} style={styles.input} mode="outlined" />
      <TextInput label="Tipo (yacht, speedboat, jetski, etc.)" value={type} onChangeText={setType} style={styles.input} mode="outlined" />
      <TextInput label="Ubicación" value={location} onChangeText={setLocation} style={styles.input} mode="outlined" />
      <TextInput label="Capacidad" value={capacity} onChangeText={setCapacity} keyboardType="numeric" style={styles.input} mode="outlined" />
      <TextInput label="Precio por día" value={pricePerDay} onChangeText={setPricePerDay} keyboardType="numeric" style={styles.input} mode="outlined" />
      <TextInput label="Descripción" value={description} onChangeText={setDescription} style={styles.input} mode="outlined" multiline />
      <Divider style={styles.divider} />
      <TextInput label="Imagen 1 URL o base64" value={image1} onChangeText={setImage1} style={styles.input} mode="outlined" />
      <Button mode="outlined" onPress={() => pickImage(setImage1)} style={styles.pickButton}>Elegir de galería (1)</Button>
      <TextInput label="Imagen 2 URL o base64" value={image2} onChangeText={setImage2} style={styles.input} mode="outlined" />
      <Button mode="outlined" onPress={() => pickImage(setImage2)} style={styles.pickButton}>Elegir de galería (2)</Button>
      <View style={styles.row}>
        <Text style={styles.switchLabel}>Publicar</Text>
        <Switch value={published} onValueChange={setPublished} />
      </View>
      <Button mode="contained" onPress={onSubmit} loading={submitting} disabled={submitting} style={styles.submit}>
        Guardar
      </Button>
      <Button mode="text" onPress={() => router.back()} style={styles.cancel}>Cancelar</Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
  },
  divider: {
    marginVertical: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  submit: {
    marginTop: 8,
    backgroundColor: '#007AFF',
  },
  cancel: {
    marginTop: 8,
  },
});
