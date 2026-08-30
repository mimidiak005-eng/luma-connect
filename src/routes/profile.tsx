import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { RequireAuth } from "@/components/luma/RequireAuth";
import { useAuth } from "@/hooks/useAuth";
import { upsertUserProfile } from "@/services/userService";
import { initials } from "@/utils/format";

export const Route = createFileRoute("/profile")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Profil — LUMA" },
      { name: "description", content: "Gérez votre nom affiché et votre présentation LUMA." },
      { property: "og:title", content: "Profil — LUMA" },
      { property: "og:description", content: "Votre identité dans la messagerie LUMA." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <ProfilePage />
    </RequireAuth>
  ),
});

function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setDisplayName(profile?.displayName ?? user?.displayName ?? "");
    setBio(profile?.bio ?? "");
  }, [profile, user]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setBusy(true);
    await upsertUserProfile({
      uid: user.uid,
      email: user.email ?? "",
      displayName: displayName.trim() || "Utilisateur LUMA",
      bio: bio.trim(),
    });
    await refreshProfile();
    setBusy(false);
    setSaved(true);
  }

  return (
    <div className="luma-root">
      <div className="luma-page">
        <div className="luma-page-head">
          <Link to="/chat" className="luma-icon-btn" aria-label="Retour">
            <ArrowLeft size={17} />
          </Link>
          <h1 className="luma-title" style={{ fontSize: "1.4rem", margin: 0 }}>
            Profil
          </h1>
        </div>

        <div className="luma-panel">
          <div className="luma-profile-head">
            <span className="luma-avatar" data-size="lg">
              {initials(displayName || "?")}
            </span>
            <div>
              <div className="luma-row-name" style={{ fontSize: "1.1rem" }}>
                {displayName || "Utilisateur LUMA"}
              </div>
              <div className="luma-row-preview">{user?.email}</div>
            </div>
          </div>

          {saved && (
            <div className="luma-alert" data-kind="ok">
              Profil mis à jour.
            </div>
          )}

          <form onSubmit={save}>
            <label className="luma-field">
              <span>Nom affiché</span>
              <input
                className="luma-input"
                value={displayName}
                onChange={(e) => {
                  setDisplayName(e.target.value);
                  setSaved(false);
                }}
                required
              />
            </label>
            <label className="luma-field">
              <span>À propos</span>
              <textarea
                className="luma-textarea"
                value={bio}
                onChange={(e) => {
                  setBio(e.target.value);
                  setSaved(false);
                }}
                placeholder="Quelques mots visibles par vos contacts."
              />
            </label>
            <button className="luma-btn" type="submit" disabled={busy}>
              {busy ? "Enregistrement…" : "Enregistrer"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
