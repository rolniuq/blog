"use client";

import { IconButton, Tooltip } from "@mui/material";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useThemeMode } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { mode, toggleTheme } = useThemeMode();

  return (
    <Tooltip title={mode === "light" ? "Dark mode" : "Light mode"}>
      <IconButton
        onClick={toggleTheme}
        sx={{
          color: "text.secondary",
          transition: "transform 0.3s ease",
          "&:hover": {
            color: "primary.main",
            transform: "rotate(15deg)",
          },
        }}
        aria-label="Toggle theme"
      >
        {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>
    </Tooltip>
  );
}
