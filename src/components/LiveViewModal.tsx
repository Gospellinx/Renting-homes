import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Video, Lock, Loader2, CheckCircle, Play } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";

interface LiveViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: {
    id: number;
    title: string;
    location: string;
    image: string;
  };
}

const LIVE_VIEW_FEE = 500;

// Mock video URLs for demo (in production these would come from your storage)
const mockVideos: Record<number, string> = {
  1: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  5: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  9: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
};

const LiveViewModal = ({ open, onOpenChange, property }: LiveViewModalProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [showVideo, setShowVideo] = useState(false);

  // Check access on open
  useEffect(() => {
    if (open && user) {
      checkAccess();
    } else {
      setChecking(false);
    }
  }, [open, user, property.id]);

  // Handle payment callback verification
  useEffect(() => {
    const liveview = searchParams.get('liveview');
    const reference = searchParams.get('reference');
    const propertyId = searchParams.get('propertyId');

    if (liveview === 'verify' && reference && propertyId === String(property.id) && user) {
      verifyPayment(reference);
    }
  }, [searchParams, user, property.id]);

  const checkAccess = async () => {
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('live-view-payment', {
        body: { propertyId: String(property.id), action: 'check' },
      });
      if (!error && data?.hasAccess) {
        setHasAccess(true);
      }
    } catch (e) {
      console.error('Check access error:', e);
    } finally {
      setChecking(false);
    }
  };

  const verifyPayment = async (reference: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('live-view-verify', {
        body: { reference },
      });
      if (error) throw error;
      setHasAccess(true);
      toast({ title: "Access Unlocked! 🎉", description: "You can now view the property tour video." });
      // Clean URL params
      window.history.replaceState({}, '', window.location.pathname);
    } catch (e) {
      console.error('Verify error:', e);
      toast({ title: "Verification Failed", description: "Could not verify payment. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!user) {
      toast({ title: "Sign In Required", description: "Please sign in to access Live View.", variant: "destructive" });
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('live-view-payment', {
        body: {
          propertyId: String(property.id),
          propertyType: 'rent',
          email: user.email,
          action: 'pay',
        },
      });

      if (error) throw error;

      if (data?.authorization_url) {
        window.location.href = data.authorization_url;
      }
    } catch (e) {
      console.error('Payment error:', e);
      toast({ title: "Payment Failed", description: "Could not initialize payment. Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5 text-primary" />
            Live View — {property.title}
          </DialogTitle>
          <DialogDescription>
            Pre-recorded video walkthrough of the property
          </DialogDescription>
        </DialogHeader>

        {checking ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : hasAccess ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">
                <CheckCircle className="h-3 w-3 mr-1" />
                Access Unlocked
              </Badge>
            </div>

            {showVideo ? (
              <div className="rounded-lg overflow-hidden bg-black aspect-video">
                <video
                  controls
                  autoPlay
                  className="w-full h-full"
                  poster={property.image}
                  src={mockVideos[property.id] || mockVideos[1]}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <div
                className="relative rounded-lg overflow-hidden cursor-pointer group aspect-video"
                onClick={() => setShowVideo(true)}
              >
                <img src={property.image} alt={property.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                  <div className="bg-primary rounded-full p-4 shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="h-8 w-8 text-primary-foreground fill-primary-foreground" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4">
                  <p className="text-white font-medium text-sm">{property.title}</p>
                  <p className="text-white/70 text-xs">{property.location}</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative rounded-lg overflow-hidden aspect-video">
              <img src={property.image} alt={property.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                <Lock className="h-12 w-12 mb-4 text-white/80" />
                <h3 className="text-xl font-bold mb-1">Unlock Live View</h3>
                <p className="text-white/70 text-sm mb-4">Watch the full property video tour</p>
                <Badge className="bg-primary text-primary-foreground text-lg px-4 py-2">
                  ₦{LIVE_VIEW_FEE.toLocaleString()}
                </Badge>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-sm">What you get:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ Full pre-recorded video walkthrough</li>
                <li>✓ Interior & exterior views of every room</li>
                <li>✓ Permanent access — watch anytime</li>
              </ul>
            </div>

            <Button
              className="w-full"
              size="lg"
              onClick={handlePayment}
              disabled={loading}
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
              ) : (
                <>Pay ₦{LIVE_VIEW_FEE.toLocaleString()} to Unlock</>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LiveViewModal;
