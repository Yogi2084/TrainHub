import { serverUrl } from "../environment";

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    messages: number;
  };
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  memoryIds: string[];
  createdAt: string;
  referencedMemories?: ReferencedMemory[];
}

export interface ReferencedMemory {
  id: string;
  title?: string;
  content: string;
}

export interface CreateChatRequest {
  message?: string;
}

export interface SendMessageRequest {
  content: string;
}

export interface ChatSessionResponse {
  session: ChatSession & {
    messages: ChatMessage[];
  };
}

export interface SendMessageResponse {
  message: ChatMessage;
  assistantResponse: string;
  referencedMemories: ReferencedMemory[];
}

export interface ListChatSessionsResponse {
  sessions: ChatSession[];
  totalSessions: number;
}

export interface MemoryQueryResponse {
  memoryTitle?: string;
  userInput: string;
  assistantResponse: string;
}

export const createChat = async (
  data: CreateChatRequest
): Promise<ChatSessionResponse & Partial<SendMessageResponse>> => {
  const response = await fetch(`${serverUrl}/chat`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify({
      ...data,
      userId: "me",
    }),
  });

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error("Invalid input data");
    }
    if (response.status === 404) {
      throw new Error("User not found");
    }
    throw new Error("Failed to create chat session");
  }

  return response.json();
};

export const sendMessage = async (
  sessionId: string,
  data: SendMessageRequest
): Promise<SendMessageResponse> => {
  if (!data.content || !data.content.trim()) {
    throw new Error("Message content is required");
  }

  const response = await fetch(`${serverUrl}/chat/${sessionId}/message`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify({
      content: data.content.trim(),
      userId: "me", // The server will resolve this to the authenticated user's ID
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 400) {
      throw new Error(errorData.error || "Invalid input data");
    }
    if (response.status === 403) {
      throw new Error("Not authorized to send messages in this chat session");
    }
    if (response.status === 404) {
      throw new Error("Chat session not found");
    }
    throw new Error(errorData.error || "Failed to send message");
  }

  return response.json();
};

export const getChatSession = async (
  sessionId: string
): Promise<ChatSessionResponse> => {
  const response = await fetch(`${serverUrl}/chat/${sessionId}`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error("Not authorized to access this chat session");
    }
    if (response.status === 404) {
      throw new Error("Chat session not found");
    }
    throw new Error("Failed to get chat session");
  }

  const data = await response.json();
  return {
    session: {
      ...data.session,
      messages: data.session.messages.map((message: ChatMessage) => ({
        ...message,
        referencedMemories: message.referencedMemories || [],
      })),
    },
  };
};

export const listChatSessions = async (): Promise<ListChatSessionsResponse> => {
  try {
    const response = await fetch(`${serverUrl}/chat`, {
      method: "GET",
      credentials: "include",
    });

    if (!response.ok) {
      return { sessions: [], totalSessions: 0 };
    }

    const data = await response.json();
    return {
      sessions: Array.isArray(data.sessions) ? data.sessions : [],
      totalSessions: data.totalSessions || 0,
    };
  } catch (error) {
    // Handle network errors silently
    if (error instanceof TypeError && error.message === "Failed to fetch") {
      return { sessions: [], totalSessions: 0 };
    }
    // Log other errors
    console.error("Error listing chat sessions:", error);
    return { sessions: [], totalSessions: 0 };
  }
};

export const deleteAllChatSessions = async (): Promise<{ message: string }> => {
  const response = await fetch(`${serverUrl}/chat/delete/chat/all`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to delete chats");
  }

  return response.json();
};

export const deleteChatSession = async (
  sessionId: string
): Promise<{ message: string }> => {
  const response = await fetch(`${serverUrl}/chat/${sessionId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const data = await response.json();
    if (response.status === 404) {
      throw new Error("Chat not found");
    }
    if (response.status === 403) {
      throw new Error("Not authorized to delete this chat session");
    }
    throw new Error(data.error || "Failed to delete chat session");
  }

  return response.json();
};

export const queryMemory = async (
  memoryId: string,
  data: SendMessageRequest
): Promise<MemoryQueryResponse> => {
  if (!data.content || !data.content.trim()) {
    throw new Error("Message content is required");
  }

  const response = await fetch(
    `${serverUrl}/chat/from-memory/${memoryId}/query`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        content: data.content.trim(),
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    if (response.status === 400) {
      throw new Error(errorData.error || "Invalid input data");
    }
    if (response.status === 404) {
      throw new Error("Memory not found or unauthorized");
    }
    throw new Error(errorData.error || "Failed to query memory");
  }

  return response.json();
};
