import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";

import { ensureUser } from "@/lib/ensureUser";
import { z } from "zod";
import { Sync } from "@/models/sync";
import { Record } from "@/models/record";
import { IntegrationAppClient } from "@membranehq/sdk";
import { createSyncActivity } from "@/lib/sync-activity-utils";
import appObjects from "@/lib/app-objects";
import { getElementKey } from "@/lib/element-key";
import { triggerPullRecords } from "@/inngest/trigger-pull-records";
import { RecordType } from "@/models/types";
import { AppObjectKey } from "@/lib/app-objects-schemas";

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
  /**
   * Data source & Field mapping instances are created on the client when the customer
   * tries to configure them. But this trys to  create them even if they don't exist.
   */

  // Data source
  await membrane
    .connection(integrationKey)
    .dataSource(getElementKey(recordType, "data-source"), {
      instanceKey: instanceKey,
    })
    .get({
      autoCreate: true,
    });

  // Field Mapping
  await membrane
    .connection(integrationKey)
    .fieldMapping(getElementKey(recordType, "field-mapping"), {
      instanceKey: instanceKey,
    })
    .get({
      autoCreate: true,
    });

  // Flow Instance
  await membrane
    .connection(integrationKey)
    .flow(getElementKey(recordType, "flow"), {
      instanceKey: instanceKey,
    })
    .get({
      autoCreate: true,
    });

  // Action Instances
  const { allowCreate, allowUpdate, allowDelete } =
    appObjects[recordType as AppObjectKey];

  await membrane
    .connection(integrationKey)
    .action(getElementKey(recordType, "list-action"), {
      instanceKey: instanceKey,
    })
    .create();

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

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const result = await ensureUser(request);

    // Check if ensureUser returned an error response
    if (result instanceof NextResponse) {
      return result;
    }

    const { id: dbUserId, membraneAccessToken } = result;

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

    await createSyncDependencies(
      membrane,
      integrationKey,
      recordType as RecordType,
      instanceKey
    );

    const datasource = await membrane
      .connection(integrationKey)
      .dataSource(getElementKey(recordType, "data-source"), {
        instanceKey: instanceKey,
      })
      .get();

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

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const result = await ensureUser(request);

    // Check if ensureUser returned an error response
    if (result instanceof NextResponse) {
      return result;
    }

    const { id: dbUserId } = result;

    if (!dbUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

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
