{ createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type PayMethod = "upi" | "bank";
// Extended SiteKind: 4 segmented verticals + legacy values for backwards-compatibility.
export type SiteKind =
  | "playstore"   // Google Play Store Apps
  | "offstore"    // Off-Store / APK / Link-Downloaded Apps
  | "ai"          // AI Automation Tools & Task Portals
  | "custom"      // Tournament Frameworks & Custom Websites
  | "android" | "website" | "tasks" | "gaming";
export type AdFormat = "banner" | "sidebar" | "interstitial";

export interface PublisherTerms {
  acceptedAt: number;
  customTerms: string;
  privacyPolicy: string;
}

export interface Publisher {
  id: string;
  email: string;
  password: string;
  channelUrl?: string;
  subscribers: number;
  payMethod: PayMethod;
  upiId?: string;
  accountHolder?: string;
  bankAccount?: string;
  ifsc?: string;
  bankName?: string;
  bankBranch?: string;
  approved: boolean;
  frozen: boolean;
  createdAt: number;
  balance: number;
  impressions: number;
  monthlyCycle: number;
  copyrightDeduction: number;
  totalWithdrawn: number;
  commissionOverride?: number; // 0–1, overrides PLATFORM_COMMISSION when set
  terms?: PublisherTerms;
  isAdmin?: boolean; // Firebase-style custom claim — dynamically grants /admin access

}
export type SiteStatus = "pending" | "approved" | "rejected";
export interface SitePlacement {
  id: string;
  publisherId: string;
  name: string;
  url: string;
  kind: SiteKind;
  extra?: string; // Package ID / APK URL / endpoint / domain
  createdAt: number;
  status: SiteStatus;
  reviewedAt?: number;
}
export interface AdUnit {
  id: string;
  publisherId: string;
  siteId: string;
  format: AdFormat;
  label: string;
  pubCode: string;
  impressions: number;
  createdAt: number;
}
export interface ShortLink {
  id: string;
  publisherId: string;
  slug: string;
  target: string;
  views: number;
  createdAt: number;
}
export type WithdrawalStatus = "pending" | "paid" | "rejected";
export interface Withdrawal {
  id: string;
  publisherId: string;
  amount: number;
  mode: PayMethod;
  destination: string;
  status: WithdrawalStatus;
  createdAt: number;
  paidAt?: number;
}

export interface PayoutWindow {
  openedAt: number;   // ms — when admin marked "Network Funds Received"
  startsAt: number;   // ms — 12:00 AM of the following day
  expiresAt: number;  // ms — startsAt + 10 days
}

interface DB {
  publishers: Publisher[];
  sites: SitePlacement[];
  adUnits: AdUnit[];
  links: ShortLink[];
  withdrawals: Withdrawal[];
  networkRevenue: number;
  currentSession: string | null;
  payoutWindow: PayoutWindow | null;
  seedVersion: number;
  globalCommissionRate: number; // 0–1 universal admin baseline deduction
}

const KEY = "vibeflux_db_v3";

// Production-clean default state — admin panel must reflect zero residual mock data.
const defaultDB: DB = {
  publishers: [],
  globalCommissionRate: 0.4,
  sites: [],
  adUnits: [],
  links: [],
  withdrawals: [],
  networkRevenue: 0,
  currentSession: null,
  payoutWindow: null,
  seedVersion: 2,
};

function normalize(db: DB): DB {
  // Hard purge of legacy starter publisher / seeded mock metrics (seedVersion 1 → 2).
  const wasLegacy = (db.seedVersion ?? 0) < 2;
  const cleaned = wasLegacy
    ? (db.publishers ?? []).filter((p) => p.email.toLowerCase() !== "creator4034@gmail.com")
    : (db.publishers ?? []);
  return {
    ...defaultDB,
    ...db,
    seedVersion: 2,
    payoutWindow: db.payoutWindow ?? null,
    currentSession: wasLegacy ? null : (db.currentSession ?? null),
    publishers: cleaned.map((p) => ({
      ...p,
      frozen: p.frozen ?? false,
      totalWithdrawn: p.totalWithdrawn ?? 0,
      monthlyCycle: p.monthlyCycle ?? 0,
      impressions: p.impressions ?? 0,
      balance: p.balance ?? 0,
      copyrightDeduction: p.copyrightDeduction ?? 10,
    })),
    sites: (db.sites ?? []).map((s: any) => ({ ...s, status: s.status ?? "pending" })),
  };
}

function load(): DB {
  if (typeof window === "undefined") return defaultDB;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultDB;
    return normalize({ ...defaultDB, ...JSON.parse(raw) });
  } catch {
    return defaultDB;
  }
}
function save(db: DB) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(db));
}

interface Ctx {
  db: DB;
  setDB: (updater: (d: DB) => DB) => void;
  currentPublisher: Publisher | null;
  loginEmail: (email: string) => string | null;
  logout: () => void;
  registerInstant: (email: string, payMethod?: PayMethod) => string | null;
  deletePublisher: (id: string) => void;
  toggleFreeze: (id: string) => void;
  openPayoutWindow: () => void;
  closePayoutWindow: () => void;
  setGlobalCommission: (rate: number) => void;
  setSiteStatus: (id: string, status: SiteStatus) => void;
  syncFirebaseUser: (uid: string, email: string, isAdmin: boolean) => Publisher;
  setPublisherAdmin: (id: string, isAdmin: boolean) => void;
}

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [db, setDbState] = useState<DB>(defaultDB);

  useEffect(() => { setDbState(load()); }, []);

  const setDB: Ctx["setDB"] = (updater) => {
    setDbState((prev) => { const next = updater(prev); save(next); return next; });
  };

  const currentPublisher = db.publishers.find((p) => p.id === db.currentSession) ?? null;

  const loginEmail: Ctx["loginEmail"] = (email) => {
    const p = db.publishers.find((x) => x.email.toLowerCase() === email.toLowerCase());
    if (!p) return "No publisher account found for this Google email.";
    setDB((d) => ({ ...d, currentSession: p.id }));
    return null;
  };
  const logout = () => setDB((d) => ({ ...d, currentSession: null }));
  const registerInstant: Ctx["registerInstant"] = (email, payMethod = "upi") => {
    const lower = email.toLowerCase();
    const existing = db.publishers.find((x) => x.email.toLowerCase() === lower);
    if (existing) {
      setDB((d) => ({ ...d, currentSession: existing.id }));
      return null;
    }
    const id = crypto.randomUUID();
    const newP: Publisher = {
      id, email: lower, password: crypto.randomUUID().slice(0, 12),
      subscribers: 0, payMethod,
      approved: true, frozen: false,
      createdAt: Date.now(), balance: 0, impressions: 0,
      monthlyCycle: 0, copyrightDeduction: 10, totalWithdrawn: 0,
    };
    setDB((d) => ({ ...d, publishers: [...d.publishers, newP], currentSession: id }));
    return null;
  };

  const deletePublisher: Ctx["deletePublisher"] = (id) => {
    setDB((d) => ({
      ...d,
      publishers: d.publishers.filter((p) => p.id !== id),
      sites: d.sites.filter((s) => s.publisherId !== id),
      adUnits: d.adUnits.filter((u) => u.publisherId !== id),
      withdrawals: d.withdrawals.filter((w) => w.publisherId !== id),
      currentSession: d.currentSession === id ? null : d.currentSession,
    }));
  };
  const toggleFreeze: Ctx["toggleFreeze"] = (id) => {
    setDB((d) => ({
      ...d,
      publishers: d.publishers.map((p) => p.id === id ? { ...p, frozen: !p.frozen } : p),
    }));
  };
  const openPayoutWindow: Ctx["openPayoutWindow"] = () => {
    const now = new Date();
    const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    const startsAt = next.getTime();
    const expiresAt = startsAt + 10 * 24 * 60 * 60 * 1000;
    setDB((d) => ({ ...d, payoutWindow: { openedAt: Date.now(), startsAt, expiresAt } }));
  };
  const closePayoutWindow: Ctx["closePayoutWindow"] = () => {
    setDB((d) => ({ ...d, payoutWindow: null }));
  };
  const setGlobalCommission: Ctx["setGlobalCommission"] = (rate) => {
    const clamped = Math.min(0.9, Math.max(0, rate));
    setDB((d) => ({ ...d, globalCommissionRate: clamped }));
  };
  const setSiteStatus: Ctx["setSiteStatus"] = (id, status) => {
    setDB((d) => ({
      ...d,
      sites: d.sites.map((s) => s.id === id ? { ...s, status, reviewedAt: Date.now() } : s),
    }));
  };

  const syncFirebaseUser: Ctx["syncFirebaseUser"] = (uid, email, isAdmin) => {
    const lower = email.toLowerCase();
    let created: Publisher | null = null;
    setDB((d) => {
      const existing = d.publishers.find((p) => p.id === uid || p.email.toLowerCase() === lower);
      if (existing) {
        const merged: Publisher = { ...existing, id: uid, email: lower, isAdmin };
        created = merged;
        return {
          ...d,
          publishers: d.publishers.map((p) => p === existing ? merged : p),
          currentSession: uid,
        };
      }
      const newP: Publisher = {
        id: uid, email: lower, password: crypto.randomUUID().slice(0, 12),
        subscribers: 0, payMethod: "upi",
        approved: true, frozen: false,
        createdAt: Date.now(), balance: 0, impressions: 0,
        monthlyCycle: 0, copyrightDeduction: 10, totalWithdrawn: 0,
        isAdmin,
      };
      created = newP;
      return { ...d, publishers: [...d.publishers, newP], currentSession: uid };
    });
    return created!;
  };

  const setPublisherAdmin: Ctx["setPublisherAdmin"] = (id, isAdmin) => {
    setDB((d) => ({
      ...d,
      publishers: d.publishers.map((p) => p.id === id ? { ...p, isAdmin } : p),
    }));
  };

  return (
    <StoreCtx.Provider value={{
      db, setDB, currentPublisher, loginEmail, logout, registerInstant,
      deletePublisher, toggleFreeze, openPayoutWindow, closePayoutWindow,
      setGlobalCommission, setSiteStatus, syncFirebaseUser, setPublisherAdmin,
    }}>

      {children}
    </StoreCtx.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export const BRAND = "VibeFlux Media";
export const PLATFORM_COMMISSION = 0.4;
export const MIN_WITHDRAW = 500;
export const MAX_WITHDRAW = 30000;
export const MAX_REQUESTS_PER_DAY = 3;

// Firebase-ready admin allowlist — only these identities may unlock /admin.
export const ADMIN_EMAILS: string[] = [
  "creator4034@gmail.com",
  "pandey.sachin1222@gmail.com",
];
export function isAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

/**
 * Firebase-style dynamic admin check.
 * Grants /admin access when the publisher carries an `isAdmin` custom claim
 * (simulating Firebase Auth custom claims / role-based tokens) OR when the
 * email matches the bootstrap allowlist. Any authenticated administrator
 * with the claim gets in — no hardcoded string required.
 */
export function isAdminUser(publisher: { email?: string; isAdmin?: boolean } | null | undefined): boolean {
  if (!publisher) return false;
  if (publisher.isAdmin === true) return true;
  return isAdminEmail(publisher.email);
}


export function fmtINR(n: number) {
  return "₹" + Math.round(n).toLocaleString("en-IN");
}

// FIFO ledger formatter — explicit `YYYY-MM-DD HH:mm:ss`.
export function fmtTs(ms: number): string {
  const d = new Date(ms);
  const p = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

export function isPayoutWindowActive(win: PayoutWindow | null, now: number = Date.now()): boolean {
  if (!win) return false;
  return now >= win.startsAt && now < win.expiresAt;
}

export function makePubCode(format: AdFormat) {
  const r = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `vf-${r}`;
}

// Vertical segmentation helper for admin dashboards.
export const VERTICALS: { id: SiteKind; label: string; short: string }[] = [
  { id: "playstore", label: "Google Play Store Apps", short: "Play Store" },
  { id: "offstore",  label: "Off-Store / APK Apps",   short: "Off-Store APK" },
  { id: "ai",        label: "AI Tools & Task Portals", short: "AI Tools" },
  { id: "playstore", label: "Google Play Store Apps", short: "Play Store" },
  { id: "offstore",  label: "Off-Store / APK Apps",   short: "Off-Store APK" },
  { id: "ai",        label: "AI Tools & Task Portals", short: "AI Tools" },
  { id: "custom",    label: "Custom Web / Tournaments", short: "Custom / Tournament" },
];

// Net-30 audit framework — admin commission histories lock on the 3rd of each month.
export const COMMISSION_LOCK_DAY = 3;
export const PAYOUT_NOTICE =
  "System Notice: Manual risk audits are conducted. Approved balances are securely disbursed within 24–48 hours post-verification.";

export function effectiveCommission(p: Publisher, globalRate?: number): number {
  if (typeof p.commissionOverride === "number") return p.commissionOverride;
  return typeof globalRate === "number" ? globalRate : PLATFORM_COMMISSION;
}

export function isMonthLocked(year: number, monthIndex: number): boolean {
  const now = new Date();
  const cy = now.getFullYear();
  const cm = now.getMonth();
  if (year < cy) return true;
  if (year > cy) return false;
  if (monthIndex < cm) return true;
  if (monthIndex > cm) return false;
  return now.getDate() >= COMMISSION_LOCK_DAY;
                                        }
