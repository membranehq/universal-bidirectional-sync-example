"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { analytics } from "@/lib/posthog";

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });

      if (response.ok) {
        const userData = await response.json();
        const user = userData.user;
        setUser(user);

        // Identify user in PostHog when auth check succeeds
        if (user?.email) {
          analytics.identify(user.id, user.email, {
            user_id: user.id,
            login_method: "session",
          });
        }
      } else {
        setUser(null);
        // Reset PostHog when user is not authenticated
        analytics.reset();
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
      // Reset PostHog on auth error
      analytics.reset();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string) => {
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const userData = await response.json();
        const user = userData.user;
        setUser(user);

        // Track login event and identify user in PostHog
        analytics.trackSignIn("email", {
          email: user.email,
          user_id: user.id,
        });

        // Identify user in PostHog
        analytics.identify(user.id, user.email, {
          user_id: user.id,
          login_method: "email",
          last_login: new Date().toISOString(),
        });
      } else {
        throw new Error("Login failed");
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    user,
    isLoading,
    login,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
