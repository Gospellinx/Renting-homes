import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, ExternalLink, Loader2 } from 'lucide-react';
import { useApprovedAds, ApprovedAd } from '@/hooks/useApprovedAds';
import { useAdTracking } from '@/hooks/useAdTracking';

interface AdContent {
  id: string;
  title: string;
  description: string;
  image: string;
  price?: string;
  location?: string;
  badge?: string;
  cta: string;
  link: string;
}

interface AdBannerProps {
  type?: 'hero' | 'banner' | 'sidebar';
  className?: string;
  autoRotate?: boolean;
  showClose?: boolean;
}

// Fallback ads when no approved ads exist
const fallbackAds: AdContent[] = [
  {
    id: 'fallback1',
    title: 'Luxury 4BR Duplex in Lekki',
    description: 'Premium gated estate with 24/7 security, swimming pool, and gym facilities',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=500&fit=crop',
    price: '₦45M',
    location: 'Lekki Phase 1',
    badge: 'Featured',
    cta: 'View Details',
    link: '/property/luxury-lekki-duplex'
  },
  {
    id: 'fallback2',
    title: 'Affordable 2BR Apartment',
    description: 'Modern apartment in serene environment with excellent facilities',
    image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=500&fit=crop',
    price: '₦8.5M',
    location: 'Ibeju-Lekki',
    badge: 'Hot Deal',
    cta: 'Book Inspection',
    link: '/property/affordable-apartment'
  },
];

const transformApprovedAd = (ad: ApprovedAd): AdContent => ({
  id: ad.id,
  title: ad.headline,
  description: ad.description || '',
  image: ad.image_url || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=500&fit=crop',
  price: ad.price || undefined,
  location: ad.location || undefined,
  badge: ad.badge || undefined,
  cta: ad.cta_text,
  link: ad.cta_link || '#'
});

const AdBanner = ({ 
  type = 'banner', 
  className = '', 
  autoRotate = true,
  showClose = true 
}: AdBannerProps) => {
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [trackedImpressions, setTrackedImpressions] = useState<Set<string>>(new Set());
  const { data: approvedAds, isLoading } = useApprovedAds();
  const { trackImpression, trackClick } = useAdTracking();

  // Use approved ads from database, fallback to mock data if none available
  const adContent: AdContent[] = approvedAds && approvedAds.length > 0 
    ? approvedAds.map(transformApprovedAd)
    : fallbackAds;

  // Track impression when ad is displayed
  useEffect(() => {
    const currentAd = adContent[currentAdIndex];
    if (currentAd && !currentAd.id.startsWith('fallback') && !trackedImpressions.has(currentAd.id)) {
      trackImpression.mutate(currentAd.id);
      setTrackedImpressions(prev => new Set(prev).add(currentAd.id));
    }
  }, [currentAdIndex, adContent, trackedImpressions, trackImpression]);

  useEffect(() => {
    if (!autoRotate || adContent.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % adContent.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRotate, adContent.length]);

  // Handle ad click tracking
  const handleAdClick = (adId: string, link: string) => {
    if (!adId.startsWith('fallback')) {
      trackClick.mutate(adId);
    }
    // Navigate to link
    if (link && link !== '#') {
      window.location.href = link;
    }
  };

  if (!isVisible) return null;

  if (isLoading) {
    return (
      <Card className={`border-0 shadow-lg ${className}`}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const currentAd = adContent[currentAdIndex];

  if (type === 'hero') {
    return (
      <div className={`relative overflow-hidden rounded-2xl ${className}`}>
        <Card className="w-full border-0 shadow-lg overflow-hidden">
          <div className="relative min-h-[400px] md:min-h-[500px]">
            {/* Background Image */}
            <img
              src={currentAd.image}
              alt={currentAd.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
            
            {/* Gradient Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
            
            {/* Content overlay */}
            <div className="relative z-10 flex flex-col justify-center h-full min-h-[400px] md:min-h-[500px] p-6 lg:p-12">
              <div className="max-w-2xl space-y-4">
                {currentAd.badge && (
                  <Badge className="bg-primary text-primary-foreground w-fit">
                    {currentAd.badge}
                  </Badge>
                )}
                <div>
                  <h3 className="text-2xl lg:text-4xl font-bold text-white mb-2">{currentAd.title}</h3>
                  <p className="text-white/90 text-lg">{currentAd.description}</p>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <div className="text-3xl font-bold text-white">{currentAd.price}</div>
                    <div className="text-white/80">{currentAd.location}</div>
                  </div>
                  <Button 
                    variant="hero" 
                    size="lg" 
                    className="gap-2 w-fit"
                    onClick={() => handleAdClick(currentAd.id, currentAd.link)}
                  >
                    {currentAd.cta}
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            {showClose && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 z-20 bg-white/10 hover:bg-white/20 text-white"
                onClick={() => setIsVisible(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
        
        {/* Dots indicator */}
        <div className="flex justify-center mt-4 space-x-2">
          {adContent.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentAdIndex ? 'bg-primary scale-110' : 'bg-muted hover:bg-muted-foreground/50'
              }`}
              onClick={() => setCurrentAdIndex(index)}
            />
          ))}
        </div>
      </div>
    );
  }

  if (type === 'sidebar') {
    return (
      <Card className={`border-0 shadow-lg bg-gradient-to-br from-card to-card/90 overflow-hidden ${className}`}>
        {showClose && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 z-10"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        <div className="relative h-32">
          <img
            src={currentAd.image}
            alt={currentAd.title}
            className="w-full h-full object-cover"
          />
          {currentAd.badge && (
            <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs">
              {currentAd.badge}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <div className="space-y-2">
            <h4 className="font-semibold text-sm line-clamp-1">{currentAd.title}</h4>
            <p className="text-xs text-muted-foreground line-clamp-2">{currentAd.description}</p>
            <div className="flex items-center justify-between">
              <div className="text-sm font-bold text-primary">{currentAd.price}</div>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => handleAdClick(currentAd.id, currentAd.link)}
              >
                {currentAd.cta}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default banner type
  return (
    <Card className={`border-0 shadow-lg bg-gradient-to-r from-primary/5 to-accent/5 overflow-hidden ${className}`}>
      {showClose && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 z-10"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={currentAd.image}
              alt={currentAd.title}
              className="w-full h-full object-cover"
            />
            {currentAd.badge && (
              <Badge className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs">
                {currentAd.badge}
              </Badge>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-foreground truncate">{currentAd.title}</h4>
            <p className="text-sm text-muted-foreground line-clamp-2">{currentAd.description}</p>
            <div className="flex items-center justify-between mt-2">
              <div>
                <div className="text-lg font-bold text-primary">{currentAd.price}</div>
                <div className="text-xs text-muted-foreground">{currentAd.location}</div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-1"
                onClick={() => handleAdClick(currentAd.id, currentAd.link)}
              >
                {currentAd.cta}
                <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdBanner;