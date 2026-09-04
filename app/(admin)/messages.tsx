import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Image, Pressable } from 'react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { ClientChat } from '../../src/components/ClientChat';
import { colors, radius, spacing, typography } from '../../src/theme';
import { watchConversations } from '../../src/api/messages';
import type { ChatConversation } from '../../src/types';

export default function AdminMessagesScreen() {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [chatWith, setChatWith] = useState<ChatConversation | null>(null);

  useEffect(() => watchConversations(setConversations), []);

  return (
    <ScreenContainer>
      <ScreenHeader eyebrow="Prepiska" title="Poruke" />
      <FlatList
        style={{ flex: 1 }}
        data={conversations}
        keyExtractor={(c) => c.clientId}
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', gap: spacing.sm, paddingBottom: spacing.xl }}
        ListEmptyComponent={<Text style={styles.empty}>Nema aktivnih razgovora.</Text>}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => setChatWith(item)}>
            {item.clientPhotoURL ? (
              <Image source={{ uri: item.clientPhotoURL }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>{item.clientName?.charAt(0) || '?'}</Text>
              </View>
            )}
            <View style={styles.cardText}>
              <Text style={styles.name}>{item.clientName}</Text>
              <Text style={styles.preview} numberOfLines={1}>
                {item.lastSenderRole === 'admin' ? 'Ti: ' : ''}
                {item.lastText}
              </Text>
            </View>
          </Pressable>
        )}
      />

      <ClientChat
        clientId={chatWith?.clientId ?? null}
        title={chatWith ? `Poruke: ${chatWith.clientName}` : undefined}
        onClose={() => setChatWith(null)}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  empty: { color: colors.textSecondary, ...typography.body, textAlign: 'center' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    gap: spacing.md,
  },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: { color: colors.textOnPrimary, fontWeight: '800', fontSize: 18 },
  cardText: { flex: 1 },
  name: { ...typography.bodyBold, color: colors.textPrimary },
  preview: { color: colors.textSecondary, ...typography.small },
});
