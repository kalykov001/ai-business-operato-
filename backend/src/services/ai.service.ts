import Groq from "groq-sdk";

import {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} from "./task.service";

import {
  getCalendarEvents,
  createCalendarEvent,
} from "./calendar.service";

import {
  getContacts,
  getContactById,
  createContact,
  updateContact,
  deleteContact,
} from "./crm.service";

import {
  getGmailMessagesService,
  searchGmailMessagesService,
} from "./gmail.service";

import {
  createNote,
  deleteNote,
  getNoteById,
  getNotes,
  updateNote,
} from "./notes.service";

/* =========================================================
   GROQ
========================================================= */

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error("GROQ_API_KEY is not defined");
}

const groq = new Groq({
  apiKey,
});

/* =========================================================
   TYPES
========================================================= */

type ToolResult = {
  success: boolean;
  [key: string]: any;
};

/* =========================================================
   AI TOOLS
========================================================= */

const tools = [
  /* =======================================================
     TASKS
  ======================================================= */

  {
    type: "function" as const,
    function: {
      name: "create_task",
      description:
        "Create a new task for the current authenticated user.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Task title",
          },
          description: {
            type: "string",
            description: "Optional task description",
          },
          status: {
            type: "string",
            enum: ["todo", "in_progress", "done"],
            description: "Task status",
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high"],
            description: "Task priority",
          },
          due_date: {
            type: "string",
            description:
              "Optional due date in ISO 8601 format",
          },
        },
        required: ["title"],
        additionalProperties: false,
      },
    },
  },

  {
    type: "function" as const,
    function: {
      name: "get_tasks",
      description:
        "Get tasks belonging to the current authenticated user. If status is omitted, return all tasks.",
      parameters: {
        type: "object",
        properties: {
          status: {
            type: "string",
            enum: ["todo", "in_progress", "done"],
            description: "Optional task status filter",
          },
        },
        required: [],
        additionalProperties: false,
      },
    },
  },

  {
    type: "function" as const,
    function: {
      name: "update_task",
      description:
        "Update an existing task belonging to the current authenticated user.",
      parameters: {
        type: "object",
        properties: {
          task_id: {
            type: "string",
            description: "Exact task ID",
          },
          title: {
            type: "string",
            description: "New task title",
          },
          description: {
            type: "string",
            description: "New task description",
          },
          status: {
            type: "string",
            enum: ["todo", "in_progress", "done"],
          },
          priority: {
            type: "string",
            enum: ["low", "medium", "high"],
          },
          due_date: {
            type: "string",
            description:
              "New due date in ISO 8601 format",
          },
        },
        required: ["task_id"],
        additionalProperties: false,
      },
    },
  },

  {
    type: "function" as const,
    function: {
      name: "delete_task",
      description:
        "Delete an existing task belonging to the current authenticated user.",
      parameters: {
        type: "object",
        properties: {
          task_id: {
            type: "string",
            description: "Exact task ID",
          },
        },
        required: ["task_id"],
        additionalProperties: false,
      },
    },
  },

  /* =======================================================
     NOTES
  ======================================================= */

  {
    type: "function" as const,
    function: {
      name: "create_note",
      description:
        "Create a new note for the current authenticated user.",
      parameters: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "Note title",
          },
          content: {
            type: "string",
            description: "Note content",
          },
        },
        required: ["title"],
        additionalProperties: false,
      },
    },
  },

  {
    type: "function" as const,
    function: {
      name: "get_notes",
      description:
        "Get all notes belonging to the current authenticated user.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
        additionalProperties: false,
      },
    },
  },

  {
    type: "function" as const,
    function: {
      name: "update_note",
      description:
        "Update an existing note belonging to the current authenticated user.",
      parameters: {
        type: "object",
        properties: {
          note_id: {
            type: "string",
            description: "Exact note ID",
          },
          title: {
            type: "string",
            description: "New note title",
          },
          content: {
            type: "string",
            description: "New note content",
          },
        },
        required: ["note_id"],
        additionalProperties: false,
      },
    },
  },

  {
    type: "function" as const,
    function: {
      name: "delete_note",
      description:
        "Delete an existing note belonging to the current authenticated user.",
      parameters: {
        type: "object",
        properties: {
          note_id: {
            type: "string",
            description: "Exact note ID",
          },
        },
        required: ["note_id"],
        additionalProperties: false,
      },
    },
  },

  /* =======================================================
     CRM
  ======================================================= */

  {
    type: "function" as const,
    function: {
      name: "get_contacts",
      description:
        "Get all CRM contacts belonging to the current authenticated user.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
        additionalProperties: false,
      },
    },
  },

  {
    type: "function" as const,
    function: {
      name: "get_contact_by_id",
      description:
        "Get one exact CRM contact by ID.",
      parameters: {
        type: "object",
        properties: {
          contact_id: {
            type: "string",
            description: "Exact contact ID",
          },
        },
        required: ["contact_id"],
        additionalProperties: false,
      },
    },
  },

  {
    type: "function" as const,
    function: {
      name: "create_contact",
      description:
        "Create a new CRM contact.",
      parameters: {
        type: "object",
        properties: {
          first_name: {
            type: "string",
          },
          last_name: {
            type: "string",
          },
          email: {
            type: "string",
          },
          phone: {
            type: "string",
          },
          company: {
            type: "string",
          },
          position: {
            type: "string",
          },
          status: {
            type: "string",
            enum: [
              "active",
              "lead",
              "customer",
              "inactive",
            ],
          },
          notes: {
            type: "string",
          },
        },
        required: ["first_name"],
        additionalProperties: false,
      },
    },
  },

  {
    type: "function" as const,
    function: {
      name: "update_contact",
      description:
        "Update an existing CRM contact.",
      parameters: {
        type: "object",
        properties: {
          contact_id: {
            type: "string",
          },
          first_name: {
            type: "string",
          },
          last_name: {
            type: "string",
          },
          email: {
            type: "string",
          },
          phone: {
            type: "string",
          },
          company: {
            type: "string",
          },
          position: {
            type: "string",
          },
          status: {
            type: "string",
            enum: [
              "active",
              "lead",
              "customer",
              "inactive",
            ],
          },
          notes: {
            type: "string",
          },
        },
        required: ["contact_id"],
        additionalProperties: false,
      },
    },
  },

  {
    type: "function" as const,
    function: {
      name: "delete_contact",
      description:
        "Delete an existing CRM contact.",
      parameters: {
        type: "object",
        properties: {
          contact_id: {
            type: "string",
          },
        },
        required: ["contact_id"],
        additionalProperties: false,
      },
    },
  },

  /* =======================================================
     GMAIL
  ======================================================= */

  {
    type: "function" as const,
    function: {
      name: "get_gmail_messages",
      description:
        "Get Gmail messages for the authenticated Google account.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
        additionalProperties: false,
      },
    },
  },

  {
    type: "function" as const,
    function: {
      name: "search_gmail_messages",
      description:
        "Search Gmail messages using a Gmail search query.",
      parameters: {
        type: "object",
        properties: {
          query: {
            type: "string",
            description:
              "Gmail search query such as from:google.com or subject:invoice",
          },
        },
        required: ["query"],
        additionalProperties: false,
      },
    },
  },

  /* =======================================================
     CALENDAR
  ======================================================= */

  {
    type: "function" as const,
    function: {
      name: "get_calendar_events",
      description:
        "Get Google Calendar events for the authenticated Google account.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
        additionalProperties: false,
      },
    },
  },

  {
    type: "function" as const,
    function: {
      name: "create_calendar_event",
      description:
        "Create a new Google Calendar event.",
      parameters: {
        type: "object",
        properties: {
          summary: {
            type: "string",
            description: "Event title",
          },
          description: {
            type: "string",
            description: "Optional event description",
          },
          start: {
            type: "string",
            description:
              "Start date/time in ISO 8601 format",
          },
          end: {
            type: "string",
            description:
              "End date/time in ISO 8601 format",
          },
        },
        required: ["summary", "start", "end"],
        additionalProperties: false,
      },
    },
  },
];

/* =========================================================
   TOOL EXECUTOR
========================================================= */

async function executeTool(
  functionName: string,
  args: any,
  userId: string,
  googleToken: string,
): Promise<ToolResult> {
  console.log("\n=================================");
  console.log("🔥 TOOL EXECUTION");
  console.log("FUNCTION:", functionName);
  console.log("USER:", userId);
  console.log("ARGS:", args);
  console.log("=================================");

  try {
    /* =====================================================
       TASKS
    ===================================================== */

 if (functionName === "create_task") {
  console.log("=================================");
  console.log("🔥 CREATE TASK");
  console.log("USER ID:", userId);
  console.log("ARGS:", JSON.stringify(args, null, 2));
  console.log("=================================");

  if (!userId) {
    return {
      success: false,
      error: "Authenticated user ID is missing.",
    };
  }

  if (!args?.title) {
    return {
      success: false,
      error: "Task title is required.",
    };
  }

  try {
    const task = await createTask({
      userId,
      title: String(args.title),
      description:
        args.description !== undefined
          ? String(args.description)
          : null,
      status: args.status ?? "todo",
      priority: args.priority ?? "medium",
      dueDate: args.due_date ?? null,
    });

    console.log("=================================");
    console.log("✅ TASK CREATED IN DATABASE");
    console.log("TASK:", JSON.stringify(task, null, 2));
    console.log("=================================");

    if (!task?.id) {
      console.error(
        "❌ SUPABASE RETURNED TASK WITHOUT ID",
      );

      return {
        success: false,
        error:
          "Task insert completed but database did not return the created task.",
      };
    }

    return {
      success: true,
      task,
      message: `Задача "${task.title}" успешно создана.`,
    };
  } catch (error: any) {
    console.error("=================================");
    console.error("❌ CREATE TASK DATABASE ERROR");
    console.error("USER ID:", userId);
    console.error("ARGS:", args);
    console.error("ERROR:", error);
    console.error("MESSAGE:", error?.message);
    console.error("DETAILS:", error?.details);
    console.error("HINT:", error?.hint);
    console.error("CODE:", error?.code);
    console.error("=================================");

    return {
      success: false,
      error:
        error?.message ||
        "Failed to create task in database.",
    };
  }
}

    if (functionName === "get_tasks") {
      const status =
        args?.status &&
        args.status !== "null"
          ? args.status
          : undefined;

      const tasks = await getTasks(
        userId,
        status,
      );

      return {
        success: true,
        tasks,
      };
    }

    if (functionName === "update_task") {
      if (!args?.task_id) {
        return {
          success: false,
          error: "task_id is required.",
        };
      }

      const task = await updateTask(
        userId,
        args.task_id,
        {
          ...(args.title !== undefined && {
            title: args.title,
          }),

          ...(args.description !== undefined && {
            description: args.description,
          }),

          ...(args.status !== undefined && {
            status: args.status,
          }),

          ...(args.priority !== undefined && {
            priority: args.priority,
          }),

          ...(args.due_date !== undefined && {
            dueDate: args.due_date,
          }),
        },
      );

      return {
        success: true,
        task,
        message: `Задача "${task.title}" успешно обновлена.`,
      };
    }

    if (functionName === "delete_task") {
      if (!args?.task_id) {
        return {
          success: false,
          error: "task_id is required.",
        };
      }

      const task = await deleteTask(
        userId,
        args.task_id,
      );

      return {
        success: true,
        task,
        message: `Задача "${task.title}" успешно удалена.`,
      };
    }

    /* =====================================================
       NOTES
    ===================================================== */

    if (functionName === "create_note") {
      if (!args?.title) {
        return {
          success: false,
          error: "Note title is required.",
        };
      }

      const note = await createNote({
        userId,
        title: args.title,
        content: args.content ?? "",
      });

      return {
        success: true,
        note,
        message: `Заметка "${note.title}" успешно создана.`,
      };
    }

    if (functionName === "get_notes") {
      const notes = await getNotes(userId);

      return {
        success: true,
        notes,
      };
    }

    if (functionName === "update_note") {
      if (!args?.note_id) {
        return {
          success: false,
          error: "note_id is required.",
        };
      }

      const note = await updateNote(
        userId,
        args.note_id,
        {
          ...(args.title !== undefined && {
            title: args.title,
          }),

          ...(args.content !== undefined && {
            content: args.content,
          }),
        },
      );

      return {
        success: true,
        note,
        message: `Заметка "${note.title}" успешно обновлена.`,
      };
    }

    if (functionName === "delete_note") {
      if (!args?.note_id) {
        return {
          success: false,
          error: "note_id is required.",
        };
      }

      const note = await getNoteById(
        userId,
        args.note_id,
      );

      if (!note) {
        return {
          success: false,
          error: "Note not found.",
        };
      }

      await deleteNote(
        userId,
        args.note_id,
      );

      return {
        success: true,
        note,
        message: `Заметка "${note.title}" успешно удалена.`,
      };
    }

    /* =====================================================
       CRM
    ===================================================== */

    if (functionName === "get_contacts") {
      const contacts = await getContacts(
        userId,
      );

      return {
        success: true,
        contacts,
      };
    }

    if (functionName === "get_contact_by_id") {
      if (!args?.contact_id) {
        return {
          success: false,
          error: "contact_id is required.",
        };
      }

      const contact = await getContactById(
        userId,
        args.contact_id,
      );

      if (!contact) {
        return {
          success: false,
          error: "Contact not found.",
        };
      }

      return {
        success: true,
        contact,
      };
    }

    if (functionName === "create_contact") {
      if (!args?.first_name) {
        return {
          success: false,
          error: "first_name is required.",
        };
      }

      const contact = await createContact(
        userId,
        {
          first_name: args.first_name,
          last_name: args.last_name,
          email: args.email,
          phone: args.phone,
          company: args.company,
          position: args.position,
          status: args.status,
          notes: args.notes,
        },
      );

      return {
        success: true,
        contact,
        message: `Контакт "${contact.first_name}" успешно создан.`,
      };
    }

    if (functionName === "update_contact") {
      if (!args?.contact_id) {
        return {
          success: false,
          error: "contact_id is required.",
        };
      }

      const contact = await updateContact(
        userId,
        args.contact_id,
        {
          ...(args.first_name !== undefined && {
            first_name: args.first_name,
          }),

          ...(args.last_name !== undefined && {
            last_name: args.last_name,
          }),

          ...(args.email !== undefined && {
            email: args.email,
          }),

          ...(args.phone !== undefined && {
            phone: args.phone,
          }),

          ...(args.company !== undefined && {
            company: args.company,
          }),

          ...(args.position !== undefined && {
            position: args.position,
          }),

          ...(args.status !== undefined && {
            status: args.status,
          }),

          ...(args.notes !== undefined && {
            notes: args.notes,
          }),
        },
      );

      return {
        success: true,
        contact,
        message: "Контакт успешно обновлен.",
      };
    }

    if (functionName === "delete_contact") {
      if (!args?.contact_id) {
        return {
          success: false,
          error: "contact_id is required.",
        };
      }

      const contact = await deleteContact(
        userId,
        args.contact_id,
      );

      return {
        success: true,
        contact,
        message: "Контакт успешно удален.",
      };
    }

    /* =====================================================
       GMAIL
    ===================================================== */

    if (functionName === "get_gmail_messages") {
      if (!googleToken) {
        return {
          success: false,
          error:
            "Google provider token is missing.",
        };
      }

      const gmailData =
        await getGmailMessagesService(
          googleToken,
        );

      return {
        success: true,
        messages:
          gmailData.messages ?? [],
      };
    }

    if (
      functionName ===
      "search_gmail_messages"
    ) {
      if (!googleToken) {
        return {
          success: false,
          error:
            "Google provider token is missing.",
        };
      }

      if (!args?.query) {
        return {
          success: false,
          error:
            "Gmail search query is required.",
        };
      }

      const messages =
        await searchGmailMessagesService(
          googleToken,
          args.query,
        );

      return {
        success: true,
        query: args.query,
        messages,
      };
    }

    /* =====================================================
       CALENDAR
    ===================================================== */

    if (
      functionName ===
      "get_calendar_events"
    ) {
      if (!googleToken) {
        return {
          success: false,
          error:
            "Google provider token is missing.",
        };
      }

      const events =
        await getCalendarEvents(
          googleToken,
        );

      return {
        success: true,
        events: events
          .slice(0, 50)
          .map((event: any) => ({
            id: event.id,

            summary:
              event.summary ??
              "Без названия",

            start:
              event.start?.dateTime ??
              event.start?.date ??
              "",

            end:
              event.end?.dateTime ??
              event.end?.date ??
              "",

            description:
              event.description ?? "",
          })),
      };
    }

    if (
      functionName ===
      "create_calendar_event"
    ) {
      if (!googleToken) {
        return {
          success: false,
          error:
            "Google provider token is missing.",
        };
      }

      if (
        !args?.summary ||
        !args?.start ||
        !args?.end
      ) {
        return {
          success: false,
          error:
            "summary, start and end are required.",
        };
      }

      const event =
        await createCalendarEvent(
          googleToken,
          {
            summary: args.summary,
            description:
              args.description,
            start: args.start,
            end: args.end,
          },
        );

      return {
        success: true,
        event,
        message: `Событие "${event.summary}" успешно добавлено в календарь.`,
      };
    }

    /* =====================================================
       UNKNOWN
    ===================================================== */

    return {
      success: false,
      error: `Unknown tool: ${functionName}`,
    };
  } catch (error: any) {
    console.error(
      `❌ TOOL FAILED: ${functionName}`,
    );

    console.error(error);

    return {
      success: false,
      error:
        error?.message ??
        `Tool ${functionName} failed`,
    };
  }
}

/* =========================================================
   SYSTEM PROMPT
========================================================= */

const SYSTEM_PROMPT = `
You are AI Business Operator.

You are an AI assistant that controls the authenticated user's business workspace.

You can work with:

- Tasks
- Notes
- CRM contacts
- Gmail
- Google Calendar

CURRENT USER ID:
{{USER_ID}}

TIMEZONE:
Asia/Bishkek (UTC+06:00)

=========================================================
IMPORTANT RULES
=========================================================

1. If the user asks to CREATE something, use the appropriate tool.

2. If the user asks to SHOW, LIST or FIND something, use the appropriate tool.

3. If the user asks to UPDATE something, use the appropriate tool.

4. If the user asks to DELETE something, use the appropriate tool.

5. NEVER claim that an operation succeeded unless the tool returned:
success: true

6. NEVER invent database records.

7. NEVER invent IDs.

8. NEVER invent task IDs, note IDs or contact IDs.

9. For UPDATE or DELETE operations where the user does not provide an exact ID:
   first call the corresponding GET tool,
   find the matching record,
   then call UPDATE or DELETE with the exact ID.

10. If there are multiple possible matching records, ask the user to clarify instead of guessing.

=========================================================
TASKS
=========================================================

Create:
create_task

List:
get_tasks

Update:
get_tasks -> identify exact task -> update_task

Delete:
get_tasks -> identify exact task -> delete_task

Task statuses:
todo
in_progress
done

Task priorities:
low
medium
high

=========================================================
NOTES
=========================================================

Create:
create_note

List:
get_notes

Update:
get_notes -> identify exact note -> update_note

Delete:
get_notes -> identify exact note -> delete_note

=========================================================
CRM
=========================================================

Create:
create_contact

List:
get_contacts

Get exact:
get_contact_by_id

Update:
get_contacts -> identify exact contact -> update_contact

Delete:
get_contacts -> identify exact contact -> delete_contact

=========================================================
GMAIL
=========================================================

List messages:
get_gmail_messages

Search:
search_gmail_messages

Use Gmail search syntax when appropriate.

Examples:

from:google.com
subject:invoice
is:unread
has:attachment

=========================================================
GOOGLE CALENDAR
=========================================================

List events:
get_calendar_events

Create event:
create_calendar_event

Timezone:
Asia/Bishkek

When creating calendar events, always use ISO 8601 date/time.

=========================================================
FINAL ANSWERS
=========================================================

After a tool call:

- Analyze the returned result.
- Answer the user clearly.
- Keep the response concise.
- Mention what was actually changed.
- Never claim success when success:false.

If a tool returns success:false, explain the error to the user.

If the user asks a normal question that does not require tools, answer normally.
`;

/* =========================================================
   MAIN AI FUNCTION
========================================================= */

export async function askGemini(
  message: string,
  userId: string,
  googleToken: string,
) {
  console.log("\n=================================");
  console.log("🔥 AI BUSINESS OPERATOR");
  console.log("USER:", userId);
  console.log("MESSAGE:", message);
  console.log("HAS GOOGLE TOKEN:", !!googleToken);
  console.log("=================================\n");

  const messages: any[] = [
    {
      role: "system",
      content: SYSTEM_PROMPT.replace(
        "{{USER_ID}}",
        userId,
      ),
    },
    {
      role: "user",
      content: message,
    },
  ];

  const MAX_STEPS = 8;

  for (let step = 0; step < MAX_STEPS; step++) {
    console.log("\n=================================");
    console.log(`🔥 AI STEP ${step + 1}/${MAX_STEPS}`);
    console.log("=================================");

    let completion;

    try {
   const lowerMessage = message.toLowerCase();

const isTaskCreateRequest =
  lowerMessage.includes("создай задачу") ||
  lowerMessage.includes("создать задачу") ||
  lowerMessage.includes("добавь задачу") ||
  lowerMessage.includes("добавить задачу") ||
  lowerMessage.includes("поставь задачу") ||
  lowerMessage.startsWith("задача ");

const toolChoice = isTaskCreateRequest
  ? {
      type: "function" as const,
      function: {
        name: "create_task",
      },
    }
  : "auto";

completion = await groq.chat.completions.create({
  model: "openai/gpt-oss-120b",
  messages,
  tools,
  tool_choice: toolChoice,
  temperature: 0,
  max_tokens: 2000,
});
    } catch (error: any) {
      console.error("❌ GROQ ERROR:", error);

      return (
        error?.message ??
        "Не удалось получить ответ от AI."
      );
    }

    const responseMessage =
      completion.choices[0]?.message;

    if (!responseMessage) {
      console.error("❌ EMPTY GROQ RESPONSE");

      return "AI не вернул ответ.";
    }

    console.log(
      "🔥 GROQ RESPONSE:",
      JSON.stringify(
        responseMessage,
        null,
        2,
      ),
    );

    messages.push(responseMessage);

    const toolCalls =
      responseMessage.tool_calls;

    /*
     * =====================================================
     * NO TOOL CALL
     * =====================================================
     */

    if (
      !toolCalls ||
      toolCalls.length === 0
    ) {
      console.log("ℹ️ NO TOOL CALL");

      const lowerMessage =
        message.toLowerCase();

      /*
       * Защита от ситуации:
       *
       * Пользователь:
       * "создай задачу купить продукты"
       *
       * AI:
       * "Задача создана"
       *
       * но create_task не был вызван.
       */

      const looksLikeTaskCreation =
        lowerMessage.includes("создай задачу") ||
        lowerMessage.includes("создать задачу") ||
        lowerMessage.includes("добавь задачу") ||
        lowerMessage.includes("добавить задачу") ||
        lowerMessage.includes("поставь задачу") ||
        lowerMessage.includes("задачу купить") ||
        lowerMessage.includes("задача купить");

      if (looksLikeTaskCreation) {
        console.error(
          "❌ AI CLAIMED TASK CREATION WITHOUT TOOL CALL",
        );

        return (
          "Не удалось создать задачу: AI не вызвал инструмент create_task."
        );
      }

      return (
        responseMessage.content ??
        "Готово."
      );
    }

    /*
     * =====================================================
     * TOOL CALLS
     * =====================================================
     */

    for (const toolCall of toolCalls) {
      const functionName =
        toolCall.function.name;

      const rawArguments =
        toolCall.function.arguments;

      console.log("\n=================================");
      console.log("🔥 TOOL CALL");
      console.log("FUNCTION:", functionName);
      console.log("ID:", toolCall.id);
      console.log("ARGUMENTS:", rawArguments);
      console.log("=================================");

      let args: any = {};

      /*
       * ===================================================
       * PARSE ARGUMENTS
       * ===================================================
       */

      try {
        args = JSON.parse(
          rawArguments || "{}",
        );
      } catch (error) {
        console.error(
          "❌ INVALID TOOL JSON:",
          error,
        );

        const result: ToolResult = {
          success: false,
          error:
            "AI generated invalid tool arguments.",
        };

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content:
            JSON.stringify(result),
        });

        continue;
      }

      /*
       * ===================================================
       * EXECUTE TOOL
       * ===================================================
       */

      console.log("🔥 EXECUTING TOOL...");
      console.log("FUNCTION:", functionName);
      console.log("ARGS:", args);

      const result =
        await executeTool(
          functionName,
          args,
          userId,
          googleToken,
        );

      /*
       * ===================================================
       * REAL TOOL RESULT
       * ===================================================
       */

      console.log(
        "🔥🔥🔥 REAL TOOL RESULT 🔥🔥🔥",
      );

      console.log(
        JSON.stringify(
          result,
          null,
          2,
        ),
      );

      /*
       * ===================================================
       * RETURN RESULT TO GROQ
       * ===================================================
       */

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content:
          JSON.stringify(result),
      });
    }
  }

  console.error(
    "❌ AI TOOL LOOP LIMIT REACHED",
  );

  return (
    "AI не смог завершить операцию. Попробуйте выполнить запрос ещё раз."
  );
}