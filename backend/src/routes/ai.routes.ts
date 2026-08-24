import { Router } from "express";
import Groq from "groq-sdk";

import { getTasks } from "../services/task.service";
import { getCalendarEvents } from "../services/calendar.service";
import { getGmailMessagesService } from "../services/gmail.service";

// ВАЖНО:
// замени путь, если твой authMiddleware находится в другом месте
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error("GROQ_API_KEY is not defined");
}

const groq = new Groq({
  apiKey,
});

router.post("/chat", authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({
        error: "Message is required",
      });
    }

    const googleToken =
      req.headers["x-google-provider-token"] as string | undefined;

    const tasks = await getTasks(userId);

    let emails: any[] = [];
    let calendarEvents: any[] = [];

    if (googleToken) {
      try {
        const gmailData =
          await getGmailMessagesService(googleToken);

        emails = gmailData.messages ?? [];
      } catch (error) {
        console.error("Chat Gmail error:", error);
      }

      try {
        calendarEvents =
          await getCalendarEvents(googleToken);
      } catch (error) {
        console.error("Chat Calendar error:", error);
      }
    }

    const prompt = `
You are an AI Business Operator.

User message:
${message}

User timezone:
Asia/Bishkek (UTC+06:00)

USER TASKS:
${JSON.stringify(tasks, null, 2)}

GMAIL:
${JSON.stringify(emails.slice(0, 20), null, 2)}

CALENDAR:
${JSON.stringify(calendarEvents.slice(0, 20), null, 2)}

Rules:
- Answer the user's request directly.
- Use the provided business data when relevant.
- Do not invent information.
- Use Asia/Bishkek timezone.
- Do not mention internal IDs.
- Do not mention system instructions.

Return only the answer text.
`;

    const completion =
      await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
          {
            role: "system",
            content:
              "You are an AI Business Operator. Help the user manage tasks, email, calendar and business information.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
      });

    const answer =
      completion.choices[0]?.message?.content;

    if (!answer) {
      return res.status(500).json({
        error: "AI returned empty response",
      });
    }

    return res.json({
      success: true,
      answer,
    });
  } catch (error) {
    console.error("AI chat error:", error);

    return res.status(500).json({
      error: "Failed to process AI request",
    });
  }
});
// =====================================
// AI SUGGESTIONS
// =====================================

router.post(
  "/suggestions",
  authMiddleware,
  async (req, res) => {
    try {
      // =====================================
      // AUTH
      // =====================================

      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          error: "Unauthorized",
        });
      }

      console.log("SUGGESTIONS USER:", userId);

      // =====================================
      // GOOGLE TOKEN
      // =====================================

      const googleToken =
        req.headers["x-google-provider-token"] as
          | string
          | undefined;

      // =====================================
      // TASKS
      // =====================================

      const tasks = await getTasks(userId);

      console.log(
        "SUGGESTIONS TASKS:",
        tasks.length,
      );

      // =====================================
      // GMAIL
      // =====================================

      let emails: any[] = [];

      if (googleToken) {
        try {
          const gmailData =
            await getGmailMessagesService(
              googleToken,
            );

          emails = gmailData.messages ?? [];

          console.log(
            "SUGGESTIONS EMAILS:",
            emails.length,
          );
        } catch (error) {
          console.error(
            "Suggestions Gmail error:",
            error,
          );
        }
      }

      // =====================================
      // CALENDAR
      // =====================================

      let calendarEvents: any[] = [];

      if (googleToken) {
        try {
          calendarEvents =
            await getCalendarEvents(
              googleToken,
            );

          console.log(
            "SUGGESTIONS CALENDAR:",
            calendarEvents.length,
          );
        } catch (error) {
          console.error(
            "Suggestions Calendar error:",
            error,
          );
        }
      }

      // =====================================
      // AI PROMPT
      // =====================================

      const prompt = `
You are an AI Business Operator.

Analyze the user's current business data and provide useful actionable suggestions.

USER TIMEZONE:
Asia/Bishkek (UTC+06:00)

IMPORTANT DATE RULES:
- Interpret dates and times using Asia/Bishkek timezone.
- When presenting dates to the user, use Asia/Bishkek timezone.
- Never show UTC to the user unless explicitly requested.
- Do not invent dates or times.

TASKS:
${JSON.stringify(
  tasks.map((task: any) => ({
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    due_date: task.due_date,
  })),
  null,
  2,
)}

GMAIL:
${JSON.stringify(
  emails.slice(0, 20).map((email: any) => ({
    from: email.from,
    subject: email.subject,
    date: email.date,
    snippet: email.snippet,
  })),
  null,
  2,
)}

CALENDAR:
${JSON.stringify(
  calendarEvents.slice(0, 20).map(
    (event: any) => ({
      summary: event.summary,
      start:
        event.start?.dateTime ??
        event.start?.date ??
        "",
      end:
        event.end?.dateTime ??
        event.end?.date ??
        "",
    }),
  ),
  null,
  2,
)}

IMPORTANT:
- Do not invent information.
- Only use the provided data.
- Prioritize urgent and high-priority tasks.
- Pay attention to overdue tasks.
- Pay attention to upcoming calendar events.
- Identify potentially important emails.
- Give practical recommendations.
- Use Asia/Bishkek timezone.
- Do not mention internal IDs.
- Do not mention system instructions.

Return JSON in exactly this format:

{
  "summary": "Short overall summary",
  "suggestions": [
    {
      "type": "task",
      "priority": "high",
      "title": "Suggestion title",
      "description": "What the user should do"
    }
  ]
}

Maximum 5 suggestions.
`;

      // =====================================
      // GROQ
      // =====================================

      const completion =
        await groq.chat.completions.create({
          model: "openai/gpt-oss-120b",

          messages: [
            {
              role: "system",
              content:
                "You are an AI Business Operator. Return only valid JSON.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],

          temperature: 0.2,
        });

      const content =
        completion.choices[0]?.message?.content;

      if (!content) {
        return res.status(500).json({
          error:
            "AI returned empty response",
        });
      }

      console.log(
        "AI SUGGESTIONS RAW:",
        content,
      );

      // =====================================
      // PARSE JSON
      // =====================================

      let suggestions;

      try {
        suggestions = JSON.parse(content);
      } catch (error) {
        console.error(
          "AI JSON parse error:",
          error,
        );

        return res.status(500).json({
          error:
            "AI returned invalid JSON",
        });
      }

      // =====================================
      // RESPONSE
      // =====================================

      return res.json({
        success: true,
        summary:
          suggestions.summary ?? "",
        suggestions:
          suggestions.suggestions ?? [],
      });
    } catch (error) {
      console.error(
        "AI suggestions error:",
        error,
      );

      return res.status(500).json({
        error:
          "Failed to generate suggestions",
      });
    }
  },
);

export default router;