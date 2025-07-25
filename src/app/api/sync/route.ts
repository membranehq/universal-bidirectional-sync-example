import { NextResponse } from "next/server";
import { generateCustomerAccessToken } from "@/lib/integration-token";
import connectDB from "@/lib/mongodb";
import { syncRecords } from "./sync-records";

import { ensureUser } from "@/lib/ensureUser";
import { z } from "zod";
import { Sync } from "@/models/sync";
import { Record } from "@/models/record";
import { IntegrationAppClient } from "@integration-app/sdk";

const schema = z.object({
  integrationKey: z.string(),
  dataSourceKey: z.string(),

  /**
   * Instance key of elements: dataSource, fieldMapping
   */
  instanceKey: z.string(),
});

export async function POST(
  request: Request
): Promise<NextResponse<{ success: boolean }>> {
  try {
    await connectDB();

    const { dbUserId, fullName } = await ensureUser();

    if (!dbUserId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const token = await generateCustomerAccessToken({
      id: dbUserId,
      name: fullName || `$user-${dbUserId}`,
    });

    const requestBody = schema.safeParse(await request.json());

    if (!requestBody.success) {
      return NextResponse.json(
        { success: false, message: "Invalid request body" },
        { status: 400 }
      );
    }

    const { integrationKey, dataSourceKey, instanceKey } = requestBody.data;

    const membrane = new IntegrationAppClient({
      token,
    });

    /**
     * Create other instances using the instanceKey from the client
     * Before now, we created fieldMapping and dataSource instances on the client
     * and allowed users user to configure them.
     *
     * Now, we'll create other instances using the instanceKey from the client:
     * - Action Instance for listing records should be in get-<data-source-key> format
     * - Flow Instance for receiving events should be in receive-<unpluralized-data-source-key>-events format
     */

    const unpluralizedDataSourceKey = dataSourceKey.replace(/s$/, "");

    await membrane
      .connection(integrationKey)
      .flow(`receive-${unpluralizedDataSourceKey}-events`, {
        instanceKey: instanceKey,
      })
      .get({
        autoCreate: true,
      });

    const action = await membrane
      .connection(integrationKey)
      .action(`get-${dataSourceKey}`, { instanceKey: instanceKey })
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
      userId: dbUserId,
      collectionEventDetails,
      instanceKey,
      syncCount: 0,
    });

    // Respond early after creating the sync
    const response = NextResponse.json({ success: true, data: sync });

    // Fire-and-forget syncRecords
    syncRecords({
      token,
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
