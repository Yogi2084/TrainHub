import { serverUrl } from "../environment";

export interface Memory {
  id: string;
  userId: string;
  title?: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  sourceUrl?: string;
  user?: {
    id: string;
    name: string;
  };
}

export interface CreateMemoryRequest {
  title?: string;
  content: string;
  tags?: string[];
}

export interface CreateMemoryFromUrlRequest {
  url: string;
}

export interface GetMemoriesResponse {
  memories: Memory[];
  page: number;
  totalPages: number;
  totalMemories: number;
}

export interface SearchMemoriesResponse {
  memories: Memory[];
  page: number;
  totalPages: number;
  totalMemories: number;
}

export interface SemanticSearchRequest {
  query: string;
  topK?: number;
  userId: string;
}

export interface SemanticSearchMatch {
  id: string;
  score: number;
  metadata: {
    userId: string;
    content: string;
    title?: string;
    tags?: string;
    updatedAt?: string;
  };
}

export interface SemanticSearchResponse {
  summary: string;
  matches: SemanticSearchMatch[];
  page: number;
  totalPages: number;
  totalMatches: number;
}

export const createMemory = async (
  data: CreateMemoryRequest
): Promise<Memory> => {
  const response = await fetch(`${serverUrl}/memories`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create memory");
  }

  return response.json();
};

export const getMemories = async (
  page: number,
  limit: number
): Promise<{
  memories: Memory[];
  totalMemories: number;
  totalPages: number;
}> => {
  const response = await fetch(
    `${serverUrl}/memories?page=${page}&limit=${limit}`,
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to fetch memories");
  }

  const data = await response.json();
  return {
    memories: data.memories || [],
    totalMemories: data.totalMemories || 0,
    totalPages: data.totalPages || 1,
  };
};

export const updateMemory = async ({
  memoryId,
  title,
  content,
  tags,
}: {
  memoryId: string;
  title?: string;
  content?: string;
  tags?: string[];
}): Promise<Memory> => {
  const response = await fetch(`${serverUrl}/memories/${memoryId}`, {
    method: "PATCH",
    credentials: "include",
    body: JSON.stringify({ title, content, tags }),
  });

  if (!response.ok) throw new Error("Failed to update memory");

  const data = await response.json();
  return data.memory;
};

export const deleteMemory = async (memoryId: string): Promise<void> => {
  const response = await fetch(`${serverUrl}/memories/${memoryId}`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) throw new Error("Failed to delete memory");
};

export const searchMemories = async (
  query: string,
  page: number = 1,
  limit: number = 10
): Promise<SearchMemoriesResponse> => {
  const url = new URL(`${serverUrl}/memories/memory/search`);
  url.searchParams.append("query", query);
  url.searchParams.append("page", page.toString());
  url.searchParams.append("limit", limit.toString());

  const response = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error("Query is required");
    }
    if (response.status === 404) {
      throw new Error("No matching memories found");
    }
    throw new Error("Failed to search memories");
  }

  return response.json();
};

export const getUserTags = async (): Promise<{ tags: string[] }> => {
  const response = await fetch(`${serverUrl}/memories/tags/me/all`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user tags");
  }

  return response.json();
};

export const searchMemoriesByTag = async (
  tags: string[],
  page: number = 1,
  limit: number = 10
): Promise<SearchMemoriesResponse> => {
  const url = new URL(`${serverUrl}/memories/tag/search`);
  url.searchParams.append("tags", tags.join(","));
  url.searchParams.append("page", page.toString());
  url.searchParams.append("limit", limit.toString());

  const response = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to search memories by tag");
  }

  return response.json();
};

export const getMemoriesCount = async (): Promise<number> => {
  const response = await fetch(`${serverUrl}/user/memories/count`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch memory count");
  }

  const data = await response.json();
  return data.count;
};

export const semanticSearchMemories = async (
  data: SemanticSearchRequest
): Promise<SemanticSearchResponse> => {
  const response = await fetch(`${serverUrl}/semantic-search`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error("Query and userId are required");
    }
    if (response.status === 404) {
      throw new Error("User not found");
    }
    if (response.status === 500) {
      throw new Error("Semantic query failed");
    }
    throw new Error("Failed to perform semantic search");
  }

  return response.json();
};

export const getMemoryById = async (memoryId: string): Promise<Memory> => {
  const response = await fetch(`${serverUrl}/memories/${memoryId}`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Memory not found");
    }
    if (response.status === 403) {
      throw new Error("Not authorized to access this memory");
    }
    throw new Error("Failed to fetch memory");
  }

  const data = await response.json();
  return data.memory;
};

export const deleteAllMemories = async (): Promise<{ message: string }> => {
  const response = await fetch(`${serverUrl}/memories/delete/all`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to delete memories");
  }

  return response.json();
};

export const createMemoryFromUrl = async (
  data: CreateMemoryFromUrlRequest
): Promise<Memory> => {
  const response = await fetch(`${serverUrl}/memories/from-url`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create memory from URL");
  }

  return response.json();
};

export const getTagsCount = async (): Promise<number> => {
  const response = await fetch(`${serverUrl}/memories/tags/count`, {
    method: "GET",
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to fetch tags count");
  }

  const data = await response.json();
  return data.count;
};
