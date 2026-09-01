import React, { useState } from 'react';
import { Text, TextInput, View, StyleSheet } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { Button } from '../../src/components/Button';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { colors, spacing, typography } from '../../src/theme';

export default function LoginScreen() {
  const { sendCode, confirmCode, confirmation } = useAuth();
  const [phone, setPhone] = useState('+381');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step: 'phone' | 'code' = confirmation ? 'code' : 'phone';

  const handleSendCode = async () => {
    setError(null);
    if (!/^\+\d{8,15}$/.test(phone.trim())) {
      setError('Unesi broj telefona u formatu +381...');
      return;
    }
    setLoading(true);
    try {
      await sendCode(phone.trim());
    } catch (e: any) {
      setError(e?.message ?? 'Greška pri slanju SMS koda.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setError(null);
    if (code.trim().length < 4) {
      setError('Unesi kod koji si dobio/la SMS-om.');
      return;
    }
    setLoading(true);
    try {
      await confirmCode(code.trim());
    } catch (e: any) {
      setError('Pogrešan kod. Pokušaj ponovo.');
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
        {step === 'phone' ? (
          <>
            <Text style={styles.label}>Broj telefona</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              placeholder="+381601234567"
              placeholderTextColor={colors.textSecondary}
            />
            {error && <Text style={styles.error}>{error}</Text>}
            <Button title="Pošalji kod" onPress={handleSendCode} loading={loading} />
          </>
        ) : (
          <>
            <Text style={styles.label}>Unesi kod poslat na {phone}</Text>
            <TextInput
              style={styles.input}
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              placeholder="123456"
              placeholderTextColor={colors.textSecondary}
            />
            {error && <Text style={styles.error}>{error}</Text>}
            <Button title="Potvrdi" onPress={handleConfirm} loading={loading} />
          </>
        )}
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
});
