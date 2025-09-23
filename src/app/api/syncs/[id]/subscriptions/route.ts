import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import { ensureUser } from "@/lib/ensureUser";
import { Sync } from "@/models/sync";
import {
  ExternalEventSubscription,
  IntegrationAppClient,
} from "@membranehq/sdk";
import { ISync } from "@/models/types";
import { getElementKey } from "@/lib/element-key";

async function getSubscriptionsForSync(
  sync: ISync,
  membraneAccessToken: string
) {
  try {
    const membrane = new IntegrationAppClient({
      token: membraneAccessToken!,
    });

    const flowInstance = await membrane
      .connection(sync.integrationKey)
      .flow(getElementKey(sync.appObjectKey, "flow"), {
        instanceKey: sync.instanceKey,
      })
      .get();

    const externalEventDependencies = flowInstance?.dependencies?.filter(
      (dependency) => dependency?.type === "external-event"
    );

    const subscriptions: {
      "data-record-created": ExternalEventSubscription | null;
      "data-record-updated": ExternalEventSubscription | null;
      "data-record-deleted": ExternalEventSubscription | null;
    } = {
      "data-record-created": null,
      "data-record-updated": null,
      "data-record-deleted": null,
    };

    if (externalEventDependencies) {
      for (const externalEventDependency of externalEventDependencies) {
        const externalEventSubscription = await membrane
          .externalEventSubscription(externalEventDependency.instanceId!)
          .get();

        const subscriptionType = externalEventSubscription.config?.type;

        if (subscriptionType) {
          subscriptions[subscriptionType as keyof typeof subscriptions] =
            externalEventSubscription;
        }
      }
    }

    return subscriptions;
  } catch (error) {
    console.error("Failed to fetch subscriptions for sync:", error);
    return {
      "data-record-created": null,
      "data-record-updated": null,
      "data-record-deleted": null,
    };
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const result = await ensureUser(request);

    if (result instanceof NextResponse) {
      return result;
    }

    const { id: dbUserId, membraneAccessToken } = result;
    if (!dbUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { id } = await params;

    const sync = await Sync.findOne({
      _id: id,
      userId: dbUserId,
    }).lean();

    if (!sync) {
      return NextResponse.json(
        { success: false, message: "Sync not found" },
        { status: 404 }
      );
    }

    const subscriptions = await getSubscriptionsForSync(
      sync,
      membraneAccessToken!
    );

    return NextResponse.json({
      success: true,
      data: subscriptions,
    });
  } catch (error) {
    console.error("Failed to fetch subscriptions:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch subscriptions" },
      { status: 500 }
    );
  }
}
