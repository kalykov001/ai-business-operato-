export const getCalendarEvents = async (
  googleToken: string,
) => {
  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      headers: {
        Authorization: `Bearer ${googleToken}`,
      },
    },
  );

  const text = await response.text();

  console.log(
    "GOOGLE GET STATUS:",
    response.status,
  );

  console.log(
    "GOOGLE GET RESPONSE:",
    text,
  );

  if (!response.ok) {
    let data: any = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {
        raw: text,
      };
    }

    throw new Error(
      data?.error?.message ||
        data?.message ||
        data?.raw ||
        `Google Calendar error ${response.status}`,
    );
  }

  try {
    const data = text
      ? JSON.parse(text)
      : {};

    return data.items ?? [];
  } catch {
    throw new Error(
      "Google Calendar returned invalid JSON",
    );
  }
};


// =====================================
// CREATE CALENDAR EVENT
// =====================================

export const createCalendarEvent = async (
  googleToken: string,
  event: {
    summary: string;
    description?: string;
    start: string;
    end: string;
  },
) => {
  const response = await fetch(
    "https://www.googleapis.com/calendar/v3/calendars/primary/events",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${googleToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: event.summary,

        ...(event.description
          ? { description: event.description }
          : {}),

        start: {
          dateTime: event.start,
          timeZone: "Asia/Bishkek",
        },

        end: {
          dateTime: event.end,
          timeZone: "Asia/Bishkek",
        },
      }),
    },
  );

  const responseText = await response.text();

  console.log(
    "GOOGLE STATUS:",
    response.status,
  );

  console.log(
    "GOOGLE RESPONSE:",
    responseText,
  );

  if (!response.ok) {
    let googleError: any = null;

    try {
      googleError = JSON.parse(responseText);
    } catch {}

    throw new Error(
      googleError?.error?.message ||
        responseText ||
        `Google Calendar error ${response.status}`,
    );
  }

  return responseText
    ? JSON.parse(responseText)
    : {};
};

// =====================================
// DELETE CALENDAR EVENT
// =====================================

export const deleteCalendarEvent = async (
  googleToken: string,
  eventId: string,
) => {
  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/primary/events/${encodeURIComponent(
      eventId,
    )}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${googleToken}`,
      },
    },
  );

  if (!response.ok) {
    const text = await response.text();

    let data: any = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = {
        raw: text,
      };
    }

    console.error(
      "Google Calendar delete error:",
      data,
    );

    throw new Error(
      data?.error?.message ||
        "Failed to delete calendar event",
    );
  }

  return true;
};