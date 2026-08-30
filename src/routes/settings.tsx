import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Moon, Sun } from "lucide-react";
import { RequireAuth } from "@/components/luma/RequireAuth";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { logOut } from "@/services/authService";

export const Route = createFileRoute("/settings")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Paramètres — LUMA" },
      { name: "description", content: "Apparence, compte et déconnexion de LUMA." },
      { property: "og:title", content: "Paramètres — LUMA" },
      { property: "og:description", content: "Réglez l'apparence et votre compte LUMA." },
    ],
  }),
  component: () => (
    <RequireAuth>
      <SettingsPage />
    </RequireAuth>
  ),
});

function SettingsPage() {
  const { user } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  async function disconnect() {
    await logOut();
    await navigate({ to: "/auth", replace: true });
  }

  return (
    <div className="luma-root">
      <div className="luma-page">
        <div className="luma-page-head">
          <Link to="/chat" className="luma-icon-btn" aria-label="Retour">
            <ArrowLeft size={17} />
          </Link>
          <h1 className="luma-title" style={{ fontSize: "1.4rem", margin: 0 }}>
            Paramètres
          </h1>
        </div>

        <div className="luma-panel">
          <h3>Apparence</h3>
          <div className="luma-setting">
            <div>
              Mode {theme === "dark" ? "sombre" : "clair"}
              <small>L'ambiance LUMA s'adapte à votre environnement.</small>
            </div>
            <button className="luma-icon-btn" onClick={toggle} aria-label="Changer de thème">
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
          </div>
        </div>

        <div className="luma-panel">
          <h3>Compte</h3>
          <div className="luma-setting">
            <div>
              {user?.email}
              <small>Identifiant de connexion Firebase Authentication.</small>
            </div>
            <Link to="/profile" className="luma-link">
              Modifier le profil
            </Link>
          </div>
          <button
            className="luma-btn luma-btn-ghost"
            style={{ marginTop: "1rem" }}
            onClick={() => void disconnect()}
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
