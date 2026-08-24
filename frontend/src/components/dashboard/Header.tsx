"use client";

import { Bell, Search, Moon, Sun } from "lucide-react";

import { useTheme } from "@/shared/ui/ThemeMode";
import { SidebarTrigger } from "@/components/ui/sidebar";
import UserProfile from "@/shared/ui/UserProfile";

export default function Header() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <SidebarTrigger />

        <div className="flex items-center">
          <img className="w-[50px]" src="/operatorAI.png" alt="OperatorAI" />

          <h2 className="text-[23px] font-[800]">OperatorAI</h2>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2">
  

        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
          aria-label={
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
          }
        >
          {theme === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </button>

        <UserProfile />
      </div>
    </header>
  );
}
