import { Memory } from "@/lib/api/memories";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

interface MemoryDialogProps {
  memory: Memory;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function MemoryDialog({
  memory,
  open,
  onOpenChange,
  onMouseEnter,
  onMouseLeave,
}: MemoryDialogProps) {
  const router = useRouter();

  const handleViewFull = () => {
    onOpenChange(false);
    router.push(`/dashboard/my-memories/${memory.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[600px] max-h-[80vh] flex flex-col"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onMaximize={handleViewFull}
      >
        <DialogHeader className="flex flex-row items-center gap-2">
          <div className="flex items-center gap-2">
            <DialogTitle>{memory.title || "Untitled Memory"}</DialogTitle>
          </div>
        </DialogHeader>

        {/* Scrollable content only */}
        <div className="overflow-y-auto scrollbar-styled flex-1 border border-accent-foreground rounded-lg">
          <p className="whitespace-pre-wrap mb-4 text-justify p-4">
            {memory.content}
          </p>
        </div>

        {/* Tags below content but outside scroll */}
        <div className="flex flex-wrap gap-2 mt-4 mb-2">
          {memory.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-[13px] rounded-full bg-accent-foreground/10 text-accent-foreground"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Created date outside scroll */}
        <p className="text-sm text-muted-foreground">
          Created{" "}
          {formatDistanceToNow(new Date(memory.createdAt), {
            addSuffix: true,
          })}
        </p>
      </DialogContent>
    </Dialog>
  );
}
