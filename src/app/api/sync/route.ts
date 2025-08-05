import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";

import { ensureUser } from "@/lib/ensureUser";
import { z } from "zod";
import { Sync } from "@/models/sync";
import { Record } from "@/models/record";
import { IntegrationAppClient } from "@integration-app/sdk";
import { createSyncActivity } from "@/lib/sync-activity-utils";
import recordTypesConfig, { getElementKey } from "@/lib/record-type-config";
import { triggerPullRecords } from "@/inngest/trigger-pull-records";
import { RecordType } from "@/models/types";

const schema = z.object({
  integrationKey: z.string(),
  recordType: z.string(),
  instanceKey: z.string(),
});

/**
 * Create other instances using the instanceKey from the client
 *  Field mapping & datasource have been created on the client
 *
 * Now, we'll create other instances using the instanceKey from the client:
 * - Action Instances for
 *   - listing records
 *   - creating records
 *   - deleting records
 *   - updating records
 *
 * - Flow Instance for receiving events
 */

async function createSyncDependencies(
  membrane: IntegrationAppClient,
  integrationKey: string,
  recordType: RecordType,
  instanceKey: string
) {
  await membrane
    .connection(integrationKey)
    .flow(getElementKey(recordType, "flow"), {
      instanceKey: instanceKey,
    })
    .get({
      autoCreate: true,
    });

  await membrane
    .connection(integrationKey)
    .action(getElementKey(recordType, "list-action"), {
      instanceKey: instanceKey,
    })
    .create();

  const { allowCreate, allowUpdate, allowDelete } =
    recordTypesConfig[recordType];

  if (allowCreate) {
    await membrane
      .connection(integrationKey)
      .action(getElementKey(recordType, "create-action"), {
        instanceKey: instanceKey,
      })
      .create();
  }

  if (allowUpdate) {
    await membrane
      .connection(integrationKey)
      .action(getElementKey(recordType, "update-action"), {
        instanceKey: instanceKey,
      })
      .create();
  }

  if (allowDelete) {
    await membrane
      .connection(integrationKey)
      .action(getElementKey(recordType, "delete-action"), {
        instanceKey: instanceKey,
      })
      .create();
  }
}

export async function POST(
  request: Request
): Promise<NextResponse<{ success: boolean }>> {
  try {
    await connectDB();

    const { dbUserId, membraneAccessToken } = await ensureUser();

    if (!dbUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const requestBody = schema.safeParse(await request.json());

    if (!requestBody.success) {
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 }
      );
    }

    const { integrationKey, recordType, instanceKey } = requestBody.data;

    const membrane = new IntegrationAppClient({
      token: membraneAccessToken!,
    });

    /**
     * Get some details about how the collection handles events in dataSource.collectionSpec
     */
    const datasource = await membrane
      .connection(integrationKey)
      .dataSource(getElementKey(recordType, "data-source"), {
        instanceKey: instanceKey,
      })
      .get();

    await createSyncDependencies(
      membrane,
      integrationKey,
      recordType as RecordType,
      instanceKey
    );

    const sync = await Sync.create({
      integrationKey,
      recordType,
      instanceKey,
      userId: dbUserId,
      integrationName: datasource.integration?.name,
      integrationLogoUri: datasource.integration?.logoUri,
    });

    await createSyncActivity({
      syncId: sync._id.toString(),
      userId: dbUserId,
      type: "sync_created",
      metadata: {
        integrationName: datasource.integration?.name,
        recordType,
        instanceKey,
      },
    });

    await triggerPullRecords({
      userId: dbUserId,
      token: membraneAccessToken!,
      integrationKey: sync.integrationKey,
      actionKey: getElementKey(sync.recordType, "list-action"),
      syncId: sync._id.toString(),
    });

    return NextResponse.json({ success: true, data: sync });
  } catch (error) {
    console.error("Failed to start sync:", error);
    return NextResponse.json(
      { success: false, message: "Failed to start sync" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await connectDB();

    const { dbUserId } = await ensureUser();

    if (!dbUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await connectDB();

    const syncs = await Sync.find({ userId: dbUserId })
      .sort({ createdAt: -1 })
      .lean();

    // Efficiently get record counts for all syncs in one query
    const syncIds = syncs.map((sync) => sync._id.toString());
    const recordCounts = await Record.aggregate([
      { $match: { syncId: { $in: syncIds }, userId: dbUserId } },
      { $group: { _id: "$syncId", count: { $sum: 1 } } },
    ]);
    const recordCountMap = Object.fromEntries(
      recordCounts.map((rc) => [rc._id, rc.count])
    );

    const syncsWithCount = syncs.map((sync) => ({
      ...sync,
      recordCount: recordCountMap[sync._id.toString()] || 0,
    }));

    return NextResponse.json({ success: true, data: syncsWithCount });
  } catch (error) {
    console.error("Failed to fetch syncs:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch syncs" },
      { status: 500 }
    );
  }
}
