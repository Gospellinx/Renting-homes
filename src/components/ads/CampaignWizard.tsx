"use client";

import { useEffect, useState } from "react";
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
  ImagePlus,
  Loader2,
  Save,
  Send,
  Target,
  Users,
} from "lucide-react";

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

export default function CampaignWizard({
  campaign,
  onComplete,
  onCancel,
}: CampaignWizardProps) {
  const { upsertCampaignBundle } = useAdsManager();

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

  const handleSave = async (mode: "draft" | "pending_review") => {
    const mergedLocations = Array.from(
      new Set([...targetLocations, ...parseList(customLocations)])
    );

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
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            <button type="button" onClick={onCancel} className="hover:text-foreground">
              Back to ads manager
            </button>
          </div>
          <h2 className="text-2xl font-bold text-[#1f1a54]">
            {campaign ? "Edit Campaign" : "Create Ad Campaign"}
          </h2>
          <p className="text-sm text-muted-foreground">
            Build one campaign, define its audience, and submit the ad for review.
          </p>
        </div>
        {campaign?.status && (
          <Badge variant="outline" className="capitalize">
            Current status: {campaign.status.replace(/_/g, " ")}
          </Badge>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Campaign Basics
              </CardTitle>
              <CardDescription>
                Set the goal, budget, and flight dates for this campaign.
              </CardDescription>
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Audience Targeting
              </CardTitle>
              <CardDescription>
                Choose where this ad should appear and who should see it.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
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
                      onClick={() =>
                        setTargetUserTypes((currentValues) =>
                          toggleListValue(currentValues, option)
                        )
                      }
                      className="capitalize"
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
                      onClick={() =>
                        setTargetPropertyTypes((currentValues) =>
                          toggleListValue(currentValues, option)
                        )
                      }
                      className="capitalize"
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

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImagePlus className="h-5 w-5 text-primary" />
                Ad Creative
              </CardTitle>
              <CardDescription>
                Provide the text and media that buyers or renters will see.
              </CardDescription>
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
                  className="min-h-[120px]"
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
                <Label htmlFor="image-url">Image URL</Label>
                <Input
                  id="image-url"
                  value={imageUrl}
                  onChange={(event) => setImageUrl(event.target.value)}
                  placeholder="https://images.example.com/ad-cover.jpg"
                />
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

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Launch Checklist</CardTitle>
              <CardDescription>
                Save a draft if you are still polishing the ad, or submit it for admin review when
                it is ready.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="rounded-lg border p-3">
                <p className="font-medium text-foreground">Campaign setup</p>
                <p>Name, objective, budget, and schedule should be final.</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="font-medium text-foreground">Audience setup</p>
                <p>Choose the right locations and property intent for better reach.</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="font-medium text-foreground">Creative review</p>
                <p>Make sure the headline, image, and CTA link are accurate.</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Campaign Summary</CardTitle>
              <CardDescription>
                A quick view of what will be saved with this campaign.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Objective</span>
                <span className="font-medium capitalize">{objective}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Budget</span>
                <span className="font-medium">NGN {Number(totalBudget || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Locations</span>
                <span className="font-medium text-right">
                  {[...targetLocations, ...parseList(customLocations)].join(", ") || "Not set"}
                </span>
              </div>
              <Separator />
              <div className="space-y-2">
                <p className="font-medium text-foreground">Headline preview</p>
                <p className="rounded-lg bg-muted/50 p-3 text-sm">
                  {headline || "Your ad headline will appear here."}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleSave("draft")}
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Draft
            </Button>
            <Button type="button" onClick={() => handleSave("pending_review")} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Submit For Review
            </Button>
            <Button type="button" variant="ghost" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
