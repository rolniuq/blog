"use client";

import React, { createContext, useContext, useSyncExternalStore } from "react";

export type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  mode: ThemeMode;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function subscribe(callback: () => void) {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSystemMode(): ThemeMode {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

// SSR always returns "light" so server markup is stable; the real value
// is resolved and kept in sync on the client without hydration mismatches.
function getServerSnapshot(): ThemeMode {
  return "light";
}

export function ThemeContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const mode = useSyncExternalStore(subscribe, getSystemMode, getServerSnapshot);

  return (
    <ThemeContext.Provider value={{ mode }}>{children}</ThemeContext.Provider>
  );
}

export function useThemeMode(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error("useThemeMode must be used within ThemeContextProvider");
  }
  return ctx;
}