"use client";

import { auth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, BrainCircuit, Sparkles, PlusCircle } from "lucide-react";
import { getDashboardStats, type DashboardStats } from "@/lib/api/dashboard";
import { useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { SettingsDialog } from "@/components/dashboard/SettingsDialog";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { PageTransition } from "@/components/ui/page-transition";
import { ModeToggle } from "@/components/ui/ModeToggle";

export default function DashboardPage() {
  const { data } = auth.useSession();
  const user = data?.user;
  const router = useRouter();
  const queryClient = useQueryClient();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { state } = useSidebar();

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  const {
    data: stats,
    isLoading,
    error,
  } = useQuery<DashboardStats>({
    queryKey: ["dashboardStats"],
    queryFn: getDashboardStats,
  });

  useEffect(() => {
    const handleMemoryDeleted = () => {
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    };

    const handleChatDeleted = () => {
      queryClient.invalidateQueries({ queryKey: ["dashboardStats"] });
    };

    window.addEventListener("memoryDeleted", handleMemoryDeleted);
    window.addEventListener("chatDeleted", handleChatDeleted);

    return () => {
      window.removeEventListener("memoryDeleted", handleMemoryDeleted);
      window.removeEventListener("chatDeleted", handleChatDeleted);
    };
  }, [queryClient]);

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-muted-foreground">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-destructive">
            Failed to load dashboard data. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  const handleStartChat = () => {
    router.push("/dashboard/new-chat");
  };

  const handleViewMemories = () => {
    router.push("/dashboard/my-memories");
  };

  return (
    <PageTransition>
      <div className="flex flex-col items-center gap-4 p-4">
        {/* Welcome Section */}
        <div className="flex flex-col items-center justify-between max-w-4xl w-full">
          <div className="space-y-1">
            <h1 className="text-center text-2xl font-bold tracking-tight">
              Welcome, {user.name || "User"}!
            </h1>
            <p className="text-sm text-muted-foreground">
              Ready to enhance your cognitive abilities today?
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 max-w-2xl w-full">
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
              <CardTitle className="text-base font-medium">
                Memory Score
              </CardTitle>
              <BrainCircuit className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">
                {stats?.memoryScore || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Based on your chat interactions
              </p>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0">
              <CardTitle className="text-base font-medium">
                Chat Streak
              </CardTitle>
              <Sparkles className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-1">
                {stats?.streak || 0} days
              </div>
              <p className="text-xs text-muted-foreground">
                Daily chat sessions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div
          className={cn(
            "flex flex-col md:flex-row gap-4 justify-center w-full",
            state === "collapsed" ? "max-w-4xl" : "max-w-4xl"
          )}
        >
          {/* Quick Actions */}
          <Card className="w-full md:w-[300px] hover:shadow-md transition-shadow duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-0">
              <CardTitle className="text-base font-medium">
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full justify-start cursor-pointer h-10 text-sm"
                size="sm"
                onClick={handleStartChat}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>Start New Chat</span>
              </Button>
              <Button
                className="w-full justify-start cursor-pointer h-10 text-sm"
                variant="outline"
                size="sm"
                onClick={handleViewMemories}
              >
                <BrainCircuit className="mr-2 h-4 w-4" />
                View Memories
              </Button>
              <div className="flex flex-row items-center justify-between mx-1">
                <span>Theme</span>
                <ModeToggle />
              </div>
            </CardContent>
          </Card>

          {/* Recent Chats */}
          <Card
            className={cn(
              "hover:shadow-md transition-shadow duration-200 w-full md:w-[350px] mb-4 md:mb-0",
              state === "collapsed" ? "" : ""
            )}
          >
            <CardTitle className="text-base font-medium text-center">
              Recent Chat Sessions
            </CardTitle>
            <CardContent className="p-2">
              {(stats?.recentSessions ?? []).slice(0, 3).map((session) => (
                <div
                  key={session.id}
                  className="flex items-center space-x-2 p-1.5 pl-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                    <Brain className="h-3 w-3 text-primary" />
                  </div>
                  <div className="hover:cursor-pointer py-1 flex-1">
                    <p className="text-sm font-medium">{session.title}</p>
                  </div>
                </div>
              ))}
              {(!stats?.recentSessions ||
                stats.recentSessions.length === 0) && (
                <p className="text-xs text-muted-foreground text-center py-2">
                  No recent chat sessions. Start a new conversation!
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      </div>
    </PageTransition>
  );
}
