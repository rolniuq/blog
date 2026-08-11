"use client";
import { Inter } from "next/font/google";
import { createTheme } from "@mui/material/styles";

const inter = Inter({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

// Shopee orange + Claude Code warm surfaces.
// Bright #ee4d2d is used for accents/buttons (3:1+ on dark for large elements),
// while deeper #c8371b is used for link/text on light backgrounds to keep WCAG AA.
// Dark mode surfaces are warm charcoal (#262625 / #2f2d2b) like Claude Code,
// with a brighter coral-orange (#ff7a5c) for contrast on dark surfaces.

export function getTheme(mode: "light" | "dark") {
  return createTheme({
    typography: {
      fontFamily: inter.style.fontFamily,
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            fontWeight: 500,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
          },
        },
      },
    },
    palette:
      mode === "light"
        ? {
            mode: "light" as const,
            primary: {
              main: "#ee4d2d", // Shopee orange
              light: "#ff7a5c",
              dark: "#c8371b", // deeper orange for link/text contrast on light bg
              contrastText: "#ffffff",
            },
            grey: {
              50: "#faf9f7",
              100: "#f2f1ee",
              200: "#e5e3de",
              300: "#d1cec8",
              400: "#b3afa8",
              500: "#8f8a82",
              600: "#6d6862",
              700: "#57524c",
              800: "#3a3733",
              900: "#232220",
            },
            background: {
              default: "#faf9f5", // warm off-white
              paper: "#ffffff",
            },
            text: {
              primary: "#1f1e1c", // warm near-black
              secondary: "#6d6762",
            },
            divider: "rgba(31,30,28,0.12)",
          }
        : {
            mode: "dark" as const,
            primary: {
              main: "#ff7a5c", // brighter coral-orange for dark surfaces
              light: "#ff9e87",
              dark: "#e85c3e",
              contrastText: "#1f1e1c", // dark text on bright orange buttons
            },
            grey: {
              50: "#2a2927",
              100: "#33322f",
              200: "#403e3b",
              300: "#57544f",
              400: "#6f6b65",
              500: "#8a857e",
              600: "#a29d96",
              700: "#b8b4ad",
              800: "#d3d0ca",
              900: "#edebe6",
            },
            background: {
              default: "#262625", // warm charcoal (Claude Code)
              paper: "#2f2d2b",
            },
            text: {
              primary: "#edebe6", // warm off-white
              secondary: "#a29d96",
            },
            divider: "rgba(237,235,230,0.12)",
          },
  });
}

export const lightTheme = getTheme("light");
export const darkTheme = getTheme("dark");