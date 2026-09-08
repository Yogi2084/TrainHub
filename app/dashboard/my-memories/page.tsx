"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getMemories,
  Memory,
  searchMemories,
  getUserTags,
  searchMemoriesByTag,
  semanticSearchMemories,
} from "@/lib/api/memories";
import { MemoryCard } from "@/components/memory/MemoryCard";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, X, Tag, Info } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { auth } from "@/lib/auth";
import { PageTransition } from "@/components/ui/page-transition";
import { motion } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useHighlightStore } from "@/lib/stores/highlightStore";

interface QueryResponse {
  memories: Memory[];
  summary?: string;
  totalPages: number;
  totalMemories: number;
}

export default function MyMemoriesPage() {
  const { data: session } = auth.useSession();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [isManualSearch, setIsManualSearch] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isTagsPopoverOpen, setIsTagsPopoverOpen] = useState(false);
  const [isSemanticSearch, setIsSemanticSearch] = useState(false);
  const [activeSearchQuery, setActiveSearchQuery] = useState("");
  const limit = 10;
  const highlightId = useHighlightStore((state) => state.highlightId);
  const clearHighlightId = useHighlightStore((state) => state.clearHighlightId);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);

  // Fetch user tags
  const { data: tagsData, isLoading: isTagsLoading } = useQuery({
    queryKey: ["userTags"],
    queryFn: getUserTags,
  });

  // Fetch memories
  const { data, isLoading, error, refetch, isFetching } =
    useQuery<QueryResponse>({
      queryKey: [
        "memories",
        page,
        selectedTags,
        activeSearchQuery,
        isManualSearch,
        isSemanticSearch,
      ],
      queryFn: async (): Promise<QueryResponse> => {
        if (selectedTags.length > 0) {
          const result = await searchMemoriesByTag(selectedTags, page, limit);
          return {
            memories: result.memories,
            totalPages: result.totalPages,
            totalMemories: result.totalMemories,
          };
        }
        if (activeSearchQuery.trim().length >= 1 || isManualSearch) {
          if (isSemanticSearch) {
            if (!session?.user?.id) {
              throw new Error("User not authenticated");
            }
            const results = await semanticSearchMemories({
              query: activeSearchQuery,
              userId: session.user.id,
              topK: limit,
            });
            return {
              memories: results.matches.map((match) => ({
                id: match.id,
                userId: match.metadata.userId,
                title: match.metadata.title,
                content: match.metadata.content,
                tags: match.metadata.tags ? match.metadata.tags.split(",") : [],
                createdAt: match.metadata.updatedAt || new Date().toISOString(),
                updatedAt: match.metadata.updatedAt || new Date().toISOString(),
              })),
              summary: results.summary,
              totalPages: results.totalPages,
              totalMemories: results.totalMatches,
            };
          }
          const result = await searchMemories(activeSearchQuery, page, limit);
          return {
            memories: result.memories,
            totalPages: result.totalPages,
            totalMemories: result.totalMemories,
          };
        }
        const result = await getMemories(page, limit);
        return {
          memories: result.memories,
          totalPages: result.totalPages,
          totalMemories: result.memories.length, // Since getMemories doesn't return totalMemories
        };
      },
      enabled:
        !activeSearchQuery ||
        activeSearchQuery.trim().length >= 1 ||
        isManualSearch ||
        selectedTags.length > 0,
    });

  // Reset page when search parameters change
  useEffect(() => {
    setPage(1);
  }, [activeSearchQuery, isManualSearch, selectedTags]);

  // Handle manual search trigger
  const handleSearch = () => {
    if (searchQuery.trim().length >= 1) {
      setActiveSearchQuery(searchQuery);
      setIsManualSearch(true);
      setPage(1);
      refetch();
    }
  };

  // Reset manual search flag when search query is cleared
  useEffect(() => {
    if (!searchQuery) {
      setIsManualSearch(false);
      setActiveSearchQuery("");
    }
  }, [searchQuery]);

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Clear all selected tags
  const clearTags = () => {
    setSelectedTags([]);
    setPage(1);
  };

  useEffect(() => {
    if (highlightId) {
      setPage(1);
      refetch();
    }
  }, [highlightId, refetch]);

  useEffect(() => {
    if (highlightId && data?.memories.some((m) => m.id === highlightId)) {
      setHighlightedId(highlightId);
      const timer = setTimeout(() => {
        setHighlightedId(null);
        clearHighlightId();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [highlightId, data, clearHighlightId]);

  return (
    <PageTransition>
      <div className="max-w-4xl mx-auto h-full p-4">
        <h1 className="text-2xl font-semibold mb-4 text-center">
          Your Memories
        </h1>

        {/* Search and Filter Section */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:gap-2">
            {/* Search bar and mode selector */}
            <div className="flex flex-col w-full gap-2 sm:flex-row sm:items-center">
              {/* Responsive search input for mobile and desktop */}
              {/* Mobile view: improved UI */}
              <div className="block sm:hidden w-full">
                <div className="relative w-full mb-3">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                  <Input
                    type="text"
                    placeholder="Search memories (min. 1 character)...  |  Press Enter ⏎"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
                    className="pl-10 w-full h-11 text-base rounded-xl shadow-sm"
                  />
                </div>
              </div>
              {/* Desktop view: original placeholder, right span, Search button */}
              <div className="relative flex-1 w-full hidden sm:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search memories (min. 1 character)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                  className="pl-10 w-full h-9 text-sm"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground block">
                  Press Enter
                </span>
              </div>

              {/* Mode selector with info tooltip */}
              <div className="flex items-center gap-2 w-full sm:w-auto mt-1 sm:mt-0">
                <Button
                  variant={isSemanticSearch ? "outline" : "default"}
                  onClick={() => setIsSemanticSearch(false)}
                  className={`flex-1 sm:flex-none h-9 text-sm px-3 ${
                    !isSemanticSearch ? "border-primary border-2" : ""
                  }`}
                  aria-pressed={!isSemanticSearch}
                >
                  Text Search
                </Button>
                <Button
                  variant={isSemanticSearch ? "default" : "outline"}
                  onClick={() => setIsSemanticSearch(true)}
                  className={`flex-1 sm:flex-none h-9 text-sm px-3 ${
                    isSemanticSearch ? "border-primary border-2" : ""
                  }`}
                  aria-pressed={isSemanticSearch}
                >
                  Semantic Search
                </Button>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="ml-1 cursor-pointer">
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs text-xs">
                      <b>Text Search:</b> Finds memories by exact words or
                      phrases you type.
                      <br />
                      <b>Semantic Search:</b> Uses AI to find memories by
                      meaning, even if the exact words don&apos;t match.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <Popover
              open={isTagsPopoverOpen}
              onOpenChange={setIsTagsPopoverOpen}
            >
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="cursor-pointer w-full sm:w-auto h-9 text-sm"
                >
                  <Tag className="h-4 w-4 mr-2" />
                  Filter Tags
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-100 p-4 ml-60 sm:ml-10 left-1/2 -translate-x-1/2 right-auto sm:left-auto sm:translate-x-0">
                <h3 className="font-semibold mb-3">Filter by Tags</h3>

                {isTagsLoading ? (
                  <div className="flex justify-center py-4">
                    <Spinner size={24} />
                  </div>
                ) : tagsData?.tags && tagsData.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2 max-h-60 overflow-y-auto">
                    {tagsData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={
                          selectedTags.includes(tag) ? "default" : "outline"
                        }
                        className="cursor-pointer"
                        onClick={() => toggleTag(tag)}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm py-2">
                    No tags available
                  </p>
                )}

                <div className="flex justify-end mt-4 gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={clearTags}
                    disabled={selectedTags.length === 0}
                    className="cursor-pointer"
                  >
                    Clear
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setIsTagsPopoverOpen(false)}
                    className="cursor-pointer"
                  >
                    Apply
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* Selected Tags Display */}
        {selectedTags.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2 items-center">
            <span className="text-sm text-muted-foreground">Filtering by:</span>
            {selectedTags.map((tag) => (
              <Badge key={tag} className="flex items-center gap-1 py-1">
                {tag}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => toggleTag(tag)}
                />
              </Badge>
            ))}
            <Button
              variant="link"
              className="text-destructive h-auto p-0 text-sm cursor-pointer"
              onClick={clearTags}
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Search status indicator */}
        {(isManualSearch || activeSearchQuery) && (
          <div className="mb-4">
            <div className="relative flex flex-wrap items-center gap-3 bg-background/60 border border-muted rounded-lg px-4 py-2 shadow-sm">
              {/* Clear search button in top right */}
              <button
                onClick={() => {
                  setSearchQuery("");
                  setActiveSearchQuery("");
                  setIsManualSearch(false);
                }}
                className="absolute top-2 right-3 text-xs sm:text-sm text-destructive hover:underline px-2 py-1 rounded transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200"
                style={{ zIndex: 2 }}
              >
                Clear search
              </button>
              <span
                className={`px-2 py-1 rounded font-medium text-xs sm:text-sm flex items-center ${
                  isSemanticSearch
                    ? "bg-violet-100 text-violet-700"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                {isSemanticSearch ? "Semantic Search" : "Text Search"} Active
              </span>
              <span className="flex items-center text-muted-foreground text-xs sm:text-sm">
                <Search className="h-4 w-4 mr-1" />
                Showing results for:{" "}
                <span className="font-semibold mx-1">
                  &quot;{isManualSearch ? searchQuery : activeSearchQuery}&quot;
                </span>
              </span>
            </div>
          </div>
        )}

        {/* Loading state - shown while fetching search results */}
        {isLoading || isFetching ? (
          <div className="flex justify-center items-center min-h-[500px]">
            <Spinner size={32} />
          </div>
        ) : error ? (
          <div className="text-muted-foreground text-center">
            {error instanceof Error &&
            error.message.includes("No memories found")
              ? "No memories yet. Start creating some!"
              : error instanceof Error && error.message.includes("Network")
              ? "No memories yet. Start creating some!"
              : error instanceof Error
              ? error.message
              : "Failed to load memories. Please try again later."}
          </div>
        ) : data?.memories.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              {searchQuery || activeSearchQuery || selectedTags.length > 0
                ? "No memories found matching your criteria."
                : "No memories yet. Start creating some!"}
            </p>
          </div>
        ) : (
          <>
            {/* Semantic Search Summary */}
            {isSemanticSearch && data?.summary && (
              <div className="mb-6 p-4 bg-background rounded-lg border  ">
                <h3 className="font-semibold mb-2">Summary</h3>
                <p className="text-foreground whitespace-pre-line">
                  {data.summary}
                </p>
              </div>
            )}

            <div className="space-y-4">
              <h2 className="text-2xl font-semibold mb-4">
                {isSemanticSearch && data?.summary && "Related Memories"}
              </h2>
              {data?.memories.map((memory: Memory, index: number) => (
                <motion.div
                  key={memory.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <MemoryCard
                    memory={memory}
                    onRefresh={refetch}
                    highlight={highlightedId === memory.id}
                  />
                </motion.div>
              ))}
            </div>

            {data && data.totalPages > 1 && (
              <Pagination className="mt-6">
                <PaginationContent className="gap-2">
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(Math.max(1, page - 1));
                      }}
                      isActive={page > 1}
                      className={cn(
                        page === 1 ? "opacity-50 cursor-not-allowed" : "",
                        "border"
                      )}
                    />
                  </PaginationItem>

                  <PaginationItem>
                    <span className="px-4 py-2 text-sm text-muted-foreground">
                      Page {page} of {data.totalPages}
                    </span>
                  </PaginationItem>

                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(Math.min(data.totalPages, page + 1));
                      }}
                      isActive={page < data.totalPages}
                      className={cn(
                        page === data.totalPages
                          ? "opacity-50 cursor-not-allowed"
                          : "",
                        "border"
                      )}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>
    </PageTransition>
  );
}
