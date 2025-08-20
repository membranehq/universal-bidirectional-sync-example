import { generateAdminAccessToken } from "./integration-token";

const INTEGRATION_APP_API_BASE = "https://api.integration.app";

export class IntegrationAppClient {
  private async getAuthHeaders(): Promise<HeadersInit> {
    const token = await generateAdminAccessToken();
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  async triggerPullEvents(subscriptionId: string): Promise<void> {
    const headers = await this.getAuthHeaders();

    const response = await fetch(
      `${INTEGRATION_APP_API_BASE}/external-event-subscriptions/${subscriptionId}/pull-events`,
      {
        method: "POST",
        headers,
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `Failed to trigger pull events: ${response.status}`
      );
    }
  }
}

export const integrationAppClient = new IntegrationAppClient();
