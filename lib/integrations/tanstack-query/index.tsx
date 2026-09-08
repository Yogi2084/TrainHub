import { QueryClient } from "@tanstack/react-query";

export const tanstackQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 6 * 60 * 60 * 1000, // Data stays fresh for 6 hours
      gcTime: 10 * 60 * 60 * 1000, // Cache is kept for 10 hours
      refetchOnWindowFocus: false, // Don't refetch when window regains focus
      refetchOnMount: false, // Don't refetch when component mounts
      refetchOnReconnect: false, // Don't refetch when reconnecting
      retry: 1, // Only retry failed requests once
    },
  },
});
