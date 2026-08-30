/**
 * Nom : Brand.tsx
 * Chemin : src/components/luma/Brand.tsx
 * Rôle : logo/marque LUMA réutilisable.
 */
import { Link } from "@tanstack/react-router";

export function Brand({ to = "/" }: { to?: "/" | "/chat" }) {
  return (
    <Link to={to} className="luma-brand">
      <span className="luma-orb" aria-hidden />
      Luma
    </Link>
  );
}
