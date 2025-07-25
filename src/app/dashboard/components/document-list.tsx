import React from "react";
import { Document } from "@/models/document";
import { Button } from "@/components/ui/button";
import { FileIcon, ExternalLinkIcon, FolderIcon, ChevronRightIcon, ChevronDownIcon, PlusIcon, DownloadIcon } from "lucide-react";
import { CreateFolderDialog } from "./create-folder-dialog";
import { UploadFileDialog } from "./upload-file-dialog";
import { DownloadStateDisplay } from "./DownloadState";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import useDownloader from "react-use-downloader";

interface DocumentListProps {
  appKey: string
  documents: Document[];
  onDocumentsChange?: () => void;
}

interface TreeNode {
  document: Document;
  children: TreeNode[];
  level: number;
}

export function DocumentList({ documents, onDocumentsChange, appKey }: DocumentListProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [uploadFileDialogOpen, setUploadFileDialogOpen] = useState(false);
  const [selectedParentId, setSelectedParentId] = useState<string | undefined>(undefined);
  const { download } = useDownloader();
  const { getToken } = useAuth();

  // Reset dialog states when they close
  useEffect(() => {
    if (!createFolderDialogOpen) {
      setSelectedParentId(undefined);
    }
  }, [createFolderDialogOpen]);

  useEffect(() => {
    if (!uploadFileDialogOpen) {
      setSelectedParentId(undefined);
    }
  }, [uploadFileDialogOpen]);

  // Cleanup effect to ensure pointer events are restored
  useEffect(() => {
    return () => {
      document.body.style.pointerEvents = 'auto';
    };
  }, []);

  const handleOpenExternal = (url: string) => {
    window.open(url, '_blank');
  };

  const handleDownload = async (document: Document) => {
    // If document has a URL, download directly using react-use-downloader
    if (document.url) {
      try {
        const filename = document.title.includes('.') ? document.title : document.title;
        download(document.url, filename);
      } catch (error) {
        console.error('Error downloading document:', error);
        alert('Failed to download document. Please try again.');
      }
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

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateFolder = (parentId?: string) => {
    setSelectedParentId(parentId);
    setCreateFolderDialogOpen(true);
  };

  const handleUploadFile = (parentId?: string) => {
    setSelectedParentId(parentId);
    setUploadFileDialogOpen(true);
  };

  const handleFolderCreated = () => {
    if (onDocumentsChange) {
      onDocumentsChange();
    }
  };

  const handleFileUploaded = () => {
    if (onDocumentsChange) {
      onDocumentsChange();
    }
  };

  const handleCreateFolderDialogChange = (open: boolean) => {
    setCreateFolderDialogOpen(open);
    if (!open) {
      // Ensure the UI is clickable after dialog closes
      setTimeout(() => {
        // Remove any potential focus trap
        document.body.style.pointerEvents = 'auto';
        // Focus back to the document list
        const documentList = document.querySelector('[data-document-list]');
        if (documentList) {
          (documentList as HTMLElement).focus();
        }
      }, 100);
    }
  };

  const handleUploadFileDialogChange = (open: boolean) => {
    setUploadFileDialogOpen(open);
    if (!open) {
      // Ensure the UI is clickable after dialog closes
      setTimeout(() => {
        // Remove any potential focus trap
        document.body.style.pointerEvents = 'auto';
        // Focus back to the document list
        const documentList = document.querySelector('[data-document-list]');
        if (documentList) {
          (documentList as HTMLElement).focus();
        }
      }, 100);
    }
  };

  // Build tree structure from flat document list
  const buildTree = (docs: Document[]): TreeNode[] => {
    const docMap = new Map<string, TreeNode>();
    const roots: TreeNode[] = [];

    // Create nodes for all documents
    docs.forEach(doc => {
      docMap.set(doc.id, {
        document: doc,
        children: [],
        level: 0
      });
    });

    // Build parent-child relationships
    docs.forEach(doc => {
      const node = docMap.get(doc.id)!;
      if (doc.parentId && docMap.has(doc.parentId)) {
        const parent = docMap.get(doc.parentId)!;
        parent.children.push(node);
        node.level = parent.level + 1;
      } else {
        roots.push(node);
      }
    });

    // Sort function to put folders first, then alphabetically
    const sortNodes = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.sort((a, b) => {
        // First, sort by type: folders first, then files
        if (a.document.canHaveChildren && !b.document.canHaveChildren) {
          return -1;
        }
        if (!a.document.canHaveChildren && b.document.canHaveChildren) {
          return 1;
        }
        // If both are the same type, sort alphabetically by title
        return a.document.title.localeCompare(b.document.title);
      });
    };

    // Sort root nodes
    const sortedRoots = sortNodes(roots);

    // Recursively sort children of each node
    const sortChildrenRecursively = (nodes: TreeNode[]) => {
      nodes.forEach(node => {
        if (node.children.length > 0) {
          node.children = sortNodes(node.children);
          sortChildrenRecursively(node.children);
        }
      });
    };

    sortChildrenRecursively(sortedRoots);

    return sortedRoots;
  };

  const renderTreeNode = (node: TreeNode): React.ReactElement => {
    const { document, children, level } = node;
    const isFolder = document.canHaveChildren;
    const isExpanded = expandedFolders.has(document.id);
    const hasChildren = children.length > 0;

    return (
      <div key={document.id} className="w-full">
        <div
          className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg cursor-pointer group transition-all duration-200 ease-in-out border border-transparent hover:border-gray-200"
          style={{ paddingLeft: `${level * 20 + 12}px` }}
        >
          {isFolder && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(document.id);
              }}
              className="p-1 hover:bg-gray-200 rounded-md transition-colors duration-150"
            >
              {isExpanded ? (
                <ChevronDownIcon className="h-4 w-4 text-gray-600" />
              ) : (
                <ChevronRightIcon className="h-4 w-4 text-gray-600" />
              )}
            </button>
          )}
          {isFolder ? (
            <FolderIcon className="h-5 w-5 text-blue-500 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
          ) : (
            <FileIcon className="h-5 w-5 text-gray-500 flex-shrink-0 transition-transform duration-200 group-hover:scale-110" />
          )}
          <span className="text-sm font-medium truncate flex-1 text-gray-700 group-hover:text-gray-900 transition-colors duration-150">{document.title}</span>

          {/* Show download state if document has one */}
          {!isFolder && document.downloadState && (
            <div className="mr-2">
              <DownloadStateDisplay state={document.downloadState} />
            </div>
          )}

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-x-2 group-hover:translate-x-0">
            {isFolder && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                    className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150"
                    title="Create new item"
                  >
                    <PlusIcon className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCreateFolder(document.id);
                    }}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <FolderIcon className="h-4 w-4" />
                    New Folder
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUploadFile(document.id);
                    }}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <FileIcon className="h-4 w-4" />
                    Upload File
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            {!isFolder && document.url && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenExternal(document.resourceURI!);
                }}
                className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150"
              >
                <ExternalLinkIcon className="h-3.5 w-3.5" />
              </Button>
            )}
            {!isFolder && document.canDownload && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(document);
                }}
                className="h-7 w-7 p-0 hover:bg-purple-50 hover:text-purple-600 transition-colors duration-150"
                title="Download document"
              >
                <DownloadIcon className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        {/* Render children if folder is expanded */}
        {isFolder && isExpanded && hasChildren && (
          <div className="mt-1">
            {children.map(child => renderTreeNode(child))}
          </div>
        )}
      </div>
    );
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-16">
        <FileIcon className="h-16 w-16 text-gray-300 mx-auto mb-6" />
        <h3 className="text-xl font-semibold text-gray-700 mb-3">No documents found</h3>
        <p className="text-gray-500 text-lg">Connect an integration to start syncing documents.</p>
      </div>
    );
  }

  const treeData = buildTree(documents);

  return (
    <div className="w-full space-y-1 p-2" data-document-list tabIndex={-1}>
      <div className="flex justify-end items-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              Create
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem
              onClick={() => handleCreateFolder()}
              className="flex items-center gap-2 cursor-pointer"
            >
              <FolderIcon className="h-4 w-4" />
              New Folder
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => handleUploadFile()}
              className="flex items-center gap-2 cursor-pointer"
            >
              <FileIcon className="h-4 w-4" />
              Upload File
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {treeData.map(node => renderTreeNode(node))}

      <CreateFolderDialog
        open={createFolderDialogOpen}
        onOpenChange={handleCreateFolderDialogChange}
        parentId={selectedParentId}
        onFolderCreated={handleFolderCreated}
        appKey={appKey}
      />

      <UploadFileDialog
        open={uploadFileDialogOpen}
        onOpenChange={handleUploadFileDialogChange}
        parentId={selectedParentId}
        onFileUploaded={handleFileUploaded}
        appKey={appKey}
      />
    </div>
  );
} 