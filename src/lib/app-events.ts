import axios from "axios";

const BASE_URL = "https://api.integration.app/webhooks/app-events";

const APP_EVENT_ID_FILE_CREATED = "88bcf3c1-4272-4d2a-b185-e1c365da4eff";

export async function onFileCreated(eventBody: {
  id: string;
  title: string;
  url?: string;
  userId: string;
  folderId: string | null;
  type: "file" | "folder";
}) {
  const { id, title, url, userId, folderId, type } = eventBody;

  console.log("Firing event: file-created", eventBody);

  const response = await axios.post(
    `${BASE_URL}/${APP_EVENT_ID_FILE_CREATED}`,
    {
      id,
      title,
      url,
      userId,
      folderId,
      type,
    }
  );

  return response.data;
}
