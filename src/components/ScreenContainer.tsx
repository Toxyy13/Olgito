import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing } from '../theme';

export function ScreenContainer({
  children,
  scroll = false,
}: {
  children: React.ReactNode;
  scroll?: boolean;
}) {
  const Container = scroll ? ScrollView : View;
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <Container style={styles.inner} contentContainerStyle={scroll ? styles.scrollContent : undefined}>
        {children}
      </Container>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1, padding: spacing.lg },
  scrollContent: { padding: spacing.lg, flexGrow: 1 },
});
