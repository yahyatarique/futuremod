import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SessionUser {
  userId: string;
  email: string;
  name: string;
}

interface SessionContextValue {
  user: SessionUser | null;
  /** True while the initial Supabase session is being restored from storage. */
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ ok: true } | { ok: false; error: string }>;
  signUp: (
    name: string,
    email: string,
    password: string
  ) => Promise<
    | { ok: true; needsConfirmation: false }
    | { ok: true; needsConfirmation: true }
    | { ok: false; error: string }
  >;
  signOut: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function toSessionUser(user: User): SessionUser {
  return {
    userId: user.id,
    email: user.email ?? "",
    name:
      (user.user_metadata?.name as string | undefined) ??
      (user.user_metadata?.full_name as string | undefined) ??
      user.email?.split("@")[0] ??
      "Member",
  };
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

export const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on mount and listen for auth state changes.
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ? toSessionUser(session.user) : null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ? toSessionUser(session.user) : null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return {
          ok: false as const,
          error: "We couldn't sign you in. Check your email and password.",
        };
      }
      return { ok: true as const };
    },
    []
  );

  const signUp = useCallback(
    async (name: string, email: string, password: string) => {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name: name.trim() || undefined } },
      });
      if (error) {
        return { ok: false as const, error: error.message };
      }
      // Supabase returns a session immediately when email confirmation is
      // disabled; otherwise session is null until the user confirms.
      const needsConfirmation = !data.session;
      return { ok: true as const, needsConfirmation };
    },
    []
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, signOut }),
    [user, loading, signIn, signUp, signOut]
  );

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
}

/** Safe to call outside the dashboard shell (e.g. standalone subdomain editor). */
export function useOptionalSession() {
  return useContext(SessionContext);
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used within SessionProvider");
  return ctx;
}
