import { NextResponse, NextRequest } from "next/server";
import connectDB from "@/lib/mongodb";
import { ensureAuth, getUserData } from "@/lib/ensureAuth";
import { Sync } from "@/models/sync";
import { Record } from "@/models/record";
import { IntegrationAppClient } from "@membranehq/sdk";
import { ISync } from "@/models/types";
import { getElementKey } from "@/lib/element-key";

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

  const { integrationKey, instanceKey, appObjectKey } = sync;

  const archiveOperations = [
    {
      name: "Flow Instance",
      operation: () =>
        membrane
          .connection(integrationKey)
          .flow(getElementKey(appObjectKey, "flow"), {
            instanceKey: instanceKey,
          })
          .archive(),
    },
    {
      name: "Field Mapping Instance",
      operation: () =>
        membrane
          .connection(integrationKey)
          .fieldMapping(getElementKey(appObjectKey, "field-mapping"), {
            instanceKey: instanceKey,
          })
          .archive(),
    },
    {
      name: "Data Source",
      operation: () =>
        membrane
          .connection(integrationKey)
          .dataSource(getElementKey(appObjectKey, "data-source"))
          .archive(),
    },
    {
      name: "Action Instance",
      operation: () =>
        membrane
          .connection(integrationKey)
          .action(getElementKey(appObjectKey, "list-action"), {
            instanceKey: instanceKey,
          })
          .archive(),
    },
    {
      name: "Field Mapping",
      operation: () =>
        membrane
          .connection(integrationKey)
          .fieldMapping(getElementKey(appObjectKey, "field-mapping"), {
            instanceKey: instanceKey,
          })
          .archive(),
    },
  ];

  for (const { name, operation } of archiveOperations) {
    try {
      await operation();
      console.log(`Successfully archived ${name}`);
    } catch (error) {
      console.error(`Failed to archive ${name}:`, error);
    }
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    ensureAuth(request);

    const { user } = getUserData(request);

    const { id } = await params;

    const sync = await Sync.findOne({
      _id: id,
      userId: user.id,
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

    // Calculate record count for this sync
    const recordCount = await Record.countDocuments({
      syncId: id,
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      data: {
        sync: { ...sync, recordCount },
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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    ensureAuth(request);

    const { membraneAccessToken, user } = getUserData(request);

    const { id } = await params;
    const sync = await Sync.findOne({ _id: id, userId: user.id });
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
