import { getStorage, ref, putFile, getDownloadURL } from '@react-native-firebase/storage';
import { app } from './config';

export async function uploadProfilePhoto(uid: string, localUri: string): Promise<string> {
  const storage = getStorage(app);
  const fileRef = ref(storage, `profile-photos/${uid}.jpg`);
  await putFile(fileRef, localUri);
  return getDownloadURL(fileRef);
}
