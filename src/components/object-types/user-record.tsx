import { User } from "lucide-react";
import { AppObjectComponentWrapper } from "./app-object-wrapper";
import Image from "next/image";
import { usersSchema } from "@/lib/app-objects-schemas";
import { z } from "zod";
import { IRecord } from "../../models/types";

interface UserRecordProps {
  record: IRecord;
}


type UserData = z.infer<typeof usersSchema>;

export function UserRecord({ record }: UserRecordProps) {
  const userData = record.data as Partial<UserData>;

  const userName = typeof userData?.fullName === 'string' ? userData.fullName : null;
  const userAvatar = typeof userData?.imageUrl === 'string' ? userData.imageUrl : null;

  return (
    <AppObjectComponentWrapper>
      <div className="flex items-center gap-1 sm:gap-2 min-w-0">
        {userAvatar ? (
          <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full overflow-hidden flex-shrink-0">
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
            <User className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 hidden" />
          </div>
        ) : (
          <User className="w-3 h-3 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
        )}
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium truncate text-xs sm:text-sm">
            {userName || "Unknown User"}
          </span>
        </div>
      </div>
    </AppObjectComponentWrapper>
  );
}
