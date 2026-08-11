import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { ThemeContextProvider } from "./context/ThemeContext";
import ThemeRegistry from "./ThemeRegistry";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Raymond's Notebook",
  description:
    "A personal developer blog — daily thoughts, hard-learned lessons, and experiments in software engineering, AI, and building things that ship.",
};

// Favicons are auto-served from the file convention:
// app/icon.svg (modern browsers), app/icon.png (fallback),
// app/apple-icon.png (iOS home screen).

export const viewport: Viewport = {
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AppRouterCacheProvider>
          <ThemeContextProvider>
            <ThemeRegistry>{children}</ThemeRegistry>
          </ThemeContextProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
}