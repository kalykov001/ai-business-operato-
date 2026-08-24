import { google } from "googleapis";

const createGmailClient = (providerToken: string) => {
  const auth = new google.auth.OAuth2();

  auth.setCredentials({
    access_token: providerToken,
  });

  return google.gmail({
    version: "v1",
    auth,
  });
};

export const getGmailMessagesService = async (
  providerToken: string,
  pageToken?: string,
) => {
  const gmail = createGmailClient(providerToken);

  const listResponse = await gmail.users.messages.list({
    userId: "me",
    maxResults: 20,
    ...(pageToken ? { pageToken } : {}),
  });

  const messages = listResponse.data.messages ?? [];

  const detailedMessages = await Promise.all(
    messages.map(async (message) => {
      if (!message.id) return null;

      const messageResponse = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
        format: "metadata",
        metadataHeaders: ["From", "Subject", "Date"],
      });

      const headers = messageResponse.data.payload?.headers ?? [];

      const getHeader = (name: string) =>
        headers.find(
          (header) =>
            header.name?.toLowerCase() === name.toLowerCase(),
        )?.value ?? "";

      return {
        id: messageResponse.data.id,
        threadId: messageResponse.data.threadId,
        from: getHeader("From"),
        subject: getHeader("Subject"),
        date: getHeader("Date"),
        snippet: messageResponse.data.snippet ?? "",
      };
    }),
  );

  return {
    messages: detailedMessages.filter(Boolean),
    nextPageToken: listResponse.data.nextPageToken ?? null,
  };
};

// =====================================
// SEARCH GMAIL
// =====================================

export const searchGmailMessagesService = async (
  providerToken: string,
  query: string,
) => {
  const gmail = createGmailClient(providerToken);

  const listResponse = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults: 20,
  });

  const messages = listResponse.data.messages ?? [];

  const detailedMessages = await Promise.all(
    messages.map(async (message) => {
      if (!message.id) return null;

      const messageResponse = await gmail.users.messages.get({
        userId: "me",
        id: message.id,
        format: "metadata",
        metadataHeaders: ["From", "Subject", "Date"],
      });

      const headers = messageResponse.data.payload?.headers ?? [];

      const getHeader = (name: string) =>
        headers.find(
          (header) =>
            header.name?.toLowerCase() === name.toLowerCase(),
        )?.value ?? "";

      return {
        id: messageResponse.data.id,
        threadId: messageResponse.data.threadId,
        from: getHeader("From"),
        subject: getHeader("Subject"),
        date: getHeader("Date"),
        snippet: messageResponse.data.snippet ?? "",
      };
    }),
  );

  return detailedMessages.filter(Boolean);
};