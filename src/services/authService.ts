/**
 * Nom : authService.ts
 * Chemin : src/services/authService.ts
 * Rôle : inscription, connexion, déconnexion, réinitialisation du mot de passe.
 * Aucun mot de passe n'est jamais écrit dans Firestore.
 */
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from "firebase/auth";
import { auth } from "@/firebase/config";
import { upsertUserProfile } from "./userService";

export async function signUp(displayName: string, email: string, password: string): Promise<User> {
  const { user } = await createUserWithEmailAndPassword(auth(), email.trim(), password);
  const name = displayName.trim() || email.split("@")[0]!;
  await updateProfile(user, { displayName: name });
  await upsertUserProfile({ uid: user.uid, email: user.email ?? email, displayName: name });
  return user;
}

export async function signIn(email: string, password: string): Promise<User> {
  const { user } = await signInWithEmailAndPassword(auth(), email.trim(), password);
  await upsertUserProfile({
    uid: user.uid,
    email: user.email ?? email,
    displayName: user.displayName ?? email.split("@")[0]!,
  });
  return user;
}

export const logOut = () => signOut(auth());

export const resetPassword = (email: string) => sendPasswordResetEmail(auth(), email.trim());

export const watchAuth = (cb: (user: User | null) => void) => onAuthStateChanged(auth(), cb);

/** Messages d'erreur Firebase traduits pour l'interface LUMA. */
export function authErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code ?? "";
  const map: Record<string, string> = {
    "auth/invalid-email": "Adresse e-mail invalide.",
    "auth/missing-password": "Veuillez saisir un mot de passe.",
    "auth/weak-password": "Mot de passe trop court (6 caractères minimum).",
    "auth/email-already-in-use": "Cette adresse e-mail est déjà utilisée.",
    "auth/invalid-credential": "E-mail ou mot de passe incorrect.",
    "auth/user-not-found": "Aucun compte ne correspond à cet e-mail.",
    "auth/wrong-password": "E-mail ou mot de passe incorrect.",
    "auth/too-many-requests": "Trop de tentatives. Réessayez plus tard.",
  };
  return map[code] ?? (error instanceof Error ? error.message : "Une erreur est survenue.");
}
