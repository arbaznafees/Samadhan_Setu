"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { api } from "./api";

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  phone?: string;
  role: "citizen" | "hei_reviewer" | "industry_partner" | "govt_admin";
  district?: string;
  organization?: string;
  hei?: {
    id: number;
    institute_name: string;
    aishe_code: string;
    district: string;
    specializations: string[];
  };
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<UserProfile>;
  loginAs: (role: "citizen" | "hei_reviewer" | "industry_partner" | "govt_admin") => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const DEMO_CREDENTIALS = {
  citizen: { email: "citizen@samadhansetu.jh.gov.in", password: "password123" },
  hei_reviewer: { email: "bit.mesra@samadhansetu.jh.gov.in", password: "password123" },
  industry_partner: { email: "csr@tatasteel.com", password: "password123" },
  govt_admin: { email: "admin@jharkhand.gov.in", password: "password123" },
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const storedToken = localStorage.getItem("samadhan_token");
      if (storedToken) {
        setToken(storedToken);
        const me = await api.getMe();
        setUser(me);
      } else {
        setUser(null);
        setToken(null);
      }
    } catch (err) {
      console.warn("Session check failed or expired:", err);
      localStorage.removeItem("samadhan_token");
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<UserProfile> => {
    setIsLoading(true);
    try {
      const res = await api.login({ email, password });
      localStorage.setItem("samadhan_token", res.access_token);
      setToken(res.access_token);
      const me = await api.getMe();
      setUser(me);
      return me;
    } finally {
      setIsLoading(false);
    }
  };

  const loginAs = async (role: "citizen" | "hei_reviewer" | "industry_partner" | "govt_admin") => {
    const creds = DEMO_CREDENTIALS[role];
    if (creds) {
      await login(creds.email, creds.password);
    }
  };

  const logout = () => {
    localStorage.removeItem("samadhan_token");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        loginAs,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
