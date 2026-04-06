import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import firebaseConfig from '../firebase-applet-config.json';

const sanitizedConfig = Object.fromEntries(
  Object.entries(firebaseConfig).filter(([, value]) => value !== '' && value !== null && value !== undefined)
);

const inferredDatabaseUrl = sanitizedConfig.databaseURL ||
  (sanitizedConfig.projectId ? `https://${sanitizedConfig.projectId}-default-rtdb.firebaseio.com` : undefined);

const isValidConfig =
  Boolean(sanitizedConfig.projectId && sanitizedConfig.apiKey && sanitizedConfig.authDomain && inferredDatabaseUrl);

if (!isValidConfig) {
  console.error('❌ Firebase configuration is incomplete. Please check firebase-applet-config.json');
}

const app = initializeApp(sanitizedConfig);
export const auth = getAuth(app);
export const rtdb = getDatabase(app, inferredDatabaseUrl);
