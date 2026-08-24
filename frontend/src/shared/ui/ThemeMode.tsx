"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

type Theme = "light" | "dark" | "system";

type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext =
  createContext<ThemeContextType | null>(null);

function applyTheme(theme: Theme) {
  const root = document.documentElement;

  root.classList.remove("light", "dark");

  if (theme === "system") {
    const isDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    root.classList.add(
      isDark ? "dark" : "light"
    );
  } else {
    root.classList.add(theme);
  }
}

export function ThemeMode({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] =
    useState<Theme>("system");

  useEffect(() => {
    const savedTheme =
      localStorage.getItem("theme") as Theme | null;

    const initialTheme =
      savedTheme === "light" ||
      savedTheme === "dark" ||
      savedTheme === "system"
        ? savedTheme
        : "system";

    setThemeState(initialTheme);

    applyTheme(initialTheme);
  }, []);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);

    localStorage.setItem(
      "theme",
      newTheme
    );

    applyTheme(newTheme);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context =
    useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used inside ThemeMode"
    );
  }

  return context;
}