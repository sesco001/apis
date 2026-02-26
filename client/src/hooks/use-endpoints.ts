import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useEndpoints(filters?: { search?: string; category?: string }) {
  return useQuery({
    queryKey: [api.endpoints.list.path, filters],
    queryFn: async () => {
      // Construct URL with query parameters if they exist
      const url = new URL(api.endpoints.list.path, window.location.origin);
      if (filters?.search) url.searchParams.append("search", filters.search);
      if (filters?.category && filters.category !== "All") url.searchParams.append("category", filters.category);

      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch endpoints");
      
      const data = await res.json();
      return api.endpoints.list.responses[200].parse(data);
    },
  });
}

export function useScrapeEndpoints() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.endpoints.scrape.path, {
        method: api.endpoints.scrape.method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.message || "Failed to trigger scrape");
      }
      
      const data = await res.json();
      return api.endpoints.scrape.responses[200].parse(data);
    },
    onSuccess: () => {
      // Invalidate the list query to trigger a refetch of the new data
      queryClient.invalidateQueries({ queryKey: [api.endpoints.list.path] });
    },
  });
}
