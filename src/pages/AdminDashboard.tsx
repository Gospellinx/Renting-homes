import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import BackButton from "@/components/BackButton";
import { useAdminVerifications, AdminVerificationRequest } from "@/hooks/useAdminVerifications";
import { useAdminAnalytics } from "@/hooks/useAdminAnalytics";
import { AnalyticsDashboard } from "@/components/admin/AnalyticsDashboard";
import AdModerationTab from "@/components/admin/AdModerationTab";
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  Flag, 
  Clock,
  Search,
  Eye,
  FileText,
  AlertTriangle,
  Loader2,
  RefreshCw,
  BarChart3,
  Megaphone
} from 'lucide-react';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { requests, loading, isAdmin, approveRequest, rejectRequest, flagRequest, unflagRequest } = useAdminVerifications();
  const { analytics, loading: analyticsLoading } = useAdminAnalytics();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('requests');
  const [selectedRequest, setSelectedRequest] = useState<AdminVerificationRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [flagReason, setFlagReason] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Shield className="h-16 w-16 text-muted-foreground" />
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">You don't have permission to access this page.</p>
        <Button onClick={() => navigate('/')}>Go Home</Button>
      </div>
    );
  }

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.property_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.user_id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'flagged' ? request.flagged : request.status === filterStatus);
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (requestId: string) => {
    setActionLoading(requestId);
    const { error } = await approveRequest(requestId);
    setActionLoading(null);
    
    if (error) {
      toast({ title: "Error", description: "Failed to approve request", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Verification approved" });
    }
  };

  const handleReject = async (requestId: string) => {
    if (!rejectReason.trim()) {
      toast({ title: "Error", description: "Please provide a rejection reason", variant: "destructive" });
      return;
    }

    setActionLoading(requestId);
    const { error } = await rejectRequest(requestId, rejectReason);
    setActionLoading(null);
    
    if (error) {
      toast({ title: "Error", description: "Failed to reject request", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Verification rejected" });
      setRejectReason('');
    }
  };

  const handleFlag = async (requestId: string) => {
    if (!flagReason.trim()) {
      toast({ title: "Error", description: "Please provide a flag reason", variant: "destructive" });
      return;
    }

    setActionLoading(requestId);
    const { error } = await flagRequest(requestId, flagReason);
    setActionLoading(null);
    
    if (error) {
      toast({ title: "Error", description: "Failed to flag request", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Request flagged for review" });
      setFlagReason('');
    }
  };

  const handleUnflag = async (requestId: string) => {
    setActionLoading(requestId);
    const { error } = await unflagRequest(requestId);
    setActionLoading(null);
    
    if (error) {
      toast({ title: "Error", description: "Failed to unflag request", variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Flag removed" });
    }
  };

  const getStatusBadge = (request: AdminVerificationRequest) => {
    if (request.flagged) {
      return <Badge className="gap-1 bg-orange-100 text-orange-800"><Flag className="h-3 w-3" /> Flagged</Badge>;
    }
    switch (request.status) {
      case 'approved':
        return <Badge className="gap-1 bg-orange-100 text-orange-800"><CheckCircle className="h-3 w-3" /> Approved</Badge>;
      case 'rejected':
        return <Badge className="gap-1 bg-red-100 text-red-800"><XCircle className="h-3 w-3" /> Rejected</Badge>;
      default:
        return <Badge className="gap-1 bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3" /> Pending</Badge>;
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const flaggedCount = requests.filter(r => r.flagged).length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton showHomeLink={false} />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Admin Dashboard</h1>
                <p className="text-muted-foreground">Manage verification requests and user content</p>
              </div>
            </div>
            <Button variant="outline" className="gap-2" onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList>
            <TabsTrigger value="requests" className="gap-2">
              <FileText className="h-4 w-4" />
              Verification Requests
            </TabsTrigger>
            <TabsTrigger value="ads" className="gap-2">
              <Megaphone className="h-4 w-4" />
              Ad Moderation
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ads" className="mt-6">
            <AdModerationTab />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            {analyticsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : analytics ? (
              <AnalyticsDashboard analytics={analytics} />
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  No analytics data available
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="requests" className="mt-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending</p>
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
                      <p className="text-sm text-muted-foreground">Flagged</p>
                      <p className="text-2xl font-bold text-orange-600">{flaggedCount}</p>
                    </div>
                    <Flag className="h-8 w-8 text-orange-600" />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Approved</p>
                      <p className="text-2xl font-bold text-orange-600">{approvedCount}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-orange-600" />
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
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Input
                  placeholder="Search by address or user ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
              <Tabs value={filterStatus} onValueChange={setFilterStatus}>
                <TabsList>
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="flagged">Flagged</TabsTrigger>
                  <TabsTrigger value="approved">Approved</TabsTrigger>
                  <TabsTrigger value="rejected">Rejected</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Requests List */}
            <div className="space-y-4">
          {filteredRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No verification requests found</p>
              </CardContent>
            </Card>
          ) : (
            filteredRequests.map((request) => (
              <Card key={request.id} className={request.flagged ? 'border-orange-300 bg-orange-50/50' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{request.property_address}</CardTitle>
                      <CardDescription>
                        {request.property_type} • {request.ownership_type} • Submitted {new Date(request.created_at).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    {getStatusBadge(request)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {request.ownership_document_url && (
                      <Button variant="outline" size="sm" className="gap-1" asChild>
                        <a href={request.ownership_document_url} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4" />
                          Ownership Doc
                        </a>
                      </Button>
                    )}
                    {request.occupancy_document_url && (
                      <Button variant="outline" size="sm" className="gap-1" asChild>
                        <a href={request.occupancy_document_url} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4" />
                          Occupancy Doc
                        </a>
                      </Button>
                    )}
                  </div>

                  {request.flagged && request.flagged_reason && (
                    <div className="bg-orange-100 border border-orange-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 text-orange-800">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">Flag Reason:</span>
                      </div>
                      <p className="text-orange-700 mt-1">{request.flagged_reason}</p>
                    </div>
                  )}

                  {request.rejection_reason && (
                    <div className="bg-red-100 border border-red-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center gap-2 text-red-800">
                        <XCircle className="h-4 w-4" />
                        <span className="font-medium">Rejection Reason:</span>
                      </div>
                      <p className="text-red-700 mt-1">{request.rejection_reason}</p>
                    </div>
                  )}

                  {request.status === 'pending' && (
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        className="gap-1" 
                        onClick={() => handleApprove(request.id)}
                        disabled={actionLoading === request.id}
                      >
                        {actionLoading === request.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                        Approve
                      </Button>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="destructive" className="gap-1">
                            <XCircle className="h-4 w-4" />
                            Reject
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Reject Verification</DialogTitle>
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
                                placeholder="Explain why this verification is being rejected..."
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button 
                              variant="destructive" 
                              onClick={() => handleReject(request.id)}
                              disabled={actionLoading === request.id}
                            >
                              {actionLoading === request.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                              Confirm Rejection
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      {request.flagged ? (
                        <Button 
                          variant="outline" 
                          className="gap-1"
                          onClick={() => handleUnflag(request.id)}
                          disabled={actionLoading === request.id}
                        >
                          <Flag className="h-4 w-4" />
                          Remove Flag
                        </Button>
                      ) : (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" className="gap-1 text-orange-600 border-orange-300 hover:bg-orange-50">
                              <Flag className="h-4 w-4" />
                              Flag
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Flag for Review</DialogTitle>
                              <DialogDescription>
                                Mark this request as suspicious for further investigation
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label>Flag Reason</Label>
                                <Textarea 
                                  value={flagReason}
                                  onChange={(e) => setFlagReason(e.target.value)}
                                  placeholder="Describe the suspicious activity or concerns..."
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button 
                                variant="outline"
                                className="text-orange-600"
                                onClick={() => handleFlag(request.id)}
                                disabled={actionLoading === request.id}
                              >
                                {actionLoading === request.id ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Confirm Flag
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
