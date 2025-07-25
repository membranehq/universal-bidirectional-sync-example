"use client";

import { useState } from "react";
import { useClerkAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

export function AuthTest() {
  const { userId, user } = useClerkAuth();
  const [nameInput, setNameInput] = useState("");

  return (
    <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg space-y-4">
      <div>
        <h2 className="text-lg font-semibold mb-2">Test User</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-4">
          This app now uses Clerk for authentication. Your Clerk user ID and name will be used for API calls.
        </p>
        <p className="font-mono text-sm">User ID: {userId || "Loading..."}</p>
        <p>Name: {user?.fullName || user?.username || "Not set"}</p>
      </div>
    </div>
  );
}
