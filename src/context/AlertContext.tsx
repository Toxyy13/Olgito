import React, { createContext, useContext, useState, useCallback } from 'react';
import { View, Text, Modal, StyleSheet, Pressable } from 'react-native';
import { colors, radius, spacing, typography } from '../theme';

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertState {
  title: string;
  message?: string;
  buttons: AlertButton[];
}

interface AlertContextValue {
  alert: (title: string, message?: string, buttons?: AlertButton[]) => void;
}

const AlertContext = createContext<AlertContextValue | undefined>(undefined);

// Zamena za React Native-ov Alert.alert — ovaj radi identično na webu i na
// telefonu, i uklapa se u temu aplikacije (sistemski Alert.alert na webu ne
// prikazuje ništa, a na telefonu bi izgledao kao sivi sistemski dijalog).
export function AlertProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AlertState | null>(null);

  const alert = useCallback((title: string, message?: string, buttons?: AlertButton[]) => {
    setState({ title, message, buttons: buttons && buttons.length > 0 ? buttons : [{ text: 'OK' }] });
  }, []);

  const close = () => setState(null);

  return (
    <AlertContext.Provider value={{ alert }}>
      {children}
      <Modal visible={!!state} transparent animationType="fade" onRequestClose={close}>
        <View style={styles.backdrop}>
          <View style={styles.card}>
            {state && (
              <>
                <Text style={styles.title}>{state.title}</Text>
                {!!state.message && <Text style={styles.message}>{state.message}</Text>}
                <View style={styles.buttons}>
                  {state.buttons.map((b, i) => (
                    <Pressable
                      key={i}
                      style={[
                        styles.button,
                        b.style === 'destructive' && styles.buttonDestructive,
                        b.style === 'cancel' && styles.buttonCancel,
                      ]}
                      onPress={() => {
                        close();
                        b.onPress?.();
                      }}
                    >
                      <Text style={styles.buttonText}>{b.text}</Text>
                    </Pressable>
                  ))}
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </AlertContext.Provider>
  );
}

export function useAppAlert() {
  const ctx = useContext(AlertContext);
  if (!ctx) throw new Error('useAppAlert mora biti pozvan unutar AlertProvider-a');
  return ctx;
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, width: '100%', maxWidth: 380, gap: spacing.sm },
  title: { ...typography.h3, color: colors.textOnPrimary, textAlign: 'center' },
  message: { ...typography.body, color: colors.textOnPrimary, textAlign: 'center', opacity: 0.9 },
  buttons: { gap: spacing.sm, marginTop: spacing.sm },
  button: { backgroundColor: colors.primary, borderRadius: radius.pill, paddingVertical: spacing.sm, alignItems: 'center' },
  buttonDestructive: { backgroundColor: colors.danger },
  buttonCancel: { backgroundColor: colors.surfaceAlt },
  buttonText: { color: colors.textOnPrimary, ...typography.bodyBold },
});
