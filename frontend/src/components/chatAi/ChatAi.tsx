"use client";

import { useEffect, useState } from "react";
import { Bot, Send, Sparkles, User } from "lucide-react";
import { supabase } from "@/lib/supabase";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

const ChatAi = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Загружаем историю сообщений
  useEffect(() => {
    const loadMessages = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoadingHistory(false);
          return;
        }

        const { data, error } = await supabase
          .from("ai_messages")
          .select("id, role, content, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Load AI messages error:", error);
          return;
        }

        setMessages(
          (data || []).map((item) => ({
            id: item.id,
            role: item.role as "user" | "assistant",
            content: item.content,
          }))
        );
      } catch (error) {
        console.error("Load AI history error:", error);
      } finally {
        setLoadingHistory(false);
      }
    };

    loadMessages();
  }, []);

const sendMessage = async () => {
  const text = message.trim();

  if (!text || loading) return;

  // Команда clean — очистить историю
  if (text.toLowerCase() === "clean") {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setMessage("");
        return;
      }

      const { error } = await supabase
        .from("ai_messages")
        .delete()
        .eq("user_id", user.id);

      if (error) {
        console.error("Clear chat error:", error);
        return;
      }

      // Очищаем сообщения на экране
      setMessages([]);
      setMessage("");
    } catch (error) {
      console.error("Clear chat error:", error);
    }

    return;
  }

  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user || !session.access_token) {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "Пользователь не авторизован.",
        },
      ]);

      return;
    }

    const userId = session.user.id;

    // Сохраняем сообщение пользователя
    const { data: savedUserMessage, error: userMessageError } =
      await supabase
        .from("ai_messages")
        .insert({
          user_id: userId,
          role: "user",
          content: text,
        })
        .select("id, role, content")
        .single();

    if (userMessageError) {
      console.error("Save user message error:", userMessageError);
      throw userMessageError;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: savedUserMessage.id,
        role: "user",
        content: savedUserMessage.content,
      },
    ]);

    setMessage("");
    setLoading(true);

    console.log(
      "Google provider token exists:",
      !!session.provider_token
    );

    // Отправляем сообщение AI
const response = await fetch(
  `${process.env.NEXT_PUBLIC_API_URL}/api/ai/chat`,
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      "X-Google-Provider-Token": session.provider_token ?? "",
    },
    body: JSON.stringify({
      message,
    }),
  }
);

const responseText = await response.text();

console.log("AI API STATUS:", response.status);
console.log("AI API RESPONSE:", responseText);

let data: any;

try {
  data = JSON.parse(responseText);
} catch {
  throw new Error(
    `AI API вернул не JSON. Status: ${response.status}`
  );
}

if (!response.ok) {
  throw new Error(data.error || data.message || "AI error");
}

const aiAnswer = data.answer || "AI не вернул ответ.";
    // Сохраняем ответ AI
    const { data: savedAiMessage, error: aiMessageError } =
      await supabase
        .from("ai_messages")
        .insert({
          user_id: userId,
          role: "assistant",
          content: aiAnswer,
        })
        .select("id, role, content")
        .single();

    if (aiMessageError) {
      console.error("Save AI message error:", aiMessageError);
      throw aiMessageError;
    }

    setMessages((prev) => [
      ...prev,
      {
        id: savedAiMessage.id,
        role: "assistant",
        content: savedAiMessage.content,
      },
    ]);
  } catch (error) {
    console.error("Chat AI error:", error);

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: "assistant",
        content:
          error instanceof Error
            ? error.message
            : "Не удалось получить ответ от AI.",
      },
    ]);
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="flex h-[calc(100vh-48px)] min-h-[600px] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Bot className="h-5 w-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-semibold text-foreground">
                AI Business Operator
              </h1>

              <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Online
              </span>
            </div>

            <p className="text-sm text-muted-foreground">
              Your intelligent business assistant
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
          <Sparkles className="h-4 w-4" />
          Operator AI
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
        {loadingHistory ? (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Загрузка истории...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
              <Bot className="h-8 w-8 text-muted-foreground" />
            </div>

            <h2 className="text-xl font-semibold text-foreground">
              How can I help you?
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
              Ask me to create tasks, manage your workspace, find information
              or help with your business.
            </p>

            <div className="mt-6 grid w-full max-w-2xl gap-3 sm:grid-cols-3">
              {[
                "Create a task for tomorrow",
                "Show my tasks",
                "Find a CRM contact",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setMessage(suggestion)}
                  className="rounded-xl border border-border bg-card px-4 py-3 text-left text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
            {messages.map((item) => {
              const isUser = item.role === "user";

              return (
                <div
                  key={item.id}
                  className={`flex gap-3 ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {!isUser && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                      isUser
                        ? "rounded-br-md bg-primary text-primary-foreground"
                        : "rounded-bl-md bg-muted text-foreground"
                    }`}
                  >
                    {item.content}
                  </div>

                  {isUser && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </div>

                <div className="rounded-2xl rounded-bl-md bg-muted px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-border bg-background p-4 sm:p-5">
        <div className="mx-auto flex w-full max-w-4xl items-end gap-3 rounded-2xl border border-border bg-muted/40 p-2 focus-within:ring-2 focus-within:ring-ring">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            rows={1}
            placeholder="Ask AI anything..."
            className="max-h-32 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />

          <button
            type="button"
            onClick={sendMessage}
            disabled={loading || !message.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-2 text-center text-xs text-muted-foreground">
          Enter to send · Shift + Enter for a new line
        </p>
      </div>
    </div>
  );
};

export default ChatAi;