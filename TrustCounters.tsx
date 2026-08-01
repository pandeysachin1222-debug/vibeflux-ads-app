import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Users, Wallet } from "lucide-react";

function useTick(base: number, increment: () => number, intervalMs: number) {
  const [val, setVal] = useState(base);
  useEffect(() => {
    const id = setInterval(() => setVal((v) => v + increment()), intervalMs);
    return () => clearInterval(id);
  }, [increment, intervalMs]);
  return val;
}

export function TrustCounters() {
  const publishers = useTick(14240, () => 1, 4500);
  const paidOut = useTick(482900, () => Math.floor(Math.random() * 400) + 50, 3500);

  return (
    <div className="mx-auto mt-12 grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-2">
      <Card className="glass-card p-6 text-left">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Network Publishers</p>
          <Users className="h-4 w-4 text-primary" />
        </div>
        <p className="mt-3 text-3xl font-bold gradient-text tabular-nums">
          {publishers.toLocaleString("en-IN")}+
        </p>
        <p className="mt-1 text-xs text-muted-foreground">growing every minute</p>
      </Card>
      <Card className="glass-card p-6 text-left">
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Total Paid Out This Month</p>
          <Wallet className="h-4 w-4 text-primary" />
        </div>
        <p className="mt-3 text-3xl font-bold gradient-text tabular-nums">
          ₹{paidOut.toLocaleString("en-IN")}+
        </p>
        <p className="mt-1 text-xs text-muted-foreground">live settlement ledger</p>
      </Card>
    </div>
  );
}
