import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/s/$slug")({
  component: Redirector,
});

function Redirector() {
  const { slug } = Route.useParams();
  const { db, setDB } = useStore();
  const link = db.links.find((l) => l.slug === slug);

  useEffect(() => {
    if (!link) return;
    setDB((d) => ({
      ...d,
      links: d.links.map((l) => l.id === link.id ? { ...l, views: l.views + 1 } : l),
      publishers: d.publishers.map((p) => p.id === link.publisherId ? { ...p, balance: p.balance + 1.2 } : p),
      networkRevenue: d.networkRevenue + 1.2,
    }));
    const t = setTimeout(() => { window.location.href = link.target; }, 1200);
    return () => clearTimeout(t);
  }, [link, setDB]);

  return (
    <div className="grid min-h-screen place-items-center text-center">
      <div>
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="mt-4 text-muted-foreground">{link ? "Redirecting…" : "Link not found"}</p>
      </div>
    </div>
  );
}
