import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ApprovedAd {
  id: string;
  headline: string;
  description: string | null;
  image_url: string | null;
  price: string | null;
  location: string | null;
  badge: string | null;
  cta_text: string;
  cta_link: string | null;
  ad_type: string;
}

export const useApprovedAds = () => {
  return useQuery({
    queryKey: ['approved-ads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ads')
        .select('id, headline, description, image_url, price, location, badge, cta_text, cta_link, ad_type')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ApprovedAd[];
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
};
