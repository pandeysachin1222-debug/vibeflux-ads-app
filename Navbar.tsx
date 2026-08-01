import { Link, useRouter } from "@tanstack/react-router";
import { useStore, isAdminUser } from "@/lib/store";
import { firebaseSignOut } from "@/lib/firebase.config";

import { Button } from "@/components/ui/button";
import { Waves } from "lucide-react";

export function Navbar() {
  const { currentPublisher, logout } = useStore();
  const router = useRouter();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 backdrop-blur-xl bg-background/70">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground shadow-[0_0_30px_-5px_var(--primary)]">
            <Waves className="h-5 w-5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Vibe<span className="gradient-text">Flux</span> Media
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="/#features" className="hover:text-foreground">Features</a>
          <a href="/#how" className="hover:text-foreground">How it works</a>
          <a href="/#payouts" className="hover:text-foreground">Payouts</a>
          <Link to="/support" className="hover:text-foreground">Support</Link>
          {isAdminUser(currentPublisher) && (
            <Link to="/admin" className="hover:text-foreground">Admin</Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          {currentPublisher ? (
            <>
              <Button variant="ghost" onClick={() => router.navigate({ to: "/dashboard" })}>
                Dashboard
              </Button>
              <Button variant="outline" onClick={async () => { await firebaseSignOut(); logout(); router.navigate({ to: "/" }); }}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => router.navigate({ to: "/login" })}>Login</Button>
              <Button onClick={() => router.navigate({ to: "/register" })}>Register</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
