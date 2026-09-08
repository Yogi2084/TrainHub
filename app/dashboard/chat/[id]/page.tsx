"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Send, Bot, User } from "lucide-react";
import { useParams } from "next/navigation";
import {
  ChatMessage,
  ChatSession,
  sendMessage,
  getChatSession,
} from "@/lib/api/chat";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import ReactMarkdown from "react-markdown";
import { MemoryDialog } from "@/components/memory/MemoryDialog";
import { Memory } from "@/lib/api/memories";
import { getMemoryById } from "@/lib/api/memories";
import { Badge } from "@/components/ui/badge";

interface Message extends ChatMessage {
  id: string;
}

export default function ChatSessionPage() {
  const params = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<ChatSession | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const streamingRef = useRef<NodeJS.Timeout | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const [streamingMessage, setStreamingMessage] = useState<{
    id: string;
    content: string;
    fullContent: string;
    index: number;
  } | null>(null);
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

  // Load chat session and messages
  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await getChatSession(params.id as string);
        setSession(response.session);
        // Ensure each message has referencedMemories property
        const messagesWithReferences = response.session.messages.map(
          (message) => ({
            ...message,
            referencedMemories: message.referencedMemories || [],
          })
        );
        setMessages(messagesWithReferences);

        // Fetch memory details for all memoryIds
        const uniqueMemoryIds = new Set<string>();
        messagesWithReferences.forEach((message) => {
          message.memoryIds.forEach((id) => uniqueMemoryIds.add(id));
        });

        // Fetch details for each unique memory ID
        const memoryDetailsPromises = Array.from(uniqueMemoryIds).map(
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
        const memoryDetailsMap = Object.fromEntries(
          memoryDetailsArray.filter(([memory]) => memory !== null)
        );
        setMemoryDetails(memoryDetailsMap);
      } catch (error) {
        console.error("Failed to load chat session:", error);
      }
    };

    if (params.id) {
      loadSession();
    }
  }, [params.id]);

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
              sessionId: params.id as string,
              role: "assistant" as const,
              content: prev.fullContent,
              memoryIds: [],
              createdAt: new Date().toISOString(),
            };

            setMessages((old) => {
              const exists = old.find((m) => m.id === completedMessage.id);
              return exists ? old : [...old, completedMessage];
            });

            return null;
          }
        });
      }, 10); // Even faster typing speed
    }

    return () => {
      if (streamingRef.current) {
        clearInterval(streamingRef.current);
        streamingRef.current = null;
      }
    };
  }, [streamingMessage, params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || !params.id) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    // Add user message immediately
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}-${Math.random()}`,
      sessionId: params.id as string,
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
        sessionId: params.id as string,
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
      const response = await sendMessage(params.id as string, {
        content: userMessage,
      });
      clearTimeout(timeoutId); // Clear timeout if response received

      if (response.message && response.assistantResponse) {
        // Start streaming with empty content
        setStreamingMessage({
          id: response.message.id,
          content: "",
          fullContent: response.assistantResponse,
          index: 0,
        });
      }
    } catch (error) {
      clearTimeout(timeoutId); // Clear timeout if error occurs
      console.error("Failed to send message:", error);
      const errorMessage: Message = {
        id: `error-${Date.now()}-${Math.random()}`,
        sessionId: params.id as string,
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
          <div className="container mx-auto px-4 pb-2">
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-full">
                <Bot className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">
                  {session?.title || "Chat Session"}
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
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Bot className="w-6 h-6 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold mb-2">
                    Start a New Chat
                  </h2>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Begin a conversation with your AI assistant. Ask questions,
                    share thoughts, or explore ideas together.
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
