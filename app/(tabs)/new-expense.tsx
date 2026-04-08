import React, { useState, useEffect, useCallback } from 'react';
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
import { useRouter, Stack } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  TransactionStatus,
  TransactionType,
  CreateTransactionDTO,
  createTransactionSchema,
} from '@/features/dashboard/services/transaction.service';
import { Account, getAccounts } from '@/features/dashboard/services/account.service';
import { Category, getCategories } from '@/features/dashboard/services/category.service';
import { Responsible, getResponsibles } from '@/features/dashboard/services/responsible.service';
import { createTransaction } from '@/features/dashboard/services/transaction.service';
import { useAuth } from '@/features/auth/store/AuthContext';

const STATUS_OPTIONS: Array<{ value: TransactionStatus; label: string; color: string }> = [
  { value: 'PENDING', label: 'Pendente', color: '#f59e0b' },
  { value: 'CONFIRMED', label: 'Confirmado', color: '#10b981' },
  { value: 'RECONCILED', label: 'Conciliado', color: '#6366f1' },
];

interface FormValues {
  amount: string;
  description: string;
  accountId: string;
  categoryId: string;
  responsibleId: string;
  status: TransactionStatus;
  date: Date;
}

export default function NewExpenseScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [responsibles, setResponsibles] = useState<Responsible[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showResponsibleDropdown, setShowResponsibleDropdown] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormValues>({
    defaultValues: {
      amount: '',
      description: '',
      accountId: '',
      categoryId: '',
      responsibleId: '',
      status: 'PENDING',
      date: new Date(),
    },
  });

  const selectedAccountId = watch('accountId');
  const selectedCategoryId = watch('categoryId');
  const selectedResponsibleId = watch('responsibleId');
  const selectedStatus = watch('status');

  const selectedAccount = accounts.find((a) => a.id.toString() === selectedAccountId);
  const selectedCategory = categories.find((c) => c.id.toString() === selectedCategoryId);
  const selectedResponsible = responsibles.find((r) => r.id.toString() === selectedResponsibleId);

  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      const [accountsData, categoriesData, responsiblesData] = await Promise.all([
        getAccounts(user?.id),
        getCategories(user?.id),
        getResponsibles(user?.id),
      ]);
      setAccounts(accountsData);
      setCategories(categoriesData.filter((c) => c.type === 'EXPENSE'));
      setResponsibles(responsiblesData.filter((r) => r.isActive));
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onSubmit = async (data: FormValues) => {
    if (!user) {
      Alert.alert('Erro', 'Usuário não autenticado. Faça login novamente.');
      return;
    }

    try {
      setSaving(true);

      const dto: CreateTransactionDTO = {
        userId: user?.id,
        accountId: parseInt(data.accountId, 10),
        categoryId: parseInt(data.categoryId, 10),
        responsibleId: parseInt(data.responsibleId, 10),
        description: data.description || null,
        amount: parseFloat(data.amount.replace(',', '.')),
        date: data.date,
        paymentDate: data.date,
        type: 'EXPENSE' as TransactionType,
        status: data.status,
      };

      await createTransaction(dto);
      router.back();
    } catch (err: any) {
      Alert.alert('Erro', err?.response?.data?.message ?? 'Não foi possível salvar a despesa.');
    } finally {
      setSaving(false);
    }
  };

  const renderDropdown = (
    value: string,
    placeholder: string,
    selectedItem: any,
    items: any[],
    onSelect: (id: string) => void,
    onToggle: () => void,
    isOpen: boolean
  ) => (
    <View>
      <TouchableOpacity
        style={[styles.dropdown, isOpen && styles.dropdownOpen]}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        {selectedItem ? (
          <Text style={styles.dropdownValue}>{selectedItem.name}</Text>
        ) : (
          <Text style={styles.dropdownPlaceholder}>{placeholder}</Text>
        )}
        <Feather name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#71717a" />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdownList}>
          <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
            {items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.dropdownItem, value === item.id.toString() && styles.dropdownItemSelected]}
                onPress={() => {
                  onSelect(item.id.toString());
                  onToggle();
                }}
              >
                <Text
                  style={[
                    styles.dropdownItemText,
                    value === item.id.toString() && styles.dropdownItemTextSelected,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.root, styles.center]}>
        <ActivityIndicator size="large" color="#ef4444" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Nova Despesa',
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x" size={22} color="#18181b" />
            </TouchableOpacity>
          ),
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.root}
          contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Controller
            control={control}
            name="amount"
            rules={{
              required: 'Valor é obrigatório',
              pattern: {
                value: /^\d+([,.]\d+)?$/,
                message: 'Valor inválido',
              },
            }}
            render={({ field: { onChange, value } }) => (
              <View>
                <Text style={styles.label}>Valor</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.currencyPrefix}>R$</Text>
                  <TextInput
                    style={[styles.input, { flex: 1, borderWidth: 0 }]}
                    placeholder="0,00"
                    placeholderTextColor="#a1a1aa"
                    keyboardType="decimal-pad"
                    value={value}
                    onChangeText={onChange}
                  />
                </View>
                {errors.amount && <Text style={styles.error}>{errors.amount.message}</Text>}
              </View>
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <View>
                <Text style={styles.label}>Descrição (opcional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Almoço, Transporte..."
                  placeholderTextColor="#a1a1aa"
                  value={value}
                  onChangeText={onChange}
                  maxLength={250}
                />
              </View>
            )}
          />

          <Controller
            control={control}
            name="accountId"
            rules={{ required: 'Conta é obrigatória' }}
            render={({ field: { value } }) => (
              <View>
                <Text style={styles.label}>Conta</Text>
                {renderDropdown(
                  value,
                  'Selecione a conta',
                  selectedAccount,
                  accounts,
                  (id) => setValue('accountId', id),
                  () => setShowAccountDropdown(!showAccountDropdown),
                  showAccountDropdown
                )}
                {errors.accountId && <Text style={styles.error}>{errors.accountId.message}</Text>}
              </View>
            )}
          />

          <Controller
            control={control}
            name="categoryId"
            rules={{ required: 'Categoria é obrigatória' }}
            render={({ field: { value } }) => (
              <View>
                <Text style={styles.label}>Categoria</Text>
                {renderDropdown(
                  value,
                  'Selecione a categoria',
                  selectedCategory,
                  categories,
                  (id) => setValue('categoryId', id),
                  () => setShowCategoryDropdown(!showCategoryDropdown),
                  showCategoryDropdown
                )}
                {errors.categoryId && <Text style={styles.error}>{errors.categoryId.message}</Text>}
              </View>
            )}
          />

          <Controller
            control={control}
            name="responsibleId"
            rules={{ required: 'Responsável é obrigatório' }}
            render={({ field: { value } }) => (
              <View>
                <Text style={styles.label}>Responsável</Text>
                {renderDropdown(
                  value,
                  'Selecione o responsável',
                  selectedResponsible,
                  responsibles,
                  (id) => setValue('responsibleId', id),
                  () => setShowResponsibleDropdown(!showResponsibleDropdown),
                  showResponsibleDropdown
                )}
                {errors.responsibleId && (
                  <Text style={styles.error}>{errors.responsibleId.message}</Text>
                )}
              </View>
            )}
          />

          <Controller
            control={control}
            name="status"
            render={({ field: { onChange, value } }) => (
              <View>
                <Text style={styles.label}>Status</Text>
                <View style={styles.statusRow}>
                  {STATUS_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.statusChip,
                        value === option.value && { backgroundColor: option.color, borderColor: option.color },
                      ]}
                      onPress={() => onChange(option.value)}
                      activeOpacity={0.8}
                    >
                      <Text
                        style={[
                          styles.statusChipText,
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

          <TouchableOpacity
            style={[styles.saveButton, saving && styles.saveButtonDisabled]}
            onPress={handleSubmit(onSubmit)}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.saveButtonText}>Salvar Despesa</Text>
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
  content: {
    padding: 20,
    gap: 4,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
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
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    backgroundColor: '#fafafa',
    paddingHorizontal: 14,
  },
  currencyPrefix: {
    fontSize: 16,
    fontWeight: '600',
    color: '#71717a',
    marginRight: 8,
  },
  dropdown: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    backgroundColor: '#fafafa',
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownOpen: {
    borderColor: '#ef4444',
  },
  dropdownPlaceholder: {
    fontSize: 16,
    color: '#a1a1aa',
  },
  dropdownValue: {
    fontSize: 16,
    color: '#18181b',
  },
  dropdownList: {
    marginTop: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    backgroundColor: '#ffffff',
    maxHeight: 180,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownScroll: {
    padding: 4,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  dropdownItemSelected: {
    backgroundColor: '#ef444420',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#18181b',
  },
  dropdownItemTextSelected: {
    color: '#ef4444',
    fontWeight: '600',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statusChip: {
    flex: 1,
    height: 40,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#e4e4e7',
    backgroundColor: '#fafafa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusChipText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#71717a',
  },
  saveButton: {
    height: 52,
    backgroundColor: '#ef4444',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    shadowColor: '#ef4444',
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
