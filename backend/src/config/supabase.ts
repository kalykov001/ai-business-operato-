import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("SUPABASE_URL is not defined");
}

if (!supabaseAnonKey) {
  throw new Error("SUPABASE_ANON_KEY is not defined");
}

if (!supabaseServiceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is not defined");
}

// Используется для проверки JWT пользователя
export const supabaseAuth = createClient(
  supabaseUrl,
  supabaseAnonKey,
);

// Используется backend-сервисами для работы с БД
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey,
);