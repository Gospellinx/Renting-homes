import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export interface AdminAd {
  id: string;
  ad_set_id: string;
  name: string;
  ad_type: string;
  headline: string;
  description: string | null;
  cta_text: string;
  cta_link: string | null;
  image_url: string | null;
  price: string | null;
  location: string | null;
  badge: string | null;
  impressions: number | null;
  clicks: number | null;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export const useAdminAds = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Check if user is admin
  const { data: isAdmin } = useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data, error } = await supabase
        .rpc('has_role', { _role: 'admin', _user_id: user.id });
      if (error) throw error;
      return data as boolean;
    },
    enabled: !!user?.id,
  });

  // Fetch all ads for admin review
  const { data: ads, isLoading } = useQuery({
    queryKey: ['admin-ads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as AdminAd[];
    },
    enabled: isAdmin === true,
  });

  // Approve ad mutation
  const approveAd = useMutation({
    mutationFn: async (adId: string) => {
      const { data, error } = await supabase
        .from('ads')
        .update({ 
          status: 'approved',
          rejection_reason: null 
        })
        .eq('id', adId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ads'] });
      queryClient.invalidateQueries({ queryKey: ['approved-ads'] });
    },
  });

  // Reject ad mutation
  const rejectAd = useMutation({
    mutationFn: async ({ adId, reason }: { adId: string; reason: string }) => {
      const { data, error } = await supabase
        .from('ads')
        .update({ 
          status: 'rejected',
          rejection_reason: reason 
        })
        .eq('id', adId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-ads'] });
    },
  });

  // Get stats
  const pendingCount = ads?.filter(a => a.status === 'pending_review').length || 0;
  const approvedCount = ads?.filter(a => a.status === 'approved').length || 0;
  const rejectedCount = ads?.filter(a => a.status === 'rejected').length || 0;

  return {
    ads,
    isLoading,
    isAdmin,
    approveAd,
    rejectAd,
    pendingCount,
    approvedCount,
    rejectedCount,
  };
};
