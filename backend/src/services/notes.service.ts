import { supabaseAdmin } from "../config/supabase";

export type CreateNoteData = {
  userId: string;
  title: string;
  content: string;
};

// =====================================
// GET NOTES
// =====================================

export const getNotes = async (userId: string) => {
  const { data, error } = await supabaseAdmin
    .from("notes")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", {
      ascending: false,
    });

  if (error) {
    console.error("SUPABASE GET NOTES ERROR:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw error;
  }

  return data ?? [];
};

// =====================================
// GET NOTE BY ID
// =====================================

export const getNoteById = async (
  userId: string,
  noteId: string,
) => {
  const { data, error } = await supabaseAdmin
    .from("notes")
    .select("*")
    .eq("id", noteId)
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("SUPABASE GET NOTE ERROR:", error);
    throw error;
  }

  return data;
};

// =====================================
// CREATE NOTE
// =====================================

export const createNote = async ({
  userId,
  title,
  content,
}: CreateNoteData) => {
  console.log("CREATING NOTE:", {
    userId,
    title,
    content,
  });

  const { data, error } = await supabaseAdmin
    .from("notes")
    .insert({
      user_id: userId,
      title,
      content,
    })
    .select()
    .single();

  if (error) {
    console.error("SUPABASE CREATE NOTE ERROR:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw error;
  }

  console.log("NOTE CREATED:", data);

  return data;
};

// =====================================
// UPDATE NOTE
// =====================================

export const updateNote = async (
  userId: string,
  noteId: string,
  updates: {
    title?: string;
    content?: string;
  },
) => {
  const { data, error } = await supabaseAdmin
    .from("notes")
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq("id", noteId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("SUPABASE UPDATE NOTE ERROR:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw error;
  }

  return data;
};

// =====================================
// DELETE NOTE
// =====================================

export const deleteNote = async (
  userId: string,
  noteId: string,
) => {
  const { data, error } = await supabaseAdmin
    .from("notes")
    .delete()
    .eq("id", noteId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("SUPABASE DELETE NOTE ERROR:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });

    throw error;
  }

  return data;
};