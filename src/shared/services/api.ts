import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Error reading token from SecureStore", error);
  }
  return config;
});

export default api;