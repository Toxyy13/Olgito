import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

// Vraća Expo push token ili null ako nema dozvole / nije fizički uređaj.
// Zahteva eas projectId (vidi README — "eas init") da bi generisao pravi token.
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  if (!Device.isDevice) return null;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Olgito obaveštenja',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6F59',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  if (finalStatus !== 'granted') return null;

  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  if (!projectId) return null;

  try {
    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    return token.data;
  } catch {
    return null;
  }
}
