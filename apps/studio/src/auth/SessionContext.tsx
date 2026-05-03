import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

/**
 * Demo auth only: credentials live in localStorage. Replace with real OAuth / session API.
 */
const SESSION_KEY = "futuremod-demo-session";
const ACCOUNTS_KEY = "futuremod-demo-accounts";

export interface SessionUser {
  userId: string;
  email: string;
  name: string;
}

type AccountRecord = Record<string, { userId: string; name: string; password: string }>;

function readAccounts(): AccountRecord {
  try {
    return JSON.parse(localStorage.getItem(ACCOUNTS_KEY) ?? "{}") as AccountRecord;
  } catch {
    return {};
  }
}

function writeAccounts(a: AccountRecord) {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(a));
  } catch {
    /* ignore */
  }
}

function readSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

function writeSession(user: SessionUser | null) {
  try {
    if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    else localStorage.removeItem(SESSION_KEY);
  } catch {
    /* ignore */
  }
}

interface SessionContextValue {
  user: SessionUser | null;
  signIn: (email: string, password: string) => { ok: true } | { ok: false; error: string };
  signUp: (name: string, email: string, password: string) => { ok: true } | { ok: false; error: string };
  signOut: () => void;
}

export const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => readSession());

  const signIn = useCallback((email: string, password: string) => {
    const normalized = email.trim().toLowerCase();
    const accounts = readAccounts();
    const row = accounts[normalized];
    if (!row || row.password !== password) {
      return { ok: false as const, error: "We couldn’t sign you in. Check your email and password." };
    }
    const next = { userId: row.userId, email: normalized, name: row.name };
    writeSession(next);
    setUser(next);
    return { ok: true as const };
  }, []);

  const signUp = useCallback((name: string, email: string, password: string) => {
    const normalized = email.trim().toLowerCase();
    if (password.length < 8) {
      return { ok: false as const, error: "Use at least 8 characters for your password." };
    }
    const accounts = readAccounts();
    if (accounts[normalized]) {
      return { ok: false as const, error: "An account with this email already exists." };
    }
    const userId = crypto.randomUUID();
    accounts[normalized] = { userId, name: name.trim() || "Member", password };
    writeAccounts(accounts);
    const next = { userId, email: normalized, name: name.trim() || "Member" };
    writeSession(next);
    setUser(next);
    return { ok: true as const };
  }, []);

  const signOut = useCallback(() => {
    writeSession(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, signIn, signUp, signOut }) satisfies SessionContextValue,
    [user, signIn, signUp, signOut]
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

/** Safe where the dashboard shell isn’t mounted (e.g. legacy standalone subdomain editor). */
export function useOptionalSession() {
  return useContext(SessionContext);
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
