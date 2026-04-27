import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAdTracking = () => {
  const trackImpression = useMutation({
    mutationFn: async (adId: string) => {
      const { error } = await supabase.rpc('increment_ad_impressions', {
        ad_id: adId,
      });

      if (!error) {
        return;
      }

      const { data: ad, error: fetchError } = await supabase
        .from('ads')
        .select('impressions')
        .eq('id', adId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      const { error: updateError } = await supabase
        .from('ads')
        .update({ impressions: (ad.impressions || 0) + 1 })
        .eq('id', adId);

      if (updateError) {
        throw updateError;
      }
    },
  });

  const trackClick = useMutation({
    mutationFn: async (adId: string) => {
      const { error } = await supabase.rpc('increment_ad_clicks', {
        ad_id: adId,
      });

      if (!error) {
        return;
      }

      const { data: ad, error: fetchError } = await supabase
        .from('ads')
        .select('clicks')
        .eq('id', adId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      const { error: updateError } = await supabase
        .from('ads')
        .update({ clicks: (ad.clicks || 0) + 1 })
        .eq('id', adId);

      if (updateError) {
        throw updateError;
      }
    },
  });

  return {
    trackImpression,
    trackClick,
  };
};
