"use client";

import { useEffect, useMemo, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  CheckCircle2,
  Circle,
  Clock3,
  ListFilter,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Task = {
  id: string;
  created_at: string;
  user_id: string;
  title: string;
  description: string | null;
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  due_date: string | null;
  updated_at: string;
};

type Filter = "all" | "todo" | "in_progress";

const formatStatus = (status: Task["status"]) => {
  switch (status) {
    case "todo":
      return "Todo";
    case "in_progress":
      return "In progress";
    case "done":
      return "Done";
    default:
      return status;
  }
};

const formatPriority = (priority: Task["priority"]) => {
  switch (priority) {
    case "high":
      return "High";
    case "medium":
      return "Medium";
    case "low":
      return "Low";
    default:
      return priority;
  }
};

const formatDate = (date: string | null) => {
  if (!date) return "No date";

  const taskDate = new Date(date);

  const today = new Date();
  const tomorrow = new Date();

  tomorrow.setDate(today.getDate() + 1);

  const isToday =
    taskDate.getDate() === today.getDate() &&
    taskDate.getMonth() === today.getMonth() &&
    taskDate.getFullYear() === today.getFullYear();

  const isTomorrow =
    taskDate.getDate() === tomorrow.getDate() &&
    taskDate.getMonth() === tomorrow.getMonth() &&
    taskDate.getFullYear() === tomorrow.getFullYear();

  if (isToday) return "Today";
  if (isTomorrow) return "Tomorrow";

  return taskDate.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

const isToday = (date: string | null) => {
  if (!date) return false;

  const taskDate = new Date(date);
  const today = new Date();

  return (
    taskDate.getDate() === today.getDate() &&
    taskDate.getMonth() === today.getMonth() &&
    taskDate.getFullYear() === today.getFullYear()
  );
};
const TaskSkeleton = () => {
  return (
    <div className="flex items-center gap-4 px-5 py-4">
      {/* Checkbox */}
      <Skeleton className="h-[21px] w-[21px] shrink-0 rounded-full" />

      {/* Task info */}
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-3 w-3/4" />
      </div>

      {/* Status */}
      <Skeleton className="hidden h-6 w-20 rounded-full sm:block" />

      {/* Delete */}
      <Skeleton className="h-8 w-8 rounded-md" />

      {/* Priority */}
      <Skeleton className="hidden h-4 w-14 sm:block" />

      {/* Date */}
      <Skeleton className="hidden h-4 w-20 md:block" />
    </div>
  );
};

const TasksSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Today */}
      <div className="rounded-xl border bg-card">
        <div className="border-b px-5 py-4">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="mt-2 h-3 w-20" />
        </div>

        <div className="divide-y">
          {Array.from({ length: 4 }).map((_, index) => (
            <TaskSkeleton key={index} />
          ))}
        </div>
      </div>

      {/* Upcoming */}
      <div className="rounded-xl border bg-card">
        <div className="border-b px-5 py-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="mt-2 h-3 w-36" />
        </div>

        <div className="divide-y">
          {Array.from({ length: 4 }).map((_, index) => (
            <TaskSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
  );
};
const TasksPage = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const [openModal, setOpenModal] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Task["priority"]>("medium");
  const [dueDate, setDueDate] = useState("");

  const [creating, setCreating] = useState(false);

  // -----------------------------
  // Load tasks
  // -----------------------------

  const loadTasks = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.error("User error:", userError);
        return;
      }

      if (!user) {
        console.log("User is not authenticated");
        return;
      }

      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Tasks error:", error);
        return;
      }

      setTasks(data || []);
    } catch (error) {
      console.error("Load tasks error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // -----------------------------
  // Create task
  // -----------------------------

  const createTask = async () => {
    if (!title.trim()) return;

    try {
      setCreating(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("User not authenticated");
        return;
      }

      const { error } = await supabase.from("tasks").insert({
        user_id: user.id,
        title: title.trim(),
        description: description.trim() || null,
        status: "todo",
        priority,
        due_date: dueDate
          ? new Date(`${dueDate}T23:59:59`).toISOString()
          : null,
      });

      if (error) {
        console.error("Create task error:", error);
        return;
      }

      setTitle("");
      setDescription("");
      setPriority("medium");
      setDueDate("");
      setOpenModal(false);

      await loadTasks();
    } catch (error) {
      console.error("Create task error:", error);
    } finally {
      setCreating(false);
    }
  };

  // -----------------------------
  // Toggle task status
  // -----------------------------

const toggleTask = async (task: Task) => {
  const newStatus = task.status === "done" ? "todo" : "done";
  const updatedAt = new Date().toISOString();

  // Сразу меняем UI
  setTasks((currentTasks) =>
    currentTasks.map((item) =>
      item.id === task.id
        ? {
            ...item,
            status: newStatus,
            updated_at: updatedAt,
          }
        : item,
    ),
  );

  // Затем сохраняем в Supabase
  const { error } = await supabase
    .from("tasks")
    .update({
      status: newStatus,
      updated_at: updatedAt,
    })
    .eq("id", task.id);

  // Если произошла ошибка — возвращаем старое состояние
  if (error) {
    console.error("Update task error:", error);

    setTasks((currentTasks) =>
      currentTasks.map((item) =>
        item.id === task.id
          ? {
              ...item,
              status: task.status,
              updated_at: task.updated_at,
            }
          : item,
      ),
    );
  }
};

  // -------------------
  // DELETE 
const deleteTask = async (taskId: string) => {
  const previousTasks = tasks;

  // Сразу удаляем из интерфейса
  setTasks((currentTasks) =>
    currentTasks.filter((task) => task.id !== taskId),
  );

  // Удаляем из Supabase
  const { error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId);

  // Если ошибка — возвращаем задачу
  if (error) {
    console.error("Delete task error:", error);
    setTasks(previousTasks);
  }
};
  // -------------------


  
  // -----------------------------
  // Filter + Search
  // -----------------------------

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        (task.description || "").toLowerCase().includes(search.toLowerCase());

      const matchesFilter = filter === "all" || task.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [tasks, search, filter]);

  const todayTasks = filteredTasks.filter((task) => isToday(task.due_date));

  const upcomingTasks = filteredTasks.filter((task) => !isToday(task.due_date));

  // -----------------------------
  // UI
  // -----------------------------

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}

      <div className="border-b px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>

            <p className="mt-1 text-sm text-muted-foreground">
              Manage your work and stay organized
            </p>
          </div>

          <button
            onClick={() => setOpenModal(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            <Plus size={18} />
            New task
          </button>
        </div>
      </div>

      {/* Content */}

     <main className="flex-1 p-6">
  {/* Search / filters */}
  <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
    <div className="flex w-full max-w-md items-center gap-2 rounded-lg border bg-background px-3 py-2">
      <Search size={18} className="text-muted-foreground" />

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search tasks..."
        className="w-full bg-transparent text-sm outline-none"
      />
    </div>

    <div className="flex items-center gap-2 overflow-x-auto">
      <button
        onClick={() => setFilter("all")}
        className={`rounded-lg border px-3 py-2 text-sm ${
          filter === "all"
            ? "bg-muted font-medium"
            : "hover:bg-muted"
        }`}
      >
        All
      </button>

      <button
        onClick={() => setFilter("todo")}
        className={`rounded-lg border px-3 py-2 text-sm ${
          filter === "todo"
            ? "bg-muted font-medium"
            : "hover:bg-muted"
        }`}
      >
        Todo
      </button>

      <button
        onClick={() => setFilter("in_progress")}
        className={`rounded-lg border px-3 py-2 text-sm ${
          filter === "in_progress"
            ? "bg-muted font-medium"
            : "hover:bg-muted"
        }`}
      >
        In progress
      </button>

      <button className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted">
        <ListFilter size={16} />
        Filter
      </button>
    </div>
  </div>

  {/* Loading */}
  {loading ? (
    <div className="space-y-6">
      {/* Today Skeleton */}
      <div className="rounded-xl border bg-card">
        <div className="border-b px-5 py-4">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="mt-2 h-3 w-20" />
        </div>

        <div className="divide-y">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 px-5 py-4"
            >
              {/* Checkbox */}
              <Skeleton className="h-[21px] w-[21px] shrink-0 rounded-full" />

              {/* Task info */}
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
              </div>

              {/* Status */}
              <Skeleton className="hidden h-6 w-20 rounded-full sm:block" />

              {/* Delete */}
              <Skeleton className="h-8 w-8 rounded-md" />

              {/* Priority */}
              <Skeleton className="hidden h-4 w-14 sm:block" />

              {/* Date */}
              <Skeleton className="hidden h-4 w-20 md:block" />
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Skeleton */}
      <div className="rounded-xl border bg-card">
        <div className="border-b px-5 py-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="mt-2 h-3 w-36" />
        </div>

        <div className="divide-y">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="flex items-center gap-4 px-5 py-4"
            >
              {/* Checkbox */}
              <Skeleton className="h-[21px] w-[21px] shrink-0 rounded-full" />

              {/* Task info */}
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-3 w-3/4" />
              </div>

              {/* Status */}
              <Skeleton className="hidden h-6 w-20 rounded-full sm:block" />

              {/* Delete */}
              <Skeleton className="h-8 w-8 rounded-md" />

              {/* Priority */}
              <Skeleton className="hidden h-4 w-14 sm:block" />

              {/* Date */}
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  ) : (
    <>
      {/* Today */}
      <div className="rounded-xl border bg-card">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">Today</h2>

          <p className="mt-1 text-xs text-muted-foreground">
            {todayTasks.length}{" "}
            {todayTasks.length === 1 ? "task" : "tasks"}
          </p>
        </div>

        <div className="divide-y">
          {todayTasks.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              No tasks for today
            </div>
          ) : (
            todayTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-4 px-5 py-4 transition hover:bg-muted/40"
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleTask(task)}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                  {task.status === "done" ? (
                    <CheckCircle2 size={21} />
                  ) : (
                    <Circle size={21} />
                  )}
                </button>

                {/* Task info */}
                <div className="min-w-0 flex-1">
                  <h3
                    className={`truncate text-sm font-medium ${
                      task.status === "done"
                        ? "text-muted-foreground line-through"
                        : ""
                    }`}
                  >
                    {task.title}
                  </h3>

                  {task.description && (
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Status */}
                <span className="hidden rounded-full bg-muted px-3 py-1 text-xs sm:block">
                  {formatStatus(task.status)}
                </span>

                {/* Delete */}
                <button
                  onClick={() => deleteTask(task.id)}
                  className="rounded-md p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                  title="Delete task"
                >
                  <Trash2 size={16} />
                </button>

                {/* Priority */}
                <span
                  className={`hidden text-xs font-medium sm:block ${
                    task.priority === "high"
                      ? "text-destructive"
                      : task.priority === "medium"
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-muted-foreground"
                  }`}
                >
                  {formatPriority(task.priority)}
                </span>

                {/* Date */}
                <div className="hidden items-center gap-1 text-xs text-muted-foreground md:flex">
                  <Clock3 size={14} />
                  {formatDate(task.due_date)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Upcoming */}
      <div className="mt-6 rounded-xl border bg-card">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">Upcoming</h2>

          <p className="mt-1 text-xs text-muted-foreground">
            Tasks scheduled for later
          </p>
        </div>

        <div className="divide-y">
          {upcomingTasks.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted-foreground">
              No upcoming tasks
            </div>
          ) : (
            upcomingTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-center gap-4 px-5 py-4 transition hover:bg-muted/40"
              >
                {/* Checkbox */}
                <button
                  onClick={() => toggleTask(task)}
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                  {task.status === "done" ? (
                    <CheckCircle2 size={21} />
                  ) : (
                    <Circle size={21} />
                  )}
                </button>

                {/* Task info */}
                <div className="min-w-0 flex-1">
                  <p
                    className={`truncate text-sm font-medium ${
                      task.status === "done"
                        ? "text-muted-foreground line-through"
                        : ""
                    }`}
                  >
                    {task.title}
                  </p>

                  {task.description && (
                    <p className="mt-1 truncate text-xs text-muted-foreground">
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Status */}
                <span className="hidden rounded-full bg-muted px-3 py-1 text-xs sm:block">
                  {formatStatus(task.status)}
                </span>

                {/* Delete */}
                <button
                  onClick={() => deleteTask(task.id)}
                  className="rounded-md p-2 text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                  title="Delete task"
                >
                  <Trash2 size={16} />
                </button>

                {/* Priority */}
                <span
                  className={`hidden text-xs font-medium sm:block ${
                    task.priority === "high"
                      ? "text-destructive"
                      : task.priority === "medium"
                        ? "text-yellow-600 dark:text-yellow-400"
                        : "text-muted-foreground"
                  }`}
                >
                  {formatPriority(task.priority)}
                </span>

                {/* Date */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock3 size={14} />
                  {formatDate(task.due_date)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  )}
</main>

      {/* Create Task Modal */}

      {openModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-xl border bg-background shadow-xl">
            {/* Modal Header */}

            <div className="flex items-center justify-between border-b px-5 py-4">
              <div>
                <h2 className="font-semibold">Create new task</h2>

                <p className="mt-1 text-xs text-muted-foreground">
                  Add a task to your workspace
                </p>
              </div>

              <button
                onClick={() => setOpenModal(false)}
                className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}

            <div className="space-y-4 p-5">
              {/* Title */}

              <div>
                <label className="mb-2 block text-sm font-medium">Title</label>

                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Connect Google Calendar"
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Description */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>

                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the task..."
                  rows={3}
                  className="w-full resize-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Priority */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Priority
                </label>

                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as Task["priority"])
                  }
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              {/* Due date */}

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Due date
                </label>

                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none"
                />
              </div>
            </div>

            {/* Modal Footer */}

            <div className="flex justify-end gap-2 border-t px-5 py-4">
              <button
                onClick={() => setOpenModal(false)}
                className="rounded-lg border px-4 py-2 text-sm hover:bg-muted"
              >
                Cancel
              </button>

              <button
                onClick={createTask}
                disabled={creating || !title.trim()}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {creating ? "Creating..." : "Create task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TasksPage;
