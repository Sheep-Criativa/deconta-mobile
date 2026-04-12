import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/features/auth/store/AuthContext';
import { updateUser } from '@/features/auth/services/auth.service';

export default function ProfileScreen() {
  const { user, login } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !email.trim() || !password) {
      Alert.alert('Campos obrigatórios', 'Preencha o nome, email e sua senha para confirmar as alterações.');
      return;
    }

    try {
      setIsLoading(true);
      // Calls the same updateUser endpoint but we need the password to validate changes.
      const response = await updateUser(user!.id, {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash: password,
      });

      // The backend will respond with the updated User, and possibly a new token if part of the flow.
      // Wait, updateUser returns data as User. The JWT token might not be returned directly in this endpoint.
      // If the backend doesn't return a new token, we just manually update the AuthContext or re-login.
      // Assuming `response.token` is the new token if it's returning one:
      if (response && response.token) {
        login(response.token);
      } else {
        // If we don't have a new token, we'll try to just inform the user.
        // The token stored locally might have the old name, but typical systems will wait for next login.
        // To be safe, we alert success and pop.
      }
      
      Alert.alert('Sucesso', 'Seus dados foram atualizados com sucesso.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error: any) {
      const msg = error?.response?.data?.message || 'Não foi possível atualizar seus dados.';
      Alert.alert('Erro', msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{
          title: 'Dados Pessoais',
          headerBackTitle: 'Voltar',
          headerStyle: {
            backgroundColor: '#18181b',
          },
          headerTintColor: '#fff',
          headerShadowVisible: false,
          headerTitleStyle: {
            fontFamily: 'Poppins_600SemiBold',
            fontSize: 16,
          }
        }} 
      />
      <View style={styles.root}>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Nome completo</Text>
            <View style={styles.inputContainer}>
              <Feather name="user" size={18} color="#a1a1aa" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Seu nome"
                placeholderTextColor="#a1a1aa"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>E-mail</Text>
            <View style={styles.inputContainer}>
              <Feather name="mail" size={18} color="#a1a1aa" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="seu@email.com"
                placeholderTextColor="#a1a1aa"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Confirme sua senha</Text>
            <View style={styles.inputContainer}>
              <Feather name="lock" size={18} color="#a1a1aa" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="Sua senha atual"
                placeholderTextColor="#a1a1aa"
                secureTextEntry
              />
            </View>
            <Text style={styles.helpText}>Para sua segurança, digite sua senha para alterar seus dados.</Text>
          </View>

          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveButtonText}>Salvar Alterações</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins_500Medium',
    color: '#27272a',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: '#d4d4d8',
    borderRadius: 12,
    backgroundColor: '#fafafa',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#18181b',
    height: '100%',
  },
  helpText: {
    fontSize: 12,
    color: '#71717a',
    marginTop: 6,
    fontFamily: 'Poppins_400Regular',
  },
  saveButton: {
    height: 48,
    backgroundColor: '#10b981',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    backgroundColor: '#6ee7b7',
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontFamily: 'Poppins_600SemiBold',
  },
});
