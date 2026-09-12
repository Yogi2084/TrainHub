"use client";

import { useRouter, usePathname } from "next/navigation";
import { PropsWithChildren, useEffect, useState } from "react";
import { useAuthStore } from "@/lib/stores/authStore";
import { useRefreshStore } from "@/lib/stores/refreshStore";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/sidebar/SideBar";
import { UserProfile } from "@/components/dashboard/UserProfile";
import { auth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import { CreateMemoryDialog } from "@/components/memory/CreateMemoryDialog";
import { useHighlightStore } from "@/lib/stores/highlightStore";

function DashboardContent({ children }: PropsWithChildren) {
  const { state, isMobile } = useSidebar();
  const refreshTrigger = useRefreshStore((state) => state.refreshTrigger);
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const router = useRouter();
  const setHighlightId = useHighlightStore((state) => state.setHighlightId);
  const pathname = usePathname();
  const showPlusButton =
    isMobile &&
    ["/dashboard/my-memories", "/dashboard/profile", "/dashboard"].includes(
      pathname
    );

  useEffect(() => {}, [refreshTrigger]);

  const handleCreated = (memoryId: string) => {
    setShowCreateDialog(false);
    setHighlightId(memoryId);
    router.push(`/dashboard/my-memories`);
  };

  return (
    <>
      {/* Hamburger button for mobile */}
      {isMobile && !sidebarOpenMobile && (
        <button
          className="fixed top-4 left-4 z-30 p-2 rounded-md bg-background shadow-lg lg:hidden"
          onClick={() => setSidebarOpenMobile(true)}
          aria-label="Open sidebar"
        >
          <svg
            width="24"
            height="24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-menu"
          >
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </svg>
        </button>
      )}
      {/* Overlay for mobile sidebar */}
      {isMobile && sidebarOpenMobile && (
        <div
          className="fixed inset-0 z-20 bg-black/40"
          onClick={() => setSidebarOpenMobile(false)}
        />
      )}
      {/* Floating + button for mobile, only on certain routes */}
      {showPlusButton && (
        <button
          className="fixed bottom-6 right-6 z-40 bg-primary text-primary-foreground rounded-full w-14 h-14 flex items-center justify-center shadow-lg text-3xl"
          onClick={() => setShowCreateDialog(true)}
          aria-label="Create Memory"
        >
          +
        </button>
      )}
      <CreateMemoryDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreated={handleCreated}
      />
      <AppSidebar
        sidebarOpenMobile={sidebarOpenMobile}
        setSidebarOpenMobile={setSidebarOpenMobile}
      />
      <main
        id="main-content"
        className={cn(
          "p-2 flex-1 transition-all duration-500 ease-in-out",
          state === "expanded" && !isMobile
            ? "ml-[18rem] w-[calc(100%-18rem)]"
            : "ml-[5.625rem] w-[calc(100%-5.625rem)]",
          isMobile && "ml-0 w-full"
        )}
      >
        {children}
      </main>
      {!isMobile && <UserProfile />}
    </>
  );
}

export default function ClientDashboardLayout({ children }: PropsWithChildren) {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        const { data } = await auth.getSession();
        const user = data?.user;
        if (user) {
          setUser({ ...user, image: user.image ?? undefined });
        } else {
          router.replace("/");
        }
      } catch (error) {
        console.error("Error checking session:", error);
        router.replace("/");
      } finally {
        setIsLoading(false);
      }
    }

    checkSession();
  }, [setUser, router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === ",") {
        e.preventDefault();
        router.push("/dashboard/settings");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <SidebarProvider>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
}
