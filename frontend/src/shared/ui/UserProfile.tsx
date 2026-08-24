"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) {
  console.error("NEXT_PUBLIC_API_URL is not defined");
}
export default function UserProfile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  // Отправляем access_token в Express
  const sendTokenToBackend = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      console.log("Нет access_token");
      return;
    }

    if (!session.provider_token) {
      console.log("Нет Google provider_token");
      return;
    }

    console.log("ACCESS TOKEN:", session.access_token);
    console.log("Google provider_token получен");

    const response = await fetch(`${API_URL}/api/calendar/events`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "X-Google-Provider-Token": session.provider_token,
      },
    });

    const data = await response.json();

    console.log("Calendar events:", data);
  };

   useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("Session error:", error.message);
        setLoading(false);
        return;
      }

      const session = data.session;

      setUser(session?.user ?? null);

      if (session?.access_token) {
        console.log("ACCESS TOKEN:", session.access_token);
        console.log("PROVIDER TOKEN:", session.provider_token);

        try {
          await sendTokenToBackend();
          await getGmailMessages();
        } catch (err) {
          console.error("Backend request failed:", err);
        }
      }

      setLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);

      if (session?.access_token) {
        console.log("ACCESS TOKEN:", session.access_token);
        console.log("PROVIDER TOKEN:", session.provider_token);

        try {
          await sendTokenToBackend();
          await getGmailMessages();
        } catch (err) {
          console.error("Backend request failed:", err);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);
 const getGmailMessages = async () => {
  console.log("GMAIL FUNCTION START");

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    console.log("Нет access_token");
    return;
  }

  if (!session.provider_token) {
    console.log("Нет Google provider_token");
    return;
  }

  const response = await fetch(`${API_URL}/api/gmail/messages`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "X-Google-Provider-Token": session.provider_token,
    },
  });

  if (!response.ok) {
    throw new Error(`Gmail API error: ${response.status}`);
  }

  const data = await response.json();
  console.log("Gmail messages:", data);
};
  const handleGoogleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
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

    setOpen(false);
    setUser(null);
  };

  if (loading) return null;

  if (!user) {
    return <button onClick={handleGoogleLogin}>Continue with Google</button>;
  }

  console.log(user);

  const name =
    user.user_metadata?.full_name || user.user_metadata?.name || "User";

  const avatar =
    user.user_metadata?.avatar_url ||
    user.user_metadata?.picture ||
    "https://media.istockphoto.com/id/1495088043/vector/user-profile-icon-avatar-or-person-icon-profile-picture-portrait-symbol-default-portrait.jpg?s=612x612&w=0&k=20&c=dhV2p1JwmloBTOaG3EZElZ0=";

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-3"
      >
        {avatar && (
          <img src={avatar} alt={name} className="h-8 w-8 rounded-full" />
        )}

        <div className="text-left">
          <h3 className="text-sm font-medium">{name}</h3>

          <p className="text-xs text-gray-500">{user.email}</p>
        </div>
      </button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-full min-w-[120px] rounded-lg border bg-background p-1 text-foreground shadow-md">
          <button
            onClick={handleLogout}
            className="w-full rounded-md px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
