"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Save, X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";

interface MemoryEditFormProps {
  title: string;
  content: string;
  tags: string;
  isSaving: boolean;
  onTitleChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onTagsChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function MemoryEditForm({
  title,
  content,
  tags,
  isSaving,
  onTitleChange,
  onContentChange,
  onTagsChange,
  onSave,
  onCancel,
}: MemoryEditFormProps) {
  return (
    <div className="space-y-6 w-full">
      <div className="space-y-2">
        <label className="text-sm font-medium">Title</label>
        <Input
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Add a title (optional)"
          className="text-lg"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Content</label>
        <Textarea
          value={content}
          onChange={(e) => onContentChange(e.target.value)}
          className="min-h-[300px] resize-none"
          placeholder="Write your memory here..."
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Tags</label>
        <Input
          value={tags}
          onChange={(e) => onTagsChange(e.target.value)}
          placeholder="Add tags separated by commas"
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={onCancel}
          className="gap-2 cursor-pointer"
        >
          <X className="h-4 w-4" />
          Cancel
        </Button>
        <Button
          onClick={onSave}
          disabled={isSaving}
          className="gap-2 cursor-pointer"
        >
          {isSaving ? (
            <>
              <Spinner className="h-4 w-4" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
