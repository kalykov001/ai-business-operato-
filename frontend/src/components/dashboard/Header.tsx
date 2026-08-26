"use client";

import { Moon, Sun } from "lucide-react";

import { useTheme } from "@/shared/ui/ThemeMode";
import { SidebarTrigger } from "@/components/ui/sidebar";
import UserProfile from "@/shared/ui/UserProfile";

export default function Header() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const isDark = theme === "dark";

  return (
    <header
      className="
        sticky top-0 z-40
        flex h-16 items-center justify-between
        border-b
        border-[var(--border)]
        bg-[color:var(--background)]/95
        px-4
        backdrop-blur-xl
        md:px-6
      "
    >
      {/* LEFT */}
      <div className="flex items-center gap-4">
        <SidebarTrigger
          className="
            rounded-lg
            text-[var(--muted-foreground)]
            transition-all duration-200
            hover:bg-[var(--accent)]
            hover:text-[var(--primary)]
          "
        />

        <div className="hidden h-6 w-px bg-[var(--border)] sm:block" />

        <div className="flex items-center gap-3">
          {/* Mobile logo */}
          <div
            className="
              flex h-8 w-8 items-center justify-center
              rounded-lg
              border border-[var(--border)]
              bg-[var(--primary)]/10
              sm:hidden
            "
          >
            <img
              src="/operatorAI.png"
              alt="OperatorAI"
              className="h-6 w-6 object-contain"
            />
          </div>

          <div>
            <h2
              className="
                text-sm font-semibold tracking-tight
                text-[var(--foreground)]
                sm:text-[15px]
              "
            >
              OperatorAI
            </h2>

            <p
              className="
                hidden
                text-[10px]
                uppercase
                tracking-[0.15em]
                text-[var(--muted-foreground)]
                sm:block
              "
            >
              Business workspace
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-1.5">
        {/* Theme */}
        <button
          type="button"
          onClick={toggleTheme}
          className="
            flex h-9 w-9
            items-center justify-center
            rounded-lg
            text-[var(--muted-foreground)]
            transition-all duration-200
            hover:bg-[var(--accent)]
            hover:text-[var(--primary)]
          "
          aria-label={
            isDark
              ? "Switch to light mode"
              : "Switch to dark mode"
          }
        >
          {isDark ? (
            <Sun className="h-[18px] w-[18px]" />
          ) : (
            <Moon className="h-[18px] w-[18px]" />
          )}
        </button>

        {/* Divider */}
        <div className="mx-1 h-7 w-px bg-[var(--border)]" />

        {/* Profile */}
        <UserProfile />
      </div>
    </header>
  );
}