"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  CalendarDays,
  HardDrive,
  CheckSquare,
  Clock,
  ArrowRight,
  Sparkles,
  Users,
  Loader2,
  AlertCircle,
} from "lucide-react";

import Header from "@/components/dashboard/Header";
import AppSidebar from "@/components/dashboard/AppSidebar";
import { supabase } from "@/lib/supabase";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
};

type SuggestionsResponse = {
  suggestions?: string[];
  message?: string;
  error?: string;
  [key: string]: unknown;
};

export default function Home() {
  const router = useRouter();

  const [userName, setUserName] = useState("User");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [suggestions, setSuggestions] =
    useState<SuggestionsResponse | null>(null);
  const [suggestionsError, setSuggestionsError] = useState<string | null>(
    null,
  );

  // =========================
  // LOAD DASHBOARD
  // =========================

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        const name =
          user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "User";

        setUserName(name);

        const { data, error } = await supabase
          .from("tasks")
          .select("id,title,status,priority,due_date")
          .order("created_at", {
            ascending: false,
          });

        if (error) {
          console.error("Tasks error:", error);
          return;
        }

        setTasks(data ?? []);
      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // =========================
  // AI SUGGESTIONS
  // =========================

  const handleReviewSuggestions = async () => {
    try {
      setSuggestionsLoading(true);
      setSuggestionsError(null);
      setSuggestions(null);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session?.access_token) {
        throw new Error("Supabase session not found");
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      if (!apiUrl) {
        throw new Error(
          "NEXT_PUBLIC_API_URL is not configured",
        );
      }

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      };

      if (session.provider_token) {
        headers["X-Google-Provider-Token"] =
          session.provider_token;
      }

      console.log("AI suggestions request:", {
        apiUrl,
        hasAccessToken: !!session.access_token,
        hasGoogleToken: !!session.provider_token,
      });

      const response = await fetch(
        `${apiUrl}/api/ai/suggestions`,
        {
          method: "POST",
          headers,
        },
      );

      let data: SuggestionsResponse;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          `Server returned invalid JSON (${response.status})`,
        );
      }

      console.log(
        "SUGGESTIONS STATUS:",
        response.status,
      );

      console.log(
        "SUGGESTIONS DATA:",
        data,
      );

      if (!response.ok) {
        throw new Error(
          data.error ||
            data.message ||
            `Failed to get suggestions (${response.status})`,
        );
      }

      setSuggestions(data);
    } catch (error) {
      console.error(
        "Review suggestions error:",
        error,
      );

      setSuggestionsError(
        error instanceof Error
          ? error.message
          : "Failed to load AI suggestions",
      );
    } finally {
      setSuggestionsLoading(false);
    }
  };

  // =========================
  // TASKS
  // =========================

  const activeTasks = tasks.filter(
    (task) => task.status !== "done",
  );

  // =========================
  // GREETING
  // =========================

  const firstName = userName.split(" ")[0];

  // =========================
  // RENDER
  // =========================

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset>
        <Header />

        <main className="flex-1 space-y-8 p-6 md:p-8">
          <div className="mx-auto max-w-7xl space-y-8">

            {/* =========================
                HEADER
            ========================= */}

            <section>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">
                    Good afternoon, {firstName} 👋
                  </h1>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Here&apos;s what needs your attention today.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleReviewSuggestions}
                    disabled={suggestionsLoading}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border bg-background px-4 text-sm font-medium shadow-sm transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {suggestionsLoading ? (
                      <Loader2
                        size={16}
                        className="animate-spin"
                      />
                    ) : (
                      <Sparkles size={16} />
                    )}

                    {suggestionsLoading
                      ? "Analyzing..."
                      : "Review suggestions"}
                  </button>

                  <button
                    onClick={() => router.push("/ai")}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border bg-background px-4 text-sm font-medium shadow-sm transition hover:bg-muted"
                  >
                    <Sparkles size={16} />
                    Chat AI
                  </button>
                </div>
              </div>
            </section>

            {/* =========================
                AI SUGGESTIONS
            ========================= */}

            {(suggestionsLoading ||
              suggestions ||
              suggestionsError) && (
              <section className="rounded-xl border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
                      <Sparkles size={18} />
                    </div>

                    <div>
                      <h2 className="font-semibold">
                        AI Suggestions
                      </h2>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Operator AI analysis
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  {suggestionsLoading && (
                    <div className="flex items-center gap-3 rounded-lg bg-muted p-4">
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                      <div>
                        <p className="text-sm font-medium">
                          Analyzing your workspace...
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          AI is checking your tasks, calendar,
                          emails and connected data.
                        </p>
                      </div>
                    </div>
                  )}

                  {suggestionsError && (
                    <div className="flex gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
                      <AlertCircle
                        size={18}
                        className="mt-0.5 shrink-0"
                      />

                      <div>
                        <p className="text-sm font-medium">
                          Could not generate suggestions
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          {suggestionsError}
                        </p>
                      </div>
                    </div>
                  )}

                  {suggestions && !suggestionsLoading && (
                    <div className="space-y-3">
                      {Array.isArray(
                        suggestions.suggestions,
                      ) &&
                      suggestions.suggestions.length > 0 ? (
                        suggestions.suggestions.map(
                          (suggestion, index) => (
                            <div
                              key={index}
                              className="flex gap-3 rounded-lg border p-4"
                            >
                              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                {index + 1}
                              </div>

                              <p className="text-sm">
                                {suggestion}
                              </p>
                            </div>
                          ),
                        )
                      ) : (
                        <pre className="overflow-x-auto whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm">
                          {JSON.stringify(
                            suggestions,
                            null,
                            2,
                          )}
                        </pre>
                      )}
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* =========================
                OVERVIEW
            ========================= */}

            <section>
              <div className="mb-4">
                <h2 className="text-lg font-semibold">
                  Overview
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

                {/* EMAILS */}

                <div className="rounded-xl border bg-card p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Mail size={19} />
                    </div>

                    <ArrowRight
                      size={16}
                      className="text-muted-foreground"
                    />
                  </div>

                  <p className="mt-4 text-sm text-muted-foreground">
                    Emails
                  </p>

                  <p className="mt-1 text-2xl font-semibold">
                    —
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    today
                  </p>
                </div>

                {/* CALENDAR */}

                <div className="rounded-xl border bg-card p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <CalendarDays size={19} />
                    </div>

                    <ArrowRight
                      size={16}
                      className="text-muted-foreground"
                    />
                  </div>

                  <p className="mt-4 text-sm text-muted-foreground">
                    Meetings
                  </p>

                  <p className="mt-1 text-2xl font-semibold">
                    —
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    today
                  </p>
                </div>

                {/* CONTACTS */}

                <div className="rounded-xl border bg-card p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <Users size={19} />
                    </div>

                    <ArrowRight
                      size={16}
                      className="text-muted-foreground"
                    />
                  </div>

                  <p className="mt-4 text-sm text-muted-foreground">
                    Contacts
                  </p>

                  <p className="mt-1 text-2xl font-semibold">
                    —
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    total
                  </p>
                </div>

                {/* TASKS */}

                <div className="rounded-xl border bg-card p-5 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <CheckSquare size={19} />
                    </div>

                    <ArrowRight
                      size={16}
                      className="text-muted-foreground"
                    />
                  </div>

                  <p className="mt-4 text-sm text-muted-foreground">
                    Tasks
                  </p>

                  <p className="mt-1 text-2xl font-semibold">
                    {loading
                      ? "..."
                      : activeTasks.length}
                  </p>

                  <p className="mt-1 text-xs text-muted-foreground">
                    active
                  </p>
                </div>
              </div>
            </section>

            {/* =========================
                SCHEDULE + TASKS
            ========================= */}

            <section className="grid gap-6 lg:grid-cols-2">

              {/* SCHEDULE */}

              <div className="rounded-xl border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b p-5">
                  <div>
                    <h2 className="font-semibold">
                      Today&apos;s schedule
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Your upcoming meetings
                    </p>
                  </div>

                  <CalendarDays
                    size={19}
                    className="text-muted-foreground"
                  />
                </div>

                <div className="p-5">
                  <div className="flex items-center gap-4 rounded-lg bg-muted p-4">
                    <Clock
                      size={18}
                      className="text-muted-foreground"
                    />

                    <div>
                      <p className="text-sm font-medium">
                        Calendar events
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Your events will appear here.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t p-4">
                  <button
                    onClick={() =>
                      router.push("/calendar")
                    }
                    className="flex w-full items-center justify-center gap-2 text-sm font-medium hover:underline"
                  >
                    Open Calendar

                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* TASKS */}

              <div className="rounded-xl border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b p-5">
                  <div>
                    <h2 className="font-semibold">
                      Tasks
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Things that need to be done
                    </p>
                  </div>

                  <CheckSquare
                    size={19}
                    className="text-muted-foreground"
                  />
                </div>

                <div className="p-5">
                  {activeTasks.length === 0 ? (
                    <div className="rounded-lg bg-muted p-4">
                      <p className="text-sm font-medium">
                        No active tasks
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        You&apos;re all caught up.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeTasks
                        .slice(0, 5)
                        .map((task) => (
                          <div
                            key={task.id}
                            className="flex items-center justify-between gap-4 rounded-lg border p-3"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="h-5 w-5 shrink-0 rounded-full border" />

                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                  {task.title}
                                </p>

                                <p className="mt-1 text-xs text-muted-foreground">
                                  {task.priority}
                                </p>
                              </div>
                            </div>

                            {task.due_date && (
                              <span className="shrink-0 text-xs text-muted-foreground">
                                {new Date(
                                  task.due_date,
                                ).toLocaleDateString(
                                  "en-US",
                                )}
                              </span>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                <div className="border-t p-4">
                  <button
                    onClick={() =>
                      router.push("/tasks")
                    }
                    className="flex w-full items-center justify-center gap-2 text-sm font-medium hover:underline"
                  >
                    Open Tasks

                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </section>

            {/* =========================
                GMAIL + DRIVE
            ========================= */}

            <section className="grid gap-6 lg:grid-cols-2">

              {/* GMAIL */}

              <div className="rounded-xl border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b p-5">
                  <div>
                    <h2 className="font-semibold">
                      Important emails
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Recent messages from Gmail
                    </p>
                  </div>

                  <Mail
                    size={19}
                    className="text-muted-foreground"
                  />
                </div>

                <div className="p-5">
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm font-medium">
                      Gmail
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Your important emails will appear
                      here.
                    </p>
                  </div>
                </div>

                <div className="border-t p-4">
                  <button
                    onClick={() =>
                      router.push("/gmail")
                    }
                    className="flex w-full items-center justify-center gap-2 text-sm font-medium hover:underline"
                  >
                    Open Gmail

                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>

              {/* DRIVE */}

              <div className="rounded-xl border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b p-5">
                  <div>
                    <h2 className="font-semibold">
                      Recent files
                    </h2>

                    <p className="mt-1 text-sm text-muted-foreground">
                      Recently modified
                    </p>
                  </div>

                  <HardDrive
                    size={19}
                    className="text-muted-foreground"
                  />
                </div>

                <div className="p-5">
                  <div className="rounded-lg bg-muted p-4">
                    <p className="text-sm font-medium">
                      Google Drive
                    </p>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Your recent files will appear
                      here.
                    </p>
                  </div>
                </div>

                <div className="border-t p-4">
                  <button
                    onClick={() =>
                      router.push("/drive")
                    }
                    className="flex w-full items-center justify-center gap-2 text-sm font-medium hover:underline"
                  >
                    Open Drive

                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </section>

            {/* =========================
                FOOTER
            ========================= */}

            <div className="flex items-center justify-center pb-4 text-xs text-muted-foreground">
              Operator AI will analyze your connected
              business data.
            </div>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}