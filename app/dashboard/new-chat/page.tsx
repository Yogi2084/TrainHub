"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Send, Bot, User } from "lucide-react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";

import {
  createChat,
  sendMessage,
  type ChatMessage,
  type ReferencedMemory,
} from "@/lib/api/chat";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRefreshStore } from "@/lib/stores/refreshStore";
import { MemoryDialog } from "@/components/memory/MemoryDialog";
import { Memory } from "@/lib/api/memories";
import { getMemoryById } from "@/lib/api/memories";
import { Badge } from "@/components/ui/badge";

interface Message extends ChatMessage {
  referencedMemories?: ReferencedMemory[];
}

export default function NewChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isStopped, setIsStopped] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const streamingRef = useRef<NodeJS.Timeout | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [streamingMessage, setStreamingMessage] = useState<{
    id: string;
    content: string;
    fullContent: string;
    index: number;
  } | null>(null);
  const triggerRefresh = useRefreshStore((state) => state.triggerRefresh);
  const [selectedMemory, setSelectedMemory] = useState<Memory | null>(null);
  const [isMemoryDialogOpen, setIsMemoryDialogOpen] = useState(false);
  const [memoryDetails, setMemoryDetails] = useState<Record<string, Memory>>(
    {}
  );

  // Check if user is at bottom of scroll area
  const checkScrollPosition = useCallback(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
        const isBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 10;
        setIsAtBottom(isBottom);
      }
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive or streaming content changes
  useEffect(() => {
    if (scrollAreaRef.current && isAtBottom) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, streamingMessage?.content, isAtBottom]);

  // Add scroll event listener
  useEffect(() => {
    const scrollContainer = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", checkScrollPosition);
      return () => {
        scrollContainer.removeEventListener("scroll", checkScrollPosition);
      };
    }
  }, [checkScrollPosition]);

  // Handle streaming effect
  useEffect(() => {
    if (streamingMessage) {
      if (streamingRef.current) clearInterval(streamingRef.current);

      streamingRef.current = setInterval(() => {
        setStreamingMessage((prev) => {
          if (!prev) return null;

          if (prev.index < prev.fullContent.length) {
            const newContent = prev.fullContent.slice(0, prev.index + 1);
            return {
              ...prev,
              content: newContent,
              index: prev.index + 1,
            };
          } else {
            clearInterval(streamingRef.current as NodeJS.Timeout);
            streamingRef.current = null;

            const completedMessage: Message = {
              id: prev.id,
              sessionId: sessionId || "temp",
              role: "assistant",
              content: prev.fullContent,
              memoryIds: [],
              createdAt: new Date().toISOString(),
            };

            setMessages((old) => {
              const exists = old.find((m) => m.id === completedMessage.id);
              return exists ? old : [...old, completedMessage];
            });

            // If this is the first message and we have a session ID, wait 3 seconds then redirect
            if (sessionId && messages.length === 1) {
              setTimeout(() => {
                router.push(`/dashboard/chat/${sessionId}`);
              }, 2000);
            }

            return null;
          }
        });
      }, 10);
    }

    return () => {
      if (streamingRef.current) {
        clearInterval(streamingRef.current);
        streamingRef.current = null;
      }
    };
  }, [streamingMessage, sessionId, messages.length, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    setIsStopped(false);
    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    // Add user message immediately
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}-${Math.random()}`,
      sessionId: sessionId || "temp",
      role: "user",
      content: userMessage,
      memoryIds: [],
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    // Set up timeout
    const timeoutId = setTimeout(() => {
      const timeoutMessage: Message = {
        id: `timeout-${Date.now()}-${Math.random()}`,
        sessionId: sessionId || "temp",
        role: "assistant",
        content:
          "The AI is taking longer than usual to respond. Please try sending your message again.",
        memoryIds: [],
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, timeoutMessage]);
      setIsLoading(false);
    }, 30000); // 30 seconds timeout

    try {
      if (!sessionId) {
        // Create new chat session with first message
        const response = await createChat({ message: userMessage });
        clearTimeout(timeoutId); // Clear timeout if response received
        if (!isStopped && response.message && response.assistantResponse) {
          setSessionId(response.session.id);

          // Start streaming with empty content
          setStreamingMessage({
            id: response.message.id,
            content: "",
            fullContent: response.assistantResponse,
            index: 0,
          });

          // Fetch memory details for the new message
          if (response.message.memoryIds.length > 0) {
            const memoryDetailsPromises = response.message.memoryIds.map(
              async (id) => {
                try {
                  const memory = await getMemoryById(id);
                  return [id, memory];
                } catch (error) {
                  console.error(`Failed to fetch memory ${id}:`, error);
                  return [id, null];
                }
              }
            );

            const memoryDetailsArray = await Promise.all(memoryDetailsPromises);
            const newMemoryDetails = Object.fromEntries(
              memoryDetailsArray.filter(([, memory]) => memory !== null)
            );
            setMemoryDetails((prev) => ({ ...prev, ...newMemoryDetails }));
          }

          // Trigger refresh of chat sessions list
          triggerRefresh();

          // Dispatch custom event for new chat session
          const event = new CustomEvent("temporaryChatCreated", {
            detail: response.session,
          });
          window.dispatchEvent(event);
        }
      } else {
        // Send message to existing session
        const response = await sendMessage(sessionId, { content: userMessage });
        clearTimeout(timeoutId); // Clear timeout if response received
        if (!isStopped && response.message && response.assistantResponse) {
          setStreamingMessage({
            id: response.message.id,
            content: "",
            fullContent: response.assistantResponse,
            index: 0,
          });

          // Fetch memory details for the new message
          if (response.message.memoryIds.length > 0) {
            const memoryDetailsPromises = response.message.memoryIds.map(
              async (id) => {
                try {
                  const memory = await getMemoryById(id);
                  return [id, memory];
                } catch (error) {
                  console.error(`Failed to fetch memory ${id}:`, error);
                  return [id, null];
                }
              }
            );

            const memoryDetailsArray = await Promise.all(memoryDetailsPromises);
            const newMemoryDetails = Object.fromEntries(
              memoryDetailsArray.filter(([, memory]) => memory !== null)
            );
            setMemoryDetails((prev) => ({ ...prev, ...newMemoryDetails }));
          }
        }
      }
    } catch (error) {
      clearTimeout(timeoutId); // Clear timeout if error occurs
      console.error("Failed to send message:", error);
      const errorMessage: Message = {
        id: `error-${Date.now()}-${Math.random()}`,
        sessionId: sessionId || "temp",
        role: "assistant",
        content:
          error instanceof Error && error.message === "User not found"
            ? "Please log in to continue chatting. You'll be redirected to the login page."
            : "The AI is having trouble responding right now. Please try again in a moment.",
        memoryIds: [],
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMemoryClick = async (memoryId: string) => {
    try {
      const memory = await getMemoryById(memoryId);
      setSelectedMemory(memory);
      setIsMemoryDialogOpen(true);
    } catch (error) {
      console.error("Failed to fetch memory:", error);
    }
  };

  return (
    <div className="flex h-[calc(105vh-4rem)] overflow-hidden">
      <div className="flex flex-col flex-1 bg-background">
        {/* Header */}
        <div className="bg-background backdrop-blur-sm sticky top-0 z-10 border-b">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-full">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  AI Assistant
                </h1>
                <p className="text-xs text-muted-foreground">
                  Powered by Mistral AI
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 container mx-auto px-4 py-1 flex items-center justify-center">
          <ScrollArea
            className="h-[calc(100vh-12rem)] pr-4 w-full"
            ref={scrollAreaRef}
          >
            <div className="space-y-3 max-w-4xl mx-auto">
              {messages.length === 0 && (
                <div className="text-center py-6 flex flex-col items-center justify-center min-h-[calc(100vh-16rem)]">
                  <Bot className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <h2 className="text-2xl font-medium text-foreground mb-1">
                    Welcome to AI Chat
                  </h2>
                  <p className="text-md text-muted-foreground">
                    Start a conversation by typing a message below.
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <Avatar className="w-6 h-6 bg-primary">
                      <AvatarFallback>
                        <Bot className="w-3 h-3 text-primary-foreground" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <Card
                    className={`max-w-[70%] p-2 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card text-card-foreground border"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm prose dark:prose-invert max-w-none">
                      {message.role === "assistant" ? (
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      ) : (
                        message.content
                      )}
                    </div>

                    {message.role === "assistant" &&
                      message.memoryIds.length > 0 && (
                        <>
                          <div className="my-2 border-t border-border" />
                          <div className="flex flex-wrap gap-1">
                            {message.memoryIds.map((memoryId) => {
                              const memory = memoryDetails[memoryId];
                              if (!memory) return null;
                              return (
                                <Badge
                                  key={memoryId}
                                  variant="secondary"
                                  className="cursor-pointer hover:bg-accent"
                                  onClick={() => handleMemoryClick(memoryId)}
                                >
                                  {memory.title || "Untitled Memory"}
                                </Badge>
                              );
                            })}
                          </div>
                        </>
                      )}
                  </Card>

                  {message.role === "user" && (
                    <Avatar className="w-6 h-6 bg-muted">
                      <AvatarFallback>
                        <User className="w-3 h-3 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isLoading && !streamingMessage && (
                <div className="flex gap-2 justify-start items-center">
                  <Avatar className="w-6 h-6 bg-primary">
                    <AvatarFallback>
                      <Bot className="w-3 h-3 text-primary-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <Card className="max-w-[70%] p-2 bg-card text-card-foreground border">
                    <div className="flex items-center gap-1.5">
                      <div className="flex space-x-1">
                        <div
                          key="dot1"
                          className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"
                        ></div>
                        <div
                          key="dot2"
                          className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          key="dot3"
                          className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        AI is thinking...
                      </span>
                    </div>
                  </Card>
                </div>
              )}

              {streamingMessage && (
                <div className="flex gap-2 justify-start">
                  <Avatar className="w-6 h-6 bg-primary">
                    <AvatarFallback>
                      <Bot className="w-3 h-3 text-primary-foreground" />
                    </AvatarFallback>
                  </Avatar>
                  <Card className="max-w-[70%] p-2 bg-card text-card-foreground border">
                    <div className="whitespace-pre-wrap text-sm prose dark:prose-invert max-w-none">
                      <div className="flex items-start">
                        <div className="flex-1">
                          <ReactMarkdown>
                            {streamingMessage.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Input Area - Fixed at Bottom */}
        <div className="border-t bg-background backdrop-blur-sm">
          <div className="container mx-auto px-4 py-3">
            <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Textarea
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                      const textarea = e.target;
                      textarea.style.height = "auto";
                      const newHeight = Math.min(textarea.scrollHeight, 96);
                      textarea.style.height = `${newHeight}px`;
                    }}
                    placeholder="Type your message here..."
                    className="flex-1 min-h-[40px] max-h-[60px] text-sm resize-none overflow-y-auto"
                    disabled={isLoading}
                    rows={2}
                    onKeyDown={(
                      e: React.KeyboardEvent<HTMLTextAreaElement>
                    ) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        if (!isLoading && input.trim()) {
                          (
                            e.target as HTMLTextAreaElement
                          ).form?.requestSubmit();
                        }
                      }
                    }}
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isLoading || !input.trim()}
                  className="px-3 self-end"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {selectedMemory && (
        <MemoryDialog
          memory={selectedMemory}
          open={isMemoryDialogOpen}
          onOpenChange={setIsMemoryDialogOpen}
        />
      )}
    </div>
  );
}
