import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Plus, BarChart3, TrendingUp, Eye, MousePointerClick, DollarSign, Megaphone } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useAdsManager, Campaign } from '@/hooks/useAdsManager';
import { useWallet } from '@/hooks/useWallet';
import CampaignWizard from '@/components/ads/CampaignWizard';
import WalletCard from '@/components/ads/WalletCard';
import BackButton from '@/components/BackButton';
import AuthPrompt from '@/components/AuthPrompt';
import { toast } from 'sonner';

const AdsManager = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading } = useAuth();
  const { campaigns, campaignsLoading } = useAdsManager();
  const { verifyPayment } = useWallet();
  const [showWizard, setShowWizard] = useState(false);
  const [activeTab, setActiveTab] = useState('campaigns');

  // Handle payment verification callback
  useEffect(() => {
    const paymentAction = searchParams.get('payment');
    const reference = searchParams.get('reference');
    
    if (paymentAction === 'verify' && reference) {
      toast.info('Verifying payment...');
      verifyPayment.mutate({ reference }, {
        onSuccess: () => {
          // Clear the URL params
          navigate('/ads-manager', { replace: true });
        },
        onError: () => {
          navigate('/ads-manager', { replace: true });
        }
      });
    }
  }, [searchParams, navigate, verifyPayment]);

  // Show auth prompt for unauthenticated users
  if (!loading && !user) {
    return (
      <AuthPrompt 
        icon={Megaphone}
        title="Ads Manager"
        description="Create an account to run advertising campaigns and reach potential buyers"
      />
    );
  }

  if (showWizard) {
    return (
      <div className="min-h-screen bg-background py-8 px-4">
        <CampaignWizard 
          onComplete={() => setShowWizard(false)} 
          onCancel={() => setShowWizard(false)} 
        />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-orange-500/10 text-orange-600';
      case 'paused': return 'bg-yellow-500/10 text-yellow-600';
      case 'draft': return 'bg-muted text-muted-foreground';
      case 'pending_review': return 'bg-slate-500/10 text-slate-600';
      case 'rejected': return 'bg-red-500/10 text-red-600';
      case 'completed': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // Mock stats (would come from aggregated data in production)
  const stats = {
    totalSpend: campaigns?.reduce((sum, c) => sum + (c.total_budget || 0), 0) || 0,
    totalImpressions: 15420,
    totalClicks: 892,
    avgCTR: 5.78,
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f2f4fb_0%,#f7f7fb_42%,#f4f1ec_100%)]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(91,104,228,0.16),transparent_34%),radial-gradient(circle_at_top_right,rgba(72,153,255,0.16),transparent_28%),radial-gradient(circle_at_bottom,rgba(162,153,255,0.12),transparent_42%)] z-0" />
      
      {/* Header */}
      <header className="relative z-40 border-b border-[#d7daf0] bg-white/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton />
              <div>
                <h1 className="text-2xl font-bold text-[#1f1a54]">Ads Manager</h1>
                <p className="text-sm text-[#6f7599]">Create and manage your advertising campaigns</p>
              </div>
            </div>
            <Button onClick={() => setShowWizard(true)} className="gap-2 bg-[#26225f] text-white hover:bg-[#1f1b50]">
              <Plus className="h-4 w-4" />
              Create Campaign
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main content */}
          <div className="lg:col-span-3">
            {/* Stats Overview */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <DollarSign className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Spend</p>
                      <p className="text-xl font-bold">₦{stats.totalSpend.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/50 rounded-lg">
                      <Eye className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Impressions</p>
                      <p className="text-xl font-bold">{stats.totalImpressions.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <MousePointerClick className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Clicks</p>
                      <p className="text-xl font-bold">{stats.totalClicks.toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-accent/50 rounded-lg">
                      <TrendingUp className="h-5 w-5 text-accent-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Avg. CTR</p>
                      <p className="text-xl font-bold">{stats.avgCTR}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns">
            {campaignsLoading ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">Loading campaigns...</p>
                </CardContent>
              </Card>
            ) : campaigns && campaigns.length > 0 ? (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <Card key={campaign.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-semibold">{campaign.name}</h3>
                            <Badge className={getStatusColor(campaign.status)}>
                              {campaign.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground capitalize mt-1">
                            Objective: {campaign.objective}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₦{campaign.total_budget.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">Budget</p>
                        </div>
                      </div>
                      {campaign.status === 'active' && (
                        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t">
                          <div className="text-center">
                            <p className="text-lg font-bold">2,450</p>
                            <p className="text-xs text-muted-foreground">Impressions</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold">156</p>
                            <p className="text-xs text-muted-foreground">Clicks</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold">6.4%</p>
                            <p className="text-xs text-muted-foreground">CTR</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first campaign to start reaching potential buyers and renters
                  </p>
                  <Button onClick={() => setShowWizard(true)} className="gap-2">
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
                  View detailed analytics for your campaigns
                </CardDescription>
              </CardHeader>
              <CardContent>
                {campaigns && campaigns.length > 0 ? (
                  <div className="space-y-6">
                    <div className="h-48 bg-muted/50 rounded-lg flex items-center justify-center">
                      <p className="text-muted-foreground">Performance chart coming soon</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-2">Top Performing Locations</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Lagos</span>
                              <span className="font-medium">45%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Abuja</span>
                              <span className="font-medium">28%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Port Harcourt</span>
                              <span className="font-medium">15%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardContent className="p-4">
                          <h4 className="font-medium mb-2">Audience Breakdown</h4>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Buyers</span>
                              <span className="font-medium">52%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Renters</span>
                              <span className="font-medium">35%</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>Agents</span>
                              <span className="font-medium">13%</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Create a campaign to see performance insights
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          </Tabs>
          </div>

          {/* Sidebar with Wallet */}
          <div className="lg:col-span-1">
            <WalletCard />
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdsManager;
