import { supabaseAdmin } from "../config/supabase";

export type ContactInput = {
  first_name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  status?: string;
  notes?: string;
};

export type ContactUpdate = {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  company?: string;
  position?: string;
  status?: string;
  notes?: string;
};

// GET CONTACTS
export async function getContacts(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("contacts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getContacts error:", error);
    throw error;
  }

  return data ?? [];
}

// GET CONTACT BY ID
export async function getContactById(
  userId: string,
  contactId: string,
) {
  const { data, error } = await supabaseAdmin
    .from("contacts")
    .select("*")
    .eq("id", contactId)
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("getContactById error:", error);
    throw error;
  }

  return data;
}

// CREATE CONTACT
export async function createContact(
  userId: string,
  contact: ContactInput,
) {
  const { data, error } = await supabaseAdmin
    .from("contacts")
    .insert({
      user_id: userId,
      first_name: contact.first_name,
      last_name: contact.last_name ?? null,
      email: contact.email ?? null,
      phone: contact.phone ?? null,
      company: contact.company ?? null,
      position: contact.position ?? null,
      status: contact.status ?? "active",
      notes: contact.notes ?? null,
    })
    .select()
    .single();

  if (error) {
    console.error("createContact error:", error);
    throw error;
  }

  return data;
}

// UPDATE CONTACT
export async function updateContact(
  userId: string,
  contactId: string,
  contact: ContactUpdate,
) {
  const updateData: Record<string, unknown> = {};

  if (contact.first_name !== undefined) {
    updateData.first_name = contact.first_name;
  }

  if (contact.last_name !== undefined) {
    updateData.last_name = contact.last_name;
  }

  if (contact.email !== undefined) {
    updateData.email = contact.email;
  }

  if (contact.phone !== undefined) {
    updateData.phone = contact.phone;
  }

  if (contact.company !== undefined) {
    updateData.company = contact.company;
  }

  if (contact.position !== undefined) {
    updateData.position = contact.position;
  }

  if (contact.status !== undefined) {
    updateData.status = contact.status;
  }

  if (contact.notes !== undefined) {
    updateData.notes = contact.notes;
  }

  const { data, error } = await supabaseAdmin
    .from("contacts")
    .update(updateData)
    .eq("id", contactId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("updateContact error:", error);
    throw error;
  }

  return data;
}

// DELETE CONTACT
export async function deleteContact(
  userId: string,
  contactId: string,
) {
  const { data, error } = await supabaseAdmin
    .from("contacts")
    .delete()
    .eq("id", contactId)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) {
    console.error("deleteContact error:", error);
    throw error;
  }

  return data;
}