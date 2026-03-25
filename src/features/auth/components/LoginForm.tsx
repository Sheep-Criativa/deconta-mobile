import React, { useState, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface FormValues {
  name?: string;
  email: string;
  password: string;
}

export interface LoginFormHandle {
  submit: () => FormValues | null;
}

interface LoginFormProps {
  showNameField?: boolean;
  isLoading?: boolean;
  submitLabel?: string;
  onSubmit: (values: FormValues) => void;
}

// ─── Validação ───────────────────────────────────────────────────────────────

function validateEmail(email: string): string | null {
  if (!email.trim()) return 'E-mail é obrigatório.';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(email)) return 'E-mail inválido. Ex: voce@email.com';
  return null;
}

function validatePassword(password: string): string | null {
  if (!password) return 'Senha é obrigatória.';
  if (password.length < 6) return 'A senha deve ter ao menos 6 caracteres.';
  return null;
}

function validateName(name: string): string | null {
  if (!name.trim()) return 'Nome é obrigatório.';
  if (name.trim().length < 3) return 'O nome deve ter ao menos 3 caracteres.';
  return null;
}

// ─── Componente ──────────────────────────────────────────────────────────────

export const LoginForm = forwardRef<LoginFormHandle, LoginFormProps>(
  ({ showNameField = false, isLoading = false, submitLabel = 'Entrar', onSubmit }, ref) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [nameError, setNameError] = useState<string | null>(null);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [passwordError, setPasswordError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [passwordFocused, setPasswordFocused] = useState(false);
    const [nameFocused, setNameFocused] = useState(false);

    useImperativeHandle(ref, () => ({
      submit() { return handleSubmit(); },
    }));

    function handleSubmit(): FormValues | null {
      let valid = true;

      const eErr = validateEmail(email);
      setEmailError(eErr);
      if (eErr) valid = false;

      const pErr = validatePassword(password);
      setPasswordError(pErr);
      if (pErr) valid = false;

      if (showNameField) {
        const nErr = validateName(name);
        setNameError(nErr);
        if (nErr) valid = false;
      }

      if (!valid) return null;

      const values: FormValues = { email, password };
      if (showNameField) values.name = name;
      onSubmit(values);
      return values;
    }

    return (
      <View>

        {/* ── Nome (se cadastro) ── */}
        {showNameField && (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome completo</Text>
            <View style={[
              styles.inputWrapper,
              nameFocused && styles.inputWrapperFocused,
              nameError ? styles.inputWrapperError : null,
            ]}>
              <Feather name="user" size={16} color={nameError ? '#ef4444' : nameFocused ? '#18181b' : '#a1a1aa'} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Seu nome completo"
                placeholderTextColor="#a1a1aa"
                value={name}
                onChangeText={(v) => { setName(v); if (nameError) setNameError(validateName(v)); }}
                onBlur={() => { setNameFocused(false); setNameError(validateName(name)); }}
                onFocus={() => setNameFocused(true)}
                returnKeyType="next"
              />
            </View>
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
          </View>
        )}

        {/* ── E-mail ── */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>E-mail</Text>
          <View style={[
            styles.inputWrapper,
            emailFocused && styles.inputWrapperFocused,
            emailError ? styles.inputWrapperError : null,
          ]}>
            <Feather name="mail" size={16} color={emailError ? '#ef4444' : emailFocused ? '#18181b' : '#a1a1aa'} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="voce@email.com"
              placeholderTextColor="#a1a1aa"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={(v) => { setEmail(v); if (emailError) setEmailError(validateEmail(v)); }}
              onBlur={() => { setEmailFocused(false); setEmailError(validateEmail(email)); }}
              onFocus={() => setEmailFocused(true)}
              returnKeyType="next"
            />
          </View>
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        </View>

        {/* ── Senha ── */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Senha</Text>
          <View style={[
            styles.inputWrapper,
            passwordFocused && styles.inputWrapperFocused,
            passwordError ? styles.inputWrapperError : null,
          ]}>
            <Feather name="lock" size={16} color={passwordError ? '#ef4444' : passwordFocused ? '#18181b' : '#a1a1aa'} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor="#a1a1aa"
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(v) => { setPassword(v); if (passwordError) setPasswordError(validatePassword(v)); }}
              onBlur={() => { setPasswordFocused(false); setPasswordError(validatePassword(password)); }}
              onFocus={() => setPasswordFocused(true)}
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
            />
            <TouchableOpacity
              onPress={() => setShowPassword((p) => !p)}
              style={styles.eyeButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name={showPassword ? 'eye-off' : 'eye'} size={16} color="#a1a1aa" />
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
        </View>

        {/* ── Botão primário — emerald conforme identidade ── */}
        <TouchableOpacity
          style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
          activeOpacity={0.85}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text style={styles.primaryButtonText}>{submitLabel}</Text>
          )}
        </TouchableOpacity>

      </View>
    );
  }
);

// ─── Estilos ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#27272a',       // zinc-800
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,             // altura padrão do manual
    borderRadius: 8,        // border-radius de input do manual
    borderWidth: 1,
    borderColor: '#d4d4d8', // zinc-300
    backgroundColor: '#ffffff',
  },
  inputWrapperFocused: {
    borderColor: '#18181b', // zinc-900 no foco
  },
  inputWrapperError: {
    borderColor: '#ef4444',
    backgroundColor: '#fff5f5',
  },
  inputIcon: {
    marginLeft: 12,
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#18181b',
    paddingRight: 12,
  },
  eyeButton: {
    paddingHorizontal: 12,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    marginTop: 5,
    fontSize: 12,
    color: '#ef4444',
    marginLeft: 2,
  },

  /* Botão primário — emerald-500 com sombra colorida (manual § 5.1) */
  primaryButton: {
    height: 44,
    backgroundColor: '#10b981',   // emerald-500
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.30,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonDisabled: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
