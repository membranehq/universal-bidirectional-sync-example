"use client";

import { JsonRenderer } from "./json-renderer";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface JsonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: object;
  title: string;
}

export function JsonModal({
  open,
  onOpenChange,
  data,
  title,
}: JsonModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto">
          <JsonRenderer
            data={data}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
