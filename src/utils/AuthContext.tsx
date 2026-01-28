"use client";

import { createContext, useContext, useEffect, useState } from "react";

import localStorageService from "@/src/services/localStorageService";
import { setAuthContext } from "./AuthContextProviderForApi";

type User = {
  id: string;
  email: string;
  role: "admin" | "worker" | "viewer";
  fullName?: string | null;
  name?: string | null;
};

export type Role = User["role"];

type Organization = {
  id: string;
  name: string;
};

export type AuthSession = {
  user: User;
  organization: Organization;
};

export type AuthContextType = {
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  session: AuthSession | null;
  login: (email: string, password: string) => Promise<void>;
  authLogout: () => Promise<void>;
};

const SESSION_STORAGE_KEY = "worcoor-session";
const RAW_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
const API_BASE_URL = RAW_API_BASE_URL.endsWith("/")
  ? RAW_API_BASE_URL.slice(0, RAW_API_BASE_URL.length - 1)
  : RAW_API_BASE_URL;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const persistSession = (nextSession: AuthSession | null) => {
    if (nextSession) {
      localStorageService.setItem(SESSION_STORAGE_KEY, nextSession);
    } else {
      localStorageService.removeItem(SESSION_STORAGE_KEY);
    }
  };

  const login = async (email: string, password: string) => {
    setIsAuthLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const errorMessage = errorBody?.error || errorBody?.message || "Login failed";
        throw new Error(errorMessage);
      }

      const data = (await response.json()) as { user: User; organization: Organization };
      const nextSession: AuthSession = {
        user: data.user,
        organization: data.organization,
      };

      setSession(nextSession);
      setIsAuthenticated(true);
      persistSession(nextSession);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const authLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.warn("Logout request failed", error);
    } finally {
      setSession(null);
      setIsAuthenticated(false);
      persistSession(null);
    }
  };

  useEffect(() => {
    const storedSession = localStorageService.getItem<AuthSession>(SESSION_STORAGE_KEY);
    if (storedSession) {
      setSession(storedSession);
      setIsAuthenticated(true);
    }
    setIsAuthLoading(false);

    setAuthContext({
      isAuthenticated: !!storedSession,
      isAuthLoading: false,
      login,
      authLogout,
      session: storedSession ?? null,
    });

    return () => setAuthContext(null);
  }, []);

  useEffect(() => {
    setAuthContext({
      isAuthenticated,
      isAuthLoading,
      login,
      authLogout,
      session,
    });
  }, [authLogout, isAuthenticated, isAuthLoading, login, session]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAuthLoading,
        session,
        login,
        authLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
