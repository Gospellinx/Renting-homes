import { useState, useEffect } from "react";
import VerifiedBadge from "@/components/VerifiedBadge";
import { addStepCount } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, MapPin, Bed, Bath, Square, Heart, Share2, ArrowLeft, Filter, Star, Phone, MessageSquare, Mail, Scale, Video, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import AdBanner from '@/components/AdBanner';
import CompareFloatingButton from "@/components/CompareFloatingButton";
import { useCompareProperties } from "@/hooks/useCompareProperties";
import { nigerianCities, getAreasForCity } from "@/data/nigerianLocations";
import LiveViewModal from "@/components/LiveViewModal";
import { useAuth } from "@/hooks/useAuth";
import { useIntendedAction } from "@/hooks/useIntendedAction";
import ScrollAuthGate from "@/components/ScrollAuthGate";

// Mock data for properties for sale
const properties = [
  {
    id: 1, title: "Modern 2-Bedroom Apartment", location: "Victoria Island, Lagos",
    price: "₦85,000,000", bedrooms: 2, bathrooms: 2, area: "120 sqm",
    image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop",
    rating: 4.8, verified: true,
    features: ["Furnished", "Parking", "Generator", "Security", "Pool", "Gym"],
    agentName: "David Okonkwo", agentCompany: "Premium Estates Limited",
    agentPhone: "+234 803 123 4567", agentEmail: "david@premiumestates.com", agentWhatsapp: "+234 803 123 4567",
    similar: [
      { id: 2, title: "Luxury Studio", price: "₦65,000,000", image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=300&h=200&fit=crop" },
      { id: 3, title: "Cozy 1-Bedroom", price: "₦75,000,000", image: "https://images.unsplash.com/photo-1524230572899-a752b3835840?w=300&h=200&fit=crop" },
    ]
  },
  {
    id: 5, title: "Spacious 3-Bedroom House", location: "Ikoyi, Lagos",
    price: "₦120,000,000", bedrooms: 3, bathrooms: 3, area: "200 sqm",
    image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400&h=300&fit=crop",
    rating: 4.9, verified: true,
    features: ["Parking", "Swimming Pool", "Garden", "24/7 Security", "Solar Power"],
    agentName: "Sarah Johnson", agentCompany: "Elite Properties Nigeria",
    agentPhone: "+234 901 234 5678", agentEmail: "sarah@eliteproperties.ng", agentWhatsapp: "+234 901 234 5678",
    similar: [
      { id: 6, title: "Family Home", price: "₦110,000,000", image: "https://images.unsplash.com/photo-1524230572899-a752b3835840?w=300&h=200&fit=crop" },
    ]
  },
  {
    id: 9, title: "Executive 4-Bedroom Duplex", location: "Lekki, Lagos",
    price: "₦95,000,000", bedrooms: 4, bathrooms: 4, area: "280 sqm",
    image: "https://images.unsplash.com/photo-1524230572899-a752b3835840?w=400&h=300&fit=crop",
    rating: 4.7, verified: true,
    features: ["Parking", "Gym", "Elevator", "Balcony", "Study Room"],
    agentName: "Michael Adebayo", agentCompany: "Lekki Properties Hub",
    agentPhone: "+234 805 345 6789", agentEmail: "michael@lekkiproperties.com", agentWhatsapp: "+234 805 345 6789",
    similar: []
  },
  {
    id: 13, title: "Luxury Penthouse — Eko Atlantic", location: "Victoria Island, Lagos",
    price: "₦250,000,000", bedrooms: 5, bathrooms: 5, area: "400 sqm",
    image: "https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?w=400&h=300&fit=crop",
    rating: 5.0, verified: true,
    features: ["Sea View", "Smart Home", "Private Elevator", "Rooftop Terrace"],
    agentName: "Tunde Fashola", agentCompany: "Atlantic Properties",
    agentPhone: "+234 802 555 6666", agentEmail: "tunde@atlanticprops.com", agentWhatsapp: "+234 802 555 6666",
    similar: []
  },
  {
    id: 14, title: "3-Bedroom Bungalow — Gwarinpa", location: "Gwarinpa, Abuja",
    price: "₦55,000,000", bedrooms: 3, bathrooms: 2, area: "180 sqm",
    image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop",
    rating: 4.5, verified: true,
    features: ["Parking", "Garden", "Borehole", "Fence"],
    agentName: "Amina Bello", agentCompany: "Abuja Realty",
    agentPhone: "+234 903 111 2222", agentEmail: "amina@abujarealty.ng", agentWhatsapp: "+234 903 111 2222",
    similar: []
  },
  {
    id: 15, title: "Semi-Detached Duplex — Maitama", location: "Maitama, Abuja",
    price: "₦180,000,000", bedrooms: 5, bathrooms: 4, area: "350 sqm",
    image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400&h=300&fit=crop",
    rating: 4.8, verified: true,
    features: ["BQ", "Swimming Pool", "Generator", "24/7 Security"],
    agentName: "Chike Nwankwo", agentCompany: "Capital Estates",
    agentPhone: "+234 810 333 4444", agentEmail: "chike@capitalestates.com", agentWhatsapp: "+234 810 333 4444",
    similar: []
  },
  {
    id: 16, title: "Terrace House — Jabi", location: "Jabi, Abuja",
    price: "₦45,000,000", bedrooms: 3, bathrooms: 3, area: "160 sqm",
    image: "https://images.unsplash.com/photo-1524230572899-a752b3835840?w=400&h=300&fit=crop",
    rating: 4.4, verified: false,
    features: ["Gated Estate", "Tiled", "Parking"],
    agentName: "Yusuf Abdullahi", agentCompany: "Jabi Properties",
    agentPhone: "+234 811 555 6666", agentEmail: "yusuf@jabiprops.ng", agentWhatsapp: "+234 811 555 6666",
    similar: []
  },
  {
    id: 17, title: "Waterfront Villa — Banana Island", location: "Ikoyi, Lagos",
    price: "₦500,000,000", bedrooms: 6, bathrooms: 7, area: "600 sqm",
    image: "https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?w=400&h=300&fit=crop",
    rating: 5.0, verified: true,
    features: ["Waterfront", "Cinema", "Wine Cellar", "Smart Home", "Jetty"],
    agentName: "Fola Adesanya", agentCompany: "Luxury Living",
    agentPhone: "+234 802 777 8888", agentEmail: "fola@luxuryliving.ng", agentWhatsapp: "+234 802 777 8888",
    similar: []
  },
  {
    id: 18, title: "2-Bed Flat — GRA Phase 2", location: "Port Harcourt, Rivers",
    price: "₦35,000,000", bedrooms: 2, bathrooms: 2, area: "110 sqm",
    image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop",
    rating: 4.3, verified: true,
    features: ["Furnished", "AC", "Generator", "Security"],
    agentName: "Grace Amadi", agentCompany: "PH Homes",
    agentPhone: "+234 810 999 0000", agentEmail: "grace@phhomes.com", agentWhatsapp: "+234 810 999 0000",
    similar: []
  },
  {
    id: 19, title: "Detached House — Asokoro", location: "Asokoro, Abuja",
    price: "₦220,000,000", bedrooms: 5, bathrooms: 5, area: "450 sqm",
    image: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=400&h=300&fit=crop",
    rating: 4.9, verified: true,
    features: ["Diplomatic Zone", "BQ", "Large Compound", "Solar Power"],
    agentName: "Ngozi Eze", agentCompany: "Asokoro Realty",
    agentPhone: "+234 903 222 3333", agentEmail: "ngozi@asokororealty.ng", agentWhatsapp: "+234 903 222 3333",
    similar: []
  },
];

const BuyProperty = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { saveAction, getAction, clearAction } = useIntendedAction();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [selectedBedrooms, setSelectedBedrooms] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const { addProperty, removeProperty, isSelected, properties: compareProperties } = useCompareProperties();
  const [liveViewProperty, setLiveViewProperty] = useState<typeof properties[0] | null>(null);

  // Resume intended action after login
  useEffect(() => {
    if (user) {
      const action = getAction();
      if (action && action.page === '/buy-property' && action.type === 'live_view') {
        const prop = properties.find(p => p.id === action.propertyId);
        if (prop) {
          setLiveViewProperty(prop);
        }
        clearAction();
      }
    }
  }, [user]);

  const isGuest = !loading && !user;

  const handleLiveView = (property: typeof properties[0]) => {
    if (!user) {
      saveAction({
        type: 'live_view',
        page: '/buy-property',
        propertyId: property.id,
        propertyTitle: property.title,
      });
      toast({
        title: "Sign In Required",
        description: "Please create an account or sign in to access Live View.",
      });
      navigate('/auth');
      return;
    }
    setLiveViewProperty(property);
  };

  const availableAreas = getAreasForCity(selectedCity);

  const handleCityChange = (val: string) => {
    setSelectedCity(val);
    setSelectedArea("");
  };

  const filteredProperties = properties.filter(property => {
    const cityObj = nigerianCities.find(c => c.value === selectedCity);
    const areaObj = availableAreas.find(a => a.value === selectedArea);
    const areaLabel = areaObj?.label || "";

    const matchesCity = !selectedCity || (
      (selectedCity === "abuja" && property.location.toLowerCase().includes("abuja")) ||
      (selectedCity === "lagos" && property.location.toLowerCase().includes("lagos")) ||
      (selectedCity === "port-harcourt" && property.location.toLowerCase().includes("port harcourt")) ||
      (cityObj && property.location.toLowerCase().includes(cityObj.state.toLowerCase()))
    );
    const matchesArea = !selectedArea || property.location.toLowerCase().includes(areaLabel.toLowerCase());
    const matchesSearch = !searchTerm || property.title.toLowerCase().includes(searchTerm.toLowerCase()) || property.location.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch && (selectedCity ? matchesCity : true) && (selectedArea ? matchesArea : true);
  });

  const handleCompareToggle = (property: typeof properties[0]) => {
    if (isSelected(property.id, 'sale')) {
      removeProperty(property.id, 'sale');
      toast({
        title: "Removed from comparison",
        description: `${property.title} removed from comparison list`,
      });
    } else {
      if (compareProperties.length >= 4) {
        toast({
          title: "Maximum reached",
          description: "You can compare up to 4 properties at a time",
          variant: "destructive",
        });
        return;
      }
      addProperty({
        id: property.id,
        type: 'sale',
        title: property.title,
        location: property.location,
        price: property.price,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        area: property.area,
        image: property.image,
        features: property.features,
      });
      toast({
        title: "Added to comparison",
        description: `${property.title} added to comparison list`,
      });
    }
  };

  const handleContactAgent = (method: string, property: any) => {
    if (method === 'phone') {
      window.open(`tel:${property.agentPhone}`, '_self');
      toast({
        title: "Calling Agent",
        description: `Calling ${property.agentName} at ${property.agentPhone}`,
      });
    } else if (method === 'whatsapp') {
      window.open(`https://wa.me/${property.agentWhatsapp.replace(/\s/g, '')}?text=Hi, I'm interested in the ${property.title} property listed for ${property.price}`, '_blank');
      toast({
        title: "Opening WhatsApp",
        description: `Starting WhatsApp chat with ${property.agentName}`,
      });
    } else if (method === 'email') {
      window.open(`mailto:${property.agentEmail}?subject=Inquiry about ${property.title}&body=Hi ${property.agentName}, I'm interested in the ${property.title} property listed for ${property.price}. Please provide more details.`, '_self');
      toast({
        title: "Opening Email",
        description: `Composing email to ${property.agentName}`,
      });
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f2f4fb_0%,#f7f7fb_42%,#f4f1ec_100%)]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(91,104,228,0.16),transparent_34%),radial-gradient(circle_at_top_right,rgba(72,153,255,0.16),transparent_28%),radial-gradient(circle_at_bottom,rgba(162,153,255,0.12),transparent_42%)] z-0" />
      
      {/* Header */}
      <header className="relative z-40 border-b border-[#d7daf0] bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2 text-[#1f1a54] hover:text-[#26225f]">
              <ArrowLeft className="h-5 w-5" />
              <span className="text-lg font-semibold">Back to Home</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="text-[#1f1a54] hover:text-[#26225f] hover:bg-[#eef1ff]">Sign In</Button>
            <Button size="sm" className="bg-[#26225f] text-white hover:bg-[#1f1b50]">Get Started</Button>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <section className="relative z-10 py-8">
        <div className="container">
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-[#1f1a54]">
              Properties for Sale
            </h1>
            <p className="text-xl text-[#6f7599]">
              Find your dream home with verified listings
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-6 bg-white/90 p-6 rounded-2xl border border-[#d7daf0] shadow-[0_20px_50px_rgba(31,26,84,0.12)]">
            {/* Search */}
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-5 w-5 text-[#7d84ad]" />
              <Input
                placeholder="Search properties..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-[#d7daf0] text-[#1f1a54] placeholder:text-[#9ca2c6]"
              />
            </div>

            {/* City / State */}
            <Select value={selectedCity} onValueChange={handleCityChange}>
              <SelectTrigger className="border-[#d7daf0] text-[#1f1a54]">
                <SelectValue placeholder="City / State" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {nigerianCities.map((city) => (
                  <SelectItem key={city.value} value={city.value}>
                    {city.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Town / Area in city */}
            <Select
              value={selectedArea}
              onValueChange={setSelectedArea}
              disabled={!selectedCity}
            >
              <SelectTrigger>
                <SelectValue placeholder={selectedCity ? "Town / Area" : "Select city first"} />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {availableAreas.map((area) => (
                  <SelectItem key={area.value} value={area.value}>
                    {area.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Bedrooms */}
            <Select value={selectedBedrooms} onValueChange={setSelectedBedrooms}>
              <SelectTrigger>
                <SelectValue placeholder="Bedrooms" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 Bedroom</SelectItem>
                <SelectItem value="2">2 Bedrooms</SelectItem>
                <SelectItem value="3">3 Bedrooms</SelectItem>
                <SelectItem value="4">4+ Bedrooms</SelectItem>
              </SelectContent>
            </Select>

            {/* Price Range */}
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger>
                <SelectValue placeholder="Price Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Under ₦50M</SelectItem>
                <SelectItem value="medium">₦50M – ₦100M</SelectItem>
                <SelectItem value="high">₦100M – ₦200M</SelectItem>
                <SelectItem value="premium">₦200M+</SelectItem>
              </SelectContent>
            </Select>

            <Button className="w-full md:col-span-6">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
      </section>

      {/* Properties Ad Banner */}
      <section className="py-4">
        <div className="container">
          <AdBanner type="banner" />
        </div>
      </section>

      {/* Properties List with Vertical Scrolling */}
      <section className="py-8">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">
              Available Properties ({filteredProperties.length})
            </h2>
            <p className="text-muted-foreground">
              Scroll down to see more properties
            </p>
          </div>

          <div className="relative">
            <div className={`space-y-8 ${isGuest ? 'max-h-[800px] overflow-hidden' : ''}`}>
              {filteredProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="grid md:grid-cols-5 gap-6">
                  {/* Property Image */}
                  <div className="md:col-span-2 relative">
                    <img 
                      src={property.image} 
                      alt={property.title}
                      className="w-full h-64 md:h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      {property.verified && (
                        <Badge className="bg-primary text-primary-foreground">
                          ✓ Verified
                        </Badge>
                      )}
                      <Badge variant="secondary" className="bg-background/80">
                        <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                        {property.rating}
                      </Badge>
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button 
                        size="sm" 
                        variant={isSelected(property.id, 'sale') ? "default" : "secondary"}
                        className={isSelected(property.id, 'sale') ? "" : "bg-background/80"}
                        onClick={() => handleCompareToggle(property)}
                      >
                        <Scale className="h-4 w-4 mr-1" />
                        {isSelected(property.id, 'sale') ? "Added" : "Compare"}
                      </Button>
                      <Button size="sm" variant="secondary" className="bg-background/80">
                        <Heart className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="secondary" className="bg-background/80">
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Property Details */}
                  <div className="md:col-span-3 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-2xl font-bold mb-2">{property.title}</h3>
                        <div className="flex items-center text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          {property.location}
                        </div>
                        <div className="text-3xl font-bold text-primary">
                          {property.price}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                      <div className="flex items-center">
                        <Bed className="h-4 w-4 mr-1" />
                        {property.bedrooms} bed
                      </div>
                      <div className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" />
                        {property.bathrooms} bath
                      </div>
                      <div className="flex items-center">
                        <Square className="h-4 w-4 mr-1" />
                        {addStepCount(property.area)}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {property.features.map((feature, index) => (
                        <Badge key={index} variant="outline">
                          {feature}
                        </Badge>
                      ))}
                    </div>

                    {/* Agent Information */}
                    <div className="bg-muted/20 p-4 rounded-lg mb-4">
                      <h4 className="font-semibold mb-2">Agent Information</h4>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <strong>{property.agentName}</strong> {property.verified && <VerifiedBadge />} - {property.agentCompany}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {property.agentPhone} | {property.agentEmail}
                      </p>
                    </div>

                    {/* Similar Properties Horizontal Scroll */}
                    <div className="mb-6">
                      <h4 className="text-lg font-semibold mb-3">Similar Properties</h4>
                      <ScrollArea className="w-full whitespace-nowrap">
                        <div className="flex space-x-4 pb-4">
                          {property.similar.map((similar) => (
                            <Card key={similar.id} className="flex-shrink-0 w-48 hover:shadow-md transition-shadow">
                              <CardContent className="p-3">
                                <img 
                                  src={similar.image} 
                                  alt={similar.title}
                                  className="w-full h-32 object-cover rounded-md mb-2"
                                />
                                <h5 className="font-medium text-sm truncate">{similar.title}</h5>
                                <p className="text-primary font-semibold text-sm">{similar.price}</p>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Contact Options */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Button 
                        className="flex items-center gap-2 col-span-2 md:col-span-2"
                        onClick={() => window.location.href = `/property/sale/${property.id}`}
                      >
                        View Property
                      </Button>
                      <Button 
                        variant="hero"
                        className="flex items-center gap-2 col-span-2 md:col-span-2"
                        onClick={() => handleLiveView(property)}
                      >
                        <Video className="h-4 w-4" />
                        Live View — ₦500
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2"
                        onClick={() => handleContactAgent('phone', property)}
                      >
                        <Phone className="h-4 w-4" />
                        Call
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2"
                        onClick={() => handleContactAgent('whatsapp', property)}
                      >
                        <MessageSquare className="h-4 w-4" />
                        WhatsApp
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex items-center gap-2 col-span-2"
                        onClick={() => handleContactAgent('email', property)}
                      >
                        <Mail className="h-4 w-4" />
                        Email
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
            </div>
            {isGuest && <ScrollAuthGate />}
          </div>
        </div>
      </section>

      <CompareFloatingButton />

      {liveViewProperty && (
        <LiveViewModal
          open={!!liveViewProperty}
          onOpenChange={(open) => !open && setLiveViewProperty(null)}
          property={liveViewProperty}
        />
      )}
    </div>
  );
};

export default BuyProperty;