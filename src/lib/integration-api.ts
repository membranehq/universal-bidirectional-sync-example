import { useAuth } from "@clerk/nextjs";

export async function startSync(integrationKey: string) {
  const { getToken } = useAuth();
  const token = await getToken();
  const response = await fetch(`/api/integrations/${integrationKey}/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to start sync");
  }

  return response.json();
}
