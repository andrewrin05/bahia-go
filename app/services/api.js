import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

// Backend por defecto en 8084 para no chocar con el puerto 8081 de Metro
const DEFAULT_PORT = 8084;

const cleanUrl = (url) => (url ? url.replace(/\/+$/, '') : undefined);

// 1) Override via env (Expo).
const ENV_API_BASE_URL = cleanUrl(process.env.EXPO_PUBLIC_API_BASE_URL);

// 2) Derive LAN IP from Metro host for physical devices.
const hostUri = Constants.expoConfig?.hostUri || Constants.expoGoConfig?.hostUri;
const lanHost = hostUri ? hostUri.split(':')[0] : undefined;
const lanBaseURL = lanHost ? `http://${lanHost}:${DEFAULT_PORT}` : undefined;

// 3) Emulator/simulator fallback.
const fallbackBaseURL = Platform.OS === 'android'
  ? `http://10.0.2.2:${DEFAULT_PORT}`
  : `http://localhost:${DEFAULT_PORT}`;

const API_BASE_URL = ENV_API_BASE_URL || lanBaseURL || fallbackBaseURL;

if (__DEV__) {
  console.log('[API] baseURL:', API_BASE_URL, {
    env: ENV_API_BASE_URL,
    hostUri,
    lanBaseURL,
    fallbackBaseURL,
  });
}

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // evita timeouts cortos al cargar datos
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  requestOtp: (email) => api.post('/auth/request-otp', { email }),
  verifyOtp: (email, code) => api.post('/auth/verify-otp', { email, code }),
  registerPassword: (email, password) => api.post('/auth/register-password', { email, password }),
  loginPassword: (email, password) => api.post('/auth/login-password', { email, password }),
};

export const boatsAPI = {
  getAll: (params) => api.get('/boats', { params }),
  search: (params) => api.get('/boats/search', { params }),
  getOne: (id) => api.get(`/boats/${id}`),
  checkAvailability: (id, params) => api.get(`/boats/${id}/availability`, { params }),
  create: (data) => api.post('/boats', data),
  update: (id, data) => api.put(`/boats/${id}`, data),
  delete: (id) => api.delete(`/boats/${id}`),
};

export const bookingsAPI = {
  getAll: () => api.get('/bookings'),
  create: (data) => api.post('/bookings', data),
  update: (id, data) => api.put(`/bookings/${id}`, data),
  delete: (id) => api.delete(`/bookings/${id}`),
};

export const favoritesAPI = {
  getAll: () => api.get('/favorites'),
  add: (boatId) => api.post('/favorites', { boatId }),
  remove: (boatId) => api.delete(`/favorites/${boatId}`),
};

export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations/me'),
  getByBoat: (boatId) => api.get(`/messages/${boatId}`),
  send: (data) => api.post('/messages', data),
};

export const savedSearchesAPI = {
  getAll: () => api.get('/saved-searches'),
  create: (data) => api.post('/saved-searches', data),
  delete: (id) => api.delete(`/saved-searches/${id}`),
};

export const paymentsAPI = {
  createWompiCheckout: (bookingId, options = {}) =>
    api.post('/payments/wompi/checkout', {
      bookingId,
      ...options,
    }),
};

export default api;