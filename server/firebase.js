import { initializeApp} from 'firebase-admin/app';
import admin from 'firebase-admin'
import { initializeApp as initializeApp2 } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIRBEASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID
};

const app2 = initializeApp(firebaseConfig);
const app = initializeApp2(firebaseConfig)
export const auth = admin.auth()
export const db = getFirestore(app);
export default app