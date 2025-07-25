export const DownloadState = {
  FLOW_TRIGGERED: "FLOW_TRIGGERED",
  DOWNLOADING_FROM_URL: "DOWNLOADING_FROM_URL",
  DONE: "DONE",
  FAILED: "FAILED",
} as const;

export type DownloadStateType =
  (typeof DownloadState)[keyof typeof DownloadState];

export const ExternalSyncStatus = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
} as const;

export type ExternalSyncStatusType =
  (typeof ExternalSyncStatus)[keyof typeof ExternalSyncStatus];
