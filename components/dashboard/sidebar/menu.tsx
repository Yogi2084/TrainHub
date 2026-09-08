"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import * as Popover from "@radix-ui/react-popover";
import { format } from "date-fns";
import { createPortal } from "react-dom";

// React Icons
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { AiOutlineWechatWork } from "react-icons/ai";
import { GiFeather } from "react-icons/gi";
import { FaSignOutAlt, FaUserCircle, FaCog } from "react-icons/fa";
import { MessageCircle, MoreVertical, Trash2 } from "lucide-react";
import { auth } from "@/lib/auth";
import { useState, useEffect, useCallback } from "react";
import {
  listChatSessions,
  type ChatSession,
  deleteChatSession,
} from "@/lib/api/chat";
import { toast } from "sonner";

interface MenuProps {
  isOpen: boolean | undefined;
  setSidebarOpenMobile?: (open: boolean) => void;
  isMobile?: boolean;
}

export function Menu({ isOpen, setSidebarOpenMobile, isMobile }: MenuProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [profileOpen, setProfileOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = auth.useSession();
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);

  const loadSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await listChatSessions();

      if (!response?.sessions) {
        setSessions([]);
        return;
      }

      const sortedSessions = response.sessions.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );

      setSessions(sortedSessions);
    } catch {
      setSessions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleTemporaryChat = (event: CustomEvent<ChatSession>) => {
      setSessions((prev) => [event.detail, ...prev]);
    };

    const handleRefreshChats = () => {
      loadSessions();
    };

    const handleClearChats = () => {
      setSessions([]);
      setIsLoading(false);
    };

    window.addEventListener(
      "temporaryChatCreated",
      handleTemporaryChat as EventListener
    );
    window.addEventListener("refreshChatSessions", handleRefreshChats);
    window.addEventListener("clearChatSessions", handleClearChats);

    return () => {
      window.removeEventListener(
        "temporaryChatCreated",
        handleTemporaryChat as EventListener
      );
      window.removeEventListener("refreshChatSessions", handleRefreshChats);
      window.removeEventListener("clearChatSessions", handleClearChats);
    };
  }, [loadSessions]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const handleSessionClick = (sessionId: string) => {
    router.push(`/dashboard/chat/${sessionId}`);
  };

  const handleDeleteSession = async (
    sessionId: string,
    e: React.MouseEvent
  ) => {
    e.stopPropagation();

    setSessions((prevSessions) =>
      prevSessions.filter((session) => session.id !== sessionId)
    );

    try {
      await deleteChatSession(sessionId);
      toast.success("Chat session deleted successfully");
    } catch (error) {
      loadSessions();
      toast.error(
        error instanceof Error ? error.message : "Failed to delete chat session"
      );
    }
  };

  const menuList = [
    {
      menus: [
        {
          href: "/dashboard/new-chat",
          label: "New Chat",
          icon: AiOutlineWechatWork,
          active: pathname === "/dashboard/new-chat",
        },
        {
          href: "/dashboard",
          label: "Dashboard",
          icon: TbLayoutDashboardFilled,
          active: pathname === "/dashboard",
        },
        {
          href: "/dashboard/my-memories",
          label: "My Memories",
          icon: GiFeather,
          active: pathname === "/dashboard/my-memories",
        },
      ],
    },
  ];

  const handleSignOut = async () => {
    await auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="flex flex-col h-full">
      {/* Main Navigation - No Scroll */}
      <nav className="mt-8 w-full">
        <ul className="flex flex-col items-start space-y-1 px-2">
          {menuList.map(({ menus }, index) => (
            <li className="w-full" key={index}>
              {menus.map(({ href, label, icon: Icon, active }, index) => (
                <div className="w-full" key={index}>
                  <TooltipProvider disableHoverableContent>
                    <Tooltip delayDuration={100}>
                      <TooltipTrigger asChild>
                        <Button
                          variant={
                            (active === undefined &&
                              pathname.startsWith(href)) ||
                            active
                              ? "ghost"
                              : "ghost"
                          }
                          className={cn(
                            "w-full justify-start h-10 mb-1 hover:bg-background/50 transition-colors duration-200",
                            isOpen === false
                              ? "justify-center"
                              : "justify-start",
                            ((active === undefined &&
                              pathname.startsWith(href)) ||
                              active) &&
                              "bg-background/50"
                          )}
                          asChild
                          onClick={() => {
                            if (isMobile && setSidebarOpenMobile)
                              setSidebarOpenMobile(false);
                          }}
                        >
                          <Link href={href}>
                            <Icon size={18} />
                            <p
                              className={cn(
                                "max-w-[200px] truncate ml-2",
                                isOpen === false
                                  ? "w-0 opacity-0 hidden"
                                  : "w-auto opacity-100 block"
                              )}
                            >
                              {label}
                            </p>
                          </Link>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">{label}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              ))}
            </li>
          ))}
        </ul>
      </nav>

      {/* Chat Sessions Section - With Scroll */}
      {isOpen && (
        <div className="mt-4 flex-1 flex flex-col min-h-0 max-h-[calc(100vh-18rem)]">
          <div className="px-2 py-2 flex items-center justify-between">
            <h3 className="text-md font-medium text-primary">Recent Chats</h3>
          </div>
          <ScrollArea className="flex-1">
            <div className="space-y-1 w-full max-w-[220px]">
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="px-2 py-1.5">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 animate-pulse rounded bg-muted" />
                      <div className="h-4 flex-1 animate-pulse rounded bg-muted" />
                    </div>
                  </div>
                ))
              ) : sessions.length === 0 ? (
                <div className="px-2 py-1.5 text-sm text-muted-foreground">
                  No chats yet
                </div>
              ) : (
                sessions.map((session) => (
                  <div key={session.id} className="relative group">
                    <Button
                      variant="ghost"
                      className={cn(
                        "cursor-pointer w-full max-w-[220px] justify-start text-sm h-auto py-1.5 hover:bg-background/50",
                        pathname === `/dashboard/chat/${session.id}` &&
                          "bg-background/50"
                      )}
                      onClick={() => handleSessionClick(session.id)}
                    >
                      <MessageCircle className="h-4 w-4 mr-2 text-primary" />
                      <div className="flex flex-col items-start min-w-0 w-full">
                        <span className="truncate w-full block text-left">
                          {session.title}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(session.updatedAt), "MMM d, h:mm a")}
                        </span>
                      </div>
                    </Button>
                    <Popover.Root>
                      <Popover.Trigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="cursor-pointer absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-3 w-3" />
                        </Button>
                      </Popover.Trigger>
                      <Popover.Portal>
                        <Popover.Content
                          side="right"
                          align="start"
                          sideOffset={4}
                          className="z-50 w-36 rounded-md border bg-popover p-1 shadow-md outline-none"
                        >
                          <div className="flex flex-col gap-1 text-sm">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-destructive hover:cursor-pointer hover:text-destructive hover:bg-destructive/10"
                              onClick={(e) =>
                                handleDeleteSession(session.id, e)
                              }
                            >
                              <Trash2 className="h-3 w-3 mr-2" />
                              Delete Chat
                            </Button>
                          </div>
                        </Popover.Content>
                      </Popover.Portal>
                    </Popover.Root>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Profile Section - Always at bottom. On mobile, direct link. On desktop, popover. */}
      <div className="mt-auto w-full px-2">
        {isMobile ? (
          <>
            <Button
              variant="ghost"
              className={cn(
                "w-full cursor-pointer justify-start h-10 transition-colors duration-200 flex items-center p-0 border-none bg-transparent",
                isOpen === false ? "justify-center" : "justify-start"
              )}
              asChild
              style={{ background: "none", boxShadow: "none" }}
            >
              <Link
                href="/dashboard/profile"
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest(".signout-icon-btn")) {
                    e.preventDefault();
                  }
                  if (isMobile && setSidebarOpenMobile)
                    setSidebarOpenMobile(false);
                }}
                className="flex w-full items-center px-4 py-2"
                style={{ textAlign: "left" }}
              >
                <span className="flex items-center min-w-0 flex-1">
                  <FaUserCircle size={18} />
                  <span className="flex flex-col sm:flex-row items-start min-w-0 flex-1">
                    <p
                      className={cn(
                        "max-w-[200px] truncate ml-2 text-left",
                        isOpen === false
                          ? "w-0 opacity-0 hidden"
                          : "w-auto opacity-100 block"
                      )}
                    >
                      View Profile
                    </p>
                  </span>
                </span>
                <button
                  type="button"
                  className="signout-icon-btn text-destructive hover:text-destructive focus:outline-none ml-2"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isMobile && setSidebarOpenMobile)
                      setSidebarOpenMobile(false);
                    setShowSignOutDialog(true);
                  }}
                  aria-label="Sign out"
                  tabIndex={0}
                  style={{ background: "none", border: "none", padding: 0 }}
                >
                  <FaSignOutAlt size={18} />
                </button>
              </Link>
            </Button>
            {/* Custom Sign Out Dialog for Mobile rendered in portal */}
            {showSignOutDialog &&
              isMobile &&
              typeof window !== "undefined" &&
              createPortal(
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                  <div className="bg-background rounded-lg shadow-lg p-6 w-11/12 max-w-xs mx-auto flex flex-col items-center">
                    <p className="mb-4 text-center text-lg font-semibold">
                      Are you sure you want to sign out?
                    </p>
                    <div className="flex gap-4 w-full justify-center">
                      <button
                        className="px-4 py-2 rounded bg-destructive text-white font-medium"
                        onClick={() => {
                          setShowSignOutDialog(false);
                          handleSignOut();
                        }}
                      >
                        Sign out
                      </button>
                      <button
                        className="px-4 py-2 rounded bg-muted text-foreground font-medium"
                        onClick={() => setShowSignOutDialog(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>,
                document.body
              )}
          </>
        ) : (
          <Popover.Root open={profileOpen} onOpenChange={setProfileOpen}>
            <TooltipProvider disableHoverableContent>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Popover.Trigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full cursor-pointer justify-start h-10 hover:bg-background transition-colors duration-200",
                        isOpen === false ? "justify-center" : "justify-start",
                        profileOpen && "bg-background/50"
                      )}
                    >
                      <FaUserCircle size={18} />
                      <span className="flex flex-col sm:flex-row items-start min-w-0 flex-1">
                        <p
                          className={cn(
                            "max-w-[200px] truncate ml-2 text-left",
                            isOpen === false
                              ? "w-0 opacity-0 hidden"
                              : "w-auto opacity-100 block"
                          )}
                        >
                          {session?.user?.name}
                        </p>
                        <span className="block sm:hidden ml-2 mt-0.5 text-xs text-muted-foreground">
                          View Profile
                        </span>
                      </span>
                    </Button>
                  </Popover.Trigger>
                </TooltipTrigger>
                {isOpen === false && (
                  <TooltipContent side="right">Profile</TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
            <Popover.Portal>
              <Popover.Content
                side="right"
                align="start"
                sideOffset={4}
                className="bg-background z-50 w-56 rounded-md border p-2 shadow-md outline-none mb-3"
              >
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link
                      href="/dashboard/profile"
                      onClick={() => {
                        setProfileOpen(false);
                        if (isMobile && setSidebarOpenMobile)
                          setSidebarOpenMobile(false);
                      }}
                    >
                      <FaUserCircle className="mr-2" size={14} />
                      Profile
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    asChild
                  >
                    <Link
                      href="/dashboard/settings"
                      onClick={() => {
                        setProfileOpen(false);
                        if (isMobile && setSidebarOpenMobile)
                          setSidebarOpenMobile(false);
                      }}
                    >
                      <FaCog className="mr-2" size={14} />
                      Settings
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full cursor-pointer justify-start text-destructive hover:text-destructive"
                    onClick={handleSignOut}
                  >
                    <FaSignOutAlt className="mr-2" size={14} />
                    Sign out
                  </Button>
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        )}
      </div>
    </div>
  );
}
