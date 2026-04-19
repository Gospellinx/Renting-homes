import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { useAdminAds, AdminAd } from '@/hooks/useAdminAds';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search, 
  Eye, 
  Loader2, 
  Megaphone,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';

const AdModerationTab = () => {
  const { ads, isLoading, approveAd, rejectAd, pendingCount, approvedCount, rejectedCount } = useAdminAds();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [rejectReason, setRejectReason] = useState('');
  const [selectedAd, setSelectedAd] = useState<AdminAd | null>(null);

  const filteredAds = ads?.filter(ad => {
    const matchesSearch = ad.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ad.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ad.status === filterStatus;
    return matchesSearch && matchesStatus;
  }) || [];

  const handleApprove = async (adId: string) => {
    try {
      await approveAd.mutateAsync(adId);
      toast({ title: "Success", description: "Ad approved and now visible to users" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to approve ad", variant: "destructive" });
    }
  };

  const handleReject = async (adId: string) => {
    if (!rejectReason.trim()) {
      toast({ title: "Error", description: "Please provide a rejection reason", variant: "destructive" });
      return;
    }
    try {
      await rejectAd.mutateAsync({ adId, reason: rejectReason });
      toast({ title: "Success", description: "Ad rejected" });
      setRejectReason('');
      setSelectedAd(null);
    } catch (error) {
      toast({ title: "Error", description: "Failed to reject ad", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="gap-1 bg-indigo-100 text-indigo-800"><CheckCircle className="h-3 w-3" /> Approved</Badge>;
      case 'rejected':
        return <Badge className="gap-1 bg-red-100 text-red-800"><XCircle className="h-3 w-3" /> Rejected</Badge>;
      case 'pending_review':
        return <Badge className="gap-1 bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3" /> Pending</Badge>;
      default:
        return <Badge className="gap-1 bg-muted text-muted-foreground">{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-indigo-600">{approvedCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{rejectedCount}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Input
            placeholder="Search by headline or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        </div>
        <Tabs value={filterStatus} onValueChange={setFilterStatus}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pending_review">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Ads List */}
      <div className="space-y-4">
        {filteredAds.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No ads found</p>
            </CardContent>
          </Card>
        ) : (
          filteredAds.map((ad) => (
            <Card key={ad.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    {ad.image_url ? (
                      <img 
                        src={ad.image_url} 
                        alt={ad.headline}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-lg">{ad.headline}</CardTitle>
                      <CardDescription className="mt-1">
                        {ad.name} • {ad.ad_type} • Created {new Date(ad.created_at).toLocaleDateString()}
                      </CardDescription>
                      {ad.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{ad.description}</p>
                      )}
                      <div className="flex gap-2 mt-2 text-sm text-muted-foreground">
                        {ad.price && <span>₦{ad.price}</span>}
                        {ad.location && <span>• {ad.location}</span>}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(ad.status)}
                </div>
              </CardHeader>
              <CardContent>
                {/* Performance Stats */}
                <div className="flex gap-6 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span>{ad.impressions || 0} impressions</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    <span>{ad.clicks || 0} clicks</span>
                  </div>
                  {(ad.impressions || 0) > 0 && (
                    <div className="text-muted-foreground">
                      CTR: {(((ad.clicks || 0) / (ad.impressions || 1)) * 100).toFixed(2)}%
                    </div>
                  )}
                </div>

                {ad.rejection_reason && (
                  <div className="bg-red-100 border border-red-200 rounded-lg p-3 mb-4">
                    <div className="flex items-center gap-2 text-red-800">
                      <XCircle className="h-4 w-4" />
                      <span className="font-medium">Rejection Reason:</span>
                    </div>
                    <p className="text-red-700 mt-1">{ad.rejection_reason}</p>
                  </div>
                )}

                {ad.status === 'pending_review' && (
                  <div className="flex gap-2">
                    <Button 
                      className="gap-1" 
                      onClick={() => handleApprove(ad.id)}
                      disabled={approveAd.isPending}
                    >
                      {approveAd.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                      Approve
                    </Button>
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="destructive" className="gap-1" onClick={() => setSelectedAd(ad)}>
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reject Ad</DialogTitle>
                          <DialogDescription>
                            Please provide a reason for rejection
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Rejection Reason</Label>
                            <Textarea 
                              value={rejectReason}
                              onChange={(e) => setRejectReason(e.target.value)}
                              placeholder="Explain why this ad is being rejected..."
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button 
                            variant="destructive" 
                            onClick={() => handleReject(ad.id)}
                            disabled={rejectAd.isPending}
                          >
                            {rejectAd.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Confirm Rejection
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default AdModerationTab;
