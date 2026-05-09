import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

type CampaignRow = Tables<"ad_campaigns">;
type AdSetRow = Tables<"ad_sets">;
type AdRow = Tables<"ads">;

type CampaignStatus =
  | "draft"
  | "pending_review"
  | "active"
  | "paused"
  | "rejected"
  | "completed";

export interface CampaignStats {
  impressions: number;
  clicks: number;
  ctr: number;
  approvedAds: number;
  pendingAds: number;
  rejectedAds: number;
}

export interface CampaignAd extends AdRow {}

export interface CampaignAdSet extends AdSetRow {
  ads: CampaignAd[];
}

export interface Campaign extends CampaignRow {
  ad_sets: CampaignAdSet[];
  primaryAd: CampaignAd | null;
  stats: CampaignStats;
}

export interface AdsOverviewStats {
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  avgCtr: number;
  activeCampaigns: number;
  pendingCampaigns: number;
  draftCampaigns: number;
  rejectedCampaigns: number;
}

export interface CampaignBundleInput {
  campaignId?: string;
  adSetId?: string;
  adId?: string;
  mode: Extract<CampaignStatus, "draft" | "pending_review">;
  campaign: {
    name: string;
    objective: string;
    total_budget: number;
    daily_budget: number | null;
    start_date: string | null;
    end_date: string | null;
  };
  adSet: {
    name: string;
    target_locations: string[];
    target_user_types: string[];
    target_property_types: string[];
    target_budget_min: number | null;
    target_budget_max: number | null;
    schedule_start: string | null;
    schedule_end: string | null;
    budget: number;
  };
  ad: {
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
  };
}

const buildCampaignStats = (ads: CampaignAd[]): CampaignStats => {
  const impressions = ads.reduce((sum, ad) => sum + (ad.impressions || 0), 0);
  const clicks = ads.reduce((sum, ad) => sum + (ad.clicks || 0), 0);

  return {
    impressions,
    clicks,
    ctr: impressions > 0 ? Number(((clicks / impressions) * 100).toFixed(2)) : 0,
    approvedAds: ads.filter((ad) => ad.status === "approved").length,
    pendingAds: ads.filter((ad) => ad.status === "pending_review").length,
    rejectedAds: ads.filter((ad) => ad.status === "rejected").length,
  };
};

const normalizeCampaign = (record: CampaignRow & { ad_sets?: Array<AdSetRow & { ads?: AdRow[] | null }> | null }) => {
  const adSets: CampaignAdSet[] = (record.ad_sets || []).map((adSet) => ({
    ...adSet,
    ads: (adSet.ads || []) as CampaignAd[],
  }));
  const allAds = adSets.flatMap((adSet) => adSet.ads);

  return {
    ...record,
    ad_sets: adSets,
    primaryAd: allAds[0] || null,
    stats: buildCampaignStats(allAds),
  } as Campaign;
};

const normalizeDateValue = (value: string | null) => {
  if (!value) {
    return null;
  }

  return value.trim() || null;
};

const ensureValidCampaignBundle = (input: CampaignBundleInput) => {
  const campaignName = input.campaign.name.trim();
  const headline = input.ad.headline.trim();

  if (input.mode === "pending_review") {
    if (!campaignName) {
      throw new Error("Campaign name is required.");
    }

    if (!headline) {
      throw new Error("Ad headline is required.");
    }

    if (!input.ad.cta_text.trim()) {
      throw new Error("Call-to-action text is required.");
    }

    if (input.campaign.total_budget <= 0) {
      throw new Error("Campaign budget must be greater than zero.");
    }
  }

  if (
    input.campaign.daily_budget !== null &&
    input.campaign.daily_budget > input.campaign.total_budget
  ) {
    throw new Error("Daily budget cannot be greater than the total budget.");
  }

  if (
    input.campaign.start_date &&
    input.campaign.end_date &&
    new Date(input.campaign.end_date) < new Date(input.campaign.start_date)
  ) {
    throw new Error("End date cannot be earlier than the start date.");
  }
};

export const useAdsManager = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery({
    queryKey: ["ad-campaigns", user?.id],
    queryFn: async () => {
      if (!user?.id) {
        return [];
      }

      const { data, error } = await supabase
        .from("ad_campaigns")
        .select("*, ad_sets(*, ads(*))")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      return ((data || []) as Array<
        CampaignRow & { ad_sets?: Array<AdSetRow & { ads?: AdRow[] | null }> | null }
      >).map(normalizeCampaign);
    },
    enabled: !!user?.id,
  });

  const overview: AdsOverviewStats = {
    totalSpend: campaigns.reduce((sum, campaign) => sum + (campaign.total_budget || 0), 0),
    totalImpressions: campaigns.reduce((sum, campaign) => sum + campaign.stats.impressions, 0),
    totalClicks: campaigns.reduce((sum, campaign) => sum + campaign.stats.clicks, 0),
    avgCtr:
      campaigns.length > 0
        ? Number(
            (
              campaigns.reduce((sum, campaign) => sum + campaign.stats.ctr, 0) / campaigns.length
            ).toFixed(2)
          )
        : 0,
    activeCampaigns: campaigns.filter((campaign) => campaign.status === "active").length,
    pendingCampaigns: campaigns.filter((campaign) => campaign.status === "pending_review").length,
    draftCampaigns: campaigns.filter((campaign) => campaign.status === "draft").length,
    rejectedCampaigns: campaigns.filter((campaign) => campaign.status === "rejected").length,
  };

  const upsertCampaignBundle = useMutation({
    mutationFn: async (input: CampaignBundleInput) => {
      if (!user?.id) {
        throw new Error("You need to be signed in to manage ad campaigns.");
      }

      ensureValidCampaignBundle(input);

      const status: CampaignStatus = input.mode === "pending_review" ? "pending_review" : "draft";

      // For new inserts, always start as draft to satisfy any restrictive RLS policies
      const initialStatus = input.campaignId ? status : "draft";

      const campaignPayload: TablesInsert<"ad_campaigns"> | TablesUpdate<"ad_campaigns"> = {
        name: input.campaign.name.trim() || "Untitled Campaign",
        objective: input.campaign.objective,
        total_budget: input.campaign.total_budget,
        daily_budget: input.campaign.daily_budget,
        start_date: normalizeDateValue(input.campaign.start_date),
        end_date: normalizeDateValue(input.campaign.end_date),
        status: initialStatus,
      };

      let campaignRecord: CampaignRow;

      if (input.campaignId) {
        const { data, error } = await supabase
          .from("ad_campaigns")
          .update(campaignPayload)
          .eq("id", input.campaignId)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        campaignRecord = data as CampaignRow;
      } else {
        const { data, error } = await supabase
          .from("ad_campaigns")
          .insert({
            ...(campaignPayload as TablesInsert<"ad_campaigns">),
            user_id: user.id,
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        campaignRecord = data as CampaignRow;
      }

      const adSetPayload: TablesInsert<"ad_sets"> | TablesUpdate<"ad_sets"> = {
        campaign_id: campaignRecord.id,
        name: input.adSet.name.trim() || `${campaignRecord.name} Audience`,
        target_locations: input.adSet.target_locations,
        target_user_types: input.adSet.target_user_types,
        target_property_types: input.adSet.target_property_types,
        target_budget_min: input.adSet.target_budget_min,
        target_budget_max: input.adSet.target_budget_max,
        schedule_start:
          normalizeDateValue(input.adSet.schedule_start) ||
          normalizeDateValue(input.campaign.start_date),
        schedule_end:
          normalizeDateValue(input.adSet.schedule_end) ||
          normalizeDateValue(input.campaign.end_date),
        budget: input.adSet.budget,
        status: initialStatus,
      };

      let adSetRecord: AdSetRow;

      if (input.adSetId) {
        const { data, error } = await supabase
          .from("ad_sets")
          .update(adSetPayload)
          .eq("id", input.adSetId)
          .eq("campaign_id", campaignRecord.id)
          .select()
          .single();

        if (error) {
          throw error;
        }

        adSetRecord = data as AdSetRow;
      } else {
        const { data, error } = await supabase
          .from("ad_sets")
          .insert(adSetPayload as TablesInsert<"ad_sets">)
          .select()
          .single();

        if (error) {
          throw error;
        }

        adSetRecord = data as AdSetRow;
      }

      const adPayload: TablesInsert<"ads"> | TablesUpdate<"ads"> = {
        ad_set_id: adSetRecord.id,
        name: input.ad.name.trim() || `${campaignRecord.name} Ad`,
        ad_type: input.ad.ad_type,
        headline: input.ad.headline.trim(),
        description: input.ad.description?.trim() || null,
        cta_text: input.ad.cta_text.trim() || "Learn More",
        cta_link: input.ad.cta_link?.trim() || null,
        image_url: input.ad.image_url?.trim() || null,
        property_id: input.ad.property_id,
        price: input.ad.price?.trim() || null,
        location: input.ad.location?.trim() || null,
        badge: input.ad.badge?.trim() || null,
        status: initialStatus,
        rejection_reason: null,
      };

      if (input.adId) {
        const { error } = await supabase
          .from("ads")
          .update(adPayload)
          .eq("id", input.adId)
          .eq("ad_set_id", adSetRecord.id);

        if (error) {
          throw error;
        }
      } else {
        const { error } = await supabase.from("ads").insert({
          ...(adPayload as TablesInsert<"ads">),
          impressions: 0,
          clicks: 0,
        });

        if (error) {
          throw error;
        }
      }

      // If this was a new insert and we wanted to submit for review, update the status now
      if (!input.campaignId && status === "pending_review") {
        await supabase.from("ad_campaigns").update({ status: "pending_review" }).eq("id", campaignRecord.id);
        await supabase.from("ad_sets").update({ status: "pending_review" }).eq("id", adSetRecord.id);
        await supabase.from("ads").update({ status: "pending_review" }).eq("ad_set_id", adSetRecord.id);
      }

      return {
        campaignId: campaignRecord.id,
        mode: input.mode,
        isEdit: !!input.campaignId,
      };
    },
    onSuccess: ({ mode, isEdit }) => {
      queryClient.invalidateQueries({ queryKey: ["ad-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["approved-ads"] });
      toast.success(
        mode === "draft"
          ? isEdit
            ? "Draft campaign updated."
            : "Campaign saved as draft."
          : isEdit
            ? "Campaign updated and sent for review."
            : "Campaign created and sent for review."
      );
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "We could not save this campaign.";
      toast.error(message);
    },
  });

  const updateCampaignStatus = useMutation({
    mutationFn: async ({
      campaignId,
      status,
    }: {
      campaignId: string;
      status: CampaignStatus;
    }) => {
      if (!user?.id) {
        throw new Error("You need to be signed in to manage ad campaigns.");
      }

      const { data: campaignRecord, error: fetchError } = await supabase
        .from("ad_campaigns")
        .select("id, user_id, ad_sets(id, ads(id, status))")
        .eq("id", campaignId)
        .eq("user_id", user.id)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      const adSets = (campaignRecord.ad_sets || []) as Array<{
        id: string;
        ads: Array<{ id: string; status: string }> | null;
      }>;
      const adSetIds = adSets.map((adSet) => adSet.id);
      const ads = adSets.flatMap((adSet) => adSet.ads || []);

      if (status === "active" && !ads.some((ad) => ["approved", "paused"].includes(ad.status))) {
        throw new Error("This campaign needs at least one approved ad before it can go live.");
      }

      const adSetStatus =
        status === "active"
          ? "active"
          : status === "paused"
            ? "paused"
            : status === "pending_review"
              ? "pending_review"
              : status;

      const { error: campaignError } = await supabase
        .from("ad_campaigns")
        .update({ status })
        .eq("id", campaignId)
        .eq("user_id", user.id);

      if (campaignError) {
        throw campaignError;
      }

      if (adSetIds.length > 0) {
        const { error: adSetError } = await supabase
          .from("ad_sets")
          .update({ status: adSetStatus })
          .in("id", adSetIds);

        if (adSetError) {
          throw adSetError;
        }
      }

      const pendingReviewAdIds = ads
        .filter((ad) => ["draft", "rejected", "paused"].includes(ad.status))
        .map((ad) => ad.id);
      const pausedAdIds = ads.filter((ad) => ["approved", "active"].includes(ad.status)).map((ad) => ad.id);
      const resumableAdIds = ads.filter((ad) => ad.status === "paused").map((ad) => ad.id);

      if (status === "pending_review" && pendingReviewAdIds.length > 0) {
        const { error: adError } = await supabase
          .from("ads")
          .update({ status: "pending_review", rejection_reason: null })
          .in("id", pendingReviewAdIds);

        if (adError) {
          throw adError;
        }
      }

      if (status === "paused" && pausedAdIds.length > 0) {
        const { error: adError } = await supabase
          .from("ads")
          .update({ status: "paused" })
          .in("id", pausedAdIds);

        if (adError) {
          throw adError;
        }
      }

      if (status === "active" && resumableAdIds.length > 0) {
        const { error: adError } = await supabase
          .from("ads")
          .update({ status: "approved" })
          .in("id", resumableAdIds);

        if (adError) {
          throw adError;
        }
      }

      return { campaignId, status };
    },
    onSuccess: ({ status }) => {
      queryClient.invalidateQueries({ queryKey: ["ad-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["approved-ads"] });

      const messages: Record<CampaignStatus, string> = {
        draft: "Campaign saved as draft.",
        pending_review: "Campaign submitted for review.",
        active: "Campaign is now live.",
        paused: "Campaign has been paused.",
        rejected: "Campaign has been marked as rejected.",
        completed: "Campaign has been completed.",
      };

      toast.success(messages[status]);
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : "We could not update this campaign.";
      toast.error(message);
    },
  });

  return {
    campaigns,
    campaignsLoading,
    overview,
    upsertCampaignBundle,
    updateCampaignStatus,
  };
};
