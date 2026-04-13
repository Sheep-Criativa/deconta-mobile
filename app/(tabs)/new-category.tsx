import { Feather } from '@expo/vector-icons';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import React, { useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/features/auth/store/AuthContext';
import { CreateCategoryDTO, UpdateCategoryDTO, createCategory, updateCategory } from '@/features/dashboard/services/category.service';



const CATEGORY_COLORS = [
  '#10b981', '#ef4444', '#6366f1', '#f59e0b', '#ec4899',
  '#8b5cf6', '#14b8a6', '#f97316', '#84cc16', '#06b6d4',
];

const CATEGORY_ICONS = [
  'home', 'shopping-bag', 'heart', 'music', 'book',
  'briefcase', 'tool', 'gift', 'coffee', 'zap',
  'truck', 'film', 'globe', 'award', 'anchor',
];

const TYPE_OPTIONS: { value: 'INCOME' | 'EXPENSE'; label: string; color: string }[] = [
  { value: 'INCOME', label: 'Receita', color: '#10b981' },
  { value: 'EXPENSE', label: 'Despesa', color: '#ef4444' },
];

interface FormValues {
  name: string;
  color: string;
  icon: string;
  type: 'INCOME' | 'EXPENSE';
}

export default function NewCategoryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  // Params para edição
  const params = useLocalSearchParams<{ id?: string; name?: string; color?: string; icon?: string; type?: string }>();
  const isEditing = !!params.id;

  const { control, handleSubmit, formState: { errors }, watch, reset } = useForm<FormValues>({
    defaultValues: {
      name: '',
      color: CATEGORY_COLORS[0],
      icon: CATEGORY_ICONS[0],
      type: 'EXPENSE',
    },
  });

  useEffect(() => {
    if (isEditing) {
      reset({
        name: params.name ?? '',
        color: params.color ?? CATEGORY_COLORS[0],
        icon: params.icon ?? CATEGORY_ICONS[0],
        type: (params.type as 'INCOME' | 'EXPENSE') ?? 'EXPENSE',
      });
    }
  }, [isEditing]);

  const selectedColor = watch('color');
  const selectedIcon = watch('icon');
  const selectedType = watch('type');

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      Alert.alert('Erro', 'Usuário não autenticado. Faça login novamente.');
      return;
    }
    try {
      setSaving(true);
      if (isEditing) {
        const dto: UpdateCategoryDTO = {
          name: data.name.trim(),
          color: data.color,
          icon: data.icon,
          type: data.type,
        };
        await updateCategory(Number(params.id), dto);
      } else {
        const dto: CreateCategoryDTO = {
          userId: user.id,
          name: data.name.trim(),
          color: data.color,
          icon: data.icon,
          type: data.type,
        };
        await createCategory(dto);
      }
      router.back();
    } catch (err: any) {
      console.error('[Category] Erro:', err?.response?.data || err?.message);
      Alert.alert('Erro', err?.response?.data?.message ?? 'Não foi possível salvar a categoria.');
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
            {isEditing ? 'Editar Categoria' : 'Nova Categoria'}
          </Text>
        </View>

        <ScrollView
          style={styles.root}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.previewContainer}>
            <View style={[styles.previewIcon, { backgroundColor: selectedColor }]}>
              <Feather name={selectedIcon as any} size={28} color="#ffffff" />
            </View>
            <Text style={styles.previewLabel}>{watch('name') || 'Nome da categoria'}</Text>
          </View>

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
                  placeholder="Ex: Alimentação, Transporte..."
                  placeholderTextColor="#a1a1aa"
                  value={value}
                  onChangeText={onChange}
                  maxLength={100}
                />
                {errors.name && <Text style={styles.error}>{errors.name.message}</Text>}
              </View>
            )}
          />

          <Controller
            control={control}
            name="type"
            render={({ field: { onChange, value } }) => (
              <View>
                <Text style={styles.label}>Tipo</Text>
                <View style={styles.typeRow}>
                  {TYPE_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.typeChip,
                        value === option.value && { backgroundColor: option.color, borderColor: option.color },
                      ]}
                      onPress={() => onChange(option.value)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.typeChipText,
                          value === option.value && { color: '#ffffff' },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          />

          <Controller
            control={control}
            name="color"
            render={({ field: { onChange, value } }) => (
              <View>
                <Text style={styles.label}>Cor</Text>
                <View style={styles.colorsGrid}>
                  {CATEGORY_COLORS.map((color) => (
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

          <Controller
            control={control}
            name="icon"
            render={({ field: { onChange, value } }) => (
              <View>
                <Text style={styles.label}>Ícone</Text>
                <View style={styles.iconsGrid}>
                  {CATEGORY_ICONS.map((icon) => (
                    <TouchableOpacity
                      key={icon}
                      style={[
                        styles.iconOption,
                        value === icon && { backgroundColor: selectedColor, borderColor: selectedColor },
                      ]}
                      onPress={() => onChange(icon)}
                      activeOpacity={0.8}
                    >
                      <Feather
                        name={icon as any}
                        size={22}
                        color={value === icon ? '#ffffff' : '#71717a'}
                      />
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
                {isEditing ? 'Salvar alterações' : 'Salvar Categoria'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  // Dark header — igual ao de novo-responsável
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
  content: {
    padding: 20,
    gap: 4,
  },
  previewContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    marginBottom: 8,
  },
  previewIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#18181b',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27272a',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    backgroundColor: '#fafafa',
    paddingHorizontal: 14,
    fontSize: 16,
    color: '#18181b',
  },
  inputError: {
    borderColor: '#ef4444',
  },
  typeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  typeChip: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e4e4e7',
    backgroundColor: '#fafafa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  typeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#71717a',
  },
  colorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorOptionSelected: {
    borderWidth: 3,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  iconsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  iconOption: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f4f5',
    borderWidth: 1.5,
    borderColor: '#e4e4e7',
  },
  saveButton: {
    height: 52,
    backgroundColor: '#6366f1',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  error: {
    fontSize: 12,
    color: '#ef4444',
    marginTop: 4,
  },
});
