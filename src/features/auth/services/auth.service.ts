import api from "@/shared/services/api";
import * as SecureStore from 'expo-secure-store';

export interface RegisterData {
    name: string;
    email: string;
    password: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    avatar: string;
    token: string;
}

export async function registerUser(data: RegisterData) {
    try {
        const payload = {
            name: data.name,
            email: data.email,
            passwordHash: data.password,
        };
        console.log('[registerUser] Enviando payload:', JSON.stringify(payload));
        const response = await api.post('/users', payload);
        console.log('[registerUser] Resposta da API:', JSON.stringify(response.data));
        return response.data;
    } catch (error: any) {
        console.error('[registerUser] Erro:', error.response?.data || error.message);
        console.error('[registerUser] Status:', error.response?.status);
        throw error;
    }
}

export async function loginUser(data: RegisterData) {
    try {
        const payload = {
            email: data.email,
            passwordHash: data.password,
            password: data.password
        };
        const response = await api.post('/auth/login', payload);
        
        // Save tokens if they come in the body
        const { accessToken, refreshToken } = response.data;
        if (accessToken) {
            await SecureStore.setItemAsync('accessToken', accessToken);
        }
        if (refreshToken) {
            await SecureStore.setItemAsync('refreshToken', refreshToken);
        }

        return response.data;
    } catch (error: any) {
        console.error("Login Error:", error.response?.data || error.message);
        console.error("Error Status:", error.response?.status);
        console.error("Error Config:", {
            url: error.config?.url,
            method: error.config?.method,
            data: error.config?.data
        });
        console.error("Full Error:", error);
        throw error;
    }
}

export async function googleLogin(token: string) {
    const response = await api.post('/auth/google', { token });
    
    // Save tokens if they come in the body
    const { accessToken, refreshToken } = response.data;
    if (accessToken) {
        await SecureStore.setItemAsync('accessToken', accessToken);
    }
    if (refreshToken) {
        await SecureStore.setItemAsync('refreshToken', refreshToken);
    }

    return response.data;
}

export async function getMe() {
    const response = await api.get('/auth/me');
    return response.data;
}

export async function logoutUser() {
    const response = await api.post('/auth/logout');
    
    // Remove tokens from device
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');

    return response.data;
}

export async function updateProfile(id: number, data: RegisterData) {
    const response = await api.put(`/users/${id}`, data);
    return response.data as User;
}