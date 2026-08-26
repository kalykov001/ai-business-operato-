"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

type Event = {
  id: string;
  title: string;
  date: string;
  time: string;
};

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export function CalendarPage() {
  const [weekStart, setWeekStart] = useState(() => {
    const now = new Date();
    const day = now.getDay() || 7;

    const monday = new Date(now);

    monday.setDate(now.getDate() - day + 1);
    monday.setHours(0, 0, 0, 0);

    return monday;
  });

  const [events, setEvents] = useState<Event[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  // Create event
  const [showCreate, setShowCreate] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDate, setNewDate] = useState(formatDate(new Date()));
  const [newStart, setNewStart] = useState("09:00");
  const [newEnd, setNewEnd] = useState("10:00");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);

  // Delete event
  const [selectedEvent, setSelectedEvent] =
    useState<Event | null>(null);
  const [deleting, setDeleting] = useState(false);

  // =====================================
  // LOAD EVENTS
  // =====================================

  const loadEvents = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        console.log("Нет Supabase access_token");
        return;
      }

      if (!session.provider_token) {
        console.log("Нет Google provider_token");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/calendar/events`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "X-Google-Provider-Token": session.provider_token,
          },
        }
      );

      const text = await response.text();

      let data: any = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { raw: text };
      }

      console.log("GET CALENDAR STATUS:", response.status);
      console.log("GET CALENDAR RESPONSE:", data);

      if (!response.ok) {
        console.error("Calendar loading error:", data);
        return;
      }

      const formattedEvents: Event[] = (data.events ?? [])
        .map((event: any) => {
          const start = event.start?.dateTime;

          if (!start) {
            return null;
          }

          const date = new Date(start);

          return {
            id: event.id,
            title: event.summary || "Без названия",
            date: formatDate(date),
            time: date.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
        })
        .filter(
          (
            event: Event | null
          ): event is Event => event !== null
        );

      setEvents(formattedEvents);
    } catch (error) {
      console.error("Calendar loading error:", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadEvents();
      setLoading(false);
    };

    init();
  }, []);

  // =====================================
  // CREATE EVENT
  // =====================================

  const createEvent = async () => {
    if (!newTitle.trim()) {
      alert("Введите название события");
      return;
    }

    if (newStart >= newEnd) {
      alert(
        "Время окончания должно быть позже времени начала"
      );
      return;
    }

    try {
      setCreating(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        alert("Вы не авторизованы");
        return;
      }

      if (!session.provider_token) {
        alert("Google provider token отсутствует");
        return;
      }

      const start = `${newDate}T${newStart}:00+06:00`;
      const end = `${newDate}T${newEnd}:00+06:00`;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/calendar/events`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "X-Google-Provider-Token":
              session.provider_token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            summary: newTitle.trim(),
            description:
              newDescription.trim() || undefined,
            start,
            end,
          }),
        }
      );

      const text = await response.text();

      let data: any = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {
          raw: text,
        };
      }

      console.log(
        "CREATE EVENT STATUS:",
        response.status
      );

      console.log(
        "CREATE EVENT RESPONSE:",
        data
      );

      if (!response.ok) {
        console.error(
          "Create event error:",
          data
        );

        alert(
          data?.error ||
            data?.message ||
            data?.raw ||
            `Ошибка ${response.status}`
        );

        return;
      }

      const event = data.event;

      if (event?.start?.dateTime) {
        const date = new Date(
          event.start.dateTime
        );

        const newEvent: Event = {
          id: event.id,
          title:
            event.summary ||
            newTitle,
          date: formatDate(date),
          time: date.toLocaleTimeString(
            "en-GB",
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          ),
        };

        setEvents((prev) => [
          ...prev,
          newEvent,
        ]);
      }

      setNewTitle("");
      setNewDescription("");
      setNewStart("09:00");
      setNewEnd("10:00");
      setShowCreate(false);
    } catch (error) {
      console.error(
        "Create event error:",
        error
      );

      alert("Ошибка создания события");
    } finally {
      setCreating(false);
    }
  };

  // =====================================
  // DELETE EVENT
  // =====================================

  const deleteEvent = async () => {
    if (!selectedEvent) {
      return;
    }

    try {
      setDeleting(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        alert("Вы не авторизованы");
        return;
      }

      if (!session.provider_token) {
        alert("Google provider token отсутствует");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/calendar/events/${encodeURIComponent(
          selectedEvent.id
        )}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            "X-Google-Provider-Token":
              session.provider_token,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Delete event error:",
          data
        );

        alert(
          data?.error ||
            "Не удалось удалить событие"
        );

        return;
      }

      setEvents((prev) =>
        prev.filter(
          (event) =>
            event.id !== selectedEvent.id
        )
      );

      setSelectedEvent(null);
    } catch (error) {
      console.error(
        "Delete event error:",
        error
      );

      alert("Ошибка удаления события");
    } finally {
      setDeleting(false);
    }
  };

  // =====================================
  // DAYS
  // =====================================

  const days = Array.from(
    { length: 7 },
    (_, i) => {
      const date = new Date(weekStart);

      date.setDate(
        weekStart.getDate() + i
      );

      return date;
    }
  );

  // =====================================
  // HOURS
  // =====================================

  const hours = Array.from(
    { length: 24 },
    (_, i) => i
  );

  // =====================================
  // CHANGE WEEK
  // =====================================

  const changeWeek = (amount: number) => {
    const next = new Date(weekStart);

    next.setDate(
      next.getDate() + amount * 7
    );

    setWeekStart(next);
  };

  // =====================================
  // TODAY
  // =====================================

  const today = () => {
    const now = new Date();
    const day = now.getDay() || 7;

    const monday = new Date(now);

    monday.setDate(
      now.getDate() - day + 1
    );

    monday.setHours(0, 0, 0, 0);

    setWeekStart(monday);
  };

  // =====================================
  // SEARCH
  // =====================================

  const filteredEvents = events.filter(
    (event) =>
      event.title
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  // =====================================
  // LOADING
  // =====================================

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center bg-background">
        <div className="text-sm text-muted-foreground">
          Loading calendar...
        </div>
      </div>
    );
  }

  // =====================================
  // UI
  // =====================================

  return (
    <div className="min-h-full w-full bg-background text-foreground">

      {/* HEADER */}

      <header className="sticky top-0 z-20 flex flex-col gap-4 border-b border-border bg-background/95 px-5 py-4 backdrop-blur-xl md:flex-row md:items-center md:justify-between md:px-6">

        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">
            Calendar
          </h1>

          <p className="mt-0.5 text-sm text-muted-foreground">
            {weekStart.toLocaleDateString(
              "en-US",
              {
                month: "long",
                year: "numeric",
              }
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">

          {/* SEARCH */}

          <div className="flex h-9 items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 transition focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/10">

            <Search
              size={16}
              className="shrink-0 text-muted-foreground"
            />

            <input
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search events"
              className="w-28 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground sm:w-36"
            />
          </div>

          {/* TODAY */}

          <button
            onClick={today}
            className="h-9 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            Today
          </button>

          {/* PREVIOUS */}

          <button
            onClick={() =>
              changeWeek(-1)
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-foreground transition hover:bg-muted"
          >
            <ChevronLeft size={18} />
          </button>

          {/* NEXT */}

          <button
            onClick={() =>
              changeWeek(1)
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background text-foreground transition hover:bg-muted"
          >
            <ChevronRight size={18} />
          </button>

          {/* NEW EVENT */}

          <button
            onClick={() =>
              setShowCreate(true)
            }
            className="flex h-9 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            <Plus size={16} />
            New event
          </button>
        </div>
      </header>

      {/* DAYS */}

      <div className="grid grid-cols-[60px_repeat(7,minmax(100px,1fr))] overflow-x-auto border-b border-border bg-card">

        <div />

        {days.map((day) => {
          const isToday =
            formatDate(day) ===
            formatDate(new Date());

          return (
            <div
              key={day.toISOString()}
              className="border-l border-border py-3 text-center"
            >
              <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                {day
                  .toLocaleDateString(
                    "en-US",
                    {
                      weekday: "short",
                    }
                  )
                  .toUpperCase()}
              </div>

              <div
                className={`
                  mx-auto mt-1 flex h-8 w-8
                  items-center justify-center
                  rounded-full text-sm font-medium
                  transition
                  ${
                    isToday
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-foreground"
                  }
                `}
              >
                {day.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* CALENDAR */}

      <div className="overflow-x-auto">
        <div className="grid min-w-[760px] grid-cols-[60px_repeat(7,minmax(100px,1fr))]">

          {/* HOURS */}

          <div className="bg-muted/20">
            {hours.map((hour) => (
              <div
                key={hour}
                className="h-10 border-b border-border pr-2 text-right text-[11px] text-muted-foreground"
              >
                {String(hour).padStart(
                  2,
                  "0"
                )}
                :00
              </div>
            ))}
          </div>

          {/* DAYS */}

          {days.map((day) => (
            <div
              key={day.toISOString()}
              className="relative border-l border-border bg-background"
            >

              {/* GRID */}

              {hours.map((hour) => (
                <div
                  key={hour}
                  className="h-10 border-b border-border transition hover:bg-muted/30"
                />
              ))}

              {/* EVENTS */}

              {filteredEvents
                .filter(
                  (event) =>
                    event.date ===
                    formatDate(day)
                )
                .map((event) => {
                  const [
                    hourString,
                    minuteString,
                  ] =
                    event.time.split(":");

                  const hour =
                    Number(hourString);

                  const minute =
                    Number(minuteString);

                  const top =
                    hour * 40 +
                    (minute / 60) * 40;

                  return (
                    <div
                      key={event.id}
                      onClick={() =>
                        setSelectedEvent(
                          event
                        )
                      }
                      className="
                        absolute left-1 right-1
                        cursor-pointer
                        overflow-hidden
                        rounded-lg
                        border border-primary/20
                        bg-primary/10
                        p-2
                        shadow-sm
                        transition
                        hover:bg-primary/15
                        hover:shadow-md
                      "
                      style={{
                        top: `${top + 2}px`,
                        height: "36px",
                      }}
                    >
                      <p className="truncate text-xs font-semibold text-primary">
                        {event.title}
                      </p>

                      <p className="text-[10px] text-muted-foreground">
                        {event.time}
                      </p>
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </div>

      {/* CREATE MODAL */}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm">

          <div className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">

            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  New event
                </h2>

                <p className="mt-0.5 text-xs text-muted-foreground">
                  Create a new calendar event
                </p>
              </div>

              <button
                onClick={() =>
                  setShowCreate(false)
                }
                className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 p-6">

              {/* TITLE */}

              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">
                  Title
                </label>

                <input
                  value={newTitle}
                  onChange={(e) =>
                    setNewTitle(
                      e.target.value
                    )
                  }
                  placeholder="Meeting with client"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              {/* DATE */}

              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">
                  Date
                </label>

                <input
                  type="date"
                  value={newDate}
                  onChange={(e) =>
                    setNewDate(
                      e.target.value
                    )
                  }
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              {/* TIME */}

              <div className="grid grid-cols-2 gap-3">

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">
                    Start
                  </label>

                  <input
                    type="time"
                    value={newStart}
                    onChange={(e) =>
                      setNewStart(
                        e.target.value
                      )
                    }
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-medium text-foreground">
                    End
                  </label>

                  <input
                    type="time"
                    value={newEnd}
                    onChange={(e) =>
                      setNewEnd(
                        e.target.value
                      )
                    }
                    className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/10"
                  />
                </div>

              </div>

              {/* DESCRIPTION */}

              <div>
                <label className="mb-1.5 block text-xs font-medium text-foreground">
                  Description
                </label>

                <textarea
                  value={newDescription}
                  onChange={(e) =>
                    setNewDescription(
                      e.target.value
                    )
                  }
                  placeholder="Optional description"
                  className="min-h-24 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/10"
                />
              </div>

              {/* ACTIONS */}

              <div className="flex justify-end gap-2 border-t border-border pt-4">

                <button
                  onClick={() =>
                    setShowCreate(false)
                  }
                  disabled={creating}
                  className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                >
                  Cancel
                </button>

                <button
                  onClick={createEvent}
                  disabled={creating}
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition hover:opacity-90 disabled:opacity-50"
                >
                  {creating
                    ? "Creating..."
                    : "Create event"}
                </button>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}

      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-sm">

          <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">

            <div className="p-6">

              <div className="flex items-start justify-between">

                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold text-foreground">
                    {selectedEvent.title}
                  </h2>

                  <p className="mt-2 text-sm text-muted-foreground">
                    {selectedEvent.date}
                    {" · "}
                    {selectedEvent.time}
                  </p>
                </div>

                <button
                  onClick={() =>
                    setSelectedEvent(
                      null
                    )
                  }
                  className="rounded-lg p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  <X size={18} />
                </button>

              </div>

              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="text-xs leading-5 text-red-700">
                  This event will be permanently
                  removed from your Google Calendar.
                </p>
              </div>

              <div className="mt-6 flex justify-end gap-2">

                <button
                  onClick={() =>
                    setSelectedEvent(
                      null
                    )
                  }
                  disabled={deleting}
                  className="rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
                >
                  Cancel
                </button>

                <button
                  onClick={deleteEvent}
                  disabled={deleting}
                  className="flex items-center gap-2 rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition hover:opacity-90 disabled:opacity-50"
                >
                  <Trash2 size={15} />

                  {deleting
                    ? "Deleting..."
                    : "Delete"}
                </button>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}