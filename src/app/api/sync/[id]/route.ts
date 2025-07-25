import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { ensureUser } from "@/lib/ensureUser";
import { Sync } from "@/models/sync";
import { Record } from "@/models/record";
import {
  ExternalEventSubscription,
  IntegrationAppClient,
} from "@integration-app/sdk";
import { ISync } from "@/models/types";

async function getSubscriptionsForSync(
  sync: ISync,
  membraneAccessToken: string
) {
  try {
    const membrane = new IntegrationAppClient({
      token: membraneAccessToken!,
    });

    const unpluralizedDataSourceKey = sync.dataSourceKey.replace(/s$/, "");

    const flowInstance = await membrane
      .connection(sync.integrationKey)
      .flow(`receive-${unpluralizedDataSourceKey}-events`, {
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
    return [];
  }
}

async function archiveSyncDependencies(
  sync: ISync,
  membraneAccessToken: string
) {
  const membrane = new IntegrationAppClient({
    token: membraneAccessToken!,
  });

  /**
   * Delete dependencies on membrane
   * - Flow Instance for receiving events
   * - Action Instance for listing records
   * - Field Mapping Instance
   * - Data Source Instance
   */
  const unpluralizedDataSourceKey = sync.dataSourceKey.replace(/s$/, "");

  const { integrationKey, instanceKey, dataSourceKey } = sync;

  await membrane
    .connection(integrationKey)
    .flow(`receive-${unpluralizedDataSourceKey}-events`, {
      instanceKey: instanceKey,
    })
    .archive();

  await membrane
    .connection(integrationKey)
    .action(`get-${dataSourceKey}`, { instanceKey: instanceKey })
    .archive();

  await membrane
    .connection(integrationKey)
    .fieldMapping(`${dataSourceKey}`, { instanceKey: instanceKey })
    .archive();

  await membrane.connection(integrationKey).dataSource(dataSourceKey).archive();

  await membrane
    .connection(integrationKey)
    .fieldMapping(dataSourceKey)
    .archive();
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { dbUserId, membraneAccessToken } = await ensureUser();
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

    // Calculate record count for this sync
    const recordCount = await Record.countDocuments({
      syncId: id,
      userId: dbUserId,
    });

    return NextResponse.json({
      success: true,
      data: {
        sync: { ...sync, recordCount },
        subscriptions,
      },
    });
  } catch (error) {
    console.error("Failed to fetch sync by id:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch sync" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { dbUserId, membraneAccessToken } = await ensureUser();

    if (!dbUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const { id } = await params;
    const sync = await Sync.findOne({ _id: id, userId: dbUserId });
    if (!sync) {
      return NextResponse.json(
        { success: false, message: "Sync not found" },
        { status: 404 }
      );
    }

    await archiveSyncDependencies(sync, membraneAccessToken!);

    await sync.deleteOne();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete sync:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete sync" },
      { status: 500 }
    );
  }
}
