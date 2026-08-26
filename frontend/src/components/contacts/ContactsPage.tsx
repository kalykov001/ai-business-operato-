"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Skeleton } from "@/components/ui/skeleton";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";

import {
  Search,
  Plus,
  Pencil,
  Trash2,
  X,
  User,
  Mail,
  Building2,
  BriefcaseBusiness,
  StickyNote,
} from "lucide-react";

type Contact = {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  position: string | null;
  status: string | null;
  notes: string | null;
};

type ContactForm = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  status: string;
  notes: string;
};

const initialForm: ContactForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  company: "",
  position: "",
  status: "active",
  notes: "",
};

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<ContactForm>(initialForm);

  // null = создание
  // Contact = редактирование
  const [editingContact, setEditingContact] =
    useState<Contact | null>(null);

  const [search, setSearch] = useState("");

  // =========================
  // LOAD CONTACTS
  // =========================

  const loadContacts = async () => {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        console.error("User is not authenticated");
        setContacts([]);
        return;
      }

      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (error) {
        console.error("Ошибка загрузки контактов:", error);
        return;
      }

      setContacts(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContacts();
  }, []);

  // =========================
  // FORM CHANGE
  // =========================

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================
  // OPEN CREATE
  // =========================

  const openCreateModal = () => {
    setEditingContact(null);
    setForm(initialForm);
    setOpenModal(true);
  };

  // =========================
  // OPEN EDIT
  // =========================

  const openEditModal = (contact: Contact) => {
    setEditingContact(contact);

    setForm({
      first_name: contact.first_name || "",
      last_name: contact.last_name || "",
      email: contact.email || "",
      phone: contact.phone || "",
      company: contact.company || "",
      position: contact.position || "",
      status: contact.status || "active",
      notes: contact.notes || "",
    });

    setOpenModal(true);
  };

  // =========================
  // CLOSE MODAL
  // =========================

  const closeModal = () => {
    if (saving) return;

    setOpenModal(false);
    setEditingContact(null);
    setForm(initialForm);
  };

  // =========================
  // CREATE / UPDATE
  // =========================

  const saveContact = async (
    e: React.FormEvent,
  ) => {
    e.preventDefault();

    if (!form.first_name.trim()) {
      alert("Введите имя");
      return;
    }

    setSaving(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Пользователь не авторизован");
        return;
      }

      const contactData = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        company: form.company.trim() || null,
        position: form.position.trim() || null,
        status: form.status || null,
        notes: form.notes.trim() || null,
      };

      // =========================
      // UPDATE
      // =========================

      if (editingContact) {
        const { data, error } = await supabase
          .from("contacts")
          .update({
            ...contactData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingContact.id)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) {
          console.error(
            "Ошибка обновления контакта:",
            error,
          );

          alert(error.message);
          return;
        }

        setContacts((prev) =>
          prev.map((contact) =>
            contact.id === editingContact.id
              ? data
              : contact,
          ),
        );
      }

      // =========================
      // CREATE
      // =========================

      else {
        const { data, error } = await supabase
          .from("contacts")
          .insert({
            user_id: user.id,
            ...contactData,
          })
          .select()
          .single();

        if (error) {
          console.error(
            "Ошибка создания контакта:",
            error,
          );

          alert(error.message);
          return;
        }

        setContacts((prev) => [
          data,
          ...prev,
        ]);
      }

      closeModal();
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE
  // =========================

  const deleteContact = async (
    id: string,
  ) => {
    const confirmed = window.confirm(
      "Удалить этот контакт?",
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("contacts")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(
        "Ошибка удаления:",
        error,
      );

      alert(error.message);
      return;
    }

    setContacts((prev) =>
      prev.filter(
        (contact) => contact.id !== id,
      ),
    );
  };

  // =========================
  // SEARCH
  // =========================

  const filteredContacts = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) return contacts;

    return contacts.filter((contact) => {
      return (
        contact.first_name
          ?.toLowerCase()
          .includes(query) ||
        contact.last_name
          ?.toLowerCase()
          .includes(query) ||
        contact.email
          ?.toLowerCase()
          .includes(query) ||
        contact.phone
          ?.toLowerCase()
          .includes(query) ||
        contact.company
          ?.toLowerCase()
          .includes(query) ||
        contact.position
          ?.toLowerCase()
          .includes(query) ||
        contact.status
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [contacts, search]);

  // =========================
  // LOADING
  // =========================

if (loading) {
  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-4 w-56" />
        </div>

        <Skeleton className="h-10 w-32 rounded-lg" />
      </div>

      {/* Search */}
      <Skeleton className="mb-6 h-11 w-full rounded-lg" />

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border">
        {/* Table header */}
        <div className="grid grid-cols-7 gap-4 border-b border-border bg-muted/40 px-4 py-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="ml-auto h-4 w-20" />
        </div>

        {/* Rows */}
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={index}
            className="grid grid-cols-7 items-center gap-4 border-b border-border px-4 py-4 last:border-b-0"
          >
            {/* Name */}
            <div className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 shrink-0 rounded-full" />

              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>

            {/* Company */}
            <Skeleton className="h-4 w-24" />

            {/* Email */}
            <Skeleton className="h-4 w-32" />

            {/* Phone */}
            <Skeleton className="h-4 w-28" />

            {/* Position */}
            <Skeleton className="h-4 w-24" />

            {/* Status */}
            <Skeleton className="h-6 w-16 rounded-full" />

            {/* Actions */}
            <div className="ml-auto flex gap-2">
              <Skeleton className="h-8 w-16 rounded-md" />
              <Skeleton className="h-8 w-20 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen p-6 text-gray-900 dark:text-gray-100">

      {/* HEADER */}

      <div className="mb-6 flex items-center justify-between">

        <div>
          <h1 className="text-2xl font-semibold">
            Contacts
          </h1>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Управление контактами CRM
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-sm text-white transition hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
        >
          <Plus size={17} />
          Add contact
        </button>
      </div>

      {/* SEARCH */}

      <div className="relative mb-6">

        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search contacts..."
          className="h-11 w-full rounded-lg border border-gray-200 bg-white pl-10 pr-10 text-sm outline-none transition focus:border-black dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-white"
        />

        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 dark:hover:text-white"
          >
            <X size={17} />
          </button>
        )}
      </div>

      {/* TABLE */}

      {filteredContacts.length === 0 ? (
        <div className="rounded-xl border border-gray-200 p-10 text-center dark:border-gray-700">

          <User className="mx-auto mb-3 h-8 w-8 text-gray-400" />

          <p className="font-medium">
            {search
              ? "Contacts not found"
              : "No contacts yet"}
          </p>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {search
              ? "Попробуйте другой запрос"
              : "Добавьте первый контакт"}
          </p>

          {!search && (
            <button
              type="button"
              onClick={openCreateModal}
              className="mt-5 rounded-lg bg-black px-4 py-2 text-sm text-white dark:bg-white dark:text-black"
            >
              Add contact
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px]">

              <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900">

                <tr>

                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Name
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Company
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Email
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Phone
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Position
                  </th>

                  <th className="px-4 py-3 text-left text-sm font-medium">
                    Status
                  </th>

                  <th className="px-4 py-3 text-right text-sm font-medium">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredContacts.map(
                  (contact) => (
                    <tr
                      key={contact.id}
                      className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900/50"
                    >

                      {/* NAME */}

                      <td className="px-4 py-4">

                        <div className="flex items-center gap-3">

                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                            <User size={16} />
                          </div>

                          <div>
                            <div className="font-medium">
                              {contact.first_name}{" "}
                              {contact.last_name || ""}
                            </div>

                            {contact.notes && (
                              <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                                <StickyNote size={12} />
                                Has notes
                              </div>
                            )}
                          </div>

                        </div>

                      </td>

                      {/* COMPANY */}

                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">

                        <div className="flex items-center gap-2">
                          <Building2 size={15} />
                          {contact.company || "—"}
                        </div>

                      </td>

                      {/* EMAIL */}

                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">

                        {contact.email ? (
                          <div className="flex items-center gap-2">
                            <Mail size={15} />
                            {contact.email}
                          </div>
                        ) : (
                          "—"
                        )}

                      </td>

                      {/* PHONE */}

                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {contact.phone || "—"}
                      </td>

                      {/* POSITION */}

                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">

                        {contact.position ? (
                          <div className="flex items-center gap-2">
                            <BriefcaseBusiness size={15} />
                            {contact.position}
                          </div>
                        ) : (
                          "—"
                        )}

                      </td>

                      {/* STATUS */}

                      <td className="px-4 py-4">

                        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                          {contact.status || "—"}
                        </span>

                      </td>

                      {/* ACTIONS */}

                      <td className="px-4 py-4">

                        <div className="flex justify-end gap-2">

                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(
                                contact,
                              )
                            }
                            className="flex items-center gap-1.5 rounded-md border border-gray-200 px-3 py-1.5 text-sm transition hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-800"
                          >
                            <Pencil size={14} />
                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteContact(
                                contact.id,
                              )
                            }
                            className="flex items-center gap-1.5 rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-500 transition hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950"
                          >
                            <Trash2 size={14} />
                            Delete
                          </button>

                        </div>

                      </td>

                    </tr>
                  ),
                )}

              </tbody>

            </table>

          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL */}

      {openModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900">

            {/* MODAL HEADER */}

            <div className="mb-6 flex items-center justify-between">

              <div>

                <h2 className="text-xl font-semibold">
                  {editingContact
                    ? "Edit Contact"
                    : "Add Contact"}
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {editingContact
                    ? "Измените данные контакта"
                    : "Добавьте нового контакта в CRM"}
                </p>

              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-md p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-gray-800 dark:hover:text-white"
              >
                <X size={20} />
              </button>

            </div>

            {/* FORM */}

            <form onSubmit={saveContact}>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* FIRST NAME */}

                <div>

                  <label className="mb-1 block text-sm font-medium">
                    First name *
                  </label>

                  <input
                    type="text"
                    name="first_name"
                    value={form.first_name}
                    onChange={handleChange}
                    placeholder="John"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-black dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-white"
                  />

                </div>

                {/* LAST NAME */}

                <div>

                  <label className="mb-1 block text-sm font-medium">
                    Last name
                  </label>

                  <input
                    type="text"
                    name="last_name"
                    value={form.last_name}
                    onChange={handleChange}
                    placeholder="Smith"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-black dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-white"
                  />

                </div>

                {/* EMAIL */}

                <div>

                  <label className="mb-1 block text-sm font-medium">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-black dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-white"
                  />

                </div>

                {/* PHONE */}

                <div>

                  <label className="mb-1 block text-sm font-medium">
                    Phone
                  </label>

                  <PhoneInput
                    international
                    defaultCountry="KG"
                    value={form.phone}
                    onChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        phone: value || "",
                      }))
                    }
                    placeholder="Введите номер"
                    className="phone-input"
                  />

                </div>

                {/* COMPANY */}

                <div>

                  <label className="mb-1 block text-sm font-medium">
                    Company
                  </label>

                  <input
                    type="text"
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="Acme Inc."
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-black dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-white"
                  />

                </div>

                {/* POSITION */}

                <div>

                  <label className="mb-1 block text-sm font-medium">
                    Position
                  </label>

                  <input
                    type="text"
                    name="position"
                    value={form.position}
                    onChange={handleChange}
                    placeholder="CEO"
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-black dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-white"
                  />

                </div>

                {/* STATUS */}

                <div>

                  <label className="mb-1 block text-sm font-medium">
                    Status
                  </label>

                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-black dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-white"
                  >
                    <option value="active">
                      Active
                    </option>

                    <option value="lead">
                      Lead
                    </option>

                    <option value="customer">
                      Customer
                    </option>

                    <option value="inactive">
                      Inactive
                    </option>
                  </select>

                </div>

                {/* NOTES */}

                <div className="sm:col-span-2">

                  <label className="mb-1 block text-sm font-medium">
                    Notes
                  </label>

                  <textarea
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Дополнительная информация..."
                    rows={4}
                    className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-black dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-white"
                  />

                </div>

              </div>

              {/* BUTTONS */}

              <div className="mt-6 flex justify-end gap-3">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm transition hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-black px-4 py-2 text-sm text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                >
                  {saving
                    ? editingContact
                      ? "Saving..."
                      : "Creating..."
                    : editingContact
                      ? "Save changes"
                      : "Create contact"}
                </button>

              </div>

            </form>

          </div>
        </div>
      )}
    </div>
  );
}