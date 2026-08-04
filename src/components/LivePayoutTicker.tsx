import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Banknote } from "lucide-react";

const NAMES = ["rahul", "priya", "amit", "neha", "vikas", "anita", "sourav", "deepak", "kavya", "arjun", "manish", "pooja", "raj", "simran", "tanmay"];
const MODES = ["UPI", "Bank Transfer", "UPI", "UPI", "Bank Transfer"];

function mask(name: string) {
  return name[0] + "****@gmail.com";
}
function rand<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]; }

interface Payout { id: number; email: string; amount: number; mode: string; }

function makePayout(id: number): Payout {
  const amount = Math.round((Math.random() * 2800 + 200) / 10) * 10;
  return { id, email: mask(rand(NAMES)), amount, mode: rand(MODES) };
}

export function LivePayoutTicker() {
  const [payout, setPayout] = useState<Payout | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let i = 0;
    const show = () => {
      i += 1;
      setPayout(makePayout(i));
      setVisible(true);
      setTimeout(() => setVisible(false), 5500);
    };
    show();
    const interval = setInterval(show, 7000);
    return () => clearInterval(interval);
  }, []);

  if (!payout) return null;
  return (
    <div
      className={`fixed bottom-5 left-5 z-50 transition-all duration-500 ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"}`}
      aria-live="polite"
    >
      <Card className="glass-card flex items-center gap-3 p-3 pr-4 shadow-2xl border-primary/30 max-w-[320px]">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-primary">
          <Banknote className="h-4 w-4" />
        </div>
        <div className="text-xs leading-tight">
          <p className="font-medium text-foreground">
            Publisher {payout.email} just received <span className="text-primary">₹{payout.amount.toLocaleString("en-IN")}</span>
          </p>
          <p className="text-muted-foreground mt-0.5">via {payout.mode} · moments ago</p>
        </div>
        <span className="ml-auto h-2 w-2 shrink-0 animate-pulse rounded-full bg-success" />
      </Card>
    </div>
  );
}
