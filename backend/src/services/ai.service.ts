import Groq from "groq-sdk";

import { createTask, getTasks, updateTask, deleteTask } from "./task.service";

import { getCalendarEvents, createCalendarEvent } from "./calendar.service";


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
import { createNote, deleteNote, getNoteById, getNotes, updateNote } from "./notes.service";

// =====================================
// GROQ
// =====================================

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  throw new Error("GROQ_API_KEY is not defined");
}

const groq = new Groq({
  apiKey,
});

// =====================================
// AI TOOLS
// =====================================

const tools = [
  // =====================================
  // TASKS
  // =====================================

  {
    type: "function" as const,
    function: {
      name: "create_task",
      description: "Create a new task for the current user.",
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
            description: "Due date in ISO 8601 format",
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
        "Get tasks for the current user. If no status is specified, return all tasks. Status may be null.",
      parameters: {
        type: "object",
        properties: {
          status: {
            type: ["string", "null"],
            enum: ["todo", "in_progress", "done", null],
            description:
              "Optional task status filter. Use null when the user wants all tasks.",
          },
        },
        required: ["status"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "update_task",
      description: "Update an existing task belonging to the current user.",
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
            description: "New due date in ISO 8601 format",
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
        "Delete an existing task. First use get_tasks to find the exact task ID.",
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

  // =====================================
  // NOTES
  // =====================================

  {
    type: "function" as const,
    function: {
      name: "create_note",
      description: "Create a new note for the current user.",
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
        required: ["title", "content"],
        additionalProperties: false,
      },
    },
  },

  {
    type: "function" as const,
    function: {
      name: "get_notes",
      description: "Get all notes belonging to the current user.",
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
      description: "Update an existing note belonging to the current user.",
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
        "Delete an existing note. First use get_notes to find the exact note ID.",
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

  // =====================================
  // GET CONTACTS
  // =====================================

  {
    type: "function" as const,
    function: {
      name: "get_contacts",
      description: "Get all CRM contacts belonging to the current user.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
        additionalProperties: false,
      },
    },
  },

  // =====================================
  // CREATE CONTACT
  // =====================================

  {
    type: "function" as const,
    function: {
      name: "create_contact",
      description: "Create a new CRM contact for the current user.",
      parameters: {
        type: "object",
        properties: {
          first_name: {
            type: "string",
            description: "First name",
          },
          last_name: {
            type: "string",
            description: "Last name",
          },
          email: {
            type: "string",
            description: "Email address",
          },
          phone: {
            type: "string",
            description: "Phone number",
          },
          company: {
            type: "string",
            description: "Company",
          },
          position: {
            type: "string",
            description: "Job position",
          },
          status: {
            type: "string",
            enum: ["active", "lead", "customer", "inactive"],
          },
          notes: {
            type: "string",
            description: "Additional notes",
          },
        },
        required: ["first_name"],
        additionalProperties: false,
      },
    },
  },

  // =====================================
  // UPDATE CONTACT
  // =====================================

  {
    type: "function" as const,
    function: {
      name: "update_contact",
      description:
        "Update an existing CRM contact. First use get_contacts to find the exact contact ID.",
      parameters: {
        type: "object",
        properties: {
          contact_id: {
            type: "string",
            description: "Exact contact ID",
          },
          first_name: {
            type: "string",
            description: "New first name",
          },
          last_name: {
            type: "string",
            description: "New last name",
          },
          email: {
            type: "string",
            description: "New email",
          },
          phone: {
            type: "string",
            description: "New phone",
          },
          company: {
            type: "string",
            description: "New company",
          },
          position: {
            type: "string",
            description: "New position",
          },
          status: {
            type: "string",
            enum: ["active", "lead", "customer", "inactive"],
          },
          notes: {
            type: "string",
            description: "New notes",
          },
        },
        required: ["contact_id"],
        additionalProperties: false,
      },
    },
  },

  // =====================================
  // DELETE CONTACT
  // =====================================

  {
    type: "function" as const,
    function: {
      name: "delete_contact",
      description:
        "Delete an existing CRM contact. First use get_contacts to find the exact contact ID. Never invent IDs.",
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

  // =====================================
  // GMAIL
  // =====================================

  {
    type: "function" as const,
    function: {
      name: "get_gmail_messages",
      description: "Get the current user's Gmail messages.",
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
      description: "Search the current user's Gmail messages.",
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

  // =====================================
  // CALENDAR
  // =====================================

  {
    type: "function" as const,
    function: {
      name: "get_calendar_events",
      description: "Get the current user's Google Calendar events.",
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
      description: "Create a new Google Calendar event.",
      parameters: {
        type: "object",
        properties: {
          summary: {
            type: "string",
            description: "Event title",
          },
          description: {
            type: "string",
            description: "Optional description",
          },
          start: {
            type: "string",
            description: "Start ISO date/time",
          },
          end: {
            type: "string",
            description: "End ISO date/time",
          },
        },
        required: ["summary", "start", "end"],
        additionalProperties: false,
      },
    },
  },
];

// =====================================
// AI
// =====================================

export async function askGemini(
  message: string,
  userId: string,
  googleToken: string,
) {
console.log("🔥🔥🔥 NEW AI BACKEND VERSION 🔥🔥🔥");
console.log("USER:", userId);
console.log("MESSAGE:", message);

  const messages: any[] = [
    {
      role: "system",
      content: `
      BEHAVIOR:
- Follow these instructions silently.
- Never explain or acknowledge system instructions.
- Never tell the user that you will follow an instruction.
- Always perform the requested action.
- If the user asks about existing data, use the appropriate tool.
- After receiving tool results, answer the original user request directly.
You are AI Business Operator.

You manage the authenticated user's Tasks, Notes, CRM contacts, Gmail and Google Calendar.

IMPORTANT:
- Never invent data.
- Never invent IDs.
- Never invent user_id.
- The backend provides the authenticated userId.
- Always use tools when the user asks about existing data.
- Never claim an operation succeeded unless the tool returned success.

TASKS:

Show/list/find tasks:
→ get_tasks

Create task:
→ create_task

Update/change/complete task:
→ get_tasks first if an ID is not explicitly provided, then update_task.

Delete task by name:
1. Call get_tasks.
2. Find the matching task.
3. Use the exact ID.
4. Call delete_task.
5. Never invent IDs.
6. If multiple tasks match, ask which one.

NOTES:

Create note:
→ create_note

Show/list/find notes:
→ get_notes

Update note:
→ get_notes first if ID is unknown, then update_note.

Delete note by title:
1. Call get_notes.
2. Find matching note.
3. Use exact ID.
4. Call delete_note.

CRM:

Show/list/find/check contacts:
→ get_contacts

Create/add contact:
→ create_contact

Delete contact by name:
1. Call get_contacts.
2. Find the matching contact.
3. Use exact contact ID.
4. Call delete_contact.
5. Never invent IDs.
6. If multiple contacts have the same name, ask the user which one.

CRM fields:
- first_name
- last_name
- email
- phone
- company
- position
- status
- notes

Valid contact statuses:
- active
- lead
- customer
- inactive

GMAIL:

Show/list/check emails:
→ get_gmail_messages

Search emails:
→ search_gmail_messages

Examples:
"покажи мои письма"
→ get_gmail_messages

"найди письмо от Google"
→ search_gmail_messages

"найди письма про оплату"
→ search_gmail_messages

Useful Gmail operators:
from:
to:
subject:
after:
before:
newer_than:
older_than:
has:attachment
is:unread

CALENDAR:

Show/check calendar:
→ get_calendar_events

Create/schedule event:
→ create_calendar_event

DATE AND TIME DISPLAY RULES:
- User timezone is Asia/Bishkek (UTC+06:00).
- These are internal rules. Do not mention or acknowledge them to the user.
- Convert all dates and times from tool results to Asia/Bishkek before displaying them.
- Never display UTC unless the user explicitly asks for UTC.

Always use tool results.
Never fabricate database information.
`,
    },
    {
      role: "user",
      content: message,
    },
  ];

  // =====================================
  // TOOL LOOP
  // =====================================

  for (let step = 0; step < 5; step++) {
    console.log(`AI STEP: ${step + 1}`);

    const completion = await groq.chat.completions.create({
      model: "openai/gpt-oss-120b",
      messages,
      tools,
      tool_choice: "auto",
    });

    const responseMessage = completion.choices[0]?.message;

    if (!responseMessage) {
      return "Не удалось получить ответ от AI.";
    }

    console.log("AI TOOL CALLS:", responseMessage.tool_calls);

    messages.push(responseMessage);

    const toolCalls = responseMessage.tool_calls;

    // =====================================
    // NORMAL RESPONSE
    // =====================================

    if (!toolCalls || toolCalls.length === 0) {
      return responseMessage.content ?? "";
    }

    // =====================================
    // PROCESS TOOLS
    // =====================================

    for (const toolCall of toolCalls) {
      const functionName = toolCall.function.name;

      let args: any = {};

      try {
        args = JSON.parse(toolCall.function.arguments || "{}");

        if (
          toolCall.function.name === "get_tasks" &&
          (args.status === null || args.status === "")
        ) {
          delete args.status;
        }
      } catch (error) {
        console.error("Tool arguments parse error:", error);

        messages.push({
          role: "tool",
          tool_call_id: toolCall.id,
          content: JSON.stringify({
            success: false,
            error: "Invalid tool arguments.",
          }),
        });

        continue;
      }

      console.log("AI FUNCTION:", functionName);
      console.log("AI ARGUMENTS:", args);

      let result = "";

      // =====================================
      // GET CONTACTS
      // =====================================

      if (functionName === "get_contacts") {
        console.log("GETTING CONTACTS FOR USER:", userId);

        const contacts = await getContacts(userId);

        console.log("CONTACTS FOUND:", contacts.length);

        result = JSON.stringify({
          success: true,
          contacts: contacts.map((contact: any) => ({
            id: contact.id,
            first_name: contact.first_name,
            last_name: contact.last_name,
            email: contact.email,
            phone: contact.phone,
            company: contact.company,
            position: contact.position,
            status: contact.status,
            notes: contact.notes,
            created_at: contact.created_at,
            updated_at: contact.updated_at,
          })),
        });
      }

      // =====================================
      // CREATE CONTACT
      // =====================================
      else if (functionName === "create_contact") {
        console.log("CREATING CONTACT FOR USER:", userId);

        if (!args.first_name) {
          result = JSON.stringify({
            success: false,
            error: "first_name is required",
          });
        } else {
          const contact = await createContact(userId, {
            first_name: args.first_name,
            last_name: args.last_name,
            email: args.email,
            phone: args.phone,
            company: args.company,
            position: args.position,
            status: args.status,
            notes: args.notes,
          });

          result = JSON.stringify({
            success: true,
            contact,
            message: `Контакт "${`${contact.first_name} ${contact.last_name ?? ""}`.trim()}" успешно создан.`,
          });
        }
      }

      // =====================================
      // UPDATE CONTACT
      // =====================================
      else if (functionName === "update_contact") {
        console.log("UPDATING CONTACT:", args.contact_id, "FOR USER:", userId);

        if (!args.contact_id) {
          result = JSON.stringify({
            success: false,
            error: "contact_id is required",
          });
        } else {
          const contact = await updateContact(userId, args.contact_id, {
            ...(args.first_name !== undefined
              ? { first_name: args.first_name }
              : {}),

            ...(args.last_name !== undefined
              ? { last_name: args.last_name }
              : {}),

            ...(args.email !== undefined ? { email: args.email } : {}),

            ...(args.phone !== undefined ? { phone: args.phone } : {}),

            ...(args.company !== undefined ? { company: args.company } : {}),

            ...(args.position !== undefined ? { position: args.position } : {}),

            ...(args.status !== undefined ? { status: args.status } : {}),

            ...(args.notes !== undefined ? { notes: args.notes } : {}),
          });

          result = JSON.stringify({
            success: true,
            contact,
            message: `Контакт "${`${contact.first_name} ${contact.last_name ?? ""}`.trim()}" успешно обновлён.`,
          });
        }
      }

      // =====================================
      // DELETE CONTACT
      // =====================================
      else if (functionName === "delete_contact") {
        console.log("DELETING CONTACT:", args.contact_id, "FOR USER:", userId);

        if (!args.contact_id) {
          result = JSON.stringify({
            success: false,
            error: "contact_id is required",
          });
        } else {
          const contact = await deleteContact(userId, args.contact_id);

          result = JSON.stringify({
            success: true,
            contact: {
              id: contact.id,
              first_name: contact.first_name,
              last_name: contact.last_name,
            },
            message: `Контакт "${`${contact.first_name} ${contact.last_name ?? ""}`.trim()}" успешно удалён.`,
          });
        }
      }

      // =====================================
      // CREATE TASK
      // =====================================
     else if (functionName === "create_task") {
  console.log("=================================");
  console.log("CREATE_TASK TOOL CALLED");
  console.log("USER ID:", userId);
  console.log("ARGS:", args);
  console.log("=================================");

  try {
    if (!args.title) {
      result = JSON.stringify({
        success: false,
        error: "title is required",
      });
    } else {
      const task = await createTask({
        userId,
        title: args.title,
        description: args.description ?? null,
        status: args.status ?? "todo",
        priority: args.priority ?? "medium",
        dueDate: args.due_date ?? null,
      });

      console.log("=================================");
      console.log("TASK SUCCESSFULLY CREATED");
      console.log("TASK:", task);
      console.log("=================================");

      result = JSON.stringify({
        success: true,
        task: {
          id: task.id,
          title: task.title,
        },
        message: `Задача "${task.title}" успешно создана.`,
      });
    }
  } catch (error: any) {
    console.error("=================================");
    console.error("CREATE TASK FAILED");
    console.error(error);
    console.error("=================================");

    result = JSON.stringify({
      success: false,
      error: error?.message ?? "Failed to create task",
    });
  }
}
      // =====================================
      // GET TASKS
      // =====================================
      else if (functionName === "get_tasks") {
        console.log("GETTING TASKS FOR USER:", userId);

        const tasks = await getTasks(userId, args.status ?? undefined);

        console.log("TASKS FOUND:", tasks.length);

        result = JSON.stringify({
          success: true,
          tasks: tasks.map((task: any) => ({
            id: task.id,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            due_date: task.due_date,
          })),
        });
      }

      // =====================================
      // UPDATE TASK
      // =====================================
      else if (functionName === "update_task") {
        if (!args.task_id) {
          result = JSON.stringify({
            success: false,
            error: "task_id is required",
          });
          console.log("🔥 UPDATE_TASK TOOL CALLED");
console.log("USER ID:", userId);
console.log("ARGS:", args);
        } else {
          const task = await updateTask(userId, args.task_id, {
            title: args.title,
            description: args.description,
            status: args.status,
            priority: args.priority,
            dueDate: args.due_date,
          });

          result = JSON.stringify({
            success: true,
            task: {
              id: task.id,
              title: task.title,
            },
            message: `Задача "${task.title}" успешно обновлена.`,
          });
        }
      }

      // =====================================
      // DELETE TASK
      // =====================================
      else if (functionName === "delete_task") {
        if (!args.task_id) {
          result = JSON.stringify({
            success: false,
            error: "task_id is required",
          });
          console.log("🔥 DELETE_TASK TOOL CALLED");
console.log("USER ID:", userId);
console.log("ARGS:", args);
        } else {
          const task = await deleteTask(userId, args.task_id);

          result = JSON.stringify({
            success: true,
            task: {
              id: task.id,
              title: task.title,
            },
            message: `Задача "${task.title}" успешно удалена.`,
          });
        }
      }

      // =====================================
      // CREATE NOTE
      // =====================================
      else if (functionName === "create_note") {
        const note = await createNote({
          userId,
          title: args.title,
          content: args.content,
        });

        result = JSON.stringify({
          success: true,
          note: {
            id: note.id,
            title: note.title,
          },
          message: `Заметка "${note.title}" успешно создана.`,
        });
      }

      // =====================================
      // GET NOTES
      // =====================================
      else if (functionName === "get_notes") {
        console.log("GETTING NOTES FOR USER:", userId);

        const notes = await getNotes(userId);

        console.log("NOTES FOUND:", notes.length);

        result = JSON.stringify({
          success: true,
          notes: notes.map((note: any) => ({
            id: note.id,
            title: note.title,
            content: note.content,
            created_at: note.created_at,
            updated_at: note.updated_at,
          })),
        });
      }

      // =====================================
      // UPDATE NOTE
      // =====================================
      else if (functionName === "update_note") {
        if (!args.note_id) {
          result = JSON.stringify({
            success: false,
            error: "note_id is required",
          });
        } else {
          const note = await updateNote(userId, args.note_id, {
            ...(args.title !== undefined ? { title: args.title } : {}),
            ...(args.content !== undefined ? { content: args.content } : {}),
          });

          result = JSON.stringify({
            success: true,
            note: {
              id: note.id,
              title: note.title,
            },
            message: `Заметка "${note.title}" успешно обновлена.`,
          });
        }
      }

      // =====================================
      // DELETE NOTE
      // =====================================
      else if (functionName === "delete_note") {
        if (!args.note_id) {
          result = JSON.stringify({
            success: false,
            error: "note_id is required",
          });
        } else {
          const note = await getNoteById(userId, args.note_id);

          await deleteNote(userId, args.note_id);

          result = JSON.stringify({
            success: true,
            note: {
              id: note.id,
              title: note.title,
            },
            message: `Заметка "${note.title}" успешно удалена.`,
          });
        }
      }

      // =====================================
      // GET GMAIL
      // =====================================
      else if (functionName === "get_gmail_messages") {
        if (!googleToken) {
          result = JSON.stringify({
            success: false,
            error: "Google provider token is missing.",
          });
        } else {
          const gmailData = await getGmailMessagesService(googleToken);

          result = JSON.stringify({
            success: true,
            messages: gmailData.messages.map((message: any) => ({
              id: message.id,
              threadId: message.threadId,
              from: message.from,
              subject: message.subject,
              date: message.date,
              snippet: message.snippet,
            })),
          });
        }
      }

      // =====================================
      // SEARCH GMAIL
      // =====================================
      else if (functionName === "search_gmail_messages") {
        if (!googleToken) {
          result = JSON.stringify({
            success: false,
            error: "Google provider token is missing.",
          });
        } else if (!args.query) {
          result = JSON.stringify({
            success: false,
            error: "Gmail search query is required.",
          });
        } else {
          const gmailData = await searchGmailMessagesService(
            googleToken,
            args.query,
          );

          result = JSON.stringify({
            success: true,
            query: args.query,
            messages: gmailData.map((message: any) => ({
              id: message.id,
              threadId: message.threadId,
              from: message.from,
              subject: message.subject,
              date: message.date,
              snippet: message.snippet,
            })),
          });
        }
      }

      // =====================================
      // GET CALENDAR
      // =====================================
      else if (functionName === "get_calendar_events") {
        if (!googleToken) {
          result = JSON.stringify({
            success: false,
            error: "Google provider token is missing.",
          });
        } else {
          const events = await getCalendarEvents(googleToken);

          result = JSON.stringify({
            success: true,
            events: events.slice(0, 20).map((event: any) => ({
              summary: event.summary ?? "Без названия",
              start: event.start?.dateTime ?? event.start?.date ?? "",
              end: event.end?.dateTime ?? event.end?.date ?? "",
            })),
          });
        }
      }

      // =====================================
      // CREATE CALENDAR EVENT
      // =====================================
      else if (functionName === "create_calendar_event") {
        if (!googleToken) {
          result = JSON.stringify({
            success: false,
            error: "Google provider token is missing.",
          });
        } else {
          const event = await createCalendarEvent(googleToken, {
            summary: args.summary,
            ...(args.description
              ? {
                  description: args.description,
                }
              : {}),
            start: args.start,
            end: args.end,
          });

          result = JSON.stringify({
            success: true,
            event: {
              id: event.id,
              summary: event.summary,
            },
            message: `Событие "${event.summary}" успешно добавлено в календарь.`,
          });
        }
      }

      // =====================================
      // UNKNOWN TOOL
      // =====================================
      else {
        result = JSON.stringify({
          success: false,
          error: `Unknown tool: ${functionName}`,
        });
      }

      console.log("TOOL RESULT:", result);

      // =====================================
      // SEND RESULT TO AI
      // =====================================

      messages.push({
        role: "tool",
        tool_call_id: toolCall.id,
        content: result,
      });
    }
  }

  return "Не удалось завершить операцию.";
}
