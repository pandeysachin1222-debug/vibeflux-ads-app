import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Banknote } from "lucide-react";
import { fmtINR } from "@/lib/store";

const HANDLES = [
  "pandey.sachin", "rahul.mehra", "priya.k", "amit.singh", "neha.g", "vikas.r",
  "anita.dey", "sourav.b", "deepak.n", "kavya.s", "arjun.v", "manish.j",
  "pooja.raut", "raj.tiwari", "simran.k", "tanmay.b", "creator4034", "ishaan.m",
];
const MODES = ["UPI", "Bank Transfer", "UPI", "UPI", "Bank Transfer", "IMPS"];

function maskEmail(handle: string) {
  const visible = handle.slice(0, Math.min(4, Math.max(2, handle.length - 3)));
  return `${visible}${"*".repeat(5)}@gmail.com`;
}
function pick<T>(arr: T[]) { return arr[Math.floor(Math.random() * arr.length)]; }

interface Cashout {
  id: string;
  email: string;
  amount: number;
  mode: string;
  minutesAgo: number;
}

function makeCashout(seed: number): Cashout {
  const amount = Math.round((Math.random() * 4200 + 500) / 10) * 10;
  return {
    id: `c-${seed}-${Math.random().toString(36).slice(2, 7)}`,
    email: maskEmail(pick(HANDLES)),
    amount,
    mode: pick(MODES),
    minutesAgo: Math.floor(Math.random() * 55) + 1,
  };
}

export function RecentCashouts({ compact = false }: { compact?: boolean }) {
  const [rows, setRows] = useState<Cashout[]>([]);

  useEffect(() => {
    setRows(Array.from({ length: compact ? 5 : 8 }, (_, i) => makeCashout(i)));
    const id = setInterval(() => {
      setRows((prev) => [makeCashout(Date.now()), ...prev].slice(0, compact ? 5 : 8));
    }, 9000);
    return () => clearInterval(id);
  }, [compact]);


  return (
    <Card className="glass-card p-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold flex items-center gap-2">
            <Banknote className="h-4 w-4 text-primary" />
            Recent Network Cashouts
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Live ledger · verified publisher disbursals across VibeFlux
          </p>
        </div>
        <Badge variant="outline" className="border-success/40 text-success">
          <span className="mr-1.5 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-success" />
          Live
        </Badge>
      </div>

      <ul className="mt-4 divide-y divide-border/60">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center gap-3 py-2.5">
            <div className="grid h-8 w-8 place-items-center rounded-full bg-success/10 text-success shrink-0">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{r.email}</p>
              <p className="text-[11px] text-muted-foreground">
                via {r.mode} · {r.minutesAgo} min ago
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-semibold text-success">{fmtINR(r.amount)}</p>
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Paid</p>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}
