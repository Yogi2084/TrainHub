"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMemoriesCount, getTagsCount } from "@/lib/api/memories";
import { auth } from "@/lib/auth";
import { Brain, Tag, Calendar, Clock } from "lucide-react";
import { ModeToggle } from "@/components/ui/ModeToggle";

export default function UserStats() {
  const { data: session } = auth.useSession();
  const [memoriesCount, setMemoriesCount] = useState<number>(0);
  const [tagsCount, setTagsCount] = useState<number>(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [memories, tags] = await Promise.all([
          getMemoriesCount(),
          getTagsCount(),
        ]);
        setMemoriesCount(memories);
        setTagsCount(tags);
      } catch (error) {
        console.error("Failed to fetch user stats:", error);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 h-fit p-2 md:p-4">
      {/* Account Details Card */}
      <Card className="w-full border border-border/80 bg-gradient-to-br from-background to-background/80 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base md:text-lg font-medium text-foreground/80">
              Account Details
            </CardTitle>
            <ModeToggle />
          </div>
        </CardHeader>
        <CardContent className="space-y-4 md:space-y-6">
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="h-10 w-10 md:h-14 md:w-14 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-2 ring-primary/10">
              <span className="text-lg md:text-xl font-semibold text-primary">
                {session?.user?.name?.[0]?.toUpperCase() || "U"}
              </span>
            </div>
            <div>
              <h3 className="font-medium text-base md:text-lg">
                {session?.user?.name || "User"}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground">
                {session?.user?.email}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 pt-2">
            <div className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 rounded-xl bg-gradient-to-br from-primary/5 to-primary/0">
              <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-foreground/60">Joined</p>
                <p className="text-xs md:text-sm font-medium">
                  {session?.user?.createdAt
                    ? new Date(session.user.createdAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-3 p-2 md:p-3 rounded-xl bg-gradient-to-br from-primary/5 to-primary/0">
              <div className="h-7 w-7 md:h-8 md:w-8 rounded-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-foreground/60">
                  Last Updated
                </p>
                <p className="text-xs md:text-sm font-medium">
                  {session?.user?.updatedAt
                    ? new Date(session.user.updatedAt).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Card */}
      <Card className="w-full border border-border/80 bg-gradient-to-br from-background to-background/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-base md:text-lg text-center font-medium text-foreground/80">
            Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
            <div className="flex items-center space-x-2 md:space-x-3 p-3 md:p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10 transition-all duration-300">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-1 ring-primary/10">
                <Brain className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs md:text-sm font-medium text-foreground/80">
                  Memories
                </p>
                <p className="text-xl md:text-2xl font-bold text-primary">
                  {memoriesCount}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2 md:space-x-3 p-3 md:p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10 transition-all duration-300">
              <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center ring-1 ring-primary/10">
                <Tag className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs md:text-sm font-medium text-foreground/80">
                  Tags
                </p>
                <p className="text-xl md:text-2xl font-bold text-primary">
                  {tagsCount}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
