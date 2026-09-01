import React, { useState } from 'react';
import { Text, TextInput, View, StyleSheet, Pressable } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { Button } from '../../src/components/Button';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { colors, spacing, typography } from '../../src/theme';

export default function LoginScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
    setLoading(true);
    try {
      if (mode === 'login') await login(email.trim(), password);
      else await register(email.trim(), password);
    } catch (e: any) {
      setError(e?.message ?? 'Nešto nije u redu. Pokušaj ponovo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer>
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
        <TextInput
          style={styles.input}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
          placeholderTextColor={colors.textSecondary}
        />

        {error && <Text style={styles.error}>{error}</Text>}

        <Button title={mode === 'login' ? 'Prijavi se' : 'Registruj se'} onPress={handleSubmit} loading={loading} />

        <Pressable onPress={() => setMode(mode === 'login' ? 'register' : 'login')}>
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
  logo: { ...typography.h1, color: colors.primary },
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
  error: { color: colors.danger, ...typography.small },
  switchText: { color: colors.secondary, textAlign: 'center', ...typography.small, marginTop: spacing.xs },
});
