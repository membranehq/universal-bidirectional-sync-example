import React from "react";
import { Document } from "@/models/document";
import { FileIcon, FolderIcon, ExternalLinkIcon, DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DownloadStateDisplay } from "./DownloadState";
import { useAuth } from "@clerk/nextjs";

interface KnowledgeItemProps {
  document: Document;
  integrationName: string;
  onItemClick?: () => void;
  onDocumentsChange?: () => void;
}

export function KnowledgeItem({ document, integrationName, onItemClick, onDocumentsChange }: KnowledgeItemProps) {
  const isFolder = document.canHaveChildren;
  const { getToken } = useAuth();

  const handleOpenExternal = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (document.url) {
      window.open(document.url, '_blank');
    }
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // If document has a URL, download directly
    if (document.url) {
      window.open(`/api/documents/${document.id}/download`, '_blank');
      return;
    }

    // If document has no URL but can download, trigger the flow
    if (document.canDownload && !document.url) {
      try {
        const token = await getToken();
        const response = await fetch(`/api/documents/${document.id}/trigger-download`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to trigger download');
        }

        // Refresh documents to show updated download state
        if (onDocumentsChange) {
          onDocumentsChange();
        }
      } catch (error) {
        console.error('Error triggering download:', error);
        alert('Failed to start download. Please try again.');
      }
    }
  };

  return (
    <div
      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer group transition-all duration-200 ease-in-out border border-transparent hover:border-gray-200"
      onClick={onItemClick}
    >
      {isFolder ? (
        <FolderIcon className="h-5 w-5 text-blue-500 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
      ) : (
        <FileIcon className="h-5 w-5 text-gray-500 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
      )}

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate text-gray-700 group-hover:text-gray-900 transition-colors duration-150">
          {document.title}
        </div>
        <div className="text-xs text-gray-500 truncate">
          {integrationName}
        </div>
      </div>

      {/* Show download state if document has one */}
      {!isFolder && document.downloadState && (
        <div className="mr-2">
          <DownloadStateDisplay state={document.downloadState} />
        </div>
      )}

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
        {!isFolder && document.url && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleOpenExternal}
            className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150"
            title="Open external link"
          >
            <ExternalLinkIcon className="h-3.5 w-3.5" />
          </Button>
        )}
        {!isFolder && document.canDownload && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="h-7 w-7 p-0 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-150"
            title="Download document"
          >
            <DownloadIcon className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
} 