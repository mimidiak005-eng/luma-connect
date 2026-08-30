/**
 * Nom : format.ts
 * Chemin : src/utils/format.ts
 * Rôle : formatage des dates/heures et initiales d'avatar.
 */
import type { Timestamp } from "firebase/firestore";

const toDate = (value?: Timestamp | null): Date | null =>
  value && typeof value.toDate === "function" ? value.toDate() : null;

export function formatTime(value?: Timestamp | null): string {
  const d = toDate(value);
  if (!d) return "";
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export function formatRelative(value?: Timestamp | null): string {
  const d = toDate(value);
  if (!d) return "";
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  if (sameDay) return formatTime(value);
  const yesterday = new Date(today.getTime() - 86400000);
  if (d.toDateString() === yesterday.toDateString()) return "Hier";
  return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" });
}

export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
