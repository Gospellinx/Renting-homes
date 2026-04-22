import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export interface Campaign {
  id: string;
  user_id: string;
  name: string;
  objective: string;
  status: string;
  total_budget: number;
  daily_budget: number | null;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface AdSet {
  id: string;
  campaign_id: string;
  name: string;
  target_locations: string[] | null;
  target_user_types: string[] | null;
  target_property_types: string[] | null;
  target_budget_min: number | null;
  target_budget_max: number | null;
  schedule_start: string | null;
  schedule_end: string | null;
  budget: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Ad {
  id: string;
  ad_set_id: string;
  name: string;
  ad_type: string;
  headline: string;
  description: string | null;
  cta_text: string;
  cta_link: string | null;
  image_url: string | null;
  property_id: string | null;
  price: string | null;
  location: string | null;
  badge: string | null;
  impressions: number;
  clicks: number;
  status: string;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export const useAdsManager = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch all campaigns for the user
  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ['ad-campaigns', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Campaign[];
    },
    enabled: !!user,
  });

  // Create campaign mutation
  const createCampaign = useMutation({
    mutationFn: async (campaign: Partial<Campaign>) => {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .insert({
          user_id: user?.id,
          name: campaign.name || 'New Campaign',
          objective: campaign.objective || 'awareness',
          total_budget: campaign.total_budget || 0,
          daily_budget: campaign.daily_budget,
          start_date: campaign.start_date,
          end_date: campaign.end_date,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as Campaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad-campaigns'] });
      toast.success('Campaign created successfully');
    },
    onError: (error) => {
      toast.error('Failed to create campaign');
      console.error(error);
    },
  });

  // Update campaign mutation
  const updateCampaign = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Campaign> & { id: string }) => {
      const { data, error } = await supabase
        .from('ad_campaigns')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Campaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad-campaigns'] });
    },
  });

  // Create ad set mutation
  const createAdSet = useMutation({
    mutationFn: async (adSet: Partial<AdSet> & { campaign_id: string }) => {
      const { data, error } = await supabase
        .from('ad_sets')
        .insert({
          campaign_id: adSet.campaign_id,
          name: adSet.name || 'New Ad Set',
          target_locations: adSet.target_locations,
          target_user_types: adSet.target_user_types,
          target_property_types: adSet.target_property_types,
          target_budget_min: adSet.target_budget_min,
          target_budget_max: adSet.target_budget_max,
          schedule_start: adSet.schedule_start,
          schedule_end: adSet.schedule_end,
          budget: adSet.budget || 0,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as AdSet;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ad-sets'] });
    },
  });

  // Create ad mutation
  const createAd = useMutation({
    mutationFn: async (ad: Partial<Ad> & { ad_set_id: string }) => {
      const { data, error } = await supabase
        .from('ads')
        .insert({
          ad_set_id: ad.ad_set_id,
          name: ad.name || 'New Ad',
          ad_type: ad.ad_type || 'property',
          headline: ad.headline || '',
          description: ad.description,
          cta_text: ad.cta_text || 'Learn More',
          cta_link: ad.cta_link,
          image_url: ad.image_url,
          property_id: ad.property_id,
          price: ad.price,
          location: ad.location,
          badge: ad.badge,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as Ad;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      toast.success('Ad created successfully');
    },
  });

  return {
    campaigns,
    campaignsLoading,
    createCampaign,
    updateCampaign,
    createAdSet,
    createAd,
  };
};
