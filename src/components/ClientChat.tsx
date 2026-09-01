import React from 'react';
import { View, Text, StyleSheet, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Button } from './Button';
import { ChatView } from './ChatView';
import { colors, spacing, typography } from '../theme';

interface Props {
  clientId: string | null;
  title?: string;
  initialText?: string;
  onClose: () => void;
}

export function ClientChat({ clientId, title, initialText, onClose }: Props) {
  return (
    <Modal visible={!!clientId} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={40}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title ?? 'Poruke'}</Text>
        </View>

        <ChatView clientId={clientId} initialText={initialText} onCloseModal={onClose} />

        <Button title="Zatvori" variant="outline" onPress={onClose} />
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: spacing.md, gap: spacing.sm },
  header: { paddingTop: spacing.md, paddingBottom: spacing.sm },
  headerTitle: { ...typography.h3, color: colors.textPrimary, textAlign: 'center' },
});
