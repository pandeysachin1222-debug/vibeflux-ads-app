import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { signInWithGoogle, completeGoogleRedirect } from "@/lib/firebase.config";
import { toast } from "sonner";
import { Zap, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Register — VibeFlux Media" }] }),
  component: RegisterPage,
});

function RegisterPage() {
  const { syncFirebaseUser } = useStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await completeGoogleRedirect();
        if (!r || cancelled) return;
        syncFirebaseUser(r.uid, r.email, r.isAdmin);
        toast.success("Account live — interface unlocked.");
        router.navigate({ to: "/dashboard" });
      } catch (e: any) {
        toast.error(e?.message ?? "Google sign-up failed");
      }
    })();
    return () => { cancelled = true; };
  }, [syncFirebaseUser, router]);

  async function googleSso() {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (e: any) {
      toast.error(e?.message ?? "Google sign-up failed");
      setLoading(false);
    }
  }


  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <Card className="glass-card mx-auto max-w-lg p-8">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/15 text-primary">
            <Zap className="h-6 w-6" />
          </div>
          <h1 className="mt-5 text-3xl font-bold">Create your publisher account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            100% free · No follower threshold · Instant unlock for App Developers, AI Tool Owners and Custom Platform Creators.
          </p>

          <ul className="mt-6 space-y-2 text-sm">
            {[
              "Instant interface unlock after Google signup",
              "Generate ad codes immediately — no manual approval",
              "Earn from day one with programmatic impressions",
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" /> {t}
              </li>
            ))}
          </ul>

          <Button disabled={loading} onClick={googleSso} className="mt-8 w-full h-11 bg-white text-slate-900 hover:bg-white/90">
            <GoogleG /> {loading ? "Connecting…" : "Continue with Google"}
          </Button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account? <Link to="/login" className="text-primary hover:underline">Login</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}

function GoogleG() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 35.5 24 35.5c-6.4 0-11.5-5.1-11.5-11.5S17.6 12.5 24 12.5c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.8 6.6 29.1 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13 24 13c2.9 0 5.6 1.1 7.6 2.9l5.7-5.7C33.8 7 29.1 5 24 5 16.3 5 9.7 9.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 43c5 0 9.6-1.9 13-5.1l-6-5.1c-1.9 1.3-4.3 2.2-7 2.2-5.2 0-9.6-3.4-11.2-8.1l-6.5 5C9.6 38.6 16.3 43 24 43z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.5l6 5.1c3.6-3.3 5.7-8.2 5.7-14.6 0-1.2-.1-2.3-.4-3.5z"/>
    </svg>
  );
}
