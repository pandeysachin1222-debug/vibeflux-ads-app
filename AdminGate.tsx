import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Lock, ArrowLeft, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useStore, isAdminUser, ADMIN_EMAILS } from "@/lib/store";
import { subscribeUserDoc } from "@/lib/firebase.config";

interface Props { children: ReactNode }

/**
 * Firebase-ready Admin Authentication Guard.
 * Access is granted dynamically to any authenticated publisher whose session
 * carries an `isAdmin` custom claim (Firebase Auth style) or whose email is
 * on the bootstrap allowlist (`ADMIN_EMAILS`). Everyone else is bounced:
 *   - No active session   → redirected to /login
 *   - Non-admin session   → redirected to /dashboard
 */
export function AdminGate({ children }: Props) {
  const router = useRouter();
  const { currentPublisher, setPublisherAdmin } = useStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Live-sync isAdmin from Firestore /users/{uid}
  useEffect(() => {
    if (!currentPublisher?.id) return;
    const unsub = subscribeUserDoc(currentPublisher.id, (d) => {
      if (d) setPublisherAdmin(currentPublisher.id, d.isAdmin);
    });
    return () => unsub();
  }, [currentPublisher?.id, setPublisherAdmin]);

  const authorized = isAdminUser(currentPublisher);


  useEffect(() => {
    if (!mounted) return;
    if (!currentPublisher) {
      toast.error("Admin route locked — please sign in first");
      router.navigate({ to: "/login" });
      return;
    }
    if (!authorized) {
      toast.error("Access denied — this account is not an administrator");
      router.navigate({ to: "/dashboard" });
    }
  }, [mounted, currentPublisher, authorized, router]);

  if (!mounted) return null;
  if (authorized) return <>{children}</>;

  // Fallback screen while redirect is in flight.
  return (
    <div className="min-h-screen grid place-items-center px-4 py-10 bg-background">
      <Card className="glass-card w-full max-w-md p-6 md:p-8">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-destructive/15 text-destructive">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Restricted Zone</h1>
            <p className="text-xs text-muted-foreground">Master Control Panel · admin-only</p>
          </div>
        </div>

        <div className="mt-5 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-muted-foreground flex gap-2">
          <Lock className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
          <span>
            {currentPublisher
              ? "The signed-in account is not on the administrator allowlist."
              : "You must sign in with an authorized administrator email to continue."}
          </span>
        </div>

        <div className="mt-4 rounded-md border border-border bg-card/40 p-3 text-[11px] text-muted-foreground">
          <p className="flex items-center gap-1.5 text-foreground">
            <AlertTriangle className="h-3.5 w-3.5 text-warning" /> Authorized identities:
          </p>
          <ul className="mt-1.5 space-y-0.5 font-mono">
            {ADMIN_EMAILS.map((e) => <li key={e}>· {e}</li>)}
          </ul>
        </div>

        <Button
          onClick={() => router.navigate({ to: currentPublisher ? "/dashboard" : "/login" })}
          variant="outline"
          className="mt-5 w-full"
        >
          <ArrowLeft className="h-4 w-4" />
          {currentPublisher ? "Return to Dashboard" : "Go to Publisher Login"}
        </Button>
      </Card>
    </div>
  );
}
