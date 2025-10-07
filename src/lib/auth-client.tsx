"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { me as apiMe, logout as apiLogout } from "@/lib/auth";

export type SAUser = {
  id?: number | string;
  email?: string | null;
  phone?: string | null;
  name?: string | null;
  avatarUrl?: string | null;
  // champs optionnels renvoyés par /api/auth/me (si tu veux t'en servir)
  nom?: string | null;
  prenoms?: string | null;
} | null;

type NonNull<T> = T extends null ? never : T;

type Ctx = {
  user: SAUser;
  token: string | null; // conservé pour compat si tu l'utilises ailleurs
  setUser: (u: SAUser) => void;
  setToken: (t: string | null) => void;
  updateUser: (patch: Partial<NonNull<SAUser>>) => void;
  setAvatarUrl: (url: string) => void;
  signOut: () => Promise<void>;
};

const AuthCtx = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SAUser>(null);
  const [token, setToken] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Rehydrate depuis localStorage pour la première peinture
  useEffect(() => {
    try {
      const t = localStorage.getItem("sa_token");
      const u = localStorage.getItem("sa_user");
      if (t) setToken(t);
      if (u) setUser(JSON.parse(u));
    } catch {}
  }, []);

  // Source de vérité : l’API /api/auth/me (cookies Sanctum)
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await apiMe();           // { data: {...} } | null
        if (!mounted) return;
        setUser(res?.data ?? null);
      } catch {
        if (!mounted) return;
        setUser(null);
      } finally {
        if (mounted) setHydrated(true);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // Persistance locale (confort UI)
  useEffect(() => {
    try {
      token ? localStorage.setItem("sa_token", token) : localStorage.removeItem("sa_token");
    } catch {}
  }, [token]);

  useEffect(() => {
    try {
      user ? localStorage.setItem("sa_user", JSON.stringify(user)) : localStorage.removeItem("sa_user");
    } catch {}
  }, [user]);

  const updateUser = (patch: Partial<NonNull<SAUser>>) =>
    setUser((u) => (u ? { ...u, ...patch } : u));

  const setAvatarUrl = (url: string) => updateUser({ avatarUrl: url });

  const signOut = async () => {
    try {
      await apiLogout(); // POST /api/auth/logout (204)
    } catch {
      // on ignore les erreurs réseau : on nettoie quand même le client
    } finally {
      setUser(null);
      setToken(null);
      try {
        localStorage.removeItem("sa_user");
        localStorage.removeItem("sa_token");
      } catch {}
    }
  };

  const value: Ctx = { user, token, setUser, setToken, updateUser, setAvatarUrl, signOut };

  // Optionnel : bloquer le rendu avant première hydratation API
  // if (!hydrated) return null;

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
