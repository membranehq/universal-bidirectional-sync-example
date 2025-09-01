import { User } from "lucide-react";
import type { IRecord } from "@/models/types";
import { RecordTypeWrapper } from "./RecordTypeWrapper";
import Image from "next/image";
import { userSchema } from "@/lib/record-type-config";
import { z } from "zod";

interface UserRecordProps {
  record: IRecord;
}

// Derive the type from the Zod schema
type UserData = z.infer<typeof userSchema>;

export function UserRecord({ record }: UserRecordProps) {
  const userData = record.data as Partial<UserData>;

  const userName = typeof userData?.fullName === 'string' ? userData.fullName : null;
  const userAvatar = typeof userData?.imageUrl === 'string' ? userData.imageUrl : null;

  return (
    <RecordTypeWrapper>
      <div className="flex items-center gap-2 min-w-0">
        {userAvatar ? (
          <div className="w-4 h-4 rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={userAvatar}
              alt={userName || "User avatar"}
              width={16}
              height={16}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to icon if image fails to load
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <User className="w-4 h-4 text-green-500 hidden" />
          </div>
        ) : (
          <User className="w-4 h-4 text-green-500 flex-shrink-0" />
        )}
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate">
            {userName || record.name || "Unknown User"}
          </span>
        </div>
      </div>
    </RecordTypeWrapper>
  );
}
