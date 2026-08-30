import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Check, CheckCheck, Search, Send, Settings, User } from "lucide-react";
import { Brand } from "@/components/luma/Brand";
import { RequireAuth } from "@/components/luma/RequireAuth";
import { useAuth } from "@/hooks/useAuth";
import { formatRelative, formatTime, initials } from "@/utils/format";
import { searchUsers, type LumaUser } from "@/services/userService";
import {
  createOrGetPrivateConversation,
  otherParticipant,
  resetUnread,
  watchConversations,
  type Conversation,
} from "@/services/conversationService";
import { markMessagesRead, sendMessage, watchMessages, type LumaMessage } from "@/services/messageService";

export const Route = createFileRoute("/chat")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Conversations — LUMA" },
      { name: "description", content: "Vos conversations privées LUMA en temps réel." },
      { property: "og:title", content: "Conversations — LUMA" },
      { property: "og:description", content: "Messagerie temps réel de l'écosystème Lumesys." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <ChatPage />
    </RequireAuth>
  ),
});

function ChatPage() {
  const { user, profile } = useAuth();
  const uid = user!.uid;
  const me: LumaUser = useMemo(
    () =>
      profile ?? {
        uid,
        email: user!.email ?? "",
        displayName: user!.displayName ?? (user!.email ?? "Moi").split("@")[0]!,
      },
    [profile, uid, user],
  );

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<LumaMessage[]>([]);
  const [term, setTerm] = useState("");
  const [found, setFound] = useState<LumaUser[]>([]);
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => watchConversations(uid, setConversations), [uid]);

  useEffect(() => {
    if (!activeId) return;
    setMessages([]);
    return watchMessages(activeId, setMessages);
  }, [activeId]);

  useEffect(() => {
    if (!activeId) return;
    void resetUnread(activeId, uid);
    void markMessagesRead(activeId, uid, messages);
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeId, uid, messages]);

  useEffect(() => {
    const t = window.setTimeout(async () => {
      setFound(term.trim() ? await searchUsers(term, uid) : []);
    }, 300);
    return () => window.clearTimeout(t);
  }, [term, uid]);

  const active = conversations.find((c) => c.id === activeId) ?? null;
  const peerId = active ? otherParticipant(active, uid) : null;
  const peerName = active && peerId ? (active.members?.[peerId]?.displayName ?? "Contact") : "";

  const openWith = useCallback(
    async (other: LumaUser) => {
      const id = await createOrGetPrivateConversation(me, other);
      setTerm("");
      setFound([]);
      setActiveId(id);
    },
    [me],
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeId || !peerId || !draft.trim()) return;
    const text = draft;
    setDraft("");
    await sendMessage(activeId, uid, peerId, text);
  }

  return (
    <div className="luma-root">
      <div className="luma-app">
        <aside className="luma-sidebar" data-hidden={Boolean(activeId)}>
          <div className="luma-sidebar-head">
            <Brand to="/chat" />
            <div style={{ display: "flex", gap: "0.4rem" }}>
              <Link to="/profile" className="luma-icon-btn" aria-label="Profil">
                <User size={17} />
              </Link>
              <Link to="/settings" className="luma-icon-btn" aria-label="Paramètres">
                <Settings size={17} />
              </Link>
            </div>
          </div>

          <div className="luma-search">
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: 12,
                  top: 13,
                  color: "var(--luma-muted)",
                }}
              />
              <input
                className="luma-input"
                style={{ paddingLeft: 34 }}
                placeholder="Rechercher un utilisateur…"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="luma-list">
            {term.trim() ? (
              found.length ? (
                found.map((u) => (
                  <button key={u.uid} className="luma-row" onClick={() => void openWith(u)}>
                    <span className="luma-avatar">{initials(u.displayName)}</span>
                    <span className="luma-row-body">
                      <span className="luma-row-name">{u.displayName}</span>
                      <span className="luma-row-preview">{u.email}</span>
                    </span>
                  </button>
                ))
              ) : (
                <p className="luma-empty">Aucun utilisateur trouvé.</p>
              )
            ) : conversations.length ? (
              conversations.map((c) => {
                const other = otherParticipant(c, uid);
                const unread = c.unread?.[uid] ?? 0;
                return (
                  <button
                    key={c.id}
                    className="luma-row"
                    data-active={c.id === activeId}
                    onClick={() => setActiveId(c.id)}
                  >
                    <span className="luma-avatar">
                      {initials(c.members?.[other]?.displayName ?? "?")}
                    </span>
                    <span className="luma-row-body">
                      <span className="luma-row-top">
                        <span className="luma-row-name">
                          {c.members?.[other]?.displayName ?? "Contact"}
                        </span>
                        <span className="luma-row-time">{formatRelative(c.updatedAt)}</span>
                      </span>
                      <span className="luma-row-preview">
                        {c.lastMessage
                          ? `${c.lastMessage.senderId === uid ? "Vous : " : ""}${c.lastMessage.text}`
                          : "Nouvelle conversation"}
                      </span>
                    </span>
                    {unread > 0 && <span className="luma-badge">{unread}</span>}
                  </button>
                );
              })
            ) : (
              <p className="luma-empty">
                Aucune conversation. Recherchez un utilisateur pour commencer.
              </p>
            )}
          </div>
        </aside>

        <section className="luma-chat" data-hidden={!activeId}>
          {active ? (
            <>
              <header className="luma-chat-head">
                <button
                  className="luma-icon-btn luma-back"
                  onClick={() => setActiveId(null)}
                  aria-label="Retour"
                >
                  <ArrowLeft size={17} />
                </button>
                <span className="luma-avatar">{initials(peerName || "?")}</span>
                <div>
                  <div className="luma-row-name">{peerName}</div>
                  <div className="luma-row-preview">Conversation privée</div>
                </div>
              </header>

              <div className="luma-messages">
                {messages.map((m) => {
                  const mine = m.senderId === uid;
                  const read = (m.readBy ?? []).some((r) => r !== uid);
                  return (
                    <div key={m.id} className="luma-msg" data-mine={mine}>
                      {m.text}
                      <div className="luma-msg-meta">
                        {formatTime(m.createdAt)}
                        {mine &&
                          (read ? <CheckCheck size={13} /> : <Check size={13} />)}
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>

              <form className="luma-composer" onSubmit={submit}>
                <input
                  className="luma-input"
                  placeholder="Écrire un message…"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                />
                <button className="luma-btn" type="submit" disabled={!draft.trim()}>
                  <Send size={16} /> Envoyer
                </button>
              </form>
            </>
          ) : (
            <div className="luma-placeholder">
              <div>
                <span className="luma-orb" aria-hidden />
                <h2 className="luma-title" style={{ marginTop: "0.75rem" }}>
                  Choisissez une conversation
                </h2>
                <p>Ou recherchez un utilisateur LUMA pour démarrer un échange privé.</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
