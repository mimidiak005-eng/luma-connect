/**
 * Nom : messageService.ts
 * Chemin : src/services/messageService.ts
 * Rôle : gestion des messages (envoi, écoute temps réel, statut lu).
 */
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/firebase/config";

export interface LumaMessage {
  id: string;
  text: string;
  senderId: string;
  createdAt?: Timestamp | null;
  readBy?: string[];
}

const messagesCol = (conversationId: string) =>
  collection(db(), "conversations", conversationId, "messages");

export async function sendMessage(
  conversationId: string,
  senderId: string,
  recipientId: string,
  text: string,
): Promise<void> {
  const body = text.trim();
  if (!body) return;

  await addDoc(messagesCol(conversationId), {
    text: body,
    senderId,
    readBy: [senderId],
    createdAt: serverTimestamp(),
  });

  await updateDoc(doc(db(), "conversations", conversationId), {
    lastMessage: { text: body, senderId, createdAt: serverTimestamp() },
    updatedAt: serverTimestamp(),
    [`unread.${recipientId}`]: increment(1),
  });
}

export function watchMessages(conversationId: string, cb: (messages: LumaMessage[]) => void) {
  const q = query(messagesCol(conversationId), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<LumaMessage, "id">) })));
  });
}

/** Marque comme lus les messages reçus non encore lus par l'utilisateur courant. */
export async function markMessagesRead(
  conversationId: string,
  uid: string,
  messages: LumaMessage[],
): Promise<void> {
  const pending = messages.filter((m) => m.senderId !== uid && !(m.readBy ?? []).includes(uid));
  if (!pending.length) return;
  const batch = writeBatch(db());
  pending.forEach((m) => {
    batch.update(doc(db(), "conversations", conversationId, "messages", m.id), {
      readBy: arrayUnion(uid),
    });
  });
  await batch.commit();
}
