import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import { colors } from '../src/theme';

export default function Index() {
  const { appUser, initializing } = useAuth();

  if (initializing) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!appUser) return <Redirect href="/(auth)/login" />;

  if (appUser.accountStatus === 'blocked') return <Redirect href="/(auth)/blocked" />;

  if (appUser.role === 'client' && !appUser.profileComplete) {
    return <Redirect href="/(auth)/complete-profile" />;
  }

  if (appUser.role === 'client' && appUser.accountStatus === 'pending') {
    return <Redirect href="/(auth)/pending-approval" />;
  }

  if (appUser.role === 'admin') return <Redirect href="/(admin)/calendar" />;

  return <Redirect href="/(client)/calendar" />;
}
