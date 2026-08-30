/**
 * Nom : useAuth.tsx
 * Chemin : src/hooks/useAuth.tsx
 * Rôle : contexte d'authentification LUMA (session courante + profil Firestore).
 */
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "firebase/auth";
import { isFirebaseConfigured } from "@/firebase/config";
import { watchAuth } from "@/services/authService";
import { getUserProfile, type LumaUser } from "@/services/userService";

interface AuthContextValue {
  user: User | null;
  profile: LumaUser | null;
  loading: boolean;
  configured: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  loading: true,
  configured: false,
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<LumaUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured) {
      setLoading(false);
      return;
    }
    return watchAuth(async (next) => {
      setUser(next);
      setProfile(next ? await getUserProfile(next.uid) : null);
      setLoading(false);
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      configured: isFirebaseConfigured,
      refreshProfile: async () => {
        if (user) setProfile(await getUserProfile(user.uid));
      },
    }),
    [user, profile, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
