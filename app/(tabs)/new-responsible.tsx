import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter, Stack, useLocalSearchParams } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  CreateResponsibleDTO,
  UpdateResponsibleDTO,
  createResponsible,
  updateResponsible,
} from '@/features/dashboard/services/responsible.service';
import { useAuth } from '@/features/auth/store/AuthContext';

const RESPONSIBLE_COLORS = [
  '#10b981', '#ef4444', '#6366f1', '#f59e0b', '#ec4899',
  '#8b5cf6', '#14b8a6', '#f97316', '#84cc16', '#06b6d4',
];

interface FormValues {
  name: string;
  color: string;
}

export default function NewResponsibleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  // Params para modo edição
  const params = useLocalSearchParams<{ id?: string; name?: string; color?: string }>();
  const isEditing = !!params.id;

  const { control, handleSubmit, formState: { errors }, watch, reset } = useForm<FormValues>({
    defaultValues: {
      name: '',
      color: RESPONSIBLE_COLORS[0],
    },
  });

  // Preenche o form ao editar
  useEffect(() => {
    if (isEditing) {
      reset({
        name: params.name ?? '',
        color: params.color ?? RESPONSIBLE_COLORS[0],
      });
    }
  }, [isEditing]);

  const selectedColor = watch('color');

  const getInitial = (name: string) => name.trim().charAt(0).toUpperCase() || '?';

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      Alert.alert('Erro', 'Usuário não autenticado. Faça login novamente.');
      return;
    }
    try {
      setSaving(true);
      if (isEditing) {
        const dto: UpdateResponsibleDTO = {
          userId: user.id,
          name: data.name.trim(),
          color: data.color,
        };
        await updateResponsible(Number(params.id), dto);
      } else {
        const dto: CreateResponsibleDTO = {
          userId: user.id,
          name: data.name.trim(),
          color: data.color,
          isActive: true,
        };
        await createResponsible(dto);
      }
      router.back();
    } catch (err: any) {
      Alert.alert('Erro', err?.response?.data?.message ?? 'Não foi possível salvar o responsável.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ── Header Escuro ── */}
        <View style={[styles.darkHeader, { paddingTop: insets.top }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.darkHeaderBack}>
            <Feather name="x" size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.darkHeaderTitle}>
            {isEditing ? 'Editar Responsável' : 'Novo Responsável'}
          </Text>
        </View>

        <ScrollView
          style={styles.root}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Preview */}
          <View style={styles.previewContainer}>
            <View style={[styles.previewAvatar, { backgroundColor: selectedColor }]}>
              <Text style={styles.previewInitial}>{getInitial(watch('name'))}</Text>
            </View>
            <Text style={styles.previewLabel}>{watch('name') || 'Nome do responsável'}</Text>
          </View>

          {/* Nome */}
          <Controller
            control={control}
            name="name"
            rules={{
              required: 'Nome é obrigatório',
              minLength: { value: 2, message: 'Nome deve ter no mínimo 2 caracteres' },
              maxLength: { value: 100, message: 'Nome deve ter no máximo 100 caracteres' },
            }}
            render={({ field: { onChange, value } }) => (
              <View>
                <Text style={styles.label}>Nome</Text>
                <TextInput
                  style={[styles.input, errors.name && styles.inputError]}
                  placeholder="Ex: João Silva, Maria Santos..."
                  placeholderTextColor="#a1a1aa"
                  value={value}
                  onChangeText={onChange}
                  maxLength={100}
                  autoCapitalize="words"
                />
                {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}
              </View>
            )}
          />

          {/* Cor */}
          <Controller
            control={control}
            name="color"
            render={({ field: { onChange, value } }) => (
              <View>
                <Text style={styles.label}>Cor de identificação</Text>
                <View style={styles.colorsGrid}>
                  {RESPONSIBLE_COLORS.map((color) => (
                    <TouchableOpacity
                      key={color}
                      style={[
                        styles.colorOption,
                        { backgroundColor: color },
                        value === color && styles.colorOptionSelected,
                      ]}
                      onPress={() => onChange(color)}
                      activeOpacity={0.8}
                    >
                      {value === color && <Feather name="check" size={16} color="#ffffff" />}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          />

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.saveButtonText}>
                {isEditing ? 'Salvar alterações' : 'Salvar Responsável'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ffffff' },
  darkHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    paddingHorizontal: 16, paddingBottom: 14, backgroundColor: '#18181b',
  },
  darkHeaderBack: {
    width: 36, height: 36, borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center', justifyContent: 'center',
  },
  darkHeaderTitle: { fontSize: 16, fontWeight: '700', color: '#fff', flex: 1 },
  content: { padding: 20, gap: 4 },
  previewContainer: { alignItems: 'center', paddingVertical: 24, marginBottom: 8 },
  previewAvatar: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  previewInitial: { fontSize: 32, fontWeight: '700', color: '#ffffff' },
  previewLabel: { fontSize: 18, fontWeight: '600', color: '#18181b' },
  label: { fontSize: 14, fontWeight: '600', color: '#27272a', marginBottom: 8, marginTop: 16 },
  input: {
    height: 48, borderRadius: 12, borderWidth: 1, borderColor: '#e4e4e7',
    backgroundColor: '#fafafa', paddingHorizontal: 14, fontSize: 16, color: '#18181b',
  },
  inputError: { borderColor: '#ef4444' },
  colorsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  colorOption: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  colorOptionSelected: {
    borderWidth: 3, borderColor: '#ffffff',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
  },
  saveButton: {
    height: 52, backgroundColor: '#10b981', borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginTop: 32,
    shadowColor: '#10b981', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { fontSize: 16, fontWeight: '700', color: '#ffffff' },
  error: { fontSize: 12, color: '#ef4444', marginTop: 4 },
});
