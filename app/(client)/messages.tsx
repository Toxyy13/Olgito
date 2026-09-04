import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { ScreenContainer } from '../../src/components/ScreenContainer';
import { ScreenHeader } from '../../src/components/ScreenHeader';
import { ChatView } from '../../src/components/ChatView';
import { useAuth } from '../../src/context/AuthContext';

export default function ClientMessagesScreen() {
  const { appUser } = useAuth();
  if (!appUser) return null;

  return (
    <ScreenContainer>
      <ScreenHeader eyebrow="Prepiska" title="Poruke od Olgice" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={40}
      >
        <ChatView clientId={appUser.uid} />
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
