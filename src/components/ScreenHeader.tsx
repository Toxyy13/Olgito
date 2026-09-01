import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../theme';
import { useNavMenu } from '../context/NavMenuContext';

export function ScreenHeader({ title, showBack }: { title: string; showBack?: boolean }) {
  const { open } = useNavMenu();
  const router = useRouter();
  return (
    <View style={styles.header}>
      {showBack ? (
        <Pressable onPress={() => router.back()} style={styles.menuBtn} hitSlop={12}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </Pressable>
      ) : (
        <Pressable onPress={open} style={styles.menuBtn} hitSlop={12}>
          <Ionicons name="menu" size={26} color={colors.textPrimary} />
        </Pressable>
      )}
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: spacing.lg,
    marginBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    justifyContent: 'center',
  },
  menuBtn: { position: 'absolute', left: 0, top: 0, zIndex: 2, padding: spacing.xs },
  title: { ...typography.h2, color: colors.textPrimary, textAlign: 'center' },
});
