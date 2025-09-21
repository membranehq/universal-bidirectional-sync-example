import { IRecord } from "@/models/types";
import { AppObjectComponentWrapper } from "./app-object-wrapper";
import { AlertCircle } from "lucide-react";
import { tasksSchema } from "@/lib/app-objects-schemas";
import { z } from "zod";

interface TaskRecordProps {
  record: IRecord;
}


type TaskData = z.infer<typeof tasksSchema>;

export function TaskRecord({ record }: TaskRecordProps) {
  const taskData = record.data as Partial<TaskData>;

  const subject = typeof taskData?.subject === 'string' ? taskData.subject : null;
  const type = typeof taskData?.type === 'string' ? taskData.type : null;
  const status = typeof taskData?.status === 'string' ? taskData.status : null;
  const priority = typeof taskData?.priority === 'string' ? taskData.priority : null;
  const ownerId = typeof taskData?.ownerId === 'string' ? taskData.ownerId : null;

  return (
    <AppObjectComponentWrapper>
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-500 flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-xs sm:text-sm">
            {subject || "Unknown Task"}
          </span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {type && (
              <span>{type}</span>
            )}
            {status && (
              <span>• {status}</span>
            )}
            {priority && (
              <span>• {priority}</span>
            )}
            {ownerId && (
              <span>• {ownerId}</span>
            )}
          </div>
        </div>
      </div>
    </AppObjectComponentWrapper>
  );
}
