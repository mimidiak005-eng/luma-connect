import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Brand } from "@/components/luma/Brand";
import { useAuth } from "@/hooks/useAuth";
import { authErrorMessage, resetPassword, signIn, signUp } from "@/services/authService";

export const Route = createFileRoute("/auth")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Connexion — LUMA" },
      { name: "description", content: "Connectez-vous à LUMA ou créez votre compte Lumesys." },
      { property: "og:title", content: "Connexion — LUMA" },
      { property: "og:description", content: "Accédez à vos conversations LUMA." },
    ],
  }),
  component: AuthPage,
});

type Mode = "login" | "signup" | "reset";

function AuthPage() {
  const { user, loading, configured } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) void navigate({ to: "/chat", replace: true });
  }, [loading, user, navigate]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);
    try {
      if (mode === "signup") {
        await signUp(name, email, password);
        await navigate({ to: "/chat", replace: true });
      } else if (mode === "login") {
        await signIn(email, password);
        await navigate({ to: "/chat", replace: true });
      } else {
        await resetPassword(email);
        setInfo("E-mail de réinitialisation envoyé, vérifiez votre boîte de réception.");
      }
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="luma-root luma-center">
      <div className="luma-card">
        <Brand />
        {!configured && (
          <div className="luma-alert" data-kind="error" style={{ marginTop: "1rem" }}>
            Firebase n'est pas encore configuré. Voir FIREBASE_SETUP.md.
          </div>
        )}
        <h2>
          {mode === "signup"
            ? "Créer un compte"
            : mode === "reset"
              ? "Mot de passe oublié"
              : "Bon retour"}
        </h2>
        <p className="luma-sub">
          {mode === "reset"
            ? "Nous vous envoyons un lien de réinitialisation."
            : "Messagerie de l'écosystème Lumesys."}
        </p>

        {mode !== "reset" && (
          <div className="luma-tabs">
            <button
              type="button"
              className="luma-tab"
              data-active={mode === "login"}
              onClick={() => setMode("login")}
            >
              Connexion
            </button>
            <button
              type="button"
              className="luma-tab"
              data-active={mode === "signup"}
              onClick={() => setMode("signup")}
            >
              Inscription
            </button>
          </div>
        )}

        {error && (
          <div className="luma-alert" data-kind="error">
            {error}
          </div>
        )}
        {info && (
          <div className="luma-alert" data-kind="ok">
            {info}
          </div>
        )}

        <form onSubmit={submit}>
          {mode === "signup" && (
            <label className="luma-field">
              <span>Nom affiché</span>
              <input
                className="luma-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ada Lumen"
                required
              />
            </label>
          )}
          <label className="luma-field">
            <span>E-mail</span>
            <input
              className="luma-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vous@lumesys.io"
              required
            />
          </label>
          {mode !== "reset" && (
            <label className="luma-field">
              <span>Mot de passe</span>
              <input
                className="luma-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </label>
          )}
          <button className="luma-btn" type="submit" disabled={busy || !configured}>
            {busy
              ? "Un instant…"
              : mode === "signup"
                ? "Créer mon compte"
                : mode === "reset"
                  ? "Envoyer le lien"
                  : "Se connecter"}
          </button>
        </form>

        <p className="luma-foot">
          {mode === "reset" ? (
            <button className="luma-link" onClick={() => setMode("login")}>
              Retour à la connexion
            </button>
          ) : (
            <button className="luma-link" onClick={() => setMode("reset")}>
              Mot de passe oublié ?
            </button>
          )}
        </p>
      </div>
    </div>
  );
}
