import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createDocument } from "@/lib/document-utils";
import { UploadIcon, FileIcon, Loader2Icon } from "lucide-react";

interface UploadFileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId?: string;
  onFileUploaded: () => void;
  appKey: string;
}

export function UploadFileDialog({
  open,
  onOpenChange,
  parentId,
  onFileUploaded,
  appKey,
}: UploadFileDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file");
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      await createDocument({
        title: selectedFile.name,
        parentId: parentId || undefined,
        appKey,
        canHaveChildren: false,
        canDownload: true,
        file: selectedFile,
      });

      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onFileUploaded();
      onOpenChange(false);
    } catch (error) {
      console.error("Error uploading file:", error);
      setError(error instanceof Error ? error.message : "Failed to upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedFile(null);
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UploadIcon className="h-5 w-5" />
            Upload File
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload">Select File</Label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
              <input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept="*/*"
                title="Select a file to upload"
              />
              <div className="space-y-2">
                <FileIcon className="h-8 w-8 text-gray-400 mx-auto" />
                <p className="text-sm text-gray-600">
                  {selectedFile ? (
                    <span className="font-medium text-gray-900">{selectedFile.name}</span>
                  ) : (
                    <>
                      Click to select a file or drag and drop
                      <br />
                      <span className="text-xs">Any file type supported</span>
                    </>
                  )}
                </p>
                {!selectedFile && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose File
                  </Button>
                )}
              </div>
            </div>
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
          </div>
        </div>
        <DialogFooter className="mt-3">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            disabled={isUploading || !selectedFile}
          >
            {isUploading ? (
              <>
                <Loader2Icon className="h-4 w-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              "Upload File"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 