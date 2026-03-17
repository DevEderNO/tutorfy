import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from './api';

interface PortalAccount {
  id: string;
  name: string;
  email: string;
  accountType: 'STUDENT' | 'GUARDIAN';
}

interface PortalAuthContextType {
  account: PortalAccount | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isGuardian: boolean;
  login: (email: string, password: string) => Promise<void>;
  setSession: (token: string, account: PortalAccount) => void;
  logout: () => void;
}

const PortalAuthContext = createContext<PortalAuthContextType | null>(null);

export function PortalAuthProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<PortalAccount | null>(() => {
    const stored = localStorage.getItem('portal_account');
    return stored ? (JSON.parse(stored) as PortalAccount) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('portal_token'));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token && !account) {
      setIsLoading(true);
      api
        .get<{ data: PortalAccount }>('/portal/auth/me')
        .then((res) => {
          setAccount(res.data.data);
          localStorage.setItem('portal_account', JSON.stringify(res.data.data));
        })
        .catch(() => {
          localStorage.removeItem('portal_token');
          localStorage.removeItem('portal_account');
          setToken(null);
        })
        .finally(() => setIsLoading(false));
    }
  }, [token, account]);

  const login = async (email: string, password: string) => {
    const res = await api.post<{ data: { token: string; account: PortalAccount } }>('/portal/auth/login', {
      email,
      password,
    });
    const { token: t, account: a } = res.data.data;
    localStorage.setItem('portal_token', t);
    localStorage.setItem('portal_account', JSON.stringify(a));
    setToken(t);
    setAccount(a);
  };

  const setSession = (t: string, a: PortalAccount) => {
    localStorage.setItem('portal_token', t);
    localStorage.setItem('portal_account', JSON.stringify(a));
    setToken(t);
    setAccount(a);
  };

  const logout = () => {
    localStorage.removeItem('portal_token');
    localStorage.removeItem('portal_account');
    setToken(null);
    setAccount(null);
  };

  return (
    <PortalAuthContext.Provider
      value={{
        account,
        token,
        isAuthenticated: !!token && !!account,
        isLoading,
        isGuardian: account?.accountType === 'GUARDIAN',
        login,
        setSession,
        logout,
      }}
    >
      {children}
    </PortalAuthContext.Provider>
  );
}

export function usePortalAuth() {
  const ctx = useContext(PortalAuthContext);
  if (!ctx) throw new Error('usePortalAuth must be used within PortalAuthProvider');
  return ctx;
}
