"use client";
import { useEffect, useMemo, useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { supabase } from "@/lib/supabase";
import {
  Search,
  X,
  Mail,
  Calendar,
  User,
} from "lucide-react";
type Email = {
  id: string;
  threadId: string;
  from: string;
  subject: string;
  date: string;
  snippet: string;
};
export default function GmailPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [page, setPage] = useState(1);
  const [pageTokens, setPageTokens] = useState<(string | null)[]>([
    null,
  ]);
  const [loading, setLoading] = useState(true);
  const [hasNextPage, setHasNextPage] = useState(false);
  // Поиск
  const [search, setSearch] = useState("");
  // Выбранное письмо
  const [selectedEmail, setSelectedEmail] =
    useState<Email | null>(null);
 const loadEmails = async (pageNumber: number) => {
  try {
    setLoading(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    console.log("SESSION:", session);
    console.log("ACCESS TOKEN:", session?.access_token);
    console.log("PROVIDER TOKEN:", session?.provider_token);

    const providerToken = session?.provider_token;

    if (!session?.access_token) {
      console.error("Supabase access token not found");
      return;
    }

    if (!providerToken) {
      console.error("Google provider token not found");
      return;
    }

    const API_URL = process.env.NEXT_PUBLIC_API_URL;

    if (!API_URL) {
      console.error("NEXT_PUBLIC_API_URL is not defined");
      return;
    }

    const token = pageTokens[pageNumber - 1];

    let url = `${API_URL}/api/gmail/messages`;

    if (token) {
      url += `?pageToken=${encodeURIComponent(token)}`;
    }

    console.log("Gmail request:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "X-Google-Provider-Token": providerToken,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error(
        "Gmail API error:",
        response.status,
        errorText
      );

      throw new Error(
        `Gmail API error: ${response.status}`
      );
    }

    const data = await response.json();

    console.log("Gmail response:", data);

    setEmails(data.messages ?? []);

    setHasNextPage(
      Boolean(data.nextPageToken)
    );

    if (data.nextPageToken) {
      setPageTokens((prev) => {
        const newTokens = [...prev];

        newTokens[pageNumber] =
          data.nextPageToken;

        return newTokens;
      });
    }
  } catch (error) {
    console.error(
      "Gmail frontend error:",
      error
    );
  } finally {
    setLoading(false);
  }
};
  useEffect(() => {
    loadEmails(1);
  }, []);

  // Поиск по текущей странице
  const filteredEmails = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    if (!query) {
      return emails;
    }

    return emails.filter((email) => {
      return (
        email.from
          ?.toLowerCase()
          .includes(query) ||
        email.subject
          ?.toLowerCase()
          .includes(query) ||
        email.snippet
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [emails, search]);

  const handleNext = () => {
    if (!hasNextPage) return;

    const nextPage = page + 1;

    setPage(nextPage);

    loadEmails(nextPage);
  };

  const handlePrevious = () => {
    if (page === 1) return;

    const previousPage = page - 1;

    setPage(previousPage);

    loadEmails(previousPage);
  };

  // Закрытие модального окна через Escape
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedEmail(null);
      }
    };

    window.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  return (
    <div className="w-full">
      {/* Header */}

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Gmail
          </h1>

          <p className="text-sm text-muted-foreground">
            Your emails
          </p>
        </div>
      </div>

      {/* Search */}

      <div className="relative mb-6">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />

        <input
          type="text"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          placeholder="Search emails..."
          className="h-11 w-full rounded-lg border bg-background pl-10 pr-10 text-sm outline-none transition focus:border-primary"
        />

        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X size={17} />
          </button>
        )}
      </div>

      {/* Gmail list */}

      <div className="space-y-2">
        {loading ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Loading emails...
          </div>
        ) : filteredEmails.length === 0 ? (
          <div className="rounded-lg border py-10 text-center">
            <Mail className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />

            <p className="font-medium">
              {search
                ? "No emails found"
                : "No emails"}
            </p>

            {search && (
              <p className="mt-1 text-sm text-muted-foreground">
                Try another search
              </p>
            )}
          </div>
        ) : (
          filteredEmails.map((email) => (
            <button
              key={email.id}
              type="button"
              onClick={() =>
                setSelectedEmail(email)
              }
              className="w-full rounded-lg border p-4 text-left transition hover:bg-muted/50"
            >
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Mail size={17} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <div className="truncate font-medium">
                      {email.from}
                    </div>

                    <div className="shrink-0 text-xs text-muted-foreground">
                      {email.date}
                    </div>
                  </div>

                  <div className="mt-1 truncate font-semibold">
                    {email.subject ||
                      "(No subject)"}
                  </div>

                  <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                    {email.snippet}
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Pagination */}

      {!search && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  handlePrevious();
                }}
                className={
                  page === 1
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>

            <PaginationItem>
              <span className="px-4 text-sm">
                Page {page}
              </span>
            </PaginationItem>

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  handleNext();
                }}
                className={
                  !hasNextPage
                    ? "pointer-events-none opacity-50"
                    : ""
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Email modal */}

      {selectedEmail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onMouseDown={() =>
            setSelectedEmail(null)
          }
        >
          <div
            className="w-full max-w-2xl rounded-xl border bg-background shadow-xl"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            {/* Modal header */}

            <div className="flex items-center justify-between border-b px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                  <Mail size={18} />
                </div>

                <div>
                  <h2 className="font-semibold">
                    Email
                  </h2>

                  <p className="text-xs text-muted-foreground">
                    Message details
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedEmail(null)
                }
                className="rounded-md p-2 text-muted-foreground transition hover:bg-muted hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal content */}

            <div className="space-y-5 p-6">
              {/* From */}

              <div className="flex gap-3">
                <User
                  size={18}
                  className="mt-0.5 text-muted-foreground"
                />

                <div>
                  <p className="text-xs text-muted-foreground">
                    From
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {selectedEmail.from}
                  </p>
                </div>
              </div>

              {/* Date */}

              <div className="flex gap-3">
                <Calendar
                  size={18}
                  className="mt-0.5 text-muted-foreground"
                />

                <div>
                  <p className="text-xs text-muted-foreground">
                    Date
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {selectedEmail.date}
                  </p>
                </div>
              </div>

              {/* Subject */}

              <div>
                <p className="text-xs text-muted-foreground">
                  Subject
                </p>

                <h3 className="mt-1 text-lg font-semibold">
                  {selectedEmail.subject ||
                    "(No subject)"}
                </h3>
              </div>

              {/* Message */}

              <div>
                <p className="mb-2 text-xs text-muted-foreground">
                  Message
                </p>

                <div className="rounded-lg bg-muted/50 p-4 text-sm leading-6">
                  {selectedEmail.snippet ||
                    "No message content"}
                </div>
              </div>

              {/* IDs */}

              <div className="border-t pt-4">
                <p className="text-xs text-muted-foreground">
                  Message ID
                </p>

                <p className="mt-1 break-all font-mono text-xs">
                  {selectedEmail.id}
                </p>

                <p className="mt-3 text-xs text-muted-foreground">
                  Thread ID
                </p>

                <p className="mt-1 break-all font-mono text-xs">
                  {selectedEmail.threadId}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}