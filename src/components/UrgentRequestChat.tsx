import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, FlatList, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import { Button } from './Button';
import { colors, radius, spacing, typography } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useAppAlert } from '../context/AlertContext';
import { watchUrgentRequestMessages, sendUrgentRequestMessage } from '../api/urgentRequests';
import type { UrgentRequest, UrgentRequestMessage } from '../types';

interface Props {
  request: UrgentRequest | null;
  title?: string;
  onClose: () => void;
}

export function UrgentRequestChat({ request, title, onClose }: Props) {
  const { appUser } = useAuth();
  const { alert } = useAppAlert();
  const [messages, setMessages] = useState<UrgentRequestMessage[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);
  const requestId = request?.id ?? null;

  useEffect(() => {
    if (!requestId) return;
    setMessages([]);
    return watchUrgentRequestMessages(requestId, setMessages);
  }, [requestId]);

  useEffect(() => {
    if (messages.length > 0) listRef.current?.scrollToEnd({ animated: true });
  }, [messages.length]);

  const handleSend = async () => {
    if (!requestId || text.trim().length === 0) return;
    setSending(true);
    const toSend = text.trim();
    setText('');
    try {
      await sendUrgentRequestMessage(requestId, toSend);
    } catch {
      setText(toSend);
      alert('Greška', 'Poruka nije poslata. Pokušaj ponovo.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Modal visible={!!requestId} animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.screen}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={40}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title ?? 'Dogovor oko termina'}</Text>
        </View>

        {request && (
          <View style={styles.pinned}>
            <Text style={styles.pinnedLabel}>Originalni zahtev</Text>
            <Text style={styles.pinnedText}>{request.note}</Text>
          </View>
        )}

        <FlatList
          ref={listRef}
          style={{ flex: 1 }}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }}
          ListEmptyComponent={<Text style={styles.empty}>Još uvek nema poruka — napiši prvu.</Text>}
          renderItem={({ item }) => {
            const mine = item.senderId === appUser?.uid;
            return (
              <View style={[styles.bubbleRow, mine ? styles.bubbleRowMine : styles.bubbleRowTheirs]}>
                <View style={[styles.bubble, mine ? styles.bubbleMine : styles.bubbleTheirs]}>
                  <Text style={styles.bubbleText}>{item.text}</Text>
                </View>
              </View>
            );
          }}
        />

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Napiši poruku..."
            placeholderTextColor={colors.textSecondary}
            multiline
          />
          <Button title="Pošalji" onPress={handleSend} loading={sending} disabled={text.trim().length === 0} />
        </View>

        <Button title="Zatvori" variant="outline" onPress={onClose} />
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, padding: spacing.md, gap: spacing.sm },
  header: { paddingTop: spacing.md, paddingBottom: spacing.sm },
  headerTitle: { ...typography.h3, color: colors.textPrimary, textAlign: 'center' },
  pinned: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
    gap: spacing.xs,
  },
  pinnedLabel: { ...typography.label, color: colors.accent },
  pinnedText: { color: colors.textPrimary, ...typography.body },
  empty: { color: colors.textSecondary, ...typography.body, textAlign: 'center', marginTop: spacing.xl },
  bubbleRow: { flexDirection: 'row' },
  bubbleRowMine: { justifyContent: 'flex-end' },
  bubbleRowTheirs: { justifyContent: 'flex-start' },
  bubble: { maxWidth: '80%', borderRadius: radius.md, paddingVertical: spacing.sm, paddingHorizontal: spacing.md },
  bubbleMine: { backgroundColor: colors.primary, borderBottomRightRadius: spacing.xs },
  bubbleTheirs: { backgroundColor: colors.surface, borderBottomLeftRadius: spacing.xs },
  bubbleText: { color: colors.textPrimary, ...typography.body },
  inputRow: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: colors.surfaceAlt,
    color: colors.textPrimary,
    textAlignVertical: 'top',
  },
});
