import { FolderOpen } from "lucide-react";
import { AppObjectComponentWrapper } from "./app-object-wrapper";
import { projectsSchema } from "@/lib/app-objects-schemas";
import { z } from "zod";
import { IRecord } from "../../models/types";

interface ProjectRecordProps {
  record: IRecord;
}

type ProjectData = z.infer<typeof projectsSchema>;

export function ProjectRecord({ record }: ProjectRecordProps) {
  const projectData = record.data as Partial<ProjectData>;

  const projectName = typeof projectData?.name === 'string' ? projectData.name : null;

  return (
    <AppObjectComponentWrapper>
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        <FolderOpen className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-500 flex-shrink-0" />
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-xs sm:text-sm">
            {projectName || "Unknown Project"}
          </span>
        </div>
      </div>
    </AppObjectComponentWrapper>
  );
}
