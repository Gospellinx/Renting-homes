import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Loader2, CheckCircle, Video } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";

interface TourPaywallProps {
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  propertyType: string;
  children: React.ReactNode;
}

const TOUR_FEE = 500;

const TourPaywall = ({ propertyId, propertyTitle, propertyImage, propertyType, children }: TourPaywallProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (user) {
      checkAccess();
    } else {
      setChecking(false);
    }
  }, [user, propertyId]);

  // Handle payment callback
  useEffect(() => {
    const tourVerify = searchParams.get('tourpay');
    const reference = searchParams.get('reference');
    if (tourVerify === 'verify' && reference && user) {
      verifyPayment(reference);
    }
  }, [searchParams, user]);

  const checkAccess = async () => {
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke('live-view-payment', {
        body: { propertyId, action: 'check' },
      });
      if (!error && data?.hasAccess) {
        setHasAccess(true);
      }
    } catch (e) {
      console.error('Check tour access error:', e);
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
      toast({ title: "Tour Unlocked! 🎉", description: "Enjoy the virtual tour." });
      window.history.replaceState({}, '', window.location.pathname);
    } catch (e) {
      console.error('Verify error:', e);
      toast({ title: "Verification Failed", description: "Could not verify payment.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!user) {
      toast({ title: "Sign In Required", description: "Please sign in to access the virtual tour.", variant: "destructive" });
      navigate('/auth');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('live-view-payment', {
        body: {
          propertyId,
          propertyType,
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
      toast({ title: "Payment Failed", description: "Could not initialize payment.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (hasAccess) {
    return <>{children}</>;
  }

  // Paywall screen
  return (
    <div className="min-h-screen flex items-center justify-center bg-black/95 relative">
      {/* Blurred background */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20 blur-md"
        style={{ backgroundImage: `url(${propertyImage})` }}
      />

      <div className="relative z-10 max-w-md w-full mx-4 text-center space-y-6">
        <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Lock className="h-8 w-8 text-primary" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Unlock Virtual Tour</h2>
            <p className="text-muted-foreground text-sm">{propertyTitle}</p>
          </div>

          <Badge className="bg-primary text-primary-foreground text-lg px-5 py-2">
            ₦{TOUR_FEE.toLocaleString()}
          </Badge>

          <div className="bg-muted/50 rounded-lg p-4 text-left space-y-1">
            <h4 className="font-semibold text-sm">What you get:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>✓ Full 360° interactive virtual tour</li>
              <li>✓ Room-by-room walkthrough</li>
              <li>✓ Permanent access — view anytime</li>
            </ul>
          </div>

          <Button className="w-full" size="lg" onClick={handlePayment} disabled={loading}>
            {loading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
            ) : (
              <>Pay ₦{TOUR_FEE.toLocaleString()} to Unlock</>
            )}
          </Button>

          <Button variant="ghost" className="w-full" onClick={() => navigate(-1)}>
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TourPaywall;
