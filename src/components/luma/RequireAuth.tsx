/**
 * Nom : RequireAuth.tsx
 * Chemin : src/components/luma/RequireAuth.tsx
 * Rôle : protection des pages privées côté client (redirection vers /auth).
 */
import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading, configured } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) void navigate({ to: "/auth", replace: true });
  }, [loading, user, navigate]);

  if (!configured) {
    return (
      <div className="luma-center">
        <div className="luma-card">
          <h2>Configuration Firebase requise</h2>
          <p className="luma-sub">
            Renseignez les variables <code>VITE_FIREBASE_*</code> (voir FIREBASE_SETUP.md) puis
            rechargez LUMA.
          </p>
        </div>
      </div>
    );
  }

  if (loading || !user) {
    return (
      <div className="luma-center">
        <p style={{ color: "var(--luma-muted)" }}>Chargement de LUMA…</p>
      </div>
    );
  }

  return <>{children}</>;
}
