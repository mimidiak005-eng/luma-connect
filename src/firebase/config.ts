/**
 * Nom : config.ts
 * Chemin : src/firebase/config.ts
 * Rôle : initialisation paresseuse du SDK Firebase (App, Auth, Firestore, Storage).
 * Les clés proviennent uniquement des variables d'environnement VITE_FIREBASE_*.
 */
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";

const env = import.meta.env as Record<string, string | undefined>;

export const firebaseConfig = {
  apiKey: env["VITE_FIREBASE_API_KEY"] ?? "",
  authDomain: env["VITE_FIREBASE_AUTH_DOMAIN"] ?? "",
  projectId: env["VITE_FIREBASE_PROJECT_ID"] ?? "",
  storageBucket: env["VITE_FIREBASE_STORAGE_BUCKET"] ?? "",
  messagingSenderId: env["VITE_FIREBASE_MESSAGING_SENDER_ID"] ?? "",
  appId: env["VITE_FIREBASE_APP_ID"] ?? "",
};

/** true si la configuration minimale est présente. */
export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

function app(): FirebaseApp {
  if (!isFirebaseConfigured) {
    throw new Error("Firebase n'est pas configuré : renseignez les variables VITE_FIREBASE_*.");
  }
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export const auth = (): Auth => getAuth(app());
export const db = (): Firestore => getFirestore(app());
export const storage = (): FirebaseStorage => getStorage(app());
