import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createMemory, createMemoryFromUrl } from "@/lib/api/memories";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnimatedContent } from "@/components/memory/AnimatedContent";
import { getMemories } from "@/lib/api/memories";

interface CreateMemoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (memoryId: string) => void;
}

export const CreateMemoryDialog = ({
  open,
  onOpenChange,
  onCreated,
}: CreateMemoryDialogProps) => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isUrlMode, setIsUrlMode] = useState(false);
  const [url, setUrl] = useState("");

  const handleCreateMemory = async () => {
    try {
      setError(null);
      setIsCreating(true);
      let newMemoryId = "";
      if (isUrlMode) {
        const result = await createMemoryFromUrl({ url: url.trim() });
        newMemoryId = result?.id;
        if (!newMemoryId) {
          const recent = await getMemories(1, 1);
          newMemoryId = recent.memories[0]?.id;
        }
      } else {
        const result = await createMemory({
          title: title.trim() || undefined,
          content: content.trim(),
          tags,
        });
        newMemoryId = result?.id;
        if (!newMemoryId) {
          const recent = await getMemories(1, 1);
          newMemoryId = recent.memories[0]?.id;
        }
      }
      await queryClient.invalidateQueries({ queryKey: ["memories"] });
      setTitle("");
      setContent("");
      setTags([]);
      setTagInput("");
      setUrl("");
      onOpenChange(false);
      if (onCreated && newMemoryId) onCreated(newMemoryId);
    } catch (error) {
      setError("Failed to create memory. Please try again.");
      console.error("Error creating memory:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleTagInput = (input: string) => {
    const newTags = input
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0 && !tags.includes(tag));
    if (newTags.length > 0) {
      setTags((prev) => [...prev, ...newTags]);
    }
    setTagInput("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Memory</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {error && <p className="text-sm text-red-500">{error}</p>}
          <Tabs
            defaultValue="manual"
            className="mb-4"
            onValueChange={(value) => setIsUrlMode(value === "url")}
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="url">From URL</TabsTrigger>
            </TabsList>
          </Tabs>
          <AnimatedContent
            isUrlMode={isUrlMode}
            url={url}
            setUrl={setUrl}
            title={title}
            setTitle={setTitle}
            content={content}
            setContent={setContent}
            tagInput={tagInput}
            setTagInput={setTagInput}
            handleTagInput={handleTagInput}
            handleCreateMemory={handleCreateMemory}
          />
          <Button
            onClick={handleCreateMemory}
            disabled={isCreating || (isUrlMode ? !url.trim() : !content.trim())}
            className="w-full"
          >
            {isCreating ? "Creating Memory..." : "Create Memory"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
