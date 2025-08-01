import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { syncRecords } from "./sync-records";

import { ensureUser } from "@/lib/ensureUser";
import { z } from "zod";
import { Sync } from "@/models/sync";
import { Record } from "@/models/record";
import { IntegrationAppClient } from "@integration-app/sdk";
import { createSyncActivity } from "@/lib/sync-activity-utils";
import { getSingularForm } from "@/lib/pluralize-utils";

const schema = z.object({
  integrationKey: z.string(),
  dataSourceKey: z.string(),
  instanceKey: z.string(),
});

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

    const { integrationKey, dataSourceKey, instanceKey } = requestBody.data;

    const membrane = new IntegrationAppClient({
      token: membraneAccessToken!,
    });

    /**
     * Create other instances using the instanceKey from the client
     * Before now, we created fieldMapping and dataSource instances on the client
     * and allowed users user to configure them.
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

    const unpluralizedDataSourceKey = getSingularForm(dataSourceKey);

    // Create flow instance for receiving events
    await membrane
      .connection(integrationKey)
      .flow(`receive-${unpluralizedDataSourceKey}-events`, {
        instanceKey: instanceKey,
      })
      .get({
        autoCreate: true,
      });

    // Create action instance for listing records
    const action = await membrane
      .connection(integrationKey)
      .action(`get-${dataSourceKey}`, { instanceKey: instanceKey })
      .get({
        autoCreate: true,
      });

    // Create action instance for creating records
    // await membrane
    //   .connection(integrationKey)
    //   .action(`create-${unpluralizedDataSourceKey}`, {
    //     instanceKey: instanceKey,
    //   })
    //   .get({
    //     autoCreate: true,
    //   });

    // // Create action instance for updating records
    // await membrane
    //   .connection(integrationKey)
    //   .action(`update-${unpluralizedDataSourceKey}`, {
    //     instanceKey: instanceKey,
    //   })
    //   .get({
    //     autoCreate: true,
    //   });

    // Create action instance for deleting records
    await membrane
      .connection(integrationKey)
      .action(`delete-${unpluralizedDataSourceKey}`, {
        instanceKey: instanceKey,
      })
      .get({
        autoCreate: true,
      });

    /**
     * Get some details about how the collection handles events in dataSource.collectionSpec
     */
    const datasource = await membrane
      .connection(integrationKey)
      .dataSource(dataSourceKey, {
        instanceKey: instanceKey,
      })
      .get();

    const collectionEventDetails = (
      (await datasource) as unknown as {
        collectionSpec: {
          events: {
            created: {
              type: string;
              isFullScan: boolean;
            };
            updated: {
              type: string;
              isFullScan: boolean;
            };
            deleted: {
              type: string;
              isFullScan: boolean;
            };
          };
        };
      }
    ).collectionSpec.events;

    const sync = await Sync.create({
      integrationKey,
      dataSourceKey,
      instanceKey,

      userId: dbUserId,
      collectionEventDetails,
      syncCount: 0,

      /**
       * Other useful info to have, so you don't have to fetch it all the time
       */
      integrationName: datasource.integration?.name,
      integrationLogoUri: datasource.integration?.logoUri,
    });

    // Track sync creation activity
    await createSyncActivity({
      syncId: sync._id.toString(),
      userId: dbUserId,
      type: "sync_created",
      metadata: {
        integrationName: datasource.integration?.name,
        dataSourceKey,
        instanceKey,
      },
    });

    // Respond early after creating the sync
    const response = NextResponse.json({ success: true, data: sync });

    // Fire-and-forget syncRecords
    syncRecords({
      token: membraneAccessToken!,
      userId: dbUserId,
      integrationKey,
      actionId: action.id,
      syncId: sync._id.toString(),
    }).catch((err) => {
      console.error("syncRecords failed:", err);
    });

    return response;
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
