/**
 * Nom : conversationService.ts
 * Chemin : src/services/conversationService.ts
 * Rôle : conversations privées (création, écoute temps réel, compteurs non lus).
 */
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase/config";
import type { LumaUser } from "./userService";

export interface ConversationMember {
  displayName: string;
  photoURL?: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  members: Record<string, ConversationMember>;
  lastMessage?: { text: string; senderId: string; createdAt?: Timestamp | null };
  unread?: Record<string, number>;
  updatedAt?: Timestamp | null;
}

/** Identifiant déterministe d'une conversation privée entre deux utilisateurs. */
export const privateConversationId = (a: string, b: string) => [a, b].sort().join("__");

export async function createOrGetPrivateConversation(
  me: LumaUser,
  other: LumaUser,
): Promise<string> {
  const id = privateConversationId(me.uid, other.uid);
  const ref = doc(db(), "conversations", id);
  const existing = await getDoc(ref);
  if (!existing.exists()) {
    await setDoc(ref, {
      type: "private",
      participants: [me.uid, other.uid],
      members: {
        [me.uid]: { displayName: me.displayName, photoURL: me.photoURL ?? "" },
        [other.uid]: { displayName: other.displayName, photoURL: other.photoURL ?? "" },
      },
      unread: { [me.uid]: 0, [other.uid]: 0 },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }
  return id;
}

export function watchConversations(uid: string, cb: (list: Conversation[]) => void) {
  const q = query(
    collection(db(), "conversations"),
    where("participants", "array-contains", uid),
    orderBy("updatedAt", "desc"),
  );
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Conversation, "id">) })));
  });
}

export async function resetUnread(conversationId: string, uid: string): Promise<void> {
  await updateDoc(doc(db(), "conversations", conversationId), { [`unread.${uid}`]: 0 });
}

export const otherParticipant = (conversation: Conversation, uid: string) =>
  conversation.participants.find((p) => p !== uid) ?? uid;
