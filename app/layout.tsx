import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import { ThemeContextProvider } from "./context/ThemeContext";
import ThemeRegistry from "./ThemeRegistry";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Raymond's Notebook",
  description:
    "A personal blog where I share my daily thoughts, learnings, and experiences through markdown posts.",
  icons: {
    icon: "/images/dev.png",
    shortcut: "/images/dev.png",
    apple: "/images/dev.png",
  },
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
