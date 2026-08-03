/**
 * VibeFlux Media — Firebase Live Configuration
 * --------------------------------------------
 * Production Firebase project wiring. Auth + Firestore are enabled and
 * consumed directly by the app (see helpers below). Analytics is lazy-
 * loaded browser-side only.
 */

import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  browserLocalPersistence,
  setPersistence,
  type Auth,
  type User,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  type Firestore,
} from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyCLq8dVt0jIkjDl4VvZqoa9VLKz8T0Rj80",
  authDomain: "ads-website-9dab2.firebaseapp.com",
  projectId: "ads-website-9dab2",
  storageBucket: "ads-website-9dab2.firebasestorage.app",
  messagingSenderId: "932056734158",
  appId: "1:932056734158:web:754162f207cbef2196739f",
  measurementId: "G-F53EGFGW6P",
};

export const USE_FIREBASE = true;

/**
 * Bootstrap admin allowlist — the FIRST time one of these emails signs in
 * with Google we mint their /users/{uid} document with `isAdmin: true`.
 * All subsequent admin checks read exclusively from Firestore.
 */
export const ADMIN_BOOTSTRAP_EMAILS = [
  "creator4034@gmail.com",
  "pandey.sachin1222@gmail.com",
];

// ---- Client-only singleton ------------------------------------------------

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

function ensure() {
  if (typeof window === "undefined") {
    throw new Error("Firebase client accessed during SSR");
  }
  if (!_app) {
    _app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    _auth = getAuth(_app);
    _db = getFirestore(_app);
    setPersistence(_auth, browserLocalPersistence).catch(() => {});
    // Lazy analytics — never on server.
    import("firebase/analytics").then(async ({ getAnalytics, isSupported }) => {
      try { if (await isSupported()) getAnalytics(_app!); } catch { /* ignore */ }
    }).catch(() => {});
  }
  return { app: _app!, auth: _auth!, db: _db! };
}

export function getFirebase() {
  return ensure();
}

// ---- Domain allowlist (client-side context guard) -------------------------

/**
 * Domains this build expects to run auth on. This is a LOCAL guard only —
 * Firebase still enforces its own Authorized Domains list server-side.
 */
export const ALLOWED_AUTH_DOMAINS = [
  "preview--quick-link-prosper.lovable.app",
  "quick-link-prosper.lovable.app",
  "localhost",
  "127.0.0.1",
];

export function isAllowedAuthDomain(host = typeof window !== "undefined" ? window.location.hostname : "") {
  return (
    ALLOWED_AUTH_DOMAINS.includes(host) ||
    host.endsWith(".lovable.app") ||
    host.endsWith(".lovableproject.com")
  );
}

// ---- Auth helpers (redirect flow) -----------------------------------------

async function upsertUserDoc(user: User) {
  const { db } = ensure();
  const email = (user.email ?? "").toLowerCase();
  const uref = doc(db, "users", user.uid);
  const snap = await getDoc(uref);
  if (!snap.exists()) {
    const isAdmin = ADMIN_BOOTSTRAP_EMAILS.includes(email);
    await setDoc(uref, {
      uid: user.uid,
      email,
      isAdmin,
      availableBalance: 0,
      createdAt: serverTimestamp(),
    });
    return { uid: user.uid, email, isAdmin };
  }
  const data = snap.data() as any;
  return { uid: user.uid, email, isAdmin: data?.isAdmin === true };
}

/**
 * Kicks off Google auth via full-page redirect (no popup / no COOP issues).
 * Never resolves normally — the browser navigates away.
 */
export async function signInWithGoogle(): Promise<void> {
  const { auth } = ensure();
  if (!isAllowedAuthDomain()) {
    throw new Error(
      `This host (${window.location.hostname}) is not in the local auth allowlist.`,
    );
  }
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: "select_account" });
  await signInWithRedirect(auth, provider);
}

/**
 * Call on mount of /login and /register to finish the redirect round-trip.
 * Returns null when the page load was not a redirect return.
 */
export async function completeGoogleRedirect(): Promise<
  { uid: string; email: string; isAdmin: boolean } | null
> {
  const { auth } = ensure();
  const res = await getRedirectResult(auth);
  if (!res?.user) return null;
  return upsertUserDoc(res.user);
}


export async function firebaseSignOut() {
  try {
    const { auth } = ensure();
    await signOut(auth);
  } catch { /* ignore */ }
}

export function subscribeUserDoc(uid: string, cb: (data: { isAdmin: boolean; availableBalance: number } | null) => void) {
  const { db } = ensure();
  return onSnapshot(doc(db, "users", uid), (s) => {
    if (!s.exists()) { cb(null); return; }
    const d = s.data() as any;
    cb({ isAdmin: d.isAdmin === true, availableBalance: Number(d.availableBalance ?? 0) });
  });
}

// ---- Firestore mirroring: properties + payouts ----------------------------

export async function mirrorPropertyCreate(site: {
  id: string; publisherId: string; publisherEmail?: string;
  name: string; url: string; kind: string; extra?: string; createdAt: number;
}) {
  const { db } = ensure();
  await setDoc(doc(db, "properties", site.id), {
    ...site,
    status: "pending",
    statusLabel: "Pending Review ⏳",
    createdAtServer: serverTimestamp(),
  });
}

export async function mirrorPropertyStatus(id: string, status: "approved" | "rejected") {
  const { db } = ensure();
  const label = status === "approved" ? "Approved ✔" : "Rejected ✘";
  await updateDoc(doc(db, "properties", id), {
    status,
    statusLabel: label,
    reviewedAt: serverTimestamp(),
  });
}

export async function mirrorPayoutCreate(w: {
  id: string; publisherId: string; publisherEmail?: string;
  amount: number; mode: string; destination: string; createdAt: number;
  wallet?: Record<string, unknown>;
}) {
  const { db } = ensure();
  await setDoc(doc(db, "payouts", w.id), {
    ...w,
    status: "Pending",
    createdAtServer: serverTimestamp(),
  });
}

export async function mirrorPayoutComplete(id: string, publisherId: string, amount: number) {
  const { db } = ensure();
  await updateDoc(doc(db, "payouts", id), {
    status: "Completed",
    paidAt: serverTimestamp(),
  });
  const uref = doc(db, "users", publisherId);
  const snap = await getDoc(uref);
  const current = snap.exists() ? Number((snap.data() as any).availableBalance ?? 0) : 0;
  await setDoc(uref, { availableBalance: Math.max(0, current - amount) }, { merge: true });
}

export async function mirrorPayoutReject(id: string) {
  const { db } = ensure();
  await updateDoc(doc(db, "payouts", id), {
    status: "Rejected",
    reviewedAt: serverTimestamp(),
  });
}
