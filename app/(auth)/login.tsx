import React, { useState } from 'react';
import { Text, TextInput, View, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { Button } from '../../src/components/Button';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { colors, spacing, typography } from '../../src/theme';

export default function LoginScreen() {
  const { login, register } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Unesi ispravnu email adresu.');
      return;
    }
    if (password.length < 6) {
      setError('Lozinka mora imati bar 6 karaktera.');
      return;
    }
    if (mode === 'register' && password !== confirmPassword) {
      setError('Lozinke se ne poklapaju.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'login') await login(email.trim(), password);
      else await register(email.trim(), password);
      router.replace('/');
    } catch (e: any) {
      setError(e?.message ?? 'Nešto nije u redu. Pokušaj ponovo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <View style={styles.header}>
        <Text style={styles.logo}>Olgito 💈</Text>
        <Text style={styles.subtitle}>Zakaži termin brzo i lako</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Email adresa</Text>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          placeholder="ime@primer.com"
          placeholderTextColor={colors.textSecondary}
        />

        <Text style={styles.label}>Lozinka</Text>
        <View style={styles.passwordRow}>
          <TextInput
            style={[styles.input, styles.passwordInput]}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            placeholder="••••••••"
            placeholderTextColor={colors.textSecondary}
          />
          <Pressable style={styles.eyeButton} onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
            <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={colors.textOnPrimary} />
          </Pressable>
        </View>

        {mode === 'register' && (
          <>
            <Text style={styles.label}>Potvrdi lozinku</Text>
            <View style={styles.passwordRow}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.textSecondary}
              />
              <Pressable style={styles.eyeButton} onPress={() => setShowConfirmPassword((v) => !v)} hitSlop={8}>
                <Ionicons name={showConfirmPassword ? 'eye-off' : 'eye'} size={20} color={colors.textOnPrimary} />
              </Pressable>
            </View>
          </>
        )}

        {error && <Text style={styles.error}>{error}</Text>}

        <Button title={mode === 'login' ? 'Prijavi se' : 'Registruj se'} onPress={handleSubmit} loading={loading} />

        <Pressable
          onPress={() => {
            setMode(mode === 'login' ? 'register' : 'login');
            setConfirmPassword('');
            setError(null);
          }}
        >
          <Text style={styles.switchText}>
            {mode === 'login' ? 'Nemaš nalog? Registruj se' : 'Već imaš nalog? Prijavi se'}
          </Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginTop: spacing.xxl, marginBottom: spacing.xl },
  logo: { ...typography.h1, color: colors.textOnPrimary },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    gap: spacing.md,
  },
  label: { ...typography.bodyBold, color: colors.textPrimary },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.surfaceAlt,
  },
  passwordRow: { position: 'relative', justifyContent: 'center' },
  passwordInput: { paddingRight: spacing.xl + spacing.lg },
  eyeButton: { position: 'absolute', right: spacing.md },
  error: { color: colors.textOnPrimary, ...typography.small, fontWeight: '700' },
  switchText: { color: colors.textOnPrimary, textAlign: 'center', ...typography.small, marginTop: spacing.xs, textDecorationLine: 'underline' },
});
