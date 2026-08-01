import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Instagram, ExternalLink, LifeBuoy, Mail } from "lucide-react";
import { SUPPORT_WHATSAPP_URL, SUPPORT_EMAIL } from "@/components/FloatingWhatsApp";
import { FloatingWhatsApp } from "@/components/FloatingWhatsApp";

export const Route = createFileRoute("/support")({
  head: () => ({ meta: [{ title: "Help & Support — VibeFlux Media" }] }),
  component: SupportPage,
});

const WHATSAPP_URL = SUPPORT_WHATSAPP_URL;
const INSTAGRAM_URL = "https://instagram.com/vibefluxmedia";

function SupportPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-14">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs text-muted-foreground">
            <LifeBuoy className="h-3.5 w-3.5 text-primary" /> Help & Support Hub
          </div>
          <h1 className="mt-5 text-4xl font-bold">Talk to a human, directly.</h1>
          <p className="mt-3 text-muted-foreground">
            We've replaced bot-driven live chat with real, zero-friction support routed to verified channels.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-3xl gap-4 md:grid-cols-2">
          <SupportTile
            color="from-emerald-500/20 to-teal-500/10 border-emerald-500/40"
            icon={MessageCircle}
            title="Connect with Official WhatsApp Support Channel"
            description="Average reply under 12 minutes. Operational 9am – 9pm IST."
            cta="Open WhatsApp"
            href={WHATSAPP_URL}
          />
          <SupportTile
            color="from-fuchsia-500/20 to-pink-500/10 border-fuchsia-500/40"
            icon={Instagram}
            title="Message Admin directly on Instagram Support Handle"
            description="DM @vibefluxmedia — escalations and account reviews answered first."
            cta="Open Instagram"
            href={INSTAGRAM_URL}
          />
        </div>

        <div className="mx-auto mt-6 max-w-3xl">
          <Card className="glass-card p-5 flex flex-wrap items-center justify-between gap-3 border-primary/30">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-lg bg-primary/15 text-primary">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Official Support Email</p>
                <p className="text-xs text-muted-foreground">Escalations, compliance, payout audits</p>
              </div>
            </div>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="font-mono text-sm text-primary hover:underline"
            >
              {SUPPORT_EMAIL}
            </a>
          </Card>
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-xs text-muted-foreground">
          VibeFlux Media never asks for passwords, OTPs, or screen-sharing on any channel. All support contact
          opens in a new browser window via official destinations only.
        </p>
      </div>
      <FloatingWhatsApp />
    </div>
  );
}

function SupportTile({ icon: Icon, title, description, cta, href, color }: { icon: any; title: string; description: string; cta: string; href: string; color: string }) {
  return (
    <Card className={`glass-card p-6 bg-gradient-to-br ${color}`}>
      <div className="grid h-11 w-11 place-items-center rounded-lg bg-background/40 text-foreground">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-4 font-semibold text-lg leading-tight">{title}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      <Button asChild className="mt-5 w-full h-11">
        <a href={href} target="_blank" rel="noopener noreferrer">
          {cta} <ExternalLink className="ml-1 h-4 w-4" />
        </a>
      </Button>
    </Card>
  );
}
