"use client";

import { useState } from "react";
import UserStats from "@/components/profile/UserStats";
import { PageTransition } from "@/components/ui/page-transition";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { deleteUserAccount } from "@/lib/api/user";
import { deleteAllMemories } from "@/lib/api/memories";
import { deleteAllChatSessions } from "@/lib/api/chat";
import { useRefreshStore } from "@/lib/stores/refreshStore";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/auth";

export default function ProfilePage() {
  const [updateError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const triggerRefresh = useRefreshStore((state) => state.triggerRefresh);
  const router = useRouter();

  const handleDeleteMemories = async () => {
    try {
      setIsDeleting(true);
      await deleteAllMemories();
      toast.success("All memories deleted successfully");
      triggerRefresh();
      router.refresh();
      router.push("/dashboard/my-memories");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete memories"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteChats = async () => {
    try {
      setIsDeleting(true);
      await deleteAllChatSessions();
      window.dispatchEvent(new CustomEvent("clearChatSessions"));
      toast.success("All chats deleted successfully");
      triggerRefresh();
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete chats"
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await deleteUserAccount();
      await auth.signOut();
      toast.success("Account deleted successfully");
      window.location.href = "/";
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete account";
      if (errorMessage.includes("memories")) {
        toast.error(
          "Please delete all your memories before deleting your account"
        );
      } else if (errorMessage.includes("chats")) {
        toast.error(
          "Please delete all your chats before deleting your account"
        );
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PageTransition>
      <div className="max-w-6xl mx-auto p-6 h-fit">
        <div className="flex flex-col gap-4 mb-6">
          <h1 className="text-center text-3xl font-bold">My Profile</h1>
        </div>

        {updateError && (
          <div className="bg-background text-foreground p-3 rounded mb-6">
            {updateError}
          </div>
        )}

        <div className="w-full">
          <div className="sticky top-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
            <UserStats />
          </div>
        </div>

        {/* Settings Danger Zone - Only on small screens */}
        <div className="block sm:hidden mt-8">
          <h1 className="text-center text-2xl font-bold mb-4">Settings</h1>
          <Card>
            <CardHeader>
              <CardTitle>Danger Zone</CardTitle>
              <CardDescription>
                These actions are irreversible. Please proceed with caution.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 flex flex-col md:flex-row md:gap-4 gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="cursor-pointer"
                    disabled={isDeleting}
                  >
                    Delete All Memories
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete All Memories</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      all your memories.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="cursor-pointer"
                      onClick={handleDeleteMemories}
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="cursor-pointer"
                    disabled={isDeleting}
                  >
                    Delete All Chats
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete All Chats</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      all your chat history.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="cursor-pointer"
                      onClick={handleDeleteChats}
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    className="cursor-pointer"
                    disabled={isDeleting}
                  >
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Account</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      your account and all associated data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="cursor-pointer">
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="cursor-pointer"
                      onClick={handleDeleteAccount}
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
