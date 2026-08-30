import { createFileRoute, Link } from "@tanstack/react-router";
import { Brand } from "@/components/luma/Brand";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LUMA — Messagerie privée et lumineuse de Lumesys" },
      {
        name: "description",
        content:
          "LUMA est la messagerie de l'écosystème Lumesys : conversations privées, messages en temps réel et sécurité par défaut.",
      },
      { property: "og:title", content: "LUMA — Messagerie de l'écosystème Lumesys" },
      {
        property: "og:description",
        content: "Conversations privées et messages en temps réel, dans une interface épurée.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="luma-root luma-center">
      <div className="luma-hero">
        <Brand />
        <h1 className="luma-title">Vos conversations, à la lumière juste.</h1>
        <p>
          LUMA est la messagerie de l'écosystème Lumesys : conversations privées, messages en temps
          réel, statut de lecture et sécurité stricte dès le premier jour.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
          <Link to="/auth" className="luma-btn luma-btn-inline">
            Ouvrir LUMA
          </Link>
        </div>
      </div>
    </div>
  );
}
