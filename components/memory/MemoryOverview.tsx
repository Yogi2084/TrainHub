"use client";

import { Memory } from "@/lib/api/memories";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ExternalLink, MoreHorizontal } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MemoryOverviewProps {
  memory: Memory;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

export function MemoryOverview({
  memory,
  isDeleting,
  onEdit,
  onDelete,
}: MemoryOverviewProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-4 w-full">
        <h1 className="text-2xl font-semibold">
          {memory.title ? memory.title : "Untitled Memory"}
        </h1>
        <div className="flex items-center gap-2">
          {memory.sourceUrl && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-accent cursor-pointer"
                    onClick={() => window.open(memory.sourceUrl, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="left" align="center">
                  <p>Open original article</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-accent cursor-pointer"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-2">
              <div className="flex flex-col gap-1">
                <Button
                  variant="ghost"
                  onClick={onEdit}
                  className="cursor-pointer justify-start gap-2 hover:bg-primary/10 hover:text-primary"
                >
                  <Pencil className="h-4 w-4" />
                  <span>Edit</span>
                </Button>
                <Button
                  variant="ghost"
                  onClick={onDelete}
                  disabled={isDeleting}
                  className="cursor-pointer justify-start gap-2 hover:bg-destructive/10 hover:text-destructive"
                >
                  {isDeleting ? (
                    <Spinner className="h-4 w-4" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  <span>Delete</span>
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="bg-card rounded-lg border p-6 w-full">
        <div className="prose max-w-none mb-6">
          <p className="whitespace-pre-wrap">{memory.content}</p>
        </div>
        {memory.tags && memory.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {memory.tags.map((tag: string) => (
              <span
                key={tag}
                className="px-3 py-1 text-sm rounded-full bg-primary/10 text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
