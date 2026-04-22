import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import AdBanner from "@/components/AdBanner";
import BackButton from "@/components/BackButton";
import { useAuth } from "@/context/AuthContext";
import { useVerification } from "@/hooks/useVerification";
import { useConnections } from "@/hooks/useConnections";
import { 
  MessageSquare, 
  Users, 
  Star, 
  MapPin, 
  Shield, 
  UserPlus, 
  Search,
  ThumbsUp,
  ThumbsDown,
  AlertTriangle,
  Home,
  Building,
  Zap,
  UserCheck,
  MessageCircle,
  Plus,
  Filter,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  Loader2
} from 'lucide-react';

const Community = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { verificationRequest, loading: verificationLoading, submitVerification, isVerified } = useVerification();
  const { connections, pendingRequests, sendConnectionRequest, respondToRequest } = useConnections();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [newPost, setNewPost] = useState({ title: '', content: '', category: '', property: '' });
  const [newReview, setNewReview] = useState({ property: '', rating: 0, title: '', content: '', category: '' });
  
  // Verification form state
  const [verificationForm, setVerificationForm] = useState({
    propertyAddress: '',
    propertyType: '',
    ownershipType: '' as 'owner' | 'tenant' | '',
  });
  const [ownershipFile, setOwnershipFile] = useState<File | null>(null);
  const [occupancyFile, setOccupancyFile] = useState<File | null>(null);
  const [submittingVerification, setSubmittingVerification] = useState(false);
  const ownershipInputRef = useRef<HTMLInputElement>(null);
  const occupancyInputRef = useRef<HTMLInputElement>(null);

  // Mock data for community posts
  const communityPosts = [
    {
      id: 1,
      author: 'Sarah Johnson',
      authorAvatar: '/placeholder.svg',
      verified: true,
      title: 'Beware of Greenview Estate - Power Issues',
      content: 'Living here for 6 months now. The power situation is terrible - we get light maybe 8 hours daily despite what the agent promised. Property management is unresponsive.',
      category: 'utilities',
      property: 'Greenview Estate, Lekki',
      likes: 23,
      dislikes: 2,
      comments: 8,
      timestamp: '2 hours ago',
      verified_resident: true
    },
    {
      id: 2,
      author: 'Michael Adebayo',
      authorAvatar: '/placeholder.svg',
      verified: true,
      title: 'Great Experience at Marina Heights',
      content: 'Been here for over a year. Excellent property management, regular maintenance, and the security is top-notch. Highly recommend!',
      category: 'review',
      property: 'Marina Heights, Victoria Island',
      likes: 45,
      dislikes: 1,
      comments: 12,
      timestamp: '5 hours ago',
      verified_resident: true
    },
    {
      id: 3,
      author: 'Grace Okafor',
      authorAvatar: '/placeholder.svg',
      verified: true,
      title: 'Safety Concerns in Ajah Area',
      content: 'Recent increase in break-ins around this neighborhood. Anyone else experiencing this? We should discuss security measures.',
      category: 'safety',
      property: 'Ajah District',
      likes: 18,
      dislikes: 0,
      comments: 15,
      timestamp: '1 day ago',
      verified_resident: true
    }
  ];

  // Mock data for property reviews
  const propertyReviews = [
    {
      id: 1,
      property: 'Greenview Estate, Lekki',
      rating: 2.5,
      totalReviews: 34,
      categories: {
        facilities: 3,
        management: 2,
        utilities: 1,
        security: 4,
        location: 4
      },
      recentReviews: [
        {
          author: 'John Doe',
          rating: 2,
          title: 'Poor Power Supply',
          content: 'Constant power outages, very frustrating',
          verified: true,
          timestamp: '1 week ago'
        }
      ]
    },
    {
      id: 2,
      property: 'Marina Heights, Victoria Island',
      rating: 4.2,
      totalReviews: 67,
      categories: {
        facilities: 4,
        management: 5,
        utilities: 4,
        security: 5,
        location: 5
      },
      recentReviews: [
        {
          author: 'Jane Smith',
          rating: 5,
          title: 'Excellent Management',
          content: 'Very responsive management team',
          verified: true,
          timestamp: '3 days ago'
        }
      ]
    }
  ];

  // Mock data for friends/connections
  const suggestedFriends = [
    { id: '1', name: 'Emma Wilson', property: 'Lekki Gardens', mutualFriends: 3, avatar: '/placeholder.svg' },
    { id: '2', name: 'David Chen', property: 'Ikoyi Towers', mutualFriends: 5, avatar: '/placeholder.svg' },
    { id: '3', name: 'Fatima Hassan', property: 'Victoria Crest', mutualFriends: 2, avatar: '/placeholder.svg' }
  ];

  const handlePostSubmit = () => {
    if (!newPost.title || !newPost.content) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Success",
      description: "Your post has been published to the community"
    });
    setNewPost({ title: '', content: '', category: '', property: '' });
  };

  const handleReviewSubmit = () => {
    if (!newReview.property || !newReview.title || !newReview.content || newReview.rating === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields including rating",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Success",
      description: "Your review has been submitted and will be verified"
    });
    setNewReview({ property: '', rating: 0, title: '', content: '', category: '' });
  };

  const handleVerificationSubmit = async () => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to submit a verification request",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }

    if (!verificationForm.propertyAddress || !verificationForm.propertyType || !verificationForm.ownershipType || !ownershipFile || !occupancyFile) {
      toast({
        title: "Error",
        description: "Please fill in all fields and upload required documents",
        variant: "destructive"
      });
      return;
    }

    setSubmittingVerification(true);
    try {
      const { error } = await submitVerification({
        propertyAddress: verificationForm.propertyAddress,
        propertyType: verificationForm.propertyType,
        ownershipType: verificationForm.ownershipType as 'owner' | 'tenant',
        ownershipFile,
        occupancyFile,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Your verification request has been submitted successfully"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to submit verification request",
        variant: "destructive"
      });
    } finally {
      setSubmittingVerification(false);
    }
  };

  const handleConnect = async (userId: string) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to connect with others",
        variant: "destructive"
      });
      navigate("/auth");
      return;
    }

    const { error } = await sendConnectionRequest(userId);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to send connection request",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Request Sent",
        description: "Connection request has been sent"
      });
    }
  };

  const handleRespondToRequest = async (connectionId: string, accept: boolean) => {
    const { error } = await respondToRequest(connectionId, accept);
    if (error) {
      toast({
        title: "Error",
        description: "Failed to respond to request",
        variant: "destructive"
      });
    } else {
      toast({
        title: accept ? "Accepted" : "Declined",
        description: accept ? "You are now connected!" : "Request declined"
      });
    }
  };

  const renderStars = (rating: number, interactive = false, onRatingChange?: (rating: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={20}
            className={`${
              star <= rating 
                ? 'fill-yellow-400 text-yellow-400' 
                : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
          />
        ))}
      </div>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'utilities': return <Zap className="h-4 w-4" />;
      case 'safety': return <AlertTriangle className="h-4 w-4" />;
      case 'review': return <Star className="h-4 w-4" />;
      case 'management': return <Building className="h-4 w-4" />;
      default: return <Home className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'utilities': return 'bg-yellow-100 text-yellow-800';
      case 'safety': return 'bg-red-100 text-red-800';
      case 'review': return 'bg-orange-100 text-orange-800';
      case 'management': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="gap-1 bg-orange-100 text-orange-800"><CheckCircle className="h-3 w-3" /> Approved</Badge>;
      case 'rejected':
        return <Badge className="gap-1 bg-red-100 text-red-800"><XCircle className="h-3 w-3" /> Rejected</Badge>;
      case 'under_review':
        return <Badge className="gap-1 bg-slate-100 text-slate-800"><Clock className="h-3 w-3" /> Under Review</Badge>;
      default:
        return <Badge className="gap-1 bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3" /> Pending</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <div className="bg-card border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <BackButton showHomeLink={false} />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Property Community</h1>
                <p className="text-muted-foreground">Connect, share experiences, and make informed decisions</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    New Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Post</DialogTitle>
                    <DialogDescription>
                      Share your experience or ask the community a question
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="post-title">Title</Label>
                      <Input
                        id="post-title"
                        value={newPost.title}
                        onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                        placeholder="What's your post about?"
                      />
                    </div>
                    <div>
                      <Label htmlFor="post-category">Category</Label>
                      <Select value={newPost.category} onValueChange={(value) => setNewPost({...newPost, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="review">Property Review</SelectItem>
                          <SelectItem value="utilities">Utilities</SelectItem>
                          <SelectItem value="safety">Safety & Security</SelectItem>
                          <SelectItem value="management">Property Management</SelectItem>
                          <SelectItem value="general">General Discussion</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="post-property">Property/Area (Optional)</Label>
                      <Input
                        id="post-property"
                        value={newPost.property}
                        onChange={(e) => setNewPost({...newPost, property: e.target.value})}
                        placeholder="e.g., Lekki Gardens, Victoria Island"
                      />
                    </div>
                    <div>
                      <Label htmlFor="post-content">Content</Label>
                      <Textarea
                        id="post-content"
                        value={newPost.content}
                        onChange={(e) => setNewPost({...newPost, content: e.target.value})}
                        placeholder="Share your experience or ask your question..."
                        rows={5}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handlePostSubmit}>Publish Post</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Community Ad Banner */}
        <div className="mb-6">
          <AdBanner type="banner" />
        </div>
        
        {/* Group Chats Banner */}
        <Card className="mb-6 bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20">
          <CardContent className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold">Property Group Chats</h3>
                <p className="text-sm text-muted-foreground">Join verified residents to discuss local issues</p>
              </div>
            </div>
            <Button onClick={() => navigate('/group-chats')}>
              Open Group Chats
            </Button>
          </CardContent>
        </Card>

        <Tabs defaultValue="feed" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="feed" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Community Feed
            </TabsTrigger>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Property Reviews
            </TabsTrigger>
            <TabsTrigger value="friends" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Connect
            </TabsTrigger>
            <TabsTrigger value="verification" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Verification
            </TabsTrigger>
          </TabsList>

          {/* Community Feed */}
          <TabsContent value="feed" className="space-y-6">
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="review">Reviews</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="safety">Safety</SelectItem>
                  <SelectItem value="management">Management</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              {communityPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={post.authorAvatar} />
                          <AvatarFallback>{post.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{post.author}</span>
                            {post.verified_resident && (
                              <Badge variant="secondary" className="gap-1 text-xs">
                                <UserCheck className="h-3 w-3" />
                                Verified Resident
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {post.property}
                            <span>•</span>
                            <span>{post.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      <Badge className={`gap-1 ${getCategoryColor(post.category)}`}>
                        {getCategoryIcon(post.category)}
                        {post.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                    <p className="text-foreground/80">{post.content}</p>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-4">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <ThumbsUp className="h-4 w-4" />
                        {post.likes}
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <ThumbsDown className="h-4 w-4" />
                        {post.dislikes}
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-2">
                        <MessageCircle className="h-4 w-4" />
                        {post.comments} Comments
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Property Reviews */}
          <TabsContent value="reviews" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">Property Reviews</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Write Review
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Write Property Review</DialogTitle>
                    <DialogDescription>
                      Share your experience to help others make informed decisions
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="review-property">Property Name & Location</Label>
                      <Input
                        id="review-property"
                        value={newReview.property}
                        onChange={(e) => setNewReview({...newReview, property: e.target.value})}
                        placeholder="e.g., Greenview Estate, Lekki"
                      />
                    </div>
                    <div>
                      <Label>Overall Rating</Label>
                      {renderStars(newReview.rating, true, (rating) => setNewReview({...newReview, rating}))}
                    </div>
                    <div>
                      <Label htmlFor="review-title">Review Title</Label>
                      <Input
                        id="review-title"
                        value={newReview.title}
                        onChange={(e) => setNewReview({...newReview, title: e.target.value})}
                        placeholder="Summarize your experience"
                      />
                    </div>
                    <div>
                      <Label htmlFor="review-category">Main Issue/Highlight</Label>
                      <Select value={newReview.category} onValueChange={(value) => setNewReview({...newReview, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select main category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="facilities">Facilities</SelectItem>
                          <SelectItem value="management">Management</SelectItem>
                          <SelectItem value="utilities">Utilities</SelectItem>
                          <SelectItem value="security">Security</SelectItem>
                          <SelectItem value="location">Location</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="review-content">Detailed Review</Label>
                      <Textarea
                        id="review-content"
                        value={newReview.content}
                        onChange={(e) => setNewReview({...newReview, content: e.target.value})}
                        placeholder="Share your detailed experience..."
                        rows={5}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleReviewSubmit}>Submit Review</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid gap-6">
              {propertyReviews.map((property) => (
                <Card key={property.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <MapPin className="h-5 w-5" />
                          {property.property}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-2">
                          {renderStars(property.rating)}
                          <span className="font-semibold">{property.rating}</span>
                          <span className="text-muted-foreground">({property.totalReviews} reviews)</span>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-5 gap-4 mb-4">
                      {Object.entries(property.categories).map(([category, rating]) => (
                        <div key={category} className="text-center">
                          <div className="text-sm font-medium capitalize">{category}</div>
                          <div className="text-lg font-bold">{rating}</div>
                          {renderStars(rating)}
                        </div>
                      ))}
                    </div>
                    <Separator className="my-4" />
                    <div className="space-y-3">
                      <h4 className="font-semibold">Recent Reviews</h4>
                      {property.recentReviews.map((review, index) => (
                        <div key={index} className="bg-muted/30 p-3 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{review.author}</span>
                              {review.verified && (
                                <Badge variant="secondary" className="text-xs">
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {renderStars(review.rating)}
                              <span className="text-sm text-muted-foreground">{review.timestamp}</span>
                            </div>
                          </div>
                          <h5 className="font-medium mb-1">{review.title}</h5>
                          <p className="text-sm text-muted-foreground">{review.content}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Friends/Connect */}
          <TabsContent value="friends" className="space-y-6">
            {/* Pending Connection Requests */}
            {pendingRequests.length > 0 && (
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Pending Connection Requests
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {pendingRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={request.partnerProfile.avatar_url || undefined} />
                            <AvatarFallback>{request.partnerProfile.full_name?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-semibold">{request.partnerProfile.full_name || 'Unknown User'}</p>
                            {request.partnerProfile.location && (
                              <p className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {request.partnerProfile.location}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleRespondToRequest(request.id, true)}>Accept</Button>
                          <Button size="sm" variant="outline" onClick={() => handleRespondToRequest(request.id, false)}>Decline</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Connect with Your Community
                </CardTitle>
                <CardDescription>
                  Build your network of verified neighbors and property owners
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Connection Steps */}
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-3">1</div>
                    <h4 className="font-semibold mb-2">Get Verified</h4>
                    <p className="text-sm text-muted-foreground">Complete your residency verification to unlock connection features</p>
                  </div>
                  <div className="text-center p-4 bg-accent/5 rounded-lg">
                    <div className="h-12 w-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xl font-bold mx-auto mb-3">2</div>
                    <h4 className="font-semibold mb-2">Find Neighbors</h4>
                    <p className="text-sm text-muted-foreground">Browse and connect with verified residents in your area</p>
                  </div>
                  <div className="text-center p-4 bg-primary/5 rounded-lg">
                    <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mx-auto mb-3">3</div>
                    <h4 className="font-semibold mb-2">Start Messaging</h4>
                    <p className="text-sm text-muted-foreground">Chat with your connections about property experiences</p>
                  </div>
                </div>

                <Separator />

                {/* Suggested Connections */}
                <div>
                  <h3 className="font-semibold mb-4">Suggested Connections</h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {suggestedFriends.map((friend) => (
                      <Card key={friend.id} className="border-dashed">
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3 mb-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={friend.avatar} />
                              <AvatarFallback>{friend.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="font-semibold">{friend.name}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {friend.property}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {friend.mutualFriends} mutual connections
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button className="flex-1 gap-2" size="sm" onClick={() => handleConnect(friend.id)}>
                              <UserPlus className="h-4 w-4" />
                              Connect
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => navigate(`/messages?partner=${friend.id}`)}>
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* My Connections */}
                <div>
                  <h3 className="font-semibold mb-4">My Connections</h3>
                  {connections.length > 0 ? (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {connections.map((connection) => (
                        <Card key={connection.id}>
                          <CardContent className="pt-6">
                            <div className="flex items-center gap-3 mb-4">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={connection.partnerProfile.avatar_url || undefined} />
                                <AvatarFallback>{connection.partnerProfile.full_name?.charAt(0) || 'U'}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="font-semibold">{connection.partnerProfile.full_name || 'Unknown User'}</div>
                                {connection.partnerProfile.location && (
                                  <div className="text-sm text-muted-foreground flex items-center gap-1">
                                    <MapPin className="h-3 w-3" />
                                    {connection.partnerProfile.location}
                                  </div>
                                )}
                              </div>
                            </div>
                            <Button className="w-full gap-2" variant="outline" size="sm" onClick={() => navigate(`/messages?partner=${connection.partnerProfile.user_id}`)}>
                              <MessageCircle className="h-4 w-4" />
                              Message
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center p-8 bg-muted/30 rounded-lg">
                      <div className="text-center">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">You haven't connected with anyone yet</p>
                        <p className="text-sm text-muted-foreground">Start by completing your verification to connect with neighbors</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verification */}
          <TabsContent value="verification" className="space-y-6">
            {/* Current Verification Status */}
            {verificationRequest && (
              <Card className="border-primary">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Your Verification Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div>
                      <p className="font-semibold">{verificationRequest.property_address}</p>
                      <p className="text-sm text-muted-foreground">{verificationRequest.property_type} • {verificationRequest.ownership_type}</p>
                      <p className="text-xs text-muted-foreground mt-1">Submitted {new Date(verificationRequest.created_at).toLocaleDateString()}</p>
                    </div>
                    {getStatusBadge(verificationRequest.status)}
                  </div>
                  {verificationRequest.status === 'rejected' && verificationRequest.rejection_reason && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-800"><strong>Rejection Reason:</strong> {verificationRequest.rejection_reason}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Verification Steps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Residency Verification Process
                </CardTitle>
                <CardDescription>
                  Complete these steps to become a verified resident and unlock full community features
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Progress Steps */}
                <div className="grid md:grid-cols-4 gap-4">
                  <div className="relative">
                    <div className="flex flex-col items-center text-center">
                      <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-3">1</div>
                      <h4 className="font-semibold text-sm mb-1">Property Info</h4>
                      <p className="text-xs text-muted-foreground">Enter your property address and details</p>
                    </div>
                    <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-0.5 bg-muted" />
                  </div>
                  <div className="relative">
                    <div className="flex flex-col items-center text-center">
                      <div className="h-12 w-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xl font-bold mb-3">2</div>
                      <h4 className="font-semibold text-sm mb-1">Upload Documents</h4>
                      <p className="text-xs text-muted-foreground">Proof of ownership or tenancy</p>
                    </div>
                    <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-0.5 bg-muted" />
                  </div>
                  <div className="relative">
                    <div className="flex flex-col items-center text-center">
                      <div className="h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold mb-3">3</div>
                      <h4 className="font-semibold text-sm mb-1">Proof of Occupancy</h4>
                      <p className="text-xs text-muted-foreground">Utility bill or bank statement</p>
                    </div>
                    <div className="hidden md:block absolute top-6 left-[60%] w-[80%] h-0.5 bg-muted" />
                  </div>
                  <div>
                    <div className="flex flex-col items-center text-center">
                      <div className="h-12 w-12 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-xl font-bold mb-3">4</div>
                      <h4 className="font-semibold text-sm mb-1">Verification</h4>
                      <p className="text-xs text-muted-foreground">Review and approval</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Verification Form */}
                {(!verificationRequest || verificationRequest.status === 'rejected') && (
                  <>
                    <div className="space-y-4">
                      <h3 className="font-semibold">Step 1: Property Information</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="property-address">Property Address</Label>
                          <Input 
                            id="property-address" 
                            placeholder="Enter your full property address"
                            value={verificationForm.propertyAddress}
                            onChange={(e) => setVerificationForm({...verificationForm, propertyAddress: e.target.value})}
                          />
                        </div>
                        <div>
                          <Label htmlFor="property-type">Property Type</Label>
                          <Select value={verificationForm.propertyType} onValueChange={(value) => setVerificationForm({...verificationForm, propertyType: value})}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select property type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="apartment">Apartment</SelectItem>
                              <SelectItem value="house">House</SelectItem>
                              <SelectItem value="duplex">Duplex</SelectItem>
                              <SelectItem value="flat">Flat</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="occupancy-status">Occupancy Status</Label>
                        <Select value={verificationForm.ownershipType} onValueChange={(value) => setVerificationForm({...verificationForm, ownershipType: value as 'owner' | 'tenant'})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="owner">Property Owner</SelectItem>
                            <SelectItem value="tenant">Tenant/Renter</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Separator />

                    {/* Document Upload Section */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Step 2: Upload Property Documents</h3>
                      <p className="text-sm text-muted-foreground">Upload proof of ownership or tenancy (C of O, R of O, Lease Agreement, Tenancy Agreement)</p>
                      <input 
                        type="file" 
                        ref={ownershipInputRef}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setOwnershipFile(e.target.files?.[0] || null)}
                      />
                      <div 
                        className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer ${ownershipFile ? 'border-orange-500 bg-orange-50' : ''}`}
                        onClick={() => ownershipInputRef.current?.click()}
                      >
                        {ownershipFile ? (
                          <>
                            <CheckCircle className="h-10 w-10 text-orange-500 mx-auto mb-3" />
                            <p className="text-sm font-medium text-orange-700">{ownershipFile.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">Click to change</p>
                          </>
                        ) : (
                          <>
                            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                            <p className="text-sm font-medium">Click to upload property documents</p>
                            <p className="text-xs text-muted-foreground mt-1">PDF, JPG, PNG up to 10MB</p>
                          </>
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Proof of Occupancy Section */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Step 3: Proof of Occupancy</h3>
                      <p className="text-sm text-muted-foreground">Upload a recent utility bill (electricity, water, or gas) or bank statement showing your address</p>
                      <input 
                        type="file" 
                        ref={occupancyInputRef}
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => setOccupancyFile(e.target.files?.[0] || null)}
                      />
                      <div 
                        className={`border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer ${occupancyFile ? 'border-orange-500 bg-orange-50' : ''}`}
                        onClick={() => occupancyInputRef.current?.click()}
                      >
                        {occupancyFile ? (
                          <>
                            <CheckCircle className="h-10 w-10 text-orange-500 mx-auto mb-3" />
                            <p className="text-sm font-medium text-orange-700">{occupancyFile.name}</p>
                            <p className="text-xs text-muted-foreground mt-1">Click to change</p>
                          </>
                        ) : (
                          <>
                            <Zap className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                            <p className="text-sm font-medium">Click to upload utility bill or bank statement</p>
                            <p className="text-xs text-muted-foreground mt-1">Must be dated within last 3 months</p>
                          </>
                        )}
                      </div>
                    </div>

                    <Separator />

                    <Button 
                      className="w-full" 
                      size="lg" 
                      onClick={handleVerificationSubmit}
                      disabled={submittingVerification}
                    >
                      {submittingVerification ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2 h-4 w-4" />
                          Submit Verification Request
                        </>
                      )}
                    </Button>
                  </>
                )}

                {verificationRequest && verificationRequest.status !== 'rejected' && (
                  <div className="text-center p-8 bg-muted/30 rounded-lg">
                    <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">Verification Submitted</h3>
                    <p className="text-muted-foreground">Your verification request is being processed. You'll be notified once it's reviewed.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Community;