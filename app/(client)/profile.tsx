import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { Button } from '../../src/components/Button';
import { UpdateChecker } from '../../src/components/UpdateChecker';
import { colors, radius, spacing, typography } from '../../src/theme';
import { useAuth } from '../../src/context/AuthContext';
import { useAppAlert } from '../../src/context/AlertContext';
import { uploadProfilePhoto } from '../../src/api/upload';
import { completeProfile } from '../../src/api/users';

export default function ProfileScreen() {
  const { appUser, setAppUser, logout } = useAuth();
  const { alert } = useAppAlert();
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  if (!appUser) return null;

  const handleChangePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      alert('Nedostaje dozvola', 'Dozvoli pristup galeriji da bi promenio/la profilnu sliku.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (result.canceled || !result.assets[0]) return;

    setUploadingPhoto(true);
    try {
      const photoURL = await uploadProfilePhoto(appUser.uid, result.assets[0].uri);
      const updated = await completeProfile(appUser.uid, {
        fullName: appUser.fullName,
        age: appUser.age ?? 1,
        phone: appUser.phone,
        photoURL,
      });
      setAppUser(updated);
    } catch {
      alert('Greška', 'Profilna slika nije sačuvana. Pokušaj ponovo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  return (
    <ScreenContainer scroll>
      <View style={styles.header}>
        <Pressable style={styles.photoWrap} onPress={handleChangePhoto} disabled={uploadingPhoto}>
          {appUser.photoURL ? (
            <Image source={{ uri: appUser.photoURL }} style={styles.photo} />
          ) : (
            <View style={styles.photoPlaceholder}>
              <Text style={styles.photoInitial}>{appUser.fullName.charAt(0) || '?'}</Text>
            </View>
          )}
          {uploadingPhoto ? (
            <View style={[styles.editBadge, styles.editBadgeLoading]}>
              <ActivityIndicator size="small" color={colors.textOnPrimary} />
            </View>
          ) : (
            <View style={styles.editBadge}>
              <Ionicons name="pencil" size={14} color={colors.textOnPrimary} />
            </View>
          )}
        </Pressable>
        <Text style={styles.name}>{appUser.fullName}</Text>
        <Text style={styles.phone}>{appUser.phone}</Text>
      </View>

      <View style={styles.card}>
        <Row label="Broj godina" value={String(appUser.age ?? '-')} />
        <Row label="Status naloga" value={appUser.accountStatus === 'approved' ? 'Odobren' : appUser.accountStatus} />
      </View>

      <UpdateChecker />
      <View style={{ height: spacing.sm }} />
      <Button title="Odjavi se" variant="outline" onPress={logout} />
    </ScreenContainer>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { alignItems: 'center', marginBottom: spacing.lg, marginTop: spacing.md },
  photoWrap: { marginBottom: spacing.sm },
  photo: { width: 88, height: 88, borderRadius: 44 },
  photoPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.glassBgStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoInitial: { color: colors.textOnPrimary, fontSize: 32, fontWeight: '800' },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    borderWidth: 2,
    borderColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBadgeLoading: { backgroundColor: colors.primaryDark },
  name: { ...typography.h3, color: colors.textPrimary },
  phone: { color: colors.textSecondary, ...typography.small },
  card: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.md,
    padding: spacing.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowLabel: { color: colors.textSecondary, ...typography.body },
  rowValue: { color: colors.textPrimary, ...typography.bodyBold },
});
