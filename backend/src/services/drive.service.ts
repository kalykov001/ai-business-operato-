import { google } from "googleapis";

export const getDriveFilesService = async (
  googleToken: string
) => {
  const auth = new google.auth.OAuth2();

  auth.setCredentials({
    access_token: googleToken,
  });

  const drive = google.drive({
    version: "v3",
    auth,
  });

  const response = await drive.files.list({
    pageSize: 20,
    fields:
      "files(id,name,mimeType,webViewLink,modifiedTime,size,iconLink)",
    orderBy: "modifiedTime desc",
  });

  return response.data.files ?? [];
};