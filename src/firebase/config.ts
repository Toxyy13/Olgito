import { getApp } from '@react-native-firebase/app';
import { getAuth } from '@react-native-firebase/auth';
import { getFirestore } from '@react-native-firebase/firestore';

// @react-native-firebase se konfiguriše nativno preko google-services.json /
// GoogleService-Info.plist (vidi README.md), pa nema potrebe za apiKey/appId
// vrednostima ovde — getApp() automatski učitava podrazumevanu native app.
export const app = getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
