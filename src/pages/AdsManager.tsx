import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Clock3,
  DollarSign,
  Eye,
  Image as ImageIcon,
  Layers3,
  Loader2,
  Megaphone,
  MousePointerClick,
  PauseCircle,
  Pencil,
  PlayCircle,
  Plus,
  Send,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAdsManager, type Campaign } from "@/hooks/useAdsManager";
import { useWallet } from "@/hooks/useWallet";
import CampaignWizard from "@/components/ads/CampaignWizard";
import WalletCard from "@/components/ads/WalletCard";
import BackButton from "@/components/BackButton";
import AuthPrompt from "@/components/AuthPrompt";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const formatCurrency = (amount: number) => `NGN ${amount.toLocaleString()}`;

const getStatusMeta = (status: string) => {
  switch (status) {
    case "active":
      return {
        label: "Live",
        badgeClass: "border-emerald-200 bg-emerald-50 text-emerald-700",
        panelClass: "border-emerald-200 bg-emerald-50/80",
      };
    case "paused":
      return {
        label: "Paused",
        badgeClass: "border-amber-200 bg-amber-50 text-amber-700",
        panelClass: "border-amber-200 bg-amber-50/80",
      };
    case "draft":
      return {
        label: "Draft",
        badgeClass: "border-slate-200 bg-slate-100 text-slate-700",
        panelClass: "border-slate-200 bg-slate-50/80",
      };
    case "pending_review":
      return {
        label: "In Review",
        badgeClass: "border-sky-200 bg-sky-50 text-sky-700",
        panelClass: "border-sky-200 bg-sky-50/80",
      };
    case "rejected":
      return {
        label: "Rejected",
        badgeClass: "border-red-200 bg-red-50 text-red-700",
        panelClass: "border-red-200 bg-red-50/80",
      };
    case "completed":
      return {
        label: "Completed",
        badgeClass: "border-slate-200 bg-slate-100 text-slate-700",
        panelClass: "border-slate-200 bg-slate-50/80",
      };
    default:
      return {
        label: status,
        badgeClass: "border-slate-200 bg-slate-100 text-slate-700",
        panelClass: "border-slate-200 bg-slate-50/80",
      };
  }
};

const OverviewStatCard = ({
  icon: Icon,
  label,
  value,
  hint,
  tone = "primary",
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: string;
  tone?: "primary" | "accent";
}) => (
  <Card className="border-[#dbe0f4] bg-white/90 shadow-[0_18px_45px_rgba(31,26,84,0.06)] backdrop-blur">
    <CardContent className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b82a8]">
            {label}
          </p>
          <p className="text-2xl font-bold text-[#1f1a54]">{value}</p>
          <p className="text-sm text-[#71789f]">{hint}</p>
        </div>
        <div
          className={cn(
            "rounded-2xl p-3",
            tone === "primary" ? "bg-[#eef1ff] text-[#26225f]" : "bg-[#f6efe5] text-[#8a6135]"
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const AdsManager = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading } = useAuth();
  const { campaigns, campaignsLoading, overview, updateCampaignStatus } = useAdsManager();
  const {
    wallet,
    walletLoading,
    transactions,
    transactionsLoading,
    initializePayment,
    verifyPayment,
  } = useWallet();

  const [showWizard, setShowWizard] = useState(false);
  const [activeTab, setActiveTab] = useState("campaigns");
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const paymentAction = searchParams.get("payment");
    const reference = searchParams.get("reference");

    if (paymentAction === "verify" && reference) {
      toast.info("Verifying your payment…");
      verifyPayment.mutate(
        { reference },
        {
          onSuccess: () => {
            setPaymentSuccess(true);
            navigate("/ads-manager", { replace: true });
          },
          onError: () => {
            navigate("/ads-manager", { replace: true });
          },
        }
      );
    }
  }, [navigate, searchParams, verifyPayment]);

  const openCreateWizard = () => {
    setEditingCampaign(null);
    setShowWizard(true);
  };

  const openEditWizard = (campaign: Campaign) => {
    setEditingCampaign(campaign);
    setShowWizard(true);
  };

  const handleWizardClose = () => {
    setEditingCampaign(null);
    setShowWizard(false);
  };

  const handleTopUp = async (amount: number) => {
    if (!user?.email) {
      toast.error("Please sign in with a valid email address before topping up.");
      return;
    }

    const data = await initializePayment.mutateAsync({
      amount,
      email: user.email,
    });

    const authorizationUrl =
      data?.authorization_url || data?.authorizationUrl || data?.data?.authorization_url;

    if (!authorizationUrl) {
      toast.error("Could not open the payment checkout. Please try again.");
      return;
    }

    window.location.href = authorizationUrl;
  };

  const handleCampaignStatus = async (
    campaignId: string,
    status: "pending_review" | "active" | "paused"
  ) => {
    await updateCampaignStatus.mutateAsync({
      campaignId,
      status,
    });
  };

  const topCampaign = useMemo(() => {
    if (!campaigns.length) {
      return null;
    }

    return [...campaigns].sort((left, right) => right.stats.clicks - left.stats.clicks)[0];
  }, [campaigns]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <AuthPrompt
        icon={Megaphone}
        title="Ads Manager"
        description="Create an account to run advertising campaigns and reach potential buyers."
      />
    );
  }

  // ── Payment success screen (shown after Paystack redirect) ────────────────
  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#f2f4fb_0%,#f4f1ec_100%)] flex items-center justify-center px-4">
        <div className="mx-auto flex max-w-lg flex-col items-center gap-7 text-center">
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 shadow-[0_0_0_12px_rgba(52,211,153,0.12)]">
            <CheckCircle2 className="h-12 w-12 text-emerald-600" />
          </div>
          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-[#1f1a54]">Payment Successful!</h2>
            <p className="text-base leading-7 text-[#6d7599]">
              Your campaign budget has been received and your ad is now <strong>queued for review</strong>.
              Our moderation team will evaluate your creative and you will be notified once it goes live.
            </p>
          </div>
          <div className="w-full rounded-[24px] border border-emerald-200 bg-white/80 p-5 text-sm text-left space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-[#374151]">Budget charged to your campaign</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              <span className="text-[#374151]">Campaign status updated to <strong>In Review</strong></span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-sky-400" />
              <span className="text-[#374151]">You will be notified once the ad is approved</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setPaymentSuccess(false)}
            className="mt-2 rounded-full bg-[#26225f] px-8 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#1f1b50]"
          >
            View My Campaigns
          </button>
        </div>
      </div>
    );
  }

  if (showWizard) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#f6f7fb_0%,#f4efe7_100%)] px-4 py-8">
        <CampaignWizard
          campaign={editingCampaign}
          onComplete={handleWizardClose}
          onCancel={handleWizardClose}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f2f4fb_0%,#f7f7fb_42%,#f4f1ec_100%)]">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_top_left,rgba(91,104,228,0.16),transparent_34%),radial-gradient(circle_at_top_right,rgba(72,153,255,0.16),transparent_28%),radial-gradient(circle_at_bottom,rgba(162,153,255,0.12),transparent_42%)]" />

      <header className="relative z-40 border-b border-[#d7daf0] bg-white/80 backdrop-blur">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <BackButton />
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#7a82a9]">
                  Advertising Workspace
                </p>
                <h1 className="text-2xl font-bold text-[#1f1a54]">Ads Manager</h1>
                <p className="text-sm text-[#6f7599]">
                  Build campaigns, submit ads for review, and monitor live performance.
                </p>
              </div>
            </div>
            <Button
              onClick={openCreateWizard}
              className="gap-2 rounded-full bg-[#26225f] px-5 text-white hover:bg-[#1f1b50]"
            >
              <Plus className="h-4 w-4" />
              Create Campaign
            </Button>
          </div>
        </div>
      </header>

      <main className="container relative z-10 mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="space-y-6 lg:col-span-3">
            <Card className="overflow-hidden border-0 bg-[linear-gradient(135deg,#1f1a54_0%,#2e2a73_56%,#6d62c8_100%)] text-white shadow-[0_28px_60px_rgba(31,26,84,0.22)]">
              <CardContent className="p-6 lg:p-8">
                <div className="grid gap-8 lg:grid-cols-[1.45fr_0.95fr]">
                  <div className="space-y-5">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-white/85">
                      <Sparkles className="h-3.5 w-3.5" />
                      Campaign control center
                    </div>
                    <div className="space-y-3">
                      <h2 className="max-w-2xl text-3xl font-bold leading-tight lg:text-[2.5rem]">
                        Run polished property campaigns without losing track of review status or spend.
                      </h2>
                      <p className="max-w-2xl text-sm leading-6 text-white/72 lg:text-base">
                        Draft new ads, send them for moderation, and keep a clean view of wallet
                        balance, delivery, and approval progress in one place.
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <div className="rounded-2xl border border-white/12 bg-white/10 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.16em] text-white/65">
                          Active campaigns
                        </p>
                        <p className="mt-1 text-2xl font-semibold">{overview.activeCampaigns}</p>
                      </div>
                      <div className="rounded-2xl border border-white/12 bg-white/10 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.16em] text-white/65">
                          In review
                        </p>
                        <p className="mt-1 text-2xl font-semibold">{overview.pendingCampaigns}</p>
                      </div>
                      <div className="rounded-2xl border border-white/12 bg-white/10 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.16em] text-white/65">
                          Wallet balance
                        </p>
                        <p className="mt-1 text-2xl font-semibold">
                          {walletLoading ? "..." : formatCurrency(wallet?.balance || 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-[28px] border border-white/12 bg-white/10 p-5 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-white/65">
                          Best momentum
                        </p>
                        <h3 className="mt-1 text-lg font-semibold">
                          {topCampaign?.name || "No live data yet"}
                        </h3>
                      </div>
                      <div className="rounded-2xl bg-white/12 p-3">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    <div className="mt-5 space-y-4 text-sm">
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <span className="text-white/70">Total clicks</span>
                        <span className="font-semibold">
                          {topCampaign ? topCampaign.stats.clicks.toLocaleString() : "0"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-b border-white/10 pb-3">
                        <span className="text-white/70">CTR</span>
                        <span className="font-semibold">
                          {topCampaign ? `${topCampaign.stats.ctr}%` : "0%"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-white/70">Current focus</span>
                        <span className="font-semibold capitalize">
                          {topCampaign?.objective || "Build your first campaign"}
                        </span>
                      </div>
                    </div>
                    <div className="mt-5 flex items-center gap-2 rounded-2xl bg-black/10 px-4 py-3 text-sm text-white/78">
                      <ArrowRight className="h-4 w-4" />
                      Approve more quality creatives to unlock stronger delivery.
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              <OverviewStatCard
                icon={DollarSign}
                label="Total Spend"
                value={formatCurrency(overview.totalSpend)}
                hint="Committed campaign budget"
              />
              <OverviewStatCard
                icon={Eye}
                label="Impressions"
                value={overview.totalImpressions.toLocaleString()}
                hint="How often your ads were seen"
                tone="accent"
              />
              <OverviewStatCard
                icon={MousePointerClick}
                label="Clicks"
                value={overview.totalClicks.toLocaleString()}
                hint="Traffic generated from ads"
              />
              <OverviewStatCard
                icon={TrendingUp}
                label="Average CTR"
                value={`${overview.avgCtr}%`}
                hint="Average click-through rate"
                tone="accent"
              />
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b82a8]">
                    Campaign Views
                  </p>
                  <h2 className="text-xl font-semibold text-[#1f1a54]">Your advertising workspace</h2>
                </div>
                <TabsList className="rounded-full border border-[#dbe0f4] bg-white/90 p-1 shadow-sm">
                  <TabsTrigger
                    value="campaigns"
                    className="rounded-full px-4 data-[state=active]:bg-[#26225f] data-[state=active]:text-white"
                  >
                    Campaigns
                  </TabsTrigger>
                  <TabsTrigger
                    value="insights"
                    className="rounded-full px-4 data-[state=active]:bg-[#26225f] data-[state=active]:text-white"
                  >
                    Insights
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="campaigns" className="mt-5 space-y-4">
                {campaignsLoading ? (
                  <Card className="border-[#dbe0f4] bg-white/90">
                    <CardContent className="flex items-center justify-center p-10">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </CardContent>
                  </Card>
                ) : campaigns.length > 0 ? (
                  campaigns.map((campaign) => {
                    const ad = campaign.primaryAd;
                    const rejectionReason = ad?.rejection_reason;
                    const statusMeta = getStatusMeta(campaign.status);

                    return (
                      <Card
                        key={campaign.id}
                        className="overflow-hidden border-[#dbe0f4] bg-white/95 shadow-[0_18px_45px_rgba(31,26,84,0.06)]"
                      >
                        <CardContent className="p-0">
                          <div className="grid lg:grid-cols-[1.55fr_0.75fr]">
                            <div className="p-5 lg:p-6">
                              <div className="flex flex-col gap-5 md:flex-row">
                                <div className="relative h-32 w-full overflow-hidden rounded-[24px] bg-[#eef1ff] md:h-32 md:w-36">
                                  {ad?.image_url ? (
                                    <img
                                      src={ad.image_url}
                                      alt={ad.headline}
                                      className="h-full w-full object-cover"
                                    />
                                  ) : (
                                    <div className="flex h-full w-full items-center justify-center">
                                      <ImageIcon className="h-8 w-8 text-[#8c93b7]" />
                                    </div>
                                  )}
                                  {ad?.badge && (
                                    <div className="absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">
                                      {ad.badge}
                                    </div>
                                  )}
                                </div>

                                <div className="min-w-0 flex-1 space-y-4">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Badge className={cn("border", statusMeta.badgeClass)}>
                                      {statusMeta.label}
                                    </Badge>
                                    {ad?.status && ad.status !== campaign.status && (
                                      <Badge variant="outline" className="capitalize">
                                        Ad {ad.status.replace(/_/g, " ")}
                                      </Badge>
                                    )}
                                    <Badge variant="outline" className="capitalize">
                                      {campaign.objective}
                                    </Badge>
                                  </div>

                                  <div className="space-y-2">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                      <div>
                                        <h3 className="text-xl font-semibold text-[#1f1a54]">
                                          {campaign.name}
                                        </h3>
                                        <p className="text-sm text-[#70779e]">
                                          {ad?.headline || "No ad headline yet"}
                                        </p>
                                      </div>
                                      <div className="text-left md:text-right">
                                        <p className="text-xs uppercase tracking-[0.16em] text-[#7b82a8]">
                                          Budget
                                        </p>
                                        <p className="text-lg font-semibold text-[#1f1a54]">
                                          {formatCurrency(campaign.total_budget)}
                                        </p>
                                      </div>
                                    </div>

                                    {ad?.description && (
                                      <p className="max-w-2xl text-sm leading-6 text-[#667091]">
                                        {ad.description}
                                      </p>
                                    )}
                                  </div>

                                  <div className="grid gap-3 md:grid-cols-3">
                                    <div className="rounded-2xl border border-[#e7eaf8] bg-[#fbfbfe] p-3">
                                      <p className="text-xs uppercase tracking-[0.15em] text-[#7b82a8]">
                                        Impressions
                                      </p>
                                      <p className="mt-1 text-lg font-semibold text-[#1f1a54]">
                                        {campaign.stats.impressions.toLocaleString()}
                                      </p>
                                    </div>
                                    <div className="rounded-2xl border border-[#e7eaf8] bg-[#fbfbfe] p-3">
                                      <p className="text-xs uppercase tracking-[0.15em] text-[#7b82a8]">
                                        Clicks
                                      </p>
                                      <p className="mt-1 text-lg font-semibold text-[#1f1a54]">
                                        {campaign.stats.clicks.toLocaleString()}
                                      </p>
                                    </div>
                                    <div className="rounded-2xl border border-[#e7eaf8] bg-[#fbfbfe] p-3">
                                      <p className="text-xs uppercase tracking-[0.15em] text-[#7b82a8]">
                                        CTR
                                      </p>
                                      <p className="mt-1 text-lg font-semibold text-[#1f1a54]">
                                        {campaign.stats.ctr}%
                                      </p>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-4 text-sm text-[#6f7599]">
                                    <span className="inline-flex items-center gap-1.5">
                                      <CalendarDays className="h-4 w-4" />
                                      {campaign.start_date
                                        ? new Date(campaign.start_date).toLocaleDateString()
                                        : "No start date"}
                                      {" - "}
                                      {campaign.end_date
                                        ? new Date(campaign.end_date).toLocaleDateString()
                                        : "No end date"}
                                    </span>
                                    {ad?.location && <span>{ad.location}</span>}
                                  </div>

                                  {rejectionReason && (
                                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                                      <p className="font-medium text-red-800">Review feedback</p>
                                      <p className="mt-1">{rejectionReason}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className={cn("border-t p-5 lg:border-l lg:border-t-0 lg:p-6", statusMeta.panelClass)}>
                              <div className="space-y-4">
                                <div>
                                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7b82a8]">
                                    Campaign State
                                  </p>
                                  <p className="mt-2 text-lg font-semibold text-[#1f1a54]">
                                    {statusMeta.label}
                                  </p>
                                  <p className="mt-1 text-sm text-[#667091]">
                                    Approved ads: {campaign.stats.approvedAds} • Pending:{" "}
                                    {campaign.stats.pendingAds} • Rejected: {campaign.stats.rejectedAds}
                                  </p>
                                </div>

                                <div className="space-y-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full justify-start gap-2"
                                    onClick={() => openEditWizard(campaign)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                    Edit Campaign
                                  </Button>

                                  {(campaign.status === "draft" || campaign.status === "rejected") && (
                                    <Button
                                      type="button"
                                      className="w-full justify-start gap-2"
                                      onClick={() =>
                                        handleCampaignStatus(campaign.id, "pending_review")
                                      }
                                      disabled={updateCampaignStatus.isPending}
                                    >
                                      <Send className="h-4 w-4" />
                                      Submit For Review
                                    </Button>
                                  )}

                                  {campaign.status === "active" && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      className="w-full justify-start gap-2"
                                      onClick={() => handleCampaignStatus(campaign.id, "paused")}
                                      disabled={updateCampaignStatus.isPending}
                                    >
                                      <PauseCircle className="h-4 w-4" />
                                      Pause Campaign
                                    </Button>
                                  )}

                                  {campaign.status === "paused" && (
                                    <Button
                                      type="button"
                                      className="w-full justify-start gap-2"
                                      onClick={() => handleCampaignStatus(campaign.id, "active")}
                                      disabled={updateCampaignStatus.isPending}
                                    >
                                      <PlayCircle className="h-4 w-4" />
                                      Resume Campaign
                                    </Button>
                                  )}
                                </div>

                                {campaign.status === "pending_review" && (
                                  <div className="rounded-2xl border border-dashed border-sky-200 bg-white/50 p-4 text-sm text-sky-700">
                                    Your campaign is queued for moderation and will go live after approval.
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })
                ) : (
                  <Card className="border-[#dbe0f4] bg-white/95 shadow-[0_18px_45px_rgba(31,26,84,0.06)]">
                    <CardContent className="p-12 text-center">
                      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-[#eef1ff]">
                        <Megaphone className="h-8 w-8 text-[#26225f]" />
                      </div>
                      <h3 className="mb-2 text-xl font-semibold text-[#1f1a54]">No campaigns yet</h3>
                      <p className="mx-auto mb-6 max-w-xl text-sm leading-6 text-[#6f7599]">
                        Start with a polished campaign brief, define your audience, and send your
                        first creative for approval.
                      </p>
                      <Button onClick={openCreateWizard} className="gap-2 rounded-full px-5">
                        <Plus className="h-4 w-4" />
                        Create Your First Campaign
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="insights" className="mt-5">
                <Card className="border-[#dbe0f4] bg-white/95 shadow-[0_18px_45px_rgba(31,26,84,0.06)]">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-[#1f1a54]">
                      <BarChart3 className="h-5 w-5" />
                      Performance Insights
                    </CardTitle>
                    <CardDescription>
                      A cleaner read of campaign health, approval pressure, and delivery totals.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {campaigns.length > 0 ? (
                      <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                        <Card className="border-[#e3e7f7] bg-[#fafbff]">
                          <CardContent className="p-5">
                            <div className="mb-4 flex items-center gap-2 text-[#1f1a54]">
                              <Layers3 className="h-4 w-4" />
                              <h4 className="font-semibold">Campaign health snapshot</h4>
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="rounded-2xl border border-[#e7eaf8] bg-white p-4">
                                <p className="text-xs uppercase tracking-[0.16em] text-[#7b82a8]">
                                  Active
                                </p>
                                <p className="mt-1 text-2xl font-semibold text-[#1f1a54]">
                                  {overview.activeCampaigns}
                                </p>
                              </div>
                              <div className="rounded-2xl border border-[#e7eaf8] bg-white p-4">
                                <p className="text-xs uppercase tracking-[0.16em] text-[#7b82a8]">
                                  Pending review
                                </p>
                                <p className="mt-1 text-2xl font-semibold text-[#1f1a54]">
                                  {overview.pendingCampaigns}
                                </p>
                              </div>
                              <div className="rounded-2xl border border-[#e7eaf8] bg-white p-4">
                                <p className="text-xs uppercase tracking-[0.16em] text-[#7b82a8]">
                                  Drafts
                                </p>
                                <p className="mt-1 text-2xl font-semibold text-[#1f1a54]">
                                  {overview.draftCampaigns}
                                </p>
                              </div>
                              <div className="rounded-2xl border border-[#e7eaf8] bg-white p-4">
                                <p className="text-xs uppercase tracking-[0.16em] text-[#7b82a8]">
                                  Rejected
                                </p>
                                <p className="mt-1 text-2xl font-semibold text-[#1f1a54]">
                                  {overview.rejectedCampaigns}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <div className="space-y-4">
                          <Card className="border-[#e3e7f7] bg-[#fafbff]">
                            <CardContent className="p-5">
                              <div className="mb-4 flex items-center gap-2 text-[#1f1a54]">
                                <CheckCircle2 className="h-4 w-4" />
                                <h4 className="font-semibold">Delivery totals</h4>
                              </div>
                              <div className="space-y-3 text-sm">
                                <div className="flex items-center justify-between rounded-2xl border border-[#e7eaf8] bg-white px-4 py-3">
                                  <span className="text-[#67708f]">Total impressions</span>
                                  <span className="font-semibold text-[#1f1a54]">
                                    {overview.totalImpressions.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between rounded-2xl border border-[#e7eaf8] bg-white px-4 py-3">
                                  <span className="text-[#67708f]">Total clicks</span>
                                  <span className="font-semibold text-[#1f1a54]">
                                    {overview.totalClicks.toLocaleString()}
                                  </span>
                                </div>
                                <div className="flex items-center justify-between rounded-2xl border border-[#e7eaf8] bg-white px-4 py-3">
                                  <span className="text-[#67708f]">Average CTR</span>
                                  <span className="font-semibold text-[#1f1a54]">{overview.avgCtr}%</span>
                                </div>
                                <div className="flex items-center justify-between rounded-2xl border border-[#e7eaf8] bg-white px-4 py-3">
                                  <span className="text-[#67708f]">Budget committed</span>
                                  <span className="font-semibold text-[#1f1a54]">
                                    {formatCurrency(overview.totalSpend)}
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>

                          <Card className="border-[#e3e7f7] bg-[linear-gradient(135deg,#f7efe3_0%,#fff8ef_100%)]">
                            <CardContent className="p-5">
                              <div className="mb-3 flex items-center gap-2 text-[#6f4a1f]">
                                <Clock3 className="h-4 w-4" />
                                <h4 className="font-semibold">Operator note</h4>
                              </div>
                              <p className="text-sm leading-6 text-[#7b5c39]">
                                Campaigns with approved creatives can be resumed instantly. Draft and
                                rejected campaigns should be refreshed before sending them back to review.
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    ) : (
                      <div className="py-10 text-center text-muted-foreground">
                        Create a campaign to unlock richer insights here.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-6">
              <WalletCard
                balance={wallet?.balance || 0}
                loading={walletLoading}
                topUpPending={initializePayment.isPending || verifyPayment.isPending}
                transactions={transactions}
                transactionsLoading={transactionsLoading}
                onTopUp={handleTopUp}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdsManager;
