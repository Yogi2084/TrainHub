"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { PageTransition } from "@/components/ui/page-transition";

const SettingsPage = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const triggerRefresh = useRefreshStore((state) => state.triggerRefresh);
  const router = useRouter();

  const handleDeleteMemories = async () => {
    try {
      setIsDeleting(true);
      await deleteAllMemories();
      toast.success("All memories deleted successfully");
      triggerRefresh(); // Trigger refresh for menu and user profile
      router.refresh(); // Refresh the current page
      router.push("/dashboard/my-memories"); // Redirect to memories page
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

      // Clear chat sessions immediately
      window.dispatchEvent(new CustomEvent("clearChatSessions"));

      toast.success("All chats deleted successfully");

      // Trigger refresh of chat sessions list
      triggerRefresh();
      // Refresh the current page
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

      // First try to delete the account
      await deleteUserAccount();

      // If successful, sign out and redirect
      await auth.signOut();
      toast.success("Account deleted successfully");

      // Use window.location for a full page reload after deletion
      window.location.href = "/";
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to delete account";

      // Show specific error messages for memories and chats
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
      <div className="container mx-auto py-4 px-2 sm:py-8 sm:px-0">
        <div className="flex items-center justify-center gap-2 mb-6 sm:gap-4 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
        </div>

        <div className="grid gap-4 sm:gap-6">
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
};

export default SettingsPage;
