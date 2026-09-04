import React, { useState } from 'react';
import { Text, TextInput, View, StyleSheet, Image, Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { completeProfile } from '../../src/api/users';
import { uploadProfilePhoto } from '../../src/api/upload';
import { Button } from '../../src/components/Button';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { GlassCard } from '../../src/components/GlassCard';
import { EyebrowLabel } from '../../src/components/EyebrowLabel';
import { colors, spacing, typography } from '../../src/theme';

export default function CompleteProfileScreen() {
  const { appUser, setAppUser } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    setError(null);
    const ageNum = parseInt(age, 10);
    if (fullName.trim().length < 2) {
      setError('Unesi ime i prezime.');
      return;
    }
    if (!ageNum || ageNum < 1 || ageNum > 120) {
      setError('Unesi ispravan broj godina.');
      return;
    }
    if (phone.trim().length < 5) {
      setError('Unesi broj telefona.');
      return;
    }
    if (!appUser) return;
    setLoading(true);
    try {
      let photoURL: string | null = null;
      if (photoUri) {
        photoURL = await uploadProfilePhoto(appUser.uid, photoUri);
      }
      const updated = await completeProfile(appUser.uid, {
        fullName: fullName.trim(),
        age: ageNum,
        phone: phone.trim(),
        photoURL,
      });
      setAppUser(updated);
      router.replace('/');
    } catch (e: any) {
      setError(e?.message ?? 'Greška pri čuvanju profila. Pokušaj ponovo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <Text style={styles.title}>Dopuni profil</Text>
      <Text style={styles.subtitle}>Još samo par podataka pre nego što počneš da zakazuješ</Text>

      <Pressable style={styles.photoPicker} onPress={pickPhoto}>
        {photoUri ? (
          <Image source={{ uri: photoUri }} style={styles.photo} />
        ) : (
          <View style={styles.photoPlaceholder}>
            <Text style={styles.photoPlaceholderText}>+ Foto</Text>
          </View>
        )}
      </Pressable>

      <GlassCard style={styles.card}>
        <EyebrowLabel>Korak 1 — Podaci</EyebrowLabel>
        <Text style={styles.label}>Ime i prezime</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Marko Marković"
          placeholderTextColor={colors.textSecondary}
        />

        <Text style={styles.label}>Broj telefona</Text>
        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
          placeholder="+381601234567"
          placeholderTextColor={colors.textSecondary}
        />

        <Text style={styles.label}>Broj godina</Text>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          keyboardType="number-pad"
          placeholder="25"
          placeholderTextColor={colors.textSecondary}
        />

        {error && <Text style={styles.error}>{error}</Text>}
        <Button title="Sačuvaj i nastavi" onPress={handleSave} loading={loading} />
      </GlassCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h2, color: colors.textPrimary, textAlign: 'center', marginTop: spacing.lg },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.lg },
  photoPicker: { alignSelf: 'center', marginBottom: spacing.lg },
  photo: { width: 100, height: 100, borderRadius: 50 },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.glassBgStrong,
    borderWidth: 2,
    borderColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: { color: colors.textOnPrimary, ...typography.label },
  card: { gap: spacing.md },
  label: { ...typography.bodyBold, color: colors.textPrimary },
  input: {
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 14,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: 16,
    color: colors.textPrimary,
    backgroundColor: colors.inputBg,
  },
  error: { color: colors.accent, ...typography.small, fontFamily: typography.bodyBold.fontFamily },
});
