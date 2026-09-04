import React from 'react';
import { Stack, Redirect, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import {
  useFonts as useSpaceGrotesk,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  JetBrainsMono_600SemiBold,
  JetBrainsMono_700Bold,
} from '@expo-google-fonts/jetbrains-mono';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { AlertProvider } from '../src/context/AlertContext';
import { WaitingScreen } from '../src/components/WaitingScreen';
import { colors } from '../src/theme';

export default function RootLayout() {
  const [fontsLoaded] = useSpaceGrotesk({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    SpaceGrotesk_700Bold,
    JetBrainsMono_400Regular,
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
    JetBrainsMono_700Bold,
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <AlertProvider>
            <StatusBar style="light" />
            {fontsLoaded ? (
              <>
                <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
                <AuthGate />
              </>
            ) : (
              <View style={{ position: 'absolute', inset: 0 }}>
                <WaitingScreen />
              </View>
            )}
          </AlertProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// Prati stanje prijave i AUTOMATSKI preusmerava na ispravan ekran gde god
// korisnik trenutno bio — ne samo pri otvaranju aplikacije. Bez ovoga, npr.
// odjava ili odobrenje naloga ne bi pomerili korisnika sa trenutnog ekrana.
function AuthGate() {
  const { appUser, initializing } = useAuth();
  const segments = useSegments();

  if (initializing) {
    return (
      <View style={{ position: 'absolute', inset: 0 }}>
        <WaitingScreen />
      </View>
    );
  }

  const group = segments[0] as string | undefined;
  const sub = segments[1] as string | undefined;

  if (!appUser) {
    if (group !== '(auth)') return <Redirect href="/(auth)/login" />;
    return null;
  }

  if (appUser.accountStatus === 'blocked' || appUser.accountStatus === 'rejected') {
    if (sub !== 'blocked') return <Redirect href="/(auth)/blocked" />;
    return null;
  }

  if (appUser.role === 'client' && !appUser.profileComplete) {
    if (sub !== 'complete-profile') return <Redirect href="/(auth)/complete-profile" />;
    return null;
  }

  if (appUser.role === 'client' && appUser.accountStatus === 'pending') {
    if (sub !== 'pending-approval') return <Redirect href="/(auth)/pending-approval" />;
    return null;
  }

  if (appUser.role === 'admin') {
    if (group !== '(admin)') return <Redirect href="/(admin)/calendar" />;
    return null;
  }

  if (group !== '(client)') return <Redirect href="/(client)/calendar" />;
  return null;
}
