"use client";

import { useEffect, useState } from "react";
import {
  FileText,
  Plus,
  Search,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const API_URL = process.env.NEXT_PUBLIC_API_URL;
console.log("API_URL:", API_URL);
type Note = {
  id: string;
  user_id: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
};

const NotesPage = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // =========================
  // GET ACCESS TOKEN
  // =========================

  const getAccessToken = async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      throw new Error(error.message);
    }

    if (!session?.access_token) {
      throw new Error("User is not authenticated");
    }

    return session.access_token;
  };

  // =========================
  // LOAD NOTES
  // GET /api/notes
  // =========================

  const loadNotes = async () => {
    try {
      setLoading(true);

      if (!API_URL) {
        throw new Error(
          "NEXT_PUBLIC_API_URL is not configured",
        );
      }

      const token = await getAccessToken();

      const response = await fetch(
        `${API_URL}/api/notes`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const responseText = await response.text();

      console.log("Notes response:", {
        status: response.status,
        body: responseText,
      });

      if (!response.ok) {
        throw new Error(
          `Failed to load notes: ${response.status} ${responseText}`,
        );
      }

      const data: Note[] = JSON.parse(responseText);

      setNotes(data);

      if (data.length > 0) {
        setSelectedNote(data[0]);
      } else {
        setSelectedNote(null);
      }
    } catch (error) {
      console.error("Load notes error:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    loadNotes();
  }, []);

  // =========================
  // CREATE NOTE
  // POST /api/notes
  // =========================

  const createNote = async () => {
    try {
      setCreating(true);

      if (!API_URL) {
        throw new Error(
          "NEXT_PUBLIC_API_URL is not configured",
        );
      }

      const token = await getAccessToken();

      const response = await fetch(
        `${API_URL}/api/notes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: "New note",
            content: "",
          }),
        },
      );

      const responseText = await response.text();

      console.log("Create note response:", {
        status: response.status,
        body: responseText,
      });

      if (!response.ok) {
        throw new Error(
          `Failed to create note: ${response.status} ${responseText}`,
        );
      }

      const data: Note = JSON.parse(responseText);

      setNotes((prev) => [data, ...prev]);
      setSelectedNote(data);
    } catch (error) {
      console.error("Create note error:", error);
    } finally {
      setCreating(false);
    }
  };

  // =========================
  // UPDATE NOTE
  // PATCH /api/notes/:id
  // =========================

  const updateNote = async (
    id: string,
    updates: {
      title?: string;
      content?: string;
    },
  ) => {
    try {
      setSaving(true);

      if (!API_URL) {
        throw new Error(
          "NEXT_PUBLIC_API_URL is not configured",
        );
      }

      const token = await getAccessToken();

      const response = await fetch(
        `${API_URL}/api/notes/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
        },
      );

      const responseText = await response.text();

      console.log("Update note response:", {
        status: response.status,
        body: responseText,
      });

      if (!response.ok) {
        throw new Error(
          `Failed to update note: ${response.status} ${responseText}`,
        );
      }

      const data: Note = JSON.parse(responseText);

      setNotes((prev) =>
        prev.map((note) =>
          note.id === id ? data : note,
        ),
      );

      setSelectedNote(data);
    } catch (error) {
      console.error("Update note error:", error);
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // DELETE NOTE
  // DELETE /api/notes/:id
  // =========================

  const deleteNote = async () => {
    if (!selectedNote) return;

    try {
      setDeleting(true);

      if (!API_URL) {
        throw new Error(
          "NEXT_PUBLIC_API_URL is not configured",
        );
      }

      const token = await getAccessToken();

      const noteId = selectedNote.id;

      const response = await fetch(
        `${API_URL}/api/notes/${noteId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );

      const responseText = await response.text();

      console.log("Delete note response:", {
        status: response.status,
        body: responseText,
      });

      if (!response.ok) {
        throw new Error(
          `Failed to delete note: ${response.status} ${responseText}`,
        );
      }

      const remainingNotes = notes.filter(
        (note) => note.id !== noteId,
      );

      setNotes(remainingNotes);

      if (remainingNotes.length > 0) {
        setSelectedNote(remainingNotes[0]);
      } else {
        setSelectedNote(null);
      }
    } catch (error) {
      console.error("Delete note error:", error);
    } finally {
      setDeleting(false);
    }
  };

  // =========================
  // SEARCH
  // =========================

  const filteredNotes = notes.filter((note) => {
    const searchValue = search.toLowerCase();

    return (
      note.title.toLowerCase().includes(searchValue) ||
      note.content.toLowerCase().includes(searchValue)
    );
  });

  // =========================
  // RENDER
  // =========================

  return (
    <div className="flex h-full min-h-screen flex-col bg-background">
      {/* HEADER */}

      <div className="flex items-center justify-between border-b px-6 py-4">
        <div>
          <h1 className="text-2xl font-semibold">
            Notes
          </h1>

          <p className="text-sm text-muted-foreground">
            Keep your ideas and important information in one
            place
          </p>
        </div>

        <button
          onClick={createNote}
          disabled={creating}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus size={18} />

          {creating ? "Creating..." : "New note"}
        </button>
      </div>

      {/* MAIN */}

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}

        <aside className="w-[320px] border-r">
          {/* SEARCH */}

          <div className="border-b p-4">
            <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
              <Search
                size={18}
                className="text-muted-foreground"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search notes..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          {/* NOTES LIST */}

          <div className="overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                Loading notes...
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                No notes found
              </div>
            ) : (
              filteredNotes.map((note) => (
                <button
                  key={note.id}
                  onClick={() =>
                    setSelectedNote(note)
                  }
                  className={`w-full border-b p-4 text-left transition ${
                    selectedNote?.id === note.id
                      ? "bg-muted"
                      : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <FileText
                      size={18}
                      className="mt-1 shrink-0 text-muted-foreground"
                    />

                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">
                        {note.title}
                      </p>

                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {note.content || "Empty note"}
                      </p>

                      <p className="mt-2 text-xs text-muted-foreground">
                        {new Date(
                          note.updated_at,
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </aside>

        {/* EDITOR */}

        <main className="flex-1">
          {selectedNote ? (
            <div className="flex h-full flex-col">
              {/* EDITOR HEADER */}

              <div className="flex items-center justify-between border-b px-6 py-4">
                <div className="flex items-center gap-3">
                  <FileText size={20} />

                  <span className="text-sm text-muted-foreground">
                    {saving
                      ? "Saving..."
                      : `Last edited ${new Date(
                          selectedNote.updated_at,
                        ).toLocaleString()}`}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* SAVE */}

                  <button
                    onClick={() => {
                      if (!selectedNote) return;

                      updateNote(
                        selectedNote.id,
                        {
                          title: selectedNote.title,
                          content: selectedNote.content,
                        },
                      );
                    }}
                    disabled={saving}
                    className="rounded-lg px-3 py-2 text-sm hover:bg-muted disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>

                  {/* DELETE */}

                  <button
                    onClick={deleteNote}
                    disabled={deleting}
                    className="rounded-lg p-2 text-destructive hover:bg-muted disabled:opacity-50"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>

                  {/* MORE */}

                  <button
                    className="rounded-lg p-2 hover:bg-muted"
                    title="More"
                  >
                    <MoreHorizontal size={18} />
                  </button>
                </div>
              </div>

              {/* CONTENT */}

              <div className="flex-1 p-8">
                {/* TITLE */}

                <input
                  value={selectedNote.title}
                  onChange={(e) => {
                    const value = e.target.value;

                    setSelectedNote((prev) =>
                      prev
                        ? {
                            ...prev,
                            title: value,
                          }
                        : prev,
                    );
                  }}
                  className="mb-6 w-full bg-transparent text-3xl font-semibold outline-none"
                  placeholder="Note title"
                />

                {/* CONTENT */}

                <textarea
                  value={selectedNote.content}
                  onChange={(e) => {
                    const value = e.target.value;

                    setSelectedNote((prev) =>
                      prev
                        ? {
                            ...prev,
                            content: value,
                          }
                        : prev,
                    );
                  }}
                  placeholder="Start writing..."
                  className="min-h-[500px] w-full resize-none bg-transparent text-base leading-7 outline-none"
                />
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <FileText
                  size={40}
                  className="mx-auto mb-4 text-muted-foreground"
                />

                <h2 className="text-lg font-medium">
                  No note selected
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  Select a note or create a new one
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default NotesPage;