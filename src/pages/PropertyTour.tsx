import { useState } from "react";
import VerifiedBadge from "@/components/VerifiedBadge";
import { addStepCount } from "@/lib/utils";
import TourPaywall from "@/components/TourPaywall";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { 
  ArrowLeft, MapPin, Bed, Bath, Square, Phone, MessageSquare, Mail,
  Navigation, Home, DoorOpen, Building, Footprints, Sofa, UtensilsCrossed,
  Bath as Toilet, Wind, Star, Heart, Share2
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Extended property data with tour images
const propertyTourData: Record<string, any> = {
  "1": {
    id: 1,
    title: "Modern 2-Bedroom Apartment",
    location: "Victoria Island, Lagos",
    price: "₦850,000",
    salePrice: "₦85,000,000",
    type: "rent",
    bedrooms: 2,
    bathrooms: 2,
    area: "120 sqm",
    rating: 4.8,
    verified: true,
    features: ["Furnished", "Parking", "Generator", "Security", "Pool", "Gym"],
    agentName: "David Okonkwo",
    agentCompany: "Premium Estates Limited",
    agentPhone: "+234 803 123 4567",
    agentEmail: "david@premiumestates.com",
    agentWhatsapp: "+234 803 123 4567",
    tourImages: {
      route: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop",
      areaView: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?w=800&h=600&fit=crop",
      gate: "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=600&fit=crop",
      compound: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop",
      staircase: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop",
      livingRoom: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=600&fit=crop",
      kitchen: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800&h=600&fit=crop",
      bedroom: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800&h=600&fit=crop",
      bathroom: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800&h=600&fit=crop",
      balcony: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=800&h=600&fit=crop"
    },
    description: "A stunning modern apartment in the heart of Victoria Island. This fully furnished 2-bedroom apartment offers luxury living with access to premium amenities including a swimming pool, gym, and 24/7 security."
  }
};

const PropertyTour = () => {
  const { id, type } = useParams<{ id: string; type: string }>();
  const navigate = useNavigate();
  const [selectedView, setSelectedView] = useState("overview");
  
  const property = propertyTourData[id || "1"];

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Property not found</h2>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const handleContactAgent = (method: string) => {
    if (method === 'phone') {
      window.open(`tel:${property.agentPhone}`, '_self');
      toast({
        title: "Calling Agent",
        description: `Calling ${property.agentName}`,
      });
    } else if (method === 'whatsapp') {
      window.open(`https://wa.me/${property.agentWhatsapp.replace(/\s/g, '')}?text=Hi, I'm interested in ${property.title}`, '_blank');
      toast({
        title: "Opening WhatsApp",
        description: `Starting chat with ${property.agentName}`,
      });
    } else if (method === 'email') {
      window.open(`mailto:${property.agentEmail}?subject=Inquiry about ${property.title}`, '_self');
      toast({
        title: "Opening Email",
        description: `Composing email to ${property.agentName}`,
      });
    }
  };

  const tourSections = [
    { id: "route", label: "Route to Property", icon: Navigation, image: property.tourImages.route },
    { id: "area", label: "Area View", icon: MapPin, image: property.tourImages.areaView },
    { id: "gate", label: "Main Gate", icon: DoorOpen, image: property.tourImages.gate },
    { id: "compound", label: "Compound View", icon: Building, image: property.tourImages.compound },
    { id: "staircase", label: "Staircase", icon: Footprints, image: property.tourImages.staircase },
    { id: "living", label: "Living Room", icon: Sofa, image: property.tourImages.livingRoom },
    { id: "kitchen", label: "Kitchen", icon: UtensilsCrossed, image: property.tourImages.kitchen },
    { id: "bedroom", label: "Bedroom", icon: Bed, image: property.tourImages.bedroom },
    { id: "bathroom", label: "Bathroom", icon: Toilet, image: property.tourImages.bathroom },
    { id: "balcony", label: "Balcony", icon: Wind, image: property.tourImages.balcony }
  ];

  const tourContent = (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f2f4fb_0%,#f7f7fb_42%,#f4f1ec_100%)]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(91,104,228,0.16),transparent_34%),radial-gradient(circle_at_top_right,rgba(72,153,255,0.16),transparent_28%),radial-gradient(circle_at_bottom,rgba(162,153,255,0.12),transparent_42%)] z-0" />
      
      {/* Header */}
      <header className="relative z-40 border-b border-[#d7daf0] bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0">
        <div className="container flex h-16 items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-[#1f1a54] hover:text-[#26225f] hover:bg-[#eef1ff]"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Listings
          </Button>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost">
              <Heart className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost">
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Property Header */}
      <section className="py-6 border-b">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {property.verified && (
                  <Badge className="bg-primary">✓ Verified</Badge>
                )}
                <Badge variant="secondary">
                  <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                  {property.rating}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
              <div className="flex items-center text-muted-foreground mb-2">
                <MapPin className="h-4 w-4 mr-1" />
                {property.location}
              </div>
              <div className="text-2xl font-bold text-primary">
                {type === "rent" ? property.price : property.salePrice}
                {type === "rent" && <span className="text-sm font-normal text-muted-foreground"> per month</span>}
              </div>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-1">
                <Bed className="h-4 w-4" />
                <span>{property.bedrooms} bed</span>
              </div>
              <div className="flex items-center gap-1">
                <Bath className="h-4 w-4" />
                <span>{property.bathrooms} bath</span>
              </div>
              <div className="flex items-center gap-1">
                <Square className="h-4 w-4" />
                <span>{addStepCount(property.area)}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Virtual Tour Section */}
      <section className="py-8">
        <div className="container">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="tour">Virtual Tour</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">About This Property</h2>
                  <p className="text-muted-foreground mb-6">{property.description}</p>
                  
                  <h3 className="text-xl font-semibold mb-3">Features & Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {property.features.map((feature: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-sm">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Agent Information</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold flex items-center gap-1">{property.agentName} {property.verified && <VerifiedBadge />}</p>
                      <p className="text-sm text-muted-foreground">{property.agentCompany}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2"
                        onClick={() => handleContactAgent('phone')}
                      >
                        <Phone className="h-4 w-4" />
                        Call Agent
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2"
                        onClick={() => handleContactAgent('whatsapp')}
                      >
                        <MessageSquare className="h-4 w-4" />
                        WhatsApp
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2"
                        onClick={() => handleContactAgent('email')}
                      >
                        <Mail className="h-4 w-4" />
                        Email
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tour" className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Complete Property Tour</h2>
                  
                  <div className="grid gap-8">
                    {tourSections.map((section) => {
                      const IconComponent = section.icon;
                      return (
                        <div key={section.id} className="space-y-3">
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-5 w-5 text-primary" />
                            <h3 className="text-xl font-semibold">{section.label}</h3>
                          </div>
                          <AspectRatio ratio={16 / 9}>
                            <img
                              src={section.image}
                              alt={section.label}
                              className="rounded-lg object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                            />
                          </AspectRatio>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-muted/50">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4">Interested in this property?</h3>
                  <p className="text-muted-foreground mb-4">
                    Contact our agent to schedule an in-person viewing or get more information.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Button 
                      className="flex items-center gap-2"
                      onClick={() => handleContactAgent('phone')}
                    >
                      <Phone className="h-4 w-4" />
                      Call Now
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => handleContactAgent('whatsapp')}
                    >
                      <MessageSquare className="h-4 w-4" />
                      WhatsApp
                    </Button>
                    <Button 
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={() => handleContactAgent('email')}
                    >
                      <Mail className="h-4 w-4" />
                      Email
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );

  return (
    <TourPaywall
      propertyId={id || "1"}
      propertyTitle={property.title}
      propertyImage={property.tourImages.livingRoom}
      propertyType={type || "rent"}
    >
      {tourContent}
    </TourPaywall>
  );
};

export default PropertyTour;
