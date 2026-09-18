"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const PUBLIC_ROUTES = ["/", "/login"];
const DEFAULT_AUTHENTICATED_ROUTE = "/dashboard";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!active) return;
        setSession(newSession);
        setLoading(false);
      }
    );

    return () => {
      active = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (loading) return;
    const isPublic =
      PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/portal/");

    if (!session && !isPublic) {
      router.replace("/login");
    } else if (session && isPublic) {
      // Logged-in users never sit on the landing or login pages.
      router.replace(DEFAULT_AUTHENTICATED_ROUTE);
    }
  }, [loading, session, pathname, router]);

  async function logout() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  const isPublic =
    PUBLIC_ROUTES.includes(pathname) || pathname.startsWith("/portal/");

  // Public routes (landing, login) render immediately — good for first paint
  // and SEO. Protected routes stay blocked until the session is known, and
  // logged-in users are moved off public routes to the dashboard.
  const shouldBlock = isPublic ? !!session : loading || !session;

  return (
    <AuthContext.Provider
      value={{ user: session?.user ?? null, session, loading, logout }}
    >
      {shouldBlock ? (
        <div className="flex min-h-screen items-center justify-center bg-slate-950">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-400" />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
