import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { endpoints, setAccessToken } from '../lib/api';
import type { AuthUser } from '../types';

interface AuthCtx {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  setUser: (u: AuthUser | null) => void;
}

const Ctx = createContext<AuthCtx>({
  user: null,
  loading: true,
  login: async () => { throw new Error('no provider'); },
  logout: async () => {},
  setUser: () => {},
});

export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session on load — access token lives in memory only, so we
  // rely on the HttpOnly refresh cookie to mint a fresh one.
  useEffect(() => {
    (async () => {
      try {
        const data = await endpoints.refresh();
        setAccessToken(data.accessToken);
        setUser(data.user);
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await endpoints.login(email, password);
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try { await endpoints.logout(); } catch { /* ignore */ }
    setAccessToken(null);
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </Ctx.Provider>
  );
}
