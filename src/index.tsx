import { createFileRoute, Link } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TrustCounters } from "@/components/TrustCounters";
import { LivePayoutTicker } from "@/components/LivePayoutTicker";
import { RecentCashouts } from "@/components/RecentCashouts";
import {
  ArrowRight, BarChart3, Globe2, Lock, Rocket, ShieldCheck, Sparkles, Wallet, LineChart, Layers,
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VibeFlux Media — Premium Programmatic Ad Network" },
      { name: "description", content: "Monetize every impression with VibeFlux Media's premium dynamic CPM, smart revenue arbitrage and global traffic optimization." },
      { property: "og:title", content: "VibeFlux Media — Premium Ad Network" },
      { property: "og:description", content: "Earn via premium dynamic CPM. Scale revenue based on global traffic quality." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <LivePayoutTicker />


      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            VibeFlux Networks · Self-Hosted · Net-30 Payouts
          </div>
          <h1 className="mx-auto mt-6 max-w-4xl text-balance text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight">
            Turn every click into <span className="gradient-text">revenue</span> with intelligent ad arbitrage.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Earn via our Premium Dynamic CPM System. Maximize traffic value through smart revenue arbitrage and scale revenue based on global traffic quality.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button asChild size="lg" className="h-12 px-7 text-base">
              <Link to="/register">Start earning <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 px-7 text-base">
              <Link to="/login">Publisher login</Link>
            </Button>
          </div>

          <TrustCounters />

          <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { icon: LineChart, t: "Premium Dynamic CPM System", d: "Rates flex with geo, device & advertiser demand in real time." },
              { icon: Layers, t: "Smart Revenue Arbitrage", d: "Auto-route every impression to the highest paying partner." },
              { icon: Globe2, t: "Global Traffic Quality Scaling", d: "Higher quality traffic unlocks higher revenue tiers." },
            ].map(({ icon: Icon, t, d }) => (
              <Card key={t} className="glass-card p-6 text-left">
                <Icon className="h-6 w-6 text-primary" />
                <h3 className="mt-3 font-semibold">{t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border/60 py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold">Built for serious publishers</h2>
            <p className="mt-3 text-muted-foreground">
              Everything you need to monetize, measure and withdraw — without the noise.
            </p>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Rocket, t: "Instant link shortener", d: "Spin up branded short links the moment your channel is approved." },
              { icon: BarChart3, t: "Live performance ledger", d: "Audit your own pending and completed payouts inside your wallet." },
              { icon: ShieldCheck, t: "Compliance-first", d: "Full bookkeeping for tax, ITR and platform audits — baked in." },
              { icon: Wallet, t: "UPI & Bank payouts", d: "Choose UPI or bank transfer at signup. Update anytime." },
              { icon: Lock, t: "Channel verification", d: "Minimum 500 followers verification keeps the network premium." },
              { icon: Sparkles, t: "Revenue optimization", d: "Dynamic deduction controls protect quality without surprises." },
            ].map(({ icon: Icon, t, d }) => (
              <Card key={t} className="glass-card p-6">
                <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold">{t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{d}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How */}
      <section id="how" className="border-t border-border/60 py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold">How it works</h2>
            <p className="mt-3 text-muted-foreground">Three steps to unlock revenue.</p>
          </div>
          <ol className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { n: "01", t: "Register your channel", d: "Submit your YouTube, Instagram or Facebook profile." },
              { n: "02", t: "Get verified", d: "Admin verifies 500+ followers and unlocks earning tools." },
              { n: "03", t: "Shorten & earn", d: "Shorten links, drive traffic, and withdraw on Net-30." },
            ].map((s) => (
              <Card key={s.n} className="glass-card p-6">
                <div className="text-sm font-mono text-primary">{s.n}</div>
                <h3 className="mt-2 font-semibold text-lg">{s.t}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </Card>
            ))}
          </ol>
        </div>
      </section>

      {/* Social Proof — Recent Cashouts */}
      <section id="cashouts" className="border-t border-border/60 py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-4xl font-bold">Real publishers, real payouts</h2>
            <p className="mt-3 text-muted-foreground">
              A live glimpse into the VibeFlux network cashout ledger — updated in real time.
            </p>
          </div>
          <div className="mx-auto mt-10 max-w-2xl">
            <RecentCashouts />
          </div>
        </div>
      </section>

      {/* Payouts notice */}
      <section id="payouts" className="border-t border-border/60 py-24">
        <div className="container mx-auto px-4">
          <Card className="glass-card mx-auto max-w-4xl p-8">
            <h3 className="text-2xl font-semibold">Payout terms</h3>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Notice:</strong> Standard Net-30 Terms apply.
              Publishers can submit up to 3 withdrawal requests on the designated monthly payout day.
              Minimum withdrawal threshold is <strong className="text-foreground">₹500</strong> and
              Maximum is <strong className="text-foreground">₹30,000</strong> per request.
              Processing takes 24–48 hours after network settlement verification.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60 py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold">Ready to monetize your audience?</h2>
          <p className="mt-3 text-muted-foreground">Register in under a minute — no follower minimum to sign up.</p>
          <Button asChild size="lg" className="mt-8 h-12 px-7">
            <Link to="/register">Create publisher account <ArrowRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </div>
      </section>

      <footer className="border-t border-border/60 py-10 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} VibeFlux Media. All rights reserved.
      </footer>
    </div>
  );
}
