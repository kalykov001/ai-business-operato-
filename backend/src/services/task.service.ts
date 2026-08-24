import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("SUPABASE_URL is not defined");
}

if (!supabaseServiceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined");
}

const supabase = createClient(
  supabaseUrl,
  supabaseServiceRoleKey
);

type TaskStatus = "todo" | "in_progress" | "done";
type TaskPriority = "low" | "medium" | "high";

type CreateTaskData = {
  userId: string;
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
};

// =====================================
// CREATE TASK
// =====================================

export async function createTask(data: CreateTaskData) {
  const { data: task, error } = await supabase
    .from("tasks")
    .insert({
      user_id: data.userId,
      title: data.title,
      description: data.description ?? null,
      status: data.status ?? "todo",
      priority: data.priority ?? "medium",
      due_date: data.dueDate ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("Create task error:", error);
    throw error;
  }

  return task;
}

// =====================================
// GET TASKS
// =====================================

export async function getTasks(
  userId: string,
  status?: TaskStatus
) {
  let query = supabase
    .from("tasks")
    .select(
      "id, title, description, status, priority, due_date, created_at"
    )
    .eq("user_id", userId)
    .order("created_at", {
      ascending: false,
    });

  if (status) {
    query = query.eq("status", status);
  }

  const { data: tasks, error } = await query;

  if (error) {
    console.error("Get tasks error:", error);
    throw error;
  }

  return tasks ?? [];
}

// =====================================
// UPDATE TASK
// =====================================

export async function updateTask(
  userId: string,
  taskId: string,
  data: {
    title?: string;
    description?: string | null;
    status?: TaskStatus;
    priority?: TaskPriority;
    dueDate?: string | null;
  }
) {
  const updateData: Record<string, any> = {};

  if (data.title !== undefined) {
    updateData.title = data.title;
  }

  if (data.description !== undefined) {
    updateData.description = data.description;
  }

  if (data.status !== undefined) {
    updateData.status = data.status;
  }

  if (data.priority !== undefined) {
    updateData.priority = data.priority;
  }

  if (data.dueDate !== undefined) {
    updateData.due_date = data.dueDate;
  }

  const { data: task, error } = await supabase
    .from("tasks")
    .update(updateData)
    .eq("id", taskId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Update task error:", error);
    throw error;
  }

  return task;
}

// =====================================
// DELETE TASK
// =====================================

export async function deleteTask(
  userId: string,
  taskId: string
) {
  const { data: task, error } = await supabase
    .from("tasks")
    .delete()
    .eq("id", taskId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("Delete task error:", error);
    throw error;
  }

  return task;
}