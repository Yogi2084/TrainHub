"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User } from "lucide-react";
import { queryMemory } from "@/lib/api/chat";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ReactMarkdown from "react-markdown";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface MemoryChatProps {
  memoryId: string;
}

export function MemoryChat({ memoryId }: MemoryChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const streamingRef = useRef<NodeJS.Timeout | null>(null);
  const [streamingMessage, setStreamingMessage] = useState<{
    content: string;
    fullContent: string;
    index: number;
    done: boolean;
  } | null>(null);

  // Auto-scroll to bottom when new messages arrive or streaming content changes
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, streamingMessage?.content]);

  // Handle streaming effect
  useEffect(() => {
    if (!streamingMessage) return;

    if (streamingRef.current) clearInterval(streamingRef.current);

    streamingRef.current = setInterval(() => {
      setStreamingMessage((prev) => {
        if (!prev) return null;

        const { fullContent, index } = prev;

        if (index < fullContent.length) {
          return {
            ...prev,
            content: fullContent.slice(0, index + 1),
            index: index + 1,
          };
        } else {
          clearInterval(streamingRef.current as NodeJS.Timeout);
          streamingRef.current = null;
          return { ...prev, done: true }; // ✅ Mark done but don't remove yet
        }
      });
    }, 10);

    return () => {
      if (streamingRef.current) {
        clearInterval(streamingRef.current);
        streamingRef.current = null;
      }
    };
  }, [streamingMessage]);

  useEffect(() => {
    if (streamingMessage?.done) {
      setMessages((old) => [
        ...old,
        { role: "assistant", content: streamingMessage.fullContent },
      ]);
      setStreamingMessage(null);
    }
  }, [streamingMessage]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setIsLoading(true);

    try {
      const data = await queryMemory(memoryId, { content: userMessage });

      // Start streaming with empty content
      setStreamingMessage({
        content: "",
        fullContent: data.assistantResponse,
        index: 0,
        done: false,
      });
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I encountered an error while processing your request.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-card rounded-lg border p-6 w-full flex flex-col h-[600px]">
      <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
        <div className="space-y-3">
          {messages.length === 0 && !streamingMessage ? (
            <div className="text-center py-6 flex flex-col items-center justify-center min-h-[400px]">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-lg font-semibold mb-2">
                Ask About This Memory
              </h2>
              <p className="text-sm text-muted-foreground max-w-md">
                Start a conversation about this memory. Ask questions or explore
                the content in detail.
              </p>
            </div>
          ) : (
            <>
              {messages.map((message, index) => (
                <div
                  key={index}
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
                        <div className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"></div>
                        <div
                          className="w-1 h-1 bg-muted-foreground rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
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
            </>
          )}
        </div>
      </ScrollArea>

      <div className="flex gap-2 mt-4">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Ask a question about this memory..."
          disabled={isLoading}
          className="flex-1"
        />
        <Button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          size="icon"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
