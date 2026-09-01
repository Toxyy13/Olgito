import React, { useState } from 'react';
import { Text, TextInput, View, StyleSheet, Image, Pressable } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../src/context/AuthContext';
import { completeProfile } from '../../src/firebase/users';
import { uploadProfilePhoto } from '../../src/firebase/storage';
import { Button } from '../../src/components/Button';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { colors, spacing, typography } from '../../src/theme';

export default function CompleteProfileScreen() {
  const { firebaseUser } = useAuth();
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
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
    if (!firebaseUser) return;
    setLoading(true);
    try {
      let photoURL: string | null = null;
      if (photoUri) {
        photoURL = await uploadProfilePhoto(firebaseUser.uid, photoUri);
      }
      await completeProfile(firebaseUser.uid, { fullName: fullName.trim(), age: ageNum, photoURL });
    } catch (e: any) {
      setError('Greška pri čuvanju profila. Pokušaj ponovo.');
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

      <View style={styles.card}>
        <Text style={styles.label}>Ime i prezime</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Marko Marković"
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
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  title: { ...typography.h2, color: colors.textPrimary, marginTop: spacing.lg },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: spacing.xs, marginBottom: spacing.lg },
  photoPicker: { alignSelf: 'center', marginBottom: spacing.lg },
  photo: { width: 100, height: 100, borderRadius: 50 },
  photoPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 2,
    borderColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoPlaceholderText: { color: colors.secondary, ...typography.label },
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: spacing.lg, gap: spacing.md },
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
