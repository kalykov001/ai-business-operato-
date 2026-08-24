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

type CreateNoteData = {
  userId: string;
  title: string;
  content: string;
};

export const createNote = async ({
  userId,
  title,
  content,
}: {
  userId: string;
  title: string;
  content: string;
}) => {
  const { data, error } = await supabase
    .from("notes")
    .insert({
      user_id: userId,
      title,
      content,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};