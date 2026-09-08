import { useEffect, useState } from "react";
import { Memory, updateMemory, deleteMemory } from "@/lib/api/memories";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRefreshStore } from "@/lib/stores/refreshStore";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Label } from "@radix-ui/react-label";
import Link from "next/link";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface MemoryCardProps {
  memory: Memory;
  onRefresh: () => void;
  highlight?: boolean;
}

export function MemoryCard({
  memory,
  onRefresh,
  highlight = false,
}: MemoryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(memory.title || "");
  const [content, setContent] = useState(memory.content);
  const [tags, setTags] = useState(memory.tags.join(", "));
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const triggerRefresh = useRefreshStore((state) => state.triggerRefresh);
  const truncatedContent =
    memory.content.length > 120
      ? `${memory.content.substring(0, 120)}...`
      : memory.content;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateMemory({
        memoryId: memory.id,
        title: title.trim() || undefined,
        content: content.trim(),
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });
      onRefresh();
      triggerRefresh();
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to update memory", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteMemory(memory.id);
      onRefresh();
      triggerRefresh();
    } catch (err) {
      console.error("Failed to delete memory", err);
    } finally {
      setIsDeleting(false);
      setShowDeleteAlert(false);
    }
  };

  useEffect(() => {
    if (!isEditing) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsEditing(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isEditing]);

  return (
    <div
      className={
        `p-4 rounded-lg border border-accent-foreground bg-card text-card-foreground shadow-sm space-y-2 relative group transition-all duration-500 ` +
        (highlight ? "ring-4 ring-violet-400 bg-violet-50" : "")
      }
    >
      {isEditing ? (
        <>
          <div className="flex flex-col gap-2">
            <div>
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Title"
                className="border-accent-foreground/50"
              />
            </div>
            <div>
              <Label>Content</Label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="resize-none border-accent-foreground/50 h-42"
              />
            </div>
            <div>
              <Label>Tags</Label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="tag1, tag2"
                className="border-accent-foreground/50"
              />
              <div className="flex flex-row justify-end mt-2 gap-2">
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      Save <Spinner className="h-4 w-4" />
                    </>
                  ) : (
                    "Save"
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="border-accent-foreground/50"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Top-right icons */}
          <div className="absolute top-2 right-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 transition-all hover:bg-primary/10 hover:text-primary hover:scale-105 hover:ring-1 hover:ring-primary/30 hover:cursor-pointer"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-40 p-2">
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditing(true);
                    }}
                    className="cursor-pointer justify-start gap-2 hover:bg-primary/10 hover:text-primary"
                  >
                    <Pencil className="h-4 w-4" />
                    <span>Edit</span>
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteAlert(true);
                    }}
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

            <AlertDialog
              open={showDeleteAlert}
              onOpenChange={setShowDeleteAlert}
            >
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your memory.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="cursor-pointer">
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive/80 text-background cursor-pointer hover:bg-destructive"
                  >
                    {isDeleting ? (
                      <>
                        Deleting... <Spinner className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      "Delete"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          <Link href={`/dashboard/my-memories/${memory.id}`} className="block">
            <div className="cursor-pointer">
              {memory.title && (
                <h3 className="text-lg font-semibold pr-10">{memory.title}</h3>
              )}
              <p className="text-sm text-foreground">{truncatedContent}</p>
            </div>
          </Link>

          <div className="flex flex-wrap gap-2">
            {memory.tags.map((tag) => (
              <span
                key={tag}
                className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
              >
                {tag}
              </span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(memory.createdAt), {
              addSuffix: true,
            })}
          </p>
        </>
      )}
    </div>
  );
}
