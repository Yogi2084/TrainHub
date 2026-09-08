"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getMemoryById,
  updateMemory,
  deleteMemory,
  Memory,
} from "@/lib/api/memories";
import { useParams, useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MemoryOverview } from "@/components/memory/MemoryOverview";
import { MemoryEditForm } from "@/components/memory/MemoryEditForm";
import { MemoryChat } from "@/components/memory/MemoryChat";
import { PageTransition } from "@/components/ui/page-transition";

export default function MemoryPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const memoryId = params.id as string;
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeView, setActiveView] = useState<"overview" | "chat">("overview");

  const handleBack = () => {
    if (document.referrer && document.referrer.includes("/dashboard/chat/")) {
      router.back();
    } else {
      router.push("/dashboard/my-memories");
    }
  };

  const {
    data: memory,
    isLoading,
    error,
  } = useQuery<Memory>({
    queryKey: ["memory", memoryId],
    queryFn: () => getMemoryById(memoryId),
  });

  useEffect(() => {
    if (memory) {
      setTitle(memory.title || "");
      setContent(memory.content);
      setTags(memory.tags.join(", "));
    }
  }, [memory]);

  const handleSave = async () => {
    if (!memory) return;

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

      await queryClient.invalidateQueries({ queryKey: ["memory", memoryId] });
      setIsEditing(false);
      toast.success("Memory updated successfully");
    } catch (err) {
      console.error("Failed to update memory", err);
      toast.error("Failed to update memory");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!memory) return;

    setIsDeleting(true);
    try {
      await deleteMemory(memory.id);
      toast.success("Memory deleted successfully");
    } catch (err) {
      console.error("Failed to delete memory", err);
      toast.error("Failed to delete memory");
    } finally {
      setIsDeleting(false);
      setShowDeleteAlert(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size={32} />
      </div>
    );
  }

  if (error || !memory) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <h1 className="text-2xl font-semibold mb-4">Memory Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The memory you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have access to it.
          </p>
          <Button className="cursor-pointer" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-6 mt-10">
          <Button
            className="cursor-pointer"
            variant="ghost"
            onClick={handleBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        </div>

        <Tabs
          value={activeView}
          onValueChange={(value: string) =>
            setActiveView(value as "overview" | "chat")
          }
          className="mb-6"
        >
          <TabsList className="w-fit">
            <TabsTrigger
              value="overview"
              className="text-xs px-3 py-1 cursor-pointer"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger
              value="chat"
              className="text-xs px-3 py-1 cursor-pointer"
            >
              Chat
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {activeView === "overview" ? (
          isEditing ? (
            <MemoryEditForm
              title={title}
              content={content}
              tags={tags}
              isSaving={isSaving}
              onTitleChange={setTitle}
              onContentChange={setContent}
              onTagsChange={setTags}
              onSave={handleSave}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <MemoryOverview
              memory={memory}
              isDeleting={isDeleting}
              onEdit={() => setIsEditing(true)}
              onDelete={() => setShowDeleteAlert(true)}
            />
          )
        ) : (
          <MemoryChat memoryId={memoryId} />
        )}

        <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                memory.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
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
    </PageTransition>
  );
}
