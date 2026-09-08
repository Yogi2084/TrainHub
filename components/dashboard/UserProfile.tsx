"use client";

import { auth } from "@/lib/auth";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getMemories, Memory } from "@/lib/api/memories";
import { useRefreshStore } from "@/lib/stores/refreshStore";
import { MemoryDialog } from "@/components/memory/MemoryDialog";
import { CreateMemoryDialog } from "@/components/memory/CreateMemoryDialog";

export const UserProfile = () => {
  const { data: session } = auth.useSession();
  const triggerRefresh = useRefreshStore((state) => state.triggerRefresh);
  const refreshTrigger = useRefreshStore((state) => state.refreshTrigger);
  const [recentMemories, setRecentMemories] = useState<Memory[]>([]);
  const [loadingMemories, setLoadingMemories] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);

  const fetchRecent = async () => {
    try {
      setLoadingMemories(true);
      const result = await getMemories(1, 5);
      setRecentMemories(result.memories || []);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("No memories found")
      ) {
        setRecentMemories([]);
      } else {
        console.error("Failed to load recent memories", error);
        setRecentMemories([]);
      }
    } finally {
      setLoadingMemories(false);
    }
  };

  useEffect(() => {
    fetchRecent();
  }, [refreshTrigger]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "+") {
        e.preventDefault();
        setDialogOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
  return (
    <div className="flex flex-col justify-end h-full p-4 gap-4 text-foreground bg-background sticky top-0">
      {session?.user && (
        <div className="bg-card sticky justify-end w-70">
          <div className="rounded-2xl shadow-lg p-3 border">
            <div className="flex items-center gap-2">
              <Image
                width={48}
                height={48}
                src={"/default-avatar.png"}
                alt="User Profile"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="font-semibold text-lg ">
                  {session.user.name || "User"}
                </p>
                <p className="text-sm truncate overflow-hidden whitespace-nowrap max-w-[220px]">
                  {session.user.email}
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <Button
                onClick={() => {
                  window.location.href = "/dashboard/profile";
                }}
                variant="outline"
                className="w-full cursor-pointer"
              >
                View Profile
              </Button>
              <Button
                className="cursor-pointer w-full bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={() => setDialogOpen(true)}
              >
                Create Memory
              </Button>
              <CreateMemoryDialog
                open={dialogOpen}
                onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (!open) setSelectedMemory(null);
                }}
                onCreated={() => {
                  fetchRecent();
                  triggerRefresh();
                }}
              />
            </div>
          </div>
        </div>
      )}
      <div className="mt-4 rounded-md p-2">
        <h3 className="text-sm font-semibold mb-2">Recent Memories</h3>
        {loadingMemories ? (
          <Card>
            <CardContent>
              <p className="text-sm font-medium">Loading memories...</p>
            </CardContent>
          </Card>
        ) : recentMemories.length === 0 ? (
          <Card>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No recent memories found.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3 bg-background/50 rounded-md">
            {recentMemories.map((memory) => (
              <div
                key={memory.id}
                className="flex items-center border border-accent-foreground/50 justify-between group hover:bg-card/50 rounded-md transition-colors cursor-pointer px-1 pr-2 py-1"
                onClick={() => {
                  setSelectedMemory(memory);
                }}
              >
                <p className="text-sm font-medium p-2">
                  {memory.title
                    ? memory.title.length > 20
                      ? memory.title.substring(0, 20) + "..."
                      : memory.title
                    : "(Untitled)"}
                </p>
                <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                  {new Date(memory.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      {selectedMemory && (
        <MemoryDialog
          memory={selectedMemory}
          open={!!selectedMemory}
          onOpenChange={(open) => {
            if (!open) setSelectedMemory(null);
          }}
        />
      )}
    </div>
  );
};
