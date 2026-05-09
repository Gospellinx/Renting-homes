"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAdsManager, type Campaign } from "@/hooks/useAdsManager";
import {
  ArrowLeft,
  CheckCircle2,
  Globe2,
  ImagePlus,
  Layers3,
  Loader2,
  Save,
  Send,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CampaignWizardProps {
  campaign?: Campaign | null;
  onComplete?: () => void;
  onCancel?: () => void;
}

const userTypeOptions = ["buyer", "renter", "agent", "company", "property_owner"];
const propertyTypeOptions = ["apartment", "house", "duplex", "land", "shop"];
const commonLocationOptions = ["Lagos", "Abuja", "Port Harcourt", "Ibadan", "Enugu"];

const parseList = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const toggleListValue = (currentValues: string[], nextValue: string) =>
  currentValues.includes(nextValue)
    ? currentValues.filter((value) => value !== nextValue)
    : [...currentValues, nextValue];

const toNumberOrNull = (value: string) => {
  const trimmedValue = value.trim();
  if (!trimmedValue) {
    return null;
  }

  const numericValue = Number(trimmedValue);
  return Number.isFinite(numericValue) ? numericValue : null;
};

const SectionHeading = ({
  number,
  title,
  description,
  icon: Icon,
}: {
  number: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <div className="flex items-start gap-4">
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#eef1ff] text-[#26225f]">
      <Icon className="h-5 w-5" />
    </div>
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b82a8]">
        Step {number}
      </p>
      <h3 className="text-xl font-semibold text-[#1f1a54]">{title}</h3>
      <p className="text-sm leading-6 text-[#6d7599]">{description}</p>
    </div>
  </div>
);

export default function CampaignWizard({
  campaign,
  onComplete,
  onCancel,
}: CampaignWizardProps) {
  const { upsertCampaignBundle } = useAdsManager();
  const { user } = useAuth();
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  const [campaignName, setCampaignName] = useState("");
  const [objective, setObjective] = useState("awareness");
  const [totalBudget, setTotalBudget] = useState("");
  const [dailyBudget, setDailyBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [adSetName, setAdSetName] = useState("");
  const [targetLocations, setTargetLocations] = useState<string[]>([]);
  const [customLocations, setCustomLocations] = useState("");
  const [targetUserTypes, setTargetUserTypes] = useState<string[]>([]);
  const [targetPropertyTypes, setTargetPropertyTypes] = useState<string[]>([]);
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");

  const [adName, setAdName] = useState("");
  const [adType, setAdType] = useState("property");
  const [headline, setHeadline] = useState("");
  const [description, setDescription] = useState("");
  const [ctaText, setCtaText] = useState("View Details");
  const [ctaLink, setCtaLink] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [badge, setBadge] = useState("");

  const primaryAdSet = campaign?.ad_sets?.[0] || null;
  const primaryAd = campaign?.primaryAd || null;

  useEffect(() => {
    setCampaignName(campaign?.name || "");
    setObjective(campaign?.objective || "awareness");
    setTotalBudget(campaign?.total_budget ? String(campaign.total_budget) : "");
    setDailyBudget(campaign?.daily_budget ? String(campaign.daily_budget) : "");
    setStartDate(campaign?.start_date?.slice(0, 10) || "");
    setEndDate(campaign?.end_date?.slice(0, 10) || "");

    setAdSetName(primaryAdSet?.name || "");
    setTargetLocations(primaryAdSet?.target_locations || []);
    setCustomLocations("");
    setTargetUserTypes(primaryAdSet?.target_user_types || []);
    setTargetPropertyTypes(primaryAdSet?.target_property_types || []);
    setMinBudget(
      primaryAdSet?.target_budget_min !== null && primaryAdSet?.target_budget_min !== undefined
        ? String(primaryAdSet.target_budget_min)
        : ""
    );
    setMaxBudget(
      primaryAdSet?.target_budget_max !== null && primaryAdSet?.target_budget_max !== undefined
        ? String(primaryAdSet.target_budget_max)
        : ""
    );

    setAdName(primaryAd?.name || "");
    setAdType(primaryAd?.ad_type || "property");
    setHeadline(primaryAd?.headline || "");
    setDescription(primaryAd?.description || "");
    setCtaText(primaryAd?.cta_text || "View Details");
    setCtaLink(primaryAd?.cta_link || "");
    setImageUrl(primaryAd?.image_url || "");
    setPrice(primaryAd?.price || "");
    setLocation(primaryAd?.location || "");
    setBadge(primaryAd?.badge || "");
  }, [campaign, primaryAd, primaryAdSet]);

  const mergedLocations = useMemo(
    () => Array.from(new Set([...targetLocations, ...parseList(customLocations)])),
    [customLocations, targetLocations]
  );

  const basicsComplete =
    campaignName.trim().length > 0 &&
    Number(totalBudget || 0) > 0 &&
    objective.trim().length > 0;
  const audienceComplete = mergedLocations.length > 0 && targetUserTypes.length > 0;
  const creativeComplete =
    headline.trim().length > 0 &&
    ctaText.trim().length > 0 &&
    (description.trim().length > 0 || imageUrl.trim().length > 0);
  const progressCount = [basicsComplete, audienceComplete, creativeComplete].filter(Boolean).length;

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploadingImage(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `ads/${user?.id || 'anonymous'}-${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage.from('property-images').getPublicUrl(filePath);
      
      setImageUrl(data.publicUrl);
      
      toast.success("Image uploaded successfully.");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload image.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSave = async (mode: "draft" | "pending_review") => {
    const result = await upsertCampaignBundle.mutateAsync({
      campaignId: campaign?.id,
      adSetId: primaryAdSet?.id,
      adId: primaryAd?.id,
      mode,
      campaign: {
        name: campaignName,
        objective,
        total_budget: Number(totalBudget || 0),
        daily_budget: toNumberOrNull(dailyBudget),
        start_date: startDate || null,
        end_date: endDate || null,
      },
      adSet: {
        name: adSetName,
        target_locations: mergedLocations,
        target_user_types: targetUserTypes,
        target_property_types: targetPropertyTypes,
        target_budget_min: toNumberOrNull(minBudget),
        target_budget_max: toNumberOrNull(maxBudget),
        schedule_start: startDate || null,
        schedule_end: endDate || null,
        budget: Number(totalBudget || 0),
      },
      ad: {
        name: adName,
        ad_type: adType,
        headline,
        description,
        cta_text: ctaText,
        cta_link: ctaLink,
        image_url: imageUrl,
        property_id: primaryAd?.property_id || null,
        price,
        location,
        badge,
      },
    });

    if (result) {
      onComplete?.();
    }
  };

  const isSaving = upsertCampaignBundle.isPending;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="overflow-hidden rounded-[32px] border border-[#dbe0f4] bg-[linear-gradient(135deg,#1f1a54_0%,#2d2873_58%,#6e62ca_100%)] text-white shadow-[0_28px_60px_rgba(31,26,84,0.18)]">
        <div className="grid gap-6 px-6 py-6 lg:grid-cols-[1.35fr_0.65fr] lg:px-8 lg:py-8">
          <div className="space-y-5">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-2 text-sm text-white/78 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to ads manager
            </button>
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white/85">
                <Sparkles className="h-3.5 w-3.5" />
                Campaign builder
              </div>
              <h2 className="text-3xl font-bold leading-tight lg:text-[2.4rem]">
                {campaign ? "Refine your campaign before the next review." : "Launch a campaign with a cleaner, review-ready setup."}
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-white/75 lg:text-base">
                Shape the brief, define the audience, and package the creative in a layout that is easier
                for your team and moderators to understand quickly.
              </p>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/12 bg-white/10 p-5 backdrop-blur-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
              Progress overview
            </p>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="text-4xl font-bold">{progressCount}/3</p>
                <p className="text-sm text-white/72">Core sections ready</p>
              </div>
              {campaign?.status && (
                <Badge variant="outline" className="border-white/20 bg-white/10 text-white">
                  {campaign.status.replace(/_/g, " ")}
                </Badge>
              )}
            </div>
            <div className="mt-5 space-y-3">
              {[
                { label: "Campaign basics", complete: basicsComplete },
                { label: "Audience targeting", complete: audienceComplete },
                { label: "Creative setup", complete: creativeComplete },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-2xl bg-black/10 px-4 py-3 text-sm"
                >
                  <span className="text-white/82">{item.label}</span>
                  <span className={cn("font-medium", item.complete ? "text-white" : "text-white/55")}>
                    {item.complete ? "Ready" : "Pending"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.35fr_0.72fr]">
        <div className="space-y-6">
          <Card className="border-[#dbe0f4] bg-white/95 shadow-[0_18px_45px_rgba(31,26,84,0.06)]">
            <CardHeader className="pb-2">
              <SectionHeading
                number="01"
                title="Campaign Basics"
                description="Set the strategic direction, spend, and date range for this advertising push."
                icon={Target}
              />
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="campaign-name">Campaign name</Label>
                <Input
                  id="campaign-name"
                  value={campaignName}
                  onChange={(event) => setCampaignName(event.target.value)}
                  placeholder="Lekki duplex promotion"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="objective">Objective</Label>
                <Select value={objective} onValueChange={setObjective}>
                  <SelectTrigger id="objective">
                    <SelectValue placeholder="Select objective" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="awareness">Awareness</SelectItem>
                    <SelectItem value="traffic">Traffic</SelectItem>
                    <SelectItem value="leads">Leads</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ad-type">Ad type</Label>
                <Select value={adType} onValueChange={setAdType}>
                  <SelectTrigger id="ad-type">
                    <SelectValue placeholder="Select ad type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="property">Property</SelectItem>
                    <SelectItem value="brand">Brand</SelectItem>
                    <SelectItem value="service">Service</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="total-budget">Total budget</Label>
                <Input
                  id="total-budget"
                  type="number"
                  min="0"
                  step="100"
                  value={totalBudget}
                  onChange={(event) => setTotalBudget(event.target.value)}
                  placeholder="50000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="daily-budget">Daily budget</Label>
                <Input
                  id="daily-budget"
                  type="number"
                  min="0"
                  step="100"
                  value={dailyBudget}
                  onChange={(event) => setDailyBudget(event.target.value)}
                  placeholder="5000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="start-date">Start date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(event) => setStartDate(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="end-date">End date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(event) => setEndDate(event.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#dbe0f4] bg-white/95 shadow-[0_18px_45px_rgba(31,26,84,0.06)]">
            <CardHeader className="pb-2">
              <SectionHeading
                number="02"
                title="Audience Targeting"
                description="Describe the neighborhood, user intent, and budget profile that should receive the ad."
                icon={Users}
              />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="ad-set-name">Audience name</Label>
                <Input
                  id="ad-set-name"
                  value={adSetName}
                  onChange={(event) => setAdSetName(event.target.value)}
                  placeholder="High-intent buyers in Lagos"
                />
              </div>

              <div className="space-y-3">
                <Label>Top locations</Label>
                <div className="flex flex-wrap gap-2">
                  {commonLocationOptions.map((option) => (
                    <Button
                      key={option}
                      type="button"
                      variant={targetLocations.includes(option) ? "default" : "outline"}
                      size="sm"
                      className="rounded-full"
                      onClick={() =>
                        setTargetLocations((currentValues) =>
                          toggleListValue(currentValues, option)
                        )
                      }
                    >
                      {option}
                    </Button>
                  ))}
                </div>
                <Input
                  value={customLocations}
                  onChange={(event) => setCustomLocations(event.target.value)}
                  placeholder="Add more locations, separated by commas"
                />
              </div>

              <div className="space-y-3">
                <Label>User types</Label>
                <div className="flex flex-wrap gap-2">
                  {userTypeOptions.map((option) => (
                    <Button
                      key={option}
                      type="button"
                      variant={targetUserTypes.includes(option) ? "default" : "outline"}
                      size="sm"
                      className="rounded-full capitalize"
                      onClick={() =>
                        setTargetUserTypes((currentValues) =>
                          toggleListValue(currentValues, option)
                        )
                      }
                    >
                      {option.replace(/_/g, " ")}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Property types</Label>
                <div className="flex flex-wrap gap-2">
                  {propertyTypeOptions.map((option) => (
                    <Button
                      key={option}
                      type="button"
                      variant={targetPropertyTypes.includes(option) ? "default" : "outline"}
                      size="sm"
                      className="rounded-full capitalize"
                      onClick={() =>
                        setTargetPropertyTypes((currentValues) =>
                          toggleListValue(currentValues, option)
                        )
                      }
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="min-budget">Audience minimum budget</Label>
                  <Input
                    id="min-budget"
                    type="number"
                    min="0"
                    step="100"
                    value={minBudget}
                    onChange={(event) => setMinBudget(event.target.value)}
                    placeholder="10000000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max-budget">Audience maximum budget</Label>
                  <Input
                    id="max-budget"
                    type="number"
                    min="0"
                    step="100"
                    value={maxBudget}
                    onChange={(event) => setMaxBudget(event.target.value)}
                    placeholder="150000000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#dbe0f4] bg-white/95 shadow-[0_18px_45px_rgba(31,26,84,0.06)]">
            <CardHeader className="pb-2">
              <SectionHeading
                number="03"
                title="Creative Setup"
                description="Shape the message and visual details that make the ad feel clear and premium."
                icon={ImagePlus}
              />
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="ad-name">Ad name</Label>
                <Input
                  id="ad-name"
                  value={adName}
                  onChange={(event) => setAdName(event.target.value)}
                  placeholder="Lekki duplex hero ad"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="badge">Badge</Label>
                <Input
                  id="badge"
                  value={badge}
                  onChange={(event) => setBadge(event.target.value)}
                  placeholder="Featured"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="headline">Headline</Label>
                <Input
                  id="headline"
                  value={headline}
                  onChange={(event) => setHeadline(event.target.value)}
                  placeholder="Luxury 4-bedroom duplex in Lekki Phase 1"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Highlight the property's value, location, and strongest features."
                  className="min-h-[140px] rounded-[24px] border-[#dbe0f4] bg-[#fbfbfe] p-4"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cta-text">CTA text</Label>
                <Input
                  id="cta-text"
                  value={ctaText}
                  onChange={(event) => setCtaText(event.target.value)}
                  placeholder="Book Inspection"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cta-link">CTA link</Label>
                <Input
                  id="cta-link"
                  value={ctaLink}
                  onChange={(event) => setCtaLink(event.target.value)}
                  placeholder="https://example.com/property"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="image-upload">Ad Image</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={isUploadingImage}
                    className="flex-1"
                  />
                  {isUploadingImage && <Loader2 className="h-5 w-5 animate-spin text-[#6d62c8]" />}
                </div>
                {imageUrl && (
                  <p className="text-xs text-muted-foreground mt-2">
                    Image uploaded successfully. You can preview it on the right.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Display price</Label>
                <Input
                  id="price"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  placeholder="NGN 45,000,000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Display location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(event) => setLocation(event.target.value)}
                  placeholder="Lekki Phase 1, Lagos"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <Card className="overflow-hidden border-0 bg-[linear-gradient(160deg,#ffffff_0%,#f6f7fd_100%)] shadow-[0_18px_45px_rgba(31,26,84,0.08)]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-[#1f1a54]">
                <Layers3 className="h-5 w-5 text-primary" />
                Campaign Summary
              </CardTitle>
              <CardDescription>
                A cleaner snapshot of what you are about to save or send for review.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[24px] border border-[#e3e7f7] bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7b82a8]">
                  Campaign overview
                </p>
                <h4 className="mt-2 text-xl font-semibold text-[#1f1a54]">
                  {campaignName || "Untitled campaign"}
                </h4>
                <p className="mt-1 text-sm text-[#6d7599] capitalize">
                  {objective} • {adType} ad
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-[#e3e7f7] bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#7b82a8]">Budget</p>
                  <p className="mt-1 text-lg font-semibold text-[#1f1a54]">
                    NGN {Number(totalBudget || 0).toLocaleString()}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#e3e7f7] bg-white p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-[#7b82a8]">Locations</p>
                  <p className="mt-1 text-lg font-semibold text-[#1f1a54]">{mergedLocations.length}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                {[
                  { label: "Campaign basics", complete: basicsComplete },
                  { label: "Audience targeting", complete: audienceComplete },
                  { label: "Creative setup", complete: creativeComplete },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-2xl border border-[#e3e7f7] bg-white px-4 py-3"
                  >
                    <span className="text-sm text-[#5f678a]">{item.label}</span>
                    <span
                      className={cn(
                        "text-sm font-medium",
                        item.complete ? "text-emerald-700" : "text-[#8a91b0]"
                      )}
                    >
                      {item.complete ? "Ready" : "Needs work"}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-[#dbe0f4] bg-white/95 shadow-[0_18px_45px_rgba(31,26,84,0.06)]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-[#1f1a54]">
                <Globe2 className="h-5 w-5 text-primary" />
                Live Preview
              </CardTitle>
              <CardDescription>
                This is how the creative direction is shaping up.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="overflow-hidden rounded-[28px] border border-[#dbe0f4] bg-[#f7f8ff]">
                <div className="relative h-48 bg-[#edf1ff]">
                  {imageUrl ? (
                    <img src={imageUrl} alt={headline || "Ad preview"} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[#8e95b8]">
                      <ImagePlus className="h-10 w-10" />
                    </div>
                  )}
                  {badge && (
                    <div className="absolute left-4 top-4 rounded-full bg-black/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                      {badge}
                    </div>
                  )}
                </div>
                <div className="space-y-3 p-5">
                  <div>
                    <h4 className="text-lg font-semibold text-[#1f1a54]">
                      {headline || "Your ad headline preview"}
                    </h4>
                    <p className="mt-2 text-sm leading-6 text-[#6b7397]">
                      {description || "Add a concise description to bring the offer to life."}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#1f1a54]">
                        {price || "Price not set"}
                      </p>
                      <p className="text-xs text-[#7f86ab]">{location || "Location not set"}</p>
                    </div>
                    <div className="rounded-full bg-[#26225f] px-4 py-2 text-sm font-medium text-white">
                      {ctaText || "View Details"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-dashed border-[#dbe0f4] bg-[#fafbff] p-4 text-sm text-[#687091]">
                Strong campaigns usually combine a clear headline, a compelling image, and a tight location match.
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2 rounded-full"
              onClick={() => handleSave("draft")}
              disabled={upsertCampaignBundle.isPending || isUploadingImage}
            >
              {upsertCampaignBundle.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Draft
            </Button>
            <Button
              type="button"
              className="w-full gap-2 rounded-full"
              onClick={() => handleSave("pending_review")}
              disabled={upsertCampaignBundle.isPending || isUploadingImage || progressCount < 3}
            >
              {upsertCampaignBundle.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Submit For Review
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full rounded-full"
              onClick={onCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
          </div>

          <div className="rounded-[26px] border border-[#ecd9bf] bg-[linear-gradient(135deg,#fbf4e8_0%,#fffaf3_100%)] p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-white/80 p-2 text-[#8b6135]">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-[#6f4c22]">Submission tip</p>
                <p className="mt-1 text-sm leading-6 text-[#7b5c39]">
                  Before submitting, double-check the CTA link, image quality, and audience choices so the moderation round goes faster.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
