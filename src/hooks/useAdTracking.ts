import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAdTracking = () => {
  // Track impression - uses direct update since RPC types may not be synced
  const trackImpression = useMutation({
    mutationFn: async (adId: string) => {
      // First get current impressions
      const { data: ad } = await supabase
        .from('ads')
        .select('impressions')
        .eq('id', adId)
        .single();
      
      if (ad) {
        await supabase
          .from('ads')
          .update({ impressions: (ad.impressions || 0) + 1 })
          .eq('id', adId);
      }
    },
  });

  // Track click - uses direct update since RPC types may not be synced
  const trackClick = useMutation({
    mutationFn: async (adId: string) => {
      // First get current clicks
      const { data: ad } = await supabase
        .from('ads')
        .select('clicks')
        .eq('id', adId)
        .single();
      
      if (ad) {
        await supabase
          .from('ads')
          .update({ clicks: (ad.clicks || 0) + 1 })
          .eq('id', adId);
      }
    },
  });

  return {
    trackImpression,
    trackClick,
  };
};
