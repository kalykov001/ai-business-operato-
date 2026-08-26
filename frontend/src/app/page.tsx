"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  Bot,
  CalendarDays,
  CheckCircle2,
  CheckSquare,
  Clock3,
  FolderOpen,
  HardDrive,
  Mail,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";

import Header from "@/components/dashboard/Header";
import AppSidebar from "@/components/dashboard/AppSidebar";
import { supabase } from "@/lib/supabase";

import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

type Task = {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
};

function getPriorityClass(priority: string) {
  const value = priority.toLowerCase();

  if (value === "high" || value === "urgent") {
    return "border-red-400/20 bg-red-500/10 text-red-600 dark:text-red-300";
  }

  if (value === "medium") {
    return "border-amber-400/20 bg-amber-500/10 text-amber-600 dark:text-amber-300";
  }

  return "border-blue-400/20 bg-blue-500/10 text-blue-600 dark:text-blue-300";
}

function formatDueDate(date: string | null) {
  if (!date) return "No due date";

  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function Home() {
  const router = useRouter();

  const [userName, setUserName] = useState("User");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

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

  const activeTasks = tasks.filter(
    (task) => task.status !== "done",
  );

  const firstName = userName.split(" ")[0];

  return (
    <SidebarProvider>
      <AppSidebar />

      <SidebarInset className="bg-background">
        <Header />

        <main className="min-h-[calc(100vh-4rem)] bg-background px-4 py-6 text-foreground transition-colors sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl space-y-7">

            {/* HERO */}
            <section
              className="
                relative overflow-hidden rounded-3xl
                border border-blue-200/70
                bg-gradient-to-br from-white via-blue-50/70 to-indigo-50
                p-6
                shadow-[0_20px_70px_rgba(37,99,235,0.08)]
                transition-colors
                dark:border-blue-400/10
                dark:from-[#0b1e40]
                dark:via-[#081832]
                dark:to-[#061229]
                dark:shadow-[0_20px_70px_rgba(0,0,0,0.25)]
                sm:p-8
              "
            >
              <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />

              <div className="pointer-events-none absolute -bottom-28 left-1/3 h-56 w-56 rounded-full bg-indigo-500/10 blur-3xl" />

              <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <div
                    className="
                      mb-3 inline-flex items-center gap-2 rounded-full
                      border border-blue-200
                      bg-blue-50
                      px-3 py-1.5
                      text-[11px] font-medium text-blue-600
                      dark:border-blue-400/15
                      dark:bg-blue-500/10
                      dark:text-blue-300
                    "
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />

                    Workspace is active
                  </div>

                  <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    Good afternoon, {firstName} 👋
                  </h1>

                  <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                    Here&apos;s what needs your attention today.
                  </p>
                </div>

                <button
                  onClick={() => router.push("/ai")}
                  className="
                    group inline-flex h-11 items-center justify-center
                    gap-2 rounded-xl
                    border border-blue-200
                    bg-blue-50
                    px-5 text-sm font-semibold text-blue-600
                    shadow-[0_0_30px_rgba(37,99,235,0.08)]
                    transition
                    hover:border-blue-300
                    hover:bg-blue-100
                    dark:border-blue-400/25
                    dark:bg-blue-500/15
                    dark:text-blue-200
                    dark:hover:border-blue-400/40
                    dark:hover:bg-blue-500/25
                  "
                >
                  <Sparkles className="h-4 w-4 text-blue-500 dark:text-blue-400" />

                  Ask AI Assistant

                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                </button>
              </div>
            </section>

            {/* OVERVIEW */}
            <section>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Overview
                  </h2>

                  <p className="mt-1 text-xs text-muted-foreground">
                    Your workspace at a glance
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    label: "Emails",
                    value: "—",
                    hint: "today",
                    icon: Mail,
                    path: "/gmail",
                  },
                  {
                    label: "Meetings",
                    value: "—",
                    hint: "today",
                    icon: CalendarDays,
                    path: "/calendar",
                  },
                  {
                    label: "Contacts",
                    value: "—",
                    hint: "total",
                    icon: Users,
                    path: "/crm",
                  },
                  {
                    label: "Active tasks",
                    value: loading ? "..." : activeTasks.length,
                    hint: "to complete",
                    icon: CheckSquare,
                    path: "/tasks",
                  },
                ].map((item) => {
                  const Icon = item.icon;

                  return (
                    <button
                      key={item.label}
                      onClick={() => router.push(item.path)}
                      className="
                        group rounded-2xl
                        border border-border
                        bg-card
                        p-5 text-left
                        shadow-[0_12px_40px_rgba(15,23,42,0.05)]
                        transition
                        hover:-translate-y-0.5
                        hover:border-blue-300
                        hover:shadow-[0_16px_45px_rgba(37,99,235,0.10)]
                      "
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className="
                            flex h-10 w-10 items-center justify-center
                            rounded-xl
                            border border-blue-200
                            bg-blue-50
                            text-blue-600
                            dark:border-blue-400/15
                            dark:bg-blue-500/10
                            dark:text-blue-400
                          "
                        >
                          <Icon className="h-[18px] w-[18px]" />
                        </div>

                        <ArrowRight className="h-4 w-4 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-blue-500" />
                      </div>

                      <p className="mt-5 text-sm text-muted-foreground">
                        {item.label}
                      </p>

                      <p className="mt-1 text-2xl font-semibold text-foreground">
                        {item.value}
                      </p>

                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {item.hint}
                      </p>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* SCHEDULE + TASKS */}
            <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">

              {/* SCHEDULE */}
              <div
                className="
                  overflow-hidden rounded-2xl
                  border border-border
                  bg-card
                  shadow-[0_12px_40px_rgba(15,23,42,0.05)]
                  dark:shadow-[0_12px_40px_rgba(0,0,0,0.2)]
                "
              >
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <div>
                    <h2 className="font-semibold text-foreground">
                      Today&apos;s schedule
                    </h2>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Your upcoming meetings
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                    <CalendarDays className="h-[18px] w-[18px]" />
                  </div>
                </div>

                <div className="space-y-3 p-5">
                  <div className="flex items-center gap-4 rounded-xl border border-border bg-muted p-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                      <Clock3 className="h-[18px] w-[18px]" />
                    </div>

                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        Calendar events
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Your upcoming events will appear here.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 rounded-xl border border-border bg-muted p-4 opacity-70">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                      <Sparkles className="h-[18px] w-[18px]" />
                    </div>

                    <div>
                      <p className="text-sm font-medium text-foreground">
                        AI briefing
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        Connect your calendar to see your schedule.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border p-4">
                  <button
                    onClick={() => router.push("/calendar")}
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                  >
                    Open Calendar

                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* TASKS */}
              <div
                className="
                  overflow-hidden rounded-2xl
                  border border-border
                  bg-card
                  shadow-[0_12px_40px_rgba(15,23,42,0.05)]
                  dark:shadow-[0_12px_40px_rgba(0,0,0,0.2)]
                "
              >
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <div>
                    <h2 className="font-semibold text-foreground">
                      Tasks
                    </h2>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Things that need to be done
                    </p>
                  </div>

                  <button
                    onClick={() => router.push("/tasks")}
                    className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20"
                    aria-label="Open tasks"
                  >
                    <Plus className="h-[18px] w-[18px]" />
                  </button>
                </div>

                <div className="p-5">
                  {activeTasks.length === 0 ? (
                    <div className="flex min-h-[190px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted px-5 text-center">
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>

                      <p className="mt-3 text-sm font-medium text-foreground">
                        No active tasks
                      </p>

                      <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                        You&apos;re all caught up. New tasks will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {activeTasks.slice(0, 5).map((task) => (
                        <div
                          key={task.id}
                          className="
                            group flex items-center justify-between gap-3
                            rounded-xl border border-border
                            bg-muted p-3
                            transition
                            hover:border-blue-300
                            hover:bg-accent
                            dark:hover:bg-[#0a1b39]
                          "
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
                              <CheckSquare className="h-4 w-4 text-muted-foreground group-hover:text-blue-500" />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-foreground">
                                {task.title}
                              </p>

                              <div className="mt-1.5 flex items-center gap-2">
                                <span
                                  className={`rounded-md border px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide ${getPriorityClass(
                                    task.priority,
                                  )}`}
                                >
                                  {task.priority}
                                </span>

                                <span className="text-[10px] text-muted-foreground">
                                  {formatDueDate(task.due_date)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-border p-4">
                  <button
                    onClick={() => router.push("/tasks")}
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50 hover:text-blue-700 dark:text-blue-400 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
                  >
                    Open Tasks

                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </section>

            {/* AI ASSISTANT */}
            <section
              className="
                relative overflow-hidden rounded-2xl
                border border-blue-200
                bg-gradient-to-r from-blue-50 via-white to-indigo-50
                p-6
                shadow-[0_15px_55px_rgba(37,99,235,0.08)]
                dark:border-blue-400/15
                dark:from-[#0b2045]
                dark:via-[#0a1936]
                dark:to-[#0b1530]
              "
            >
              <div className="pointer-events-none absolute -right-20 -top-24 h-60 w-60 rounded-full bg-blue-500/10 blur-3xl" />

              <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 text-blue-600 shadow-[0_0_25px_rgba(37,99,235,0.08)] dark:border-blue-400/20 dark:bg-blue-500/10 dark:text-blue-400 dark:shadow-[0_0_25px_rgba(37,99,235,0.12)]">
                    <Bot className="h-6 w-6" />
                  </div>

                  <div>
                    <h2 className="font-semibold text-foreground">
                      Ask AI Assistant
                    </h2>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Create tasks, manage your workspace and get things done.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => router.push("/ai")}
                  className="
                    inline-flex h-10 items-center justify-center
                    gap-2 rounded-xl
                    bg-blue-600 px-5
                    text-sm font-semibold text-white
                    shadow-[0_8px_25px_rgba(37,99,235,0.25)]
                    transition hover:bg-blue-500
                  "
                >
                  <Sparkles className="h-4 w-4" />

                  Ask anything
                </button>
              </div>
            </section>

            {/* GMAIL + DRIVE */}
            <section className="grid gap-5 lg:grid-cols-2">

              {/* GMAIL */}
              <div
                className="
                  overflow-hidden rounded-2xl
                  border border-border
                  bg-card
                  shadow-[0_12px_40px_rgba(15,23,42,0.05)]
                  dark:shadow-[0_12px_40px_rgba(0,0,0,0.2)]
                "
              >
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <div>
                    <h2 className="font-semibold text-foreground">
                      Important emails
                    </h2>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Recent messages from Gmail
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-500 dark:bg-red-500/10 dark:text-red-300">
                    <Mail className="h-[18px] w-[18px]" />
                  </div>
                </div>

                <div className="p-5">
                  <div className="rounded-xl border border-border bg-muted p-4">
                    <p className="text-sm font-medium text-foreground">
                      Gmail
                    </p>

                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      Your important emails will appear here.
                    </p>
                  </div>
                </div>

                <div className="border-t border-border p-4">
                  <button
                    onClick={() => router.push("/gmail")}
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                  >
                    Open Gmail

                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* DRIVE */}
              <div
                className="
                  overflow-hidden rounded-2xl
                  border border-border
                  bg-card
                  shadow-[0_12px_40px_rgba(15,23,42,0.05)]
                  dark:shadow-[0_12px_40px_rgba(0,0,0,0.2)]
                "
              >
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <div>
                    <h2 className="font-semibold text-foreground">
                      Recent files
                    </h2>

                    <p className="mt-1 text-xs text-muted-foreground">
                      Recently modified
                    </p>
                  </div>

                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                    <HardDrive className="h-[18px] w-[18px]" />
                  </div>
                </div>

                <div className="p-5">
                  <div className="rounded-xl border border-border bg-muted p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                        <FolderOpen className="h-4 w-4" />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-foreground">
                          Google Drive
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          Your recent files will appear here.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-border p-4">
                  <button
                    onClick={() => router.push("/drive")}
                    className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-500/10"
                  >
                    Open Drive

                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </section>

            {/* FOOTER */}
            <footer className="flex items-center justify-center pb-5 pt-1 text-[11px] text-muted-foreground">
              OperatorAI will analyze your connected business data.
            </footer>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}