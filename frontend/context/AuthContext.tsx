"use client";
/**
 * Wallet-based auth — no backend.
 * Identity = wallet address. Display name stored in localStorage.
 */
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useWallet } from "@/context/WalletContext";
import { User } from "@/types";

const STORAGE_KEY = "cg_profile";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  setDisplayName: (name: string) => void;
  setRole: (role: "donor" | "creator") => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function loadProfile(address: string): User {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}_${address.toLowerCase()}`);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { address, name: address.slice(0, 6) + "..." + address.slice(-4), role: "donor" };
}

function saveProfile(user: User) {
  localStorage.setItem(
    `${STORAGE_KEY}_${user.address.toLowerCase()}`,
    JSON.stringify(user)
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { address, isConnected } = useWallet();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isConnected && address) {
      const profile = loadProfile(address);
      setUser(profile);
    } else {
      setUser(null);
    }
    setLoading(false);
  }, [isConnected, address]);

  const setDisplayName = (name: string) => {
    if (!user) return;
    const updated = { ...user, name };
    setUser(updated);
    saveProfile(updated);
  };

  const setRole = (role: "donor" | "creator") => {
    if (!user) return;
    const updated = { ...user, role };
    setUser(updated);
    saveProfile(updated);
  };

  const logout = () => {
    // Wallet disconnect handles this — nothing to clear server-side
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, setDisplayName, setRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
