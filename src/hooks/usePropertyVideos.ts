/**
 * usePropertyVideos.ts
 * ────────────────────────────────────────────────────────────────
 * React hook for fetching & managing videos for a property.
 * Wraps TanStack Query for caching, refetching, and stale-time.
 * ────────────────────────────────────────────────────────────────
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteVideoRecord,
  fetchPropertyVideos,
  type PropertyVideoRecord,
} from "@/lib/cloudinaryUpload";

const QUERY_KEY = (propertyId: string) => ["property-videos", propertyId];

// ─── Fetch hook ───────────────────────────────────────────────────────────────

export function usePropertyVideos(propertyId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEY(propertyId ?? ""),
    queryFn: () => fetchPropertyVideos(propertyId!),
    enabled: !!propertyId,
    staleTime: 60_000,          // 1 min
    refetchOnWindowFocus: false,
  });
}

// ─── Delete mutation ──────────────────────────────────────────────────────────

export function useDeletePropertyVideo(propertyId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (videoId: string) => deleteVideoRecord(videoId),
    onMutate: async (videoId: string) => {
      // Optimistic update — remove from list immediately
      await queryClient.cancelQueries({ queryKey: QUERY_KEY(propertyId) });
      const previous = queryClient.getQueryData<PropertyVideoRecord[]>(QUERY_KEY(propertyId));
      queryClient.setQueryData<PropertyVideoRecord[]>(QUERY_KEY(propertyId), (old) =>
        (old ?? []).filter((v) => v.id !== videoId)
      );
      return { previous };
    },
    onError: (_err, _videoId, context) => {
      // Roll back on error
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEY(propertyId), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY(propertyId) });
    },
  });
}
