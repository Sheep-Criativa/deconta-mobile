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
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  TransactionStatus,
  TransactionType,
  CreateTransactionDTO,
  createTransaction,
} from '@/features/dashboard/services/transaction.service';
import { Account, getAccounts } from '@/features/dashboard/services/account.service';
import { Category, getCategories } from '@/features/dashboard/services/category.service';
import { Responsible, getResponsibles } from '@/features/dashboard/services/responsible.service';
import { useAuth } from '@/features/auth/store/AuthContext';

// Helper for date formatting DD/MM/YYYY
const maskDate = (value: string) => {
  return value
    .replace(/\D/g, '')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .replace(/(\d{2})(\d)/, '$1/$2')
    .slice(0, 10);
};

const parseDateString = (dateStr: string) => {
  const [day, month, year] = dateStr.split('/');
  return new Date(`${year}-${month}-${day}T12:00:00Z`);
};

const todayStr = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

const STATUS_OPTIONS: Array<{ value: TransactionStatus; label: string; color: string; icon: any }> = [
  { value: 'CONFIRMED', label: 'Confirmado', color: '#10b981', icon: 'check-circle' },
  { value: 'PENDING', label: 'Pendente', color: '#f59e0b', icon: 'clock' },
  { value: 'RECONCILED', label: 'Conciliado', color: '#3b82f6', icon: 'shield' },
];

const recipeSchema = z.object({
  amount: z.string().min(1, 'Valor é obrigatório'),
  description: z.string().max(250).optional(),
  accountId: z.coerce.number().min(1, 'Selecione uma conta'),
  categoryId: z.coerce.number().optional().default(0),
  responsibleId: z.coerce.number().optional().default(0),
  status: z.enum(['PENDING', 'CONFIRMED', 'RECONCILED']),
  date: z.string().min(10, 'Data inválida'),
  paymentDate: z.string().min(10, 'Data inválida'),
  notes: z.string().max(1000).optional(),
});
type RecipeFormValues = z.infer<typeof recipeSchema>;

export default function NewRecipeScreen() {
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
  } = useForm<RecipeFormValues>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      amount: '',
      description: '',
      accountId: 0,
      categoryId: 0,
      responsibleId: 0,
      status: 'CONFIRMED',
      date: todayStr(),
      paymentDate: todayStr(),
      notes: '',
    },
  });

  const selectedAccountId = watch('accountId');
  const selectedCategoryId = watch('categoryId');
  const selectedResponsibleId = watch('responsibleId');

  const selectedAccount = accounts.find((a) => a.id === selectedAccountId);
  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);
  const selectedResponsible = responsibles.find((r) => r.id === selectedResponsibleId);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const [accountsData, categoriesData, responsiblesData] = await Promise.all([
        getAccounts(user?.id),
        getCategories(user?.id),
        getResponsibles(user?.id),
      ]);
      // Remove contas de crédito da tela de receitas
      setAccounts(accountsData.filter(a => a.isActive && a.type.trim() !== 'CREDIT_CARD'));
      
      setCategories(categoriesData.filter((c) => c.type.trim() === 'INCOME'));
      
      const activeResps = responsiblesData.filter((r) => r.isActive);
      setResponsibles(activeResps);
      
      // Auto selecionar Responsável idêntico ao nome do usuário ou o primeiro
      if (activeResps.length > 0) {
        const userName = user.name?.trim().toLowerCase() ?? '';
        const selfResp = activeResps.find(r => r.name.trim().toLowerCase() === userName) ?? activeResps[0];
        setValue('responsibleId', selfResp.id);
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível carregar os dados.');
    } finally {
      setLoading(false);
    }
  }, [user, setValue]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onSubmit = async (data: RecipeFormValues) => {
    if (!user) {
      Alert.alert('Erro', 'Sessão expirada. Faça login novamente.');
      return;
    }

    try {
      setSaving(true);
      
      let finalCatId = data.categoryId;
      if (!finalCatId || finalCatId === 0) {
        // Fallback para Categoria 'Geral'
        const geral = categories.find(c => c.name.toLowerCase() === 'geral');
        finalCatId = geral ? geral.id : categories[0]?.id; 
      }

      let finalRespId = data.responsibleId;
      if (!finalRespId || finalRespId === 0) {
        finalRespId = responsibles[0]?.id;
      }

      if (!finalCatId || !finalRespId) {
        Alert.alert('Aviso', 'Nenhuma categoria ou responsável cadastrado disponível.');
        return;
      }

      const numericAmount = parseFloat(data.amount.replace(',', '.'));

      const dateObj = parseDateString(data.date);
      const paymentDateObj = parseDateString(data.paymentDate);

      const dto: CreateTransactionDTO = {
        userId: user.id,
        accountId: data.accountId,
        categoryId: finalCatId,
        responsibleId: finalRespId,
        description: data.description || null,
        amount: Number(numericAmount.toFixed(2)),
        date: dateObj.toISOString(),
        paymentDate: paymentDateObj.toISOString(),
        type: 'INCOME',
        status: data.status,
      };

      await createTransaction(dto);
      Alert.alert('Sucesso', 'Receita registrada com sucesso!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (err: any) {
      Alert.alert('Erro', err?.response?.data?.message || 'Não foi possível salvar a receita.');
    } finally {
      setSaving(false);
    }
  };

  const renderDropdown = (
    value: number,
    placeholder: string,
    selectedItem: any,
    items: any[],
    onSelect: (id: number) => void,
    onToggle: () => void,
    isOpen: boolean,
    showEmptyOpt?: boolean,
    emptyIcon?: string,
    emptyColor?: string,
    emptyLabel?: string,
  ) => (
    <View>
      <TouchableOpacity
        style={[styles.dropdown, isOpen && styles.dropdownOpen]}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        {selectedItem ? (
          <View style={styles.dropdownValueBox}>
            {selectedItem.color && <View style={[styles.colorDot, { backgroundColor: selectedItem.color }]}/>}
            <Text style={styles.dropdownValue}>{selectedItem.name}</Text>
          </View>
        ) : (
          value === 0 && showEmptyOpt ? (
            <View style={styles.dropdownValueBox}>
              <View style={[styles.colorDot, { backgroundColor: emptyColor }]}/>
              <Text style={[styles.dropdownValue, { color: '#a1a1aa' }]}>{emptyLabel}</Text>
            </View>
          ) : (
            <Text style={styles.dropdownPlaceholder}>{placeholder}</Text>
          )
        )}
        <Feather name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#71717a" />
      </TouchableOpacity>

      {isOpen && (
        <View style={styles.dropdownList}>
          <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
            {showEmptyOpt && (
              <TouchableOpacity
                style={[styles.dropdownItem, value === 0 && styles.dropdownItemSelected]}
                onPress={() => {
                  onSelect(0);
                  onToggle();
                }}
              >
                <View style={styles.dropdownValueBox}>
                  <View style={[styles.colorDot, { backgroundColor: emptyColor }]}/>
                  <Text style={[styles.dropdownItemText, { color: '#a1a1aa' }, value === 0 && styles.dropdownItemTextSelected]}>
                    {emptyLabel}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {items.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[styles.dropdownItem, value === item.id && styles.dropdownItemSelected]}
                onPress={() => {
                  onSelect(item.id);
                  onToggle();
                }}
              >
                <View style={styles.dropdownValueBox}>
                  {item.color && <View style={[styles.colorDot, { backgroundColor: item.color }]}/>}
                  <Text
                    style={[
                      styles.dropdownItemText,
                      value === item.id && styles.dropdownItemTextSelected,
                    ]}
                  >
                    {item.name}
                  </Text>
                </View>
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
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Nova Receita',
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Feather name="x" size={22} color="#18181b" />
            </TouchableOpacity>
          ),
          headerStyle: { backgroundColor: '#ffffff' },
          headerShadowVisible: false,
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

          {/* Valor */}
          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange, value } }) => (
              <View>
                <Text style={styles.sectionTitle}>VALOR (R$)</Text>
                <View style={styles.inputWrapper}>
                  <Text style={styles.currencyPrefix}>R$</Text>
                  <TextInput
                    style={[styles.input, { flex: 1, borderWidth: 0, fontSize: 24, fontWeight: 'bold' }]}
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

          {/* Contas e Categorias */}
          <View style={styles.row}>
            <Controller
              control={control}
              name="accountId"
              render={({ field: { value } }) => (
                <View style={styles.flex1}>
                  <Text style={styles.sectionTitle}>CONTA RECEPTORA</Text>
                  {renderDropdown(
                    value,
                    'Selecione...',
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
              render={({ field: { value } }) => (
                <View style={styles.flex1}>
                  <Text style={styles.sectionTitle}>CATEGORIA</Text>
                  {renderDropdown(
                    value,
                    'Categoria...',
                    selectedCategory,
                    categories,
                    (id) => setValue('categoryId', id),
                    () => setShowCategoryDropdown(!showCategoryDropdown),
                    showCategoryDropdown,
                    true, 'tag', '#d4d4d8', 'Sem Categoria'
                  )}
                  {errors.categoryId && <Text style={styles.error}>{errors.categoryId.message}</Text>}
                </View>
              )}
            />
          </View>

          {/* Responsável */}
          <Controller
            control={control}
            name="responsibleId"
            render={({ field: { value } }) => (
              <View>
                <Text style={styles.sectionTitle}>RESPONSÁVEL</Text>
                {renderDropdown(
                  value,
                  'Responsável...',
                  selectedResponsible,
                  responsibles,
                  (id) => setValue('responsibleId', id),
                  () => setShowResponsibleDropdown(!showResponsibleDropdown),
                  showResponsibleDropdown,
                  true, 'user', '#d4d4d8', 'Sem Responsável'
                )}
                {errors.responsibleId && <Text style={styles.error}>{errors.responsibleId.message}</Text>}
              </View>
            )}
          />

          {/* Datas */}
          <View style={styles.row}>
            <Controller
              control={control}
              name="date"
              render={({ field: { onChange, value } }) => (
                <View style={styles.flex1}>
                  <Text style={styles.sectionTitle}>DATA DO FATO</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor="#a1a1aa"
                    keyboardType="number-pad"
                    value={value}
                    onChangeText={(t) => onChange(maskDate(t))}
                    maxLength={10}
                  />
                  {errors.date && <Text style={styles.error}>{errors.date.message}</Text>}
                </View>
              )}
            />

            <Controller
              control={control}
              name="paymentDate"
              render={({ field: { onChange, value } }) => (
                <View style={styles.flex1}>
                  <Text style={styles.sectionTitle}>DATA RECEBIMENTO</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor="#a1a1aa"
                    keyboardType="number-pad"
                    value={value}
                    onChangeText={(t) => onChange(maskDate(t))}
                    maxLength={10}
                  />
                  {errors.paymentDate && <Text style={styles.error}>{errors.paymentDate.message}</Text>}
                </View>
              )}
            />
          </View>

          {/* Status */}
          <Controller
            control={control}
            name="status"
            render={({ field: { onChange, value } }) => (
              <View>
                <Text style={styles.sectionTitle}>STATUS</Text>
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
                      <Feather name={option.icon as any} size={14} color={value === option.value ? '#fff' : '#a1a1aa'} style={{ marginRight: 4 }} />
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

          {/* Descrição */}
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, value } }) => (
              <View>
                <Text style={styles.sectionTitle}>DESCRIÇÃO (OPCIONAL)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Ex: Salário, Venda, Freelance..."
                  placeholderTextColor="#a1a1aa"
                  value={value}
                  onChangeText={onChange}
                  maxLength={250}
                />
              </View>
            )}
          />

          {/* Comentários/Notas Opcional */}
          <Controller
            control={control}
            name="notes"
            render={({ field: { onChange, value } }) => (
              <View>
                <Text style={styles.sectionTitle}>COMENTÁRIOS / OBSERVAÇÕES</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Alguma nota adicional..."
                  placeholderTextColor="#a1a1aa"
                  value={value}
                  onChangeText={onChange}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
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
              <Text style={styles.saveButtonText}>Salvar Receita</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#ffffff' },
  content: { padding: 20, gap: 16 },
  center: { justifyContent: 'center', alignItems: 'center' },
  row: { flexDirection: 'row', gap: 12 },
  flex1: { flex: 1 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Poppins_600SemiBold',
    color: '#a1a1aa',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  input: {
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    backgroundColor: '#fafafa',
    paddingHorizontal: 14,
    fontSize: 15,
    fontFamily: 'Poppins_500Medium',
    color: '#18181b',
  },
  textArea: {
    paddingTop: 12,
    height: 86,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    backgroundColor: '#fafafa',
    paddingHorizontal: 16,
  },
  currencyPrefix: {
    fontSize: 20,
    fontFamily: 'Poppins_600SemiBold',
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
  dropdownOpen: { borderColor: '#10b981' },
  dropdownValueBox: { flexDirection: 'row', alignItems: 'center', gap: 8, width: '85%' },
  colorDot: { width: 10, height: 10, borderRadius: 5 },
  dropdownPlaceholder: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: '#a1a1aa' },
  dropdownValue: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: '#18181b' },
  dropdownList: {
    marginTop: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    backgroundColor: '#ffffff',
    maxHeight: 180,
    elevation: 4,
  },
  dropdownScroll: { padding: 4 },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: 14, borderRadius: 8 },
  dropdownItemSelected: { backgroundColor: '#10b98115' },
  dropdownItemText: { fontSize: 14, fontFamily: 'Poppins_500Medium', color: '#18181b' },
  dropdownItemTextSelected: { color: '#10b981', fontFamily: 'Poppins_600SemiBold' },
  statusRow: { flexDirection: 'row', gap: 8 },
  statusChip: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#e4e4e7',
    backgroundColor: '#fafafa',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusChipText: { fontSize: 13, fontFamily: 'Poppins_600SemiBold', color: '#71717a' },
  saveButton: {
    height: 56,
    backgroundColor: '#10b981',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    elevation: 8,
  },
  saveButtonDisabled: { opacity: 0.7 },
  saveButtonText: { fontSize: 16, fontFamily: 'Poppins_600SemiBold', color: '#ffffff' },
  error: { fontSize: 12, fontFamily: 'Poppins_500Medium', color: '#ef4444', marginTop: 4 },
});
