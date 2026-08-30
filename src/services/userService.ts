/**
 * Nom : userService.ts
 * Chemin : src/services/userService.ts
 * Rôle : profils utilisateurs Firestore (users/{userId}) et recherche d'utilisateurs.
 */
import {
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAt,
  endAt,
  collection,
} from "firebase/firestore";
import { db } from "@/firebase/config";

export interface LumaUser {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
  searchName?: string;
}

const usersCol = () => collection(db(), "users");

export async function upsertUserProfile(user: {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  bio?: string;
}): Promise<void> {
  await setDoc(
    doc(db(), "users", user.uid),
    {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      searchName: user.displayName.toLowerCase(),
      photoURL: user.photoURL ?? "",
      ...(user.bio !== undefined ? { bio: user.bio } : {}),
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function getUserProfile(uid: string): Promise<LumaUser | null> {
  const snap = await getDoc(doc(db(), "users", uid));
  return snap.exists() ? (snap.data() as LumaUser) : null;
}

/** Recherche par préfixe de nom ou par e-mail exact. */
export async function searchUsers(term: string, currentUid: string): Promise<LumaUser[]> {
  const t = term.trim().toLowerCase();
  if (!t) return [];
  const results = new Map<string, LumaUser>();

  const byName = await getDocs(
    query(usersCol(), orderBy("searchName"), startAt(t), endAt(`${t}\uf8ff`), limit(10)),
  );
  byName.forEach((d) => results.set(d.id, d.data() as LumaUser));

  if (t.includes("@")) {
    const byEmail = await getDocs(
      query(usersCol(), orderBy("email"), startAt(t), endAt(`${t}\uf8ff`), limit(10)),
    );
    byEmail.forEach((d) => results.set(d.id, d.data() as LumaUser));
  }

  results.delete(currentUid);
  return [...results.values()];
}
