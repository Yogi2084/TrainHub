"use client";
import { Menu } from "@/components/dashboard/sidebar/menu";
import { SidebarToggle } from "@/components/dashboard/sidebar/sidebar-toggle";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { PanelsTopLeft, X } from "lucide-react";
import Link from "next/link";

// ... existing imports ...

interface AppSidebarProps {
  sidebarOpenMobile?: boolean;
  setSidebarOpenMobile?: (open: boolean) => void;
}

export function AppSidebar({
  sidebarOpenMobile,
  setSidebarOpenMobile,
}: AppSidebarProps) {
  const { state, open, setOpen, isMobile } = useSidebar();
  const showSidebar = isMobile ? sidebarOpenMobile : true;
  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-20 h-screen transition-all ease-in-out duration-500 bg-background lg:bg-transparent",
        state === "collapsed"
          ? "w-[var(--sidebar-width-icon)]"
          : "w-[var(--sidebar-width)]",
        isMobile && (!showSidebar ? "-translate-x-full" : "translate-x-0"),
        isMobile ? "lg:hidden" : ""
      )}
      style={{
        boxShadow:
          isMobile && showSidebar ? "0 0 0 9999px rgba(0,0,0,0.2)" : undefined,
      }}
    >
      {/* Close button for mobile */}
      {isMobile && showSidebar && (
        <button
          className="absolute top-4 right-4 z-30 p-2 rounded-md bg-background shadow-lg"
          onClick={() => setSidebarOpenMobile && setSidebarOpenMobile(false)}
          aria-label="Close sidebar"
        >
          <X width={18} height={18} />
        </button>
      )}
      <SidebarToggle isOpen={open} setIsOpen={setOpen} />
      <div className="bg-primary/5 border-r relative h-full flex flex-col px-3 py-4 shadow-md transition-all duration-500 ease-in-out">
        <Button variant="link" asChild>
          <Link href="/dashboard" className="flex items-center justify-center">
            <PanelsTopLeft className="w-6 h-6 transition-transform duration-500 ease-in-out" />
            <h1
              className={cn(
                "font-bold text-lg whitespace-nowrap transition-all ease-in-out duration-500 ml-2",
                state === "collapsed"
                  ? "opacity-0 w-0 hidden"
                  : "opacity-100 w-auto block"
              )}
            >
              NeuroNest
            </h1>
          </Link>
        </Button>
        <Menu
          isOpen={state !== "collapsed"}
          setSidebarOpenMobile={setSidebarOpenMobile}
          isMobile={isMobile}
        />
      </div>
    </aside>
  );
}
