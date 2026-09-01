import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { Link, Stack } from 'expo-router';
import { colors, spacing, typography } from '../src/theme';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Stranica ne postoji' }} />
      <View style={styles.container}>
        <Text style={styles.title}>Ova stranica ne postoji.</Text>
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Nazad na početnu</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg, backgroundColor: colors.background },
  title: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.md },
  link: { paddingVertical: spacing.md },
  linkText: { color: colors.textOnPrimary, textDecorationLine: 'underline', ...typography.body },
});
