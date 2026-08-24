"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
console.log("UserProfile rendered");
type User = {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    name?: string;
    avatar_url?: string;
    picture?: string;
  };
};

export default function UserProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [avatarError, setAvatarError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;

    // getSession() reads from local storage first — fast, and doesn't
    // depend on a network round-trip like getUser() does. This avoids
    // the "flash of logged-out state" while the OAuth redirect settles.
    const loadSession = async () => {
      
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();
console.log("Session:", session);
console.log("Session error:", error);
        if (error) {
          console.error("Get session error:", error);
        }

        if (mounted) {
          setUser((session?.user as User) ?? null);
          setLoading(false);
        }
      } catch (error) {
        console.error("Session loading error:", error);
        if (mounted) {
          setUser(null);
          setLoading(false);
        }
      }
    };

    loadSession();

    // This is the real source of truth: it fires on SIGNED_IN,
    // SIGNED_OUT, TOKEN_REFRESHED, and once on init after the client
    // has resolved the session (including right after the OAuth
    // redirect completes the code exchange).
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setUser((session?.user as User) ?? null);
      setAvatarError(false);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Close the dropdown when clicking outside it.
  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: [
          "openid",
          "email",
          "profile",
          "https://www.googleapis.com/auth/gmail.readonly",
          "https://www.googleapis.com/auth/calendar",
          "https://www.googleapis.com/auth/drive",
        ].join(" "),
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      console.error("Google login error:", error.message);
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Logout error:", error.message);
      return;
    }

    setUser(null);
    setOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
        <div>
          <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          <div className="mt-1 h-2 w-28 animate-pulse rounded bg-muted" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
      >
        Continue with Google
      </button>
    );
  }

  const name =
    user.user_metadata?.full_name || user.user_metadata?.name || "User";

  const email = user.email || "";

  const avatar =
    user.user_metadata?.avatar_url || user.user_metadata?.picture || "";

  return (
    <div className="relative" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-3"
      >
        {avatar && !avatarError ? (
          <img
            src={avatar}
            alt={name}
            className="h-8 w-8 rounded-full object-cover"
            onError={() => setAvatarError(true)}
          />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
            {name.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="text-left">
          <h3 className="text-sm font-medium">{name}</h3>
          <p className="text-xs text-muted-foreground">{email}</p>
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border bg-background p-1 shadow-md">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}