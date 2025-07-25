import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createDocument } from "@/lib/document-utils";
import { PlusIcon } from "lucide-react";

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId?: string;
  onFolderCreated: () => void;
  appKey: string;
}

export function CreateFolderDialog({
  open,
  onOpenChange,
  parentId,
  onFolderCreated,
  appKey,
}: CreateFolderDialogProps) {
  const [folderName, setFolderName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      setError("Folder name is required");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      await createDocument({
        title: folderName.trim(),
        parentId: parentId || undefined,
        appKey,
        canHaveChildren: true,
        canDownload: false,
      });

      setFolderName("");
      onFolderCreated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating folder:", error);
      setError(error instanceof Error ? error.message : "Failed to create folder");
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setFolderName("");
      setError(null);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusIcon className="h-5 w-5" />
            Create New Folder
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name..."
              className="py-2"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isCreating) {
                  handleCreateFolder();
                }
              }}
              autoFocus
            />
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>
        </div>
        <DialogFooter className="mt-3">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isCreating}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateFolder}
            disabled={isCreating || !folderName.trim()}
          >
            {isCreating ? "Creating..." : "Create Folder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 