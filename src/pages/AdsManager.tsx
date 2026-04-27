import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  CalendarDays,
  DollarSign,
  Eye,
  Image as ImageIcon,
  Loader2,
  Megaphone,
  MousePointerClick,
  PauseCircle,
  Pencil,
  PlayCircle,
  Plus,
  Send,
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

const formatCurrency = (amount: number) => `NGN ${amount.toLocaleString()}`;

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

  useEffect(() => {
    const paymentAction = searchParams.get("payment");
    const reference = searchParams.get("reference");

    if (paymentAction === "verify" && reference) {
      toast.info("Verifying wallet payment...");
      verifyPayment.mutate(
        { reference },
        {
          onSettled: () => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-700";
      case "paused":
        return "bg-amber-500/10 text-amber-700";
      case "draft":
        return "bg-slate-200 text-slate-700";
      case "pending_review":
        return "bg-sky-500/10 text-sky-700";
      case "rejected":
        return "bg-red-500/10 text-red-700";
      case "completed":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

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

  if (showWizard) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
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

      <header className="relative z-40 border-b border-[#d7daf0] bg-white/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <BackButton />
              <div>
                <h1 className="text-2xl font-bold text-[#1f1a54]">Ads Manager</h1>
                <p className="text-sm text-[#6f7599]">
                  Build campaigns, submit ads for review, and monitor live performance.
                </p>
              </div>
            </div>
            <Button
              onClick={openCreateWizard}
              className="gap-2 bg-[#26225f] text-white hover:bg-[#1f1b50]"
            >
              <Plus className="h-4 w-4" />
              Create Campaign
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Spend</p>
                      <p className="text-xl font-bold">{formatCurrency(overview.totalSpend)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-accent/50 p-2">
                      <Eye className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Impressions</p>
                      <p className="text-xl font-bold">{overview.totalImpressions.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <MousePointerClick className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Clicks</p>
                      <p className="text-xl font-bold">{overview.totalClicks.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-accent/50 p-2">
                      <TrendingUp className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg. CTR</p>
                      <p className="text-xl font-bold">{overview.avgCtr}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>

              <TabsContent value="campaigns">
                {campaignsLoading ? (
                  <Card>
                    <CardContent className="flex items-center justify-center p-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </CardContent>
                  </Card>
                ) : campaigns.length > 0 ? (
                  <div className="space-y-4">
                    {campaigns.map((campaign) => {
                      const ad = campaign.primaryAd;
                      const rejectionReason = ad?.rejection_reason;

                      return (
                        <Card key={campaign.id} className="overflow-hidden border-[#d7daf0] bg-white/90">
                          <CardContent className="p-5">
                            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                              <div className="flex flex-1 gap-4">
                                {ad?.image_url ? (
                                  <img
                                    src={ad.image_url}
                                    alt={ad.headline}
                                    className="h-28 w-28 rounded-2xl object-cover"
                                  />
                                ) : (
                                  <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-muted/60">
                                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                  </div>
                                )}

                                <div className="min-w-0 flex-1 space-y-3">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-lg font-semibold text-[#1f1a54]">
                                      {campaign.name}
                                    </h3>
                                    <Badge className={getStatusColor(campaign.status)}>
                                      {campaign.status.replace(/_/g, " ")}
                                    </Badge>
                                    {ad?.status && ad.status !== campaign.status && (
                                      <Badge variant="outline" className="capitalize">
                                        Ad: {ad.status.replace(/_/g, " ")}
                                      </Badge>
                                    )}
                                  </div>

                                  <div>
                                    <p className="font-medium">
                                      {ad?.headline || "No ad headline yet"}
                                    </p>
                                    <p className="text-sm text-muted-foreground capitalize">
                                      Objective: {campaign.objective}
                                      {ad?.location ? ` • ${ad.location}` : ""}
                                    </p>
                                  </div>

                                  {ad?.description && (
                                    <p className="line-clamp-2 text-sm text-muted-foreground">
                                      {ad.description}
                                    </p>
                                  )}

                                  <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                                    <div>
                                      <p className="font-medium text-foreground">
                                        {formatCurrency(campaign.total_budget)}
                                      </p>
                                      <p>Budget</p>
                                    </div>
                                    <div>
                                      <p className="font-medium text-foreground">
                                        {campaign.stats.impressions.toLocaleString()}
                                      </p>
                                      <p>Impressions</p>
                                    </div>
                                    <div>
                                      <p className="font-medium text-foreground">
                                        {campaign.stats.clicks.toLocaleString()} ({campaign.stats.ctr}% CTR)
                                      </p>
                                      <p>Clicks</p>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                    <span className="inline-flex items-center gap-1">
                                      <CalendarDays className="h-3.5 w-3.5" />
                                      {campaign.start_date
                                        ? new Date(campaign.start_date).toLocaleDateString()
                                        : "No start date"}
                                      {" - "}
                                      {campaign.end_date
                                        ? new Date(campaign.end_date).toLocaleDateString()
                                        : "No end date"}
                                    </span>
                                    <span>
                                      Approved ads: {campaign.stats.approvedAds} • Pending:{" "}
                                      {campaign.stats.pendingAds} • Rejected: {campaign.stats.rejectedAds}
                                    </span>
                                  </div>

                                  {rejectionReason && (
                                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                      <p className="font-medium text-red-800">Rejection reason</p>
                                      <p>{rejectionReason}</p>
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2 lg:w-[220px] lg:flex-col">
                                <Button
                                  type="button"
                                  variant="outline"
                                  className="gap-2"
                                  onClick={() => openEditWizard(campaign)}
                                >
                                  <Pencil className="h-4 w-4" />
                                  Edit
                                </Button>

                                {(campaign.status === "draft" || campaign.status === "rejected") && (
                                  <Button
                                    type="button"
                                    className="gap-2"
                                    onClick={() =>
                                      handleCampaignStatus(campaign.id, "pending_review")
                                    }
                                    disabled={updateCampaignStatus.isPending}
                                  >
                                    <Send className="h-4 w-4" />
                                    Submit Review
                                  </Button>
                                )}

                                {campaign.status === "active" && (
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="gap-2"
                                    onClick={() => handleCampaignStatus(campaign.id, "paused")}
                                    disabled={updateCampaignStatus.isPending}
                                  >
                                    <PauseCircle className="h-4 w-4" />
                                    Pause
                                  </Button>
                                )}

                                {campaign.status === "paused" && (
                                  <Button
                                    type="button"
                                    className="gap-2"
                                    onClick={() => handleCampaignStatus(campaign.id, "active")}
                                    disabled={updateCampaignStatus.isPending}
                                  >
                                    <PlayCircle className="h-4 w-4" />
                                    Resume
                                  </Button>
                                )}

                                {campaign.status === "pending_review" && (
                                  <div className="rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
                                    This campaign is waiting for admin approval.
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Megaphone className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
                      <h3 className="mb-2 text-lg font-semibold">No campaigns yet</h3>
                      <p className="mb-4 text-muted-foreground">
                        Create your first campaign to start reaching buyers and renters.
                      </p>
                      <Button onClick={openCreateWizard} className="gap-2">
                        <Plus className="h-4 w-4" />
                        Create Your First Campaign
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="insights">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5" />
                      Performance Insights
                    </CardTitle>
                    <CardDescription>
                      A quick read on how your campaigns are performing right now.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {campaigns.length > 0 ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        <Card>
                          <CardContent className="p-4">
                            <h4 className="mb-3 font-medium">Campaign health</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Active campaigns</span>
                                <span className="font-medium">{overview.activeCampaigns}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Pending review</span>
                                <span className="font-medium">{overview.pendingCampaigns}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Draft campaigns</span>
                                <span className="font-medium">{overview.draftCampaigns}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Rejected campaigns</span>
                                <span className="font-medium">{overview.rejectedCampaigns}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="p-4">
                            <h4 className="mb-3 font-medium">Delivery totals</h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Total impressions</span>
                                <span className="font-medium">
                                  {overview.totalImpressions.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Total clicks</span>
                                <span className="font-medium">
                                  {overview.totalClicks.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span>Average CTR</span>
                                <span className="font-medium">{overview.avgCtr}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Budget committed</span>
                                <span className="font-medium">
                                  {formatCurrency(overview.totalSpend)}
                                </span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-muted-foreground">
                        Create a campaign to unlock performance insights.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="lg:col-span-1">
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
      </main>
    </div>
  );
};

export default AdsManager;
