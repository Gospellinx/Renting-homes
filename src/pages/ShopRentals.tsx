import { useState, useEffect } from "react";
import { addStepCount } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, MapPin, Square, Heart, Share2, ArrowLeft, Filter, Star, Scale, Phone, MessageSquare, Mail, Video, Store, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import AdBanner from '@/components/AdBanner';
import CompareFloatingButton from "@/components/CompareFloatingButton";
import { useCompareProperties } from "@/hooks/useCompareProperties";
import { nigerianCities, getAreasForCity } from "@/data/nigerianLocations";
import LiveViewModal from "@/components/LiveViewModal";
import ShopViewModal from "@/components/ShopViewModal";
import { useAuth } from "@/hooks/useAuth";
import { useIntendedAction } from "@/hooks/useIntendedAction";
import ScrollAuthGate from "@/components/ScrollAuthGate";

const shopProperties = [
  {
    id: 101, title: "Prime Retail Space — Lekki Mall", location: "Lekki Phase 1, Lagos",
    price: "₦450,000", period: "per month", area: "600 sqft", width: "20ft", length: "30ft",
    image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop",
    rating: 4.9, verified: true,
    features: ["Ground Floor", "AC", "Tiled", "24/7 Security", "Parking"],
    agentName: "Chioma Eze", agentPhone: "+234 802 111 2222",
    agentEmail: "chioma@shopsng.com", agentWhatsapp: "+234 802 111 2222",
    similar: [
      { id: 102, title: "Corner Shop", price: "₦400,000", image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=300&h=200&fit=crop" },
      { id: 103, title: "Open-plan Store", price: "₦500,000", image: "https://images.unsplash.com/photo-1528698827591-e19cef51a699?w=300&h=200&fit=crop" },
    ],
  },
  {
    id: 104, title: "Lock-up Shop in Wuse Market", location: "Wuse Zone 4, Abuja",
    price: "₦250,000", period: "per month", area: "350 sqft", width: "14ft", length: "25ft",
    image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400&h=300&fit=crop",
    rating: 4.5, verified: true,
    features: ["Lock-up", "Burglar Proof", "Water Supply", "Signage Space"],
    agentName: "Emeka Nwosu", agentPhone: "+234 903 333 4444",
    agentEmail: "emeka@abujaprops.ng", agentWhatsapp: "+234 903 333 4444",
    similar: [
      { id: 105, title: "Market Stall", price: "₦180,000", image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=300&h=200&fit=crop" },
      { id: 106, title: "Plaza Shop", price: "₦300,000", image: "https://images.unsplash.com/photo-1528698827591-e19cef51a699?w=300&h=200&fit=crop" },
    ],
  },
  {
    id: 107, title: "Showroom Space — Aba Road", location: "Port Harcourt, Rivers",
    price: "₦350,000", period: "per month", area: "800 sqft", width: "25ft", length: "32ft",
    image: "https://images.unsplash.com/photo-1528698827591-e19cef51a699?w=400&h=300&fit=crop",
    rating: 4.6, verified: false,
    features: ["High Ceiling", "Display Windows", "Generator", "Road-facing"],
    agentName: "Grace Amadi", agentPhone: "+234 810 555 6666",
    agentEmail: "grace@phprops.com", agentWhatsapp: "+234 810 555 6666",
    similar: [
      { id: 108, title: "Warehouse Unit", price: "₦500,000", image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=300&h=200&fit=crop" },
      { id: 109, title: "Mini Shop", price: "₦200,000", image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=300&h=200&fit=crop" },
    ],
  },
  {
    id: 110, title: "Plaza Shop — Allen Avenue", location: "Ikeja, Lagos",
    price: "₦380,000", period: "per month", area: "450 sqft", width: "18ft", length: "25ft",
    image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop",
    rating: 4.4, verified: true,
    features: ["Tiled", "AC", "Security", "Toilet"],
    agentName: "Femi Balogun", agentPhone: "+234 809 777 8888",
    agentEmail: "femi@lagosshops.com", agentWhatsapp: "+234 809 777 8888",
    similar: [],
  },
  {
    id: 111, title: "Open Market Space — Garki", location: "Garki, Abuja",
    price: "₦200,000", period: "per month", area: "300 sqft", width: "15ft", length: "20ft",
    image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400&h=300&fit=crop",
    rating: 4.2, verified: true,
    features: ["Ground Floor", "Open Space", "Water Supply"],
    agentName: "Hauwa Ibrahim", agentPhone: "+234 811 999 0000",
    agentEmail: "hauwa@abujamarket.ng", agentWhatsapp: "+234 811 999 0000",
    similar: [],
  },
  {
    id: 112, title: "Boutique Space — Admiralty Way", location: "Lekki Phase 1, Lagos",
    price: "₦550,000", period: "per month", area: "500 sqft", width: "20ft", length: "25ft",
    image: "https://images.unsplash.com/photo-1528698827591-e19cef51a699?w=400&h=300&fit=crop",
    rating: 4.8, verified: true,
    features: ["Glass Front", "AC", "Parking", "CCTV"],
    agentName: "Tola Adeyemi", agentPhone: "+234 802 222 3333",
    agentEmail: "tola@lekkishops.com", agentWhatsapp: "+234 802 222 3333",
    similar: [],
  },
  {
    id: 113, title: "Corner Store — Trans Amadi", location: "Port Harcourt, Rivers",
    price: "₦280,000", period: "per month", area: "400 sqft", width: "16ft", length: "25ft",
    image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop",
    rating: 4.3, verified: false,
    features: ["Corner Piece", "Road-facing", "Burglar Proof"],
    agentName: "Chidi Okeke", agentPhone: "+234 903 444 5555",
    agentEmail: "chidi@phshops.com", agentWhatsapp: "+234 903 444 5555",
    similar: [],
  },
  {
    id: 114, title: "Mini Supermarket Space", location: "Gwarinpa, Abuja",
    price: "₦600,000", period: "per month", area: "1,000 sqft", width: "25ft", length: "40ft",
    image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400&h=300&fit=crop",
    rating: 4.7, verified: true,
    features: ["Large Space", "Parking Lot", "Generator", "Cold Room"],
    agentName: "Amina Yusuf", agentPhone: "+234 812 666 7777",
    agentEmail: "amina@abujashops.ng", agentWhatsapp: "+234 812 666 7777",
    similar: [],
  },
  {
    id: 115, title: "Fashion Store — Victoria Island", location: "Victoria Island, Lagos",
    price: "₦700,000", period: "per month", area: "550 sqft", width: "22ft", length: "25ft",
    image: "https://images.unsplash.com/photo-1528698827591-e19cef51a699?w=400&h=300&fit=crop",
    rating: 4.9, verified: true,
    features: ["Premium Location", "Display Windows", "AC", "Fitted"],
    agentName: "Nneka Obi", agentPhone: "+234 805 888 9999",
    agentEmail: "nneka@vishops.com", agentWhatsapp: "+234 805 888 9999",
    similar: [],
  },
  {
    id: 116, title: "Workshop Space — Kubwa", location: "Kubwa, Abuja",
    price: "₦180,000", period: "per month", area: "750 sqft", width: "25ft", length: "30ft",
    image: "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=300&fit=crop",
    rating: 4.1, verified: false,
    features: ["High Ceiling", "Ventilated", "Heavy Duty Floor", "Loading Bay"],
    agentName: "Musa Danjuma", agentPhone: "+234 813 111 2222",
    agentEmail: "musa@kubwashops.ng", agentWhatsapp: "+234 813 111 2222",
    similar: [],
  },
];

const ShopRentals = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const isGuest = !loading && !user;
  const { saveAction, getAction, clearAction } = useIntendedAction();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedArea, setSelectedArea] = useState("");
  const [priceRange, setPriceRange] = useState("");
  const [shopType, setShopType] = useState("");
  const { addProperty, removeProperty, isSelected, properties: compareProperties } = useCompareProperties();
  const [liveViewProperty, setLiveViewProperty] = useState<typeof shopProperties[0] | null>(null);
  const [viewShopProperty, setViewShopProperty] = useState<typeof shopProperties[0] | null>(null);

  useEffect(() => {
    if (user) {
      const action = getAction();
      if (action && action.page === '/shop-rentals' && action.type === 'live_view') {
        const prop = shopProperties.find(p => p.id === action.propertyId);
        if (prop) setLiveViewProperty(prop);
        clearAction();
      }
    }
  }, [user]);

  const handleLiveView = (property: typeof shopProperties[0]) => {
    if (!user) {
      saveAction({ type: 'live_view', page: '/shop-rentals', propertyId: property.id, propertyTitle: property.title });
      toast({ title: "Sign In Required", description: "Please create an account or sign in to access Live View." });
      navigate('/auth');
      return;
    }
    setLiveViewProperty(property);
  };

  const availableAreas = getAreasForCity(selectedCity);
  const handleCityChange = (val: string) => { setSelectedCity(val); setSelectedArea(""); };

  const filteredProperties = shopProperties.filter(property => {
    const cityObj = nigerianCities.find(c => c.value === selectedCity);
    const areaObj = availableAreas.find(a => a.value === selectedArea);
    const areaLabel = areaObj?.label || "";
    const matchesCity = !selectedCity || property.location.toLowerCase().includes(cityObj?.state?.toLowerCase() || "") || property.location.toLowerCase().includes("abuja") && selectedCity === "abuja" || property.location.toLowerCase().includes("lagos") && selectedCity === "lagos" || property.location.toLowerCase().includes("port harcourt") && selectedCity === "port-harcourt";
    const matchesArea = !selectedArea || property.location.toLowerCase().includes(areaLabel.toLowerCase());
    const matchesSearch = !searchTerm || property.title.toLowerCase().includes(searchTerm.toLowerCase()) || property.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch && (selectedCity ? matchesCity : true) && (selectedArea ? matchesArea : true);
  });

  const handleCompareToggle = (property: typeof shopProperties[0]) => {
    if (isSelected(property.id, 'rent')) {
      removeProperty(property.id, 'rent');
      toast({ title: "Removed from comparison", description: `${property.title} removed` });
    } else {
      if (compareProperties.length >= 4) {
        toast({ title: "Maximum reached", description: "You can compare up to 4 properties", variant: "destructive" });
        return;
      }
      addProperty({
        id: property.id, type: 'rent', title: property.title, location: property.location,
        price: property.price, period: property.period, bedrooms: 0, bathrooms: 0,
        area: property.area, image: property.image, features: property.features,
      });
      toast({ title: "Added to comparison", description: `${property.title} added` });
    }
  };

  const handleContactAgent = (method: string, property: any) => {
    if (method === 'phone') { window.open(`tel:${property.agentPhone}`, '_self'); }
    else if (method === 'whatsapp') { window.open(`https://wa.me/${property.agentWhatsapp.replace(/\s/g, '')}?text=Hi, I'm interested in ${property.title} listed for ${property.price}`, '_blank'); }
    else if (method === 'email') { window.open(`mailto:${property.agentEmail}?subject=Inquiry about ${property.title}&body=Hi ${property.agentName}, I'm interested in ${property.title} listed for ${property.price}.`, '_self'); }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f2f4fb_0%,#f7f7fb_42%,#f4f1ec_100%)]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(91,104,228,0.16),transparent_34%),radial-gradient(circle_at_top_right,rgba(72,153,255,0.16),transparent_28%),radial-gradient(circle_at_bottom,rgba(162,153,255,0.12),transparent_42%)] z-0" />
      
      <header className="relative z-40 border-b border-[#d7daf0] bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 text-[#1f1a54] hover:text-[#26225f]">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-lg font-semibold">Back to Home</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild className="text-[#1f1a54] hover:text-[#26225f] hover:bg-[#eef1ff]"><Link to="/auth">Sign In</Link></Button>
            <Button size="sm" asChild className="bg-[#26225f] text-white hover:bg-[#1f1b50]"><Link to="/auth">Get Started</Link></Button>
          </div>
        </div>
      </header>

      <section className="relative z-10 py-8">
        <div className="container">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-[#eef1ff] text-[#26225f] px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <Store className="h-4 w-4" /> Shop Rentals
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold mb-4 text-[#1f1a54]">Shops & Commercial Spaces</h1>
            <p className="text-xl text-[#6f7599]">Find the perfect shop or retail space for your business</p>
          </div>

          <div className="grid gap-3 md:grid-cols-5 bg-white/90 p-6 rounded-2xl border border-[#d7daf0] shadow-[0_20px_50px_rgba(31,26,84,0.12)]">
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-3 h-5 w-5 text-[#7d84ad]" />
              <Input placeholder="Search shops..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 border-[#d7daf0] text-[#1f1a54] placeholder:text-[#9ca2c6]" />
            </div>
            <Select value={selectedCity} onValueChange={handleCityChange}>
              <SelectTrigger className="border-[#d7daf0] text-[#1f1a54]"><SelectValue placeholder="City / State" /></SelectTrigger>
              <SelectContent className="max-h-72">
                {nigerianCities.map((city) => (<SelectItem key={city.value} value={city.value}>{city.label}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={selectedArea} onValueChange={setSelectedArea} disabled={!selectedCity}>
              <SelectTrigger className="border-[#d7daf0] text-[#1f1a54]"><SelectValue placeholder={selectedCity ? "Town / Area" : "Select city first"} /></SelectTrigger>
              <SelectContent className="max-h-72">
                {availableAreas.map((area) => (<SelectItem key={area.value} value={area.value}>{area.label}</SelectItem>))}
              </SelectContent>
            </Select>
            <Select value={priceRange} onValueChange={setPriceRange}>
              <SelectTrigger className="border-[#d7daf0] text-[#1f1a54]"><SelectValue placeholder="Price Range" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Under ₦200k</SelectItem>
                <SelectItem value="medium">₦200k – ₦500k</SelectItem>
                <SelectItem value="high">₦500k – ₦1M</SelectItem>
                <SelectItem value="premium">₦1M+</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full md:col-span-5 bg-[#26225f] text-white hover:bg-[#1f1b50]"><Filter className="h-4 w-4 mr-2" />Filter</Button>
          </div>
        </div>
      </section>

      <section className="py-4"><div className="container"><AdBanner type="banner" /></div></section>

      <section className="relative z-10 py-8">
        <div className="container">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2 text-[#1f1a54]">Available Shops ({filteredProperties.length})</h2>
            <p className="text-[#6f7599]">Scroll down to explore commercial spaces</p>
          </div>

          <div className="relative">
            <div className={`space-y-8 ${isGuest ? 'max-h-[800px] overflow-hidden' : ''}`}>
              {filteredProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="grid md:grid-cols-5 gap-6">
                  <div className="md:col-span-2 relative">
                    <img src={property.image} alt={property.title} className="w-full h-64 md:h-full object-cover" />
                    <div className="absolute top-4 left-4 flex gap-2">
                      {property.verified && (<Badge className="bg-primary text-primary-foreground">✓ Verified</Badge>)}
                      <Badge variant="secondary" className="bg-background/80"><Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />{property.rating}</Badge>
                    </div>
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button size="sm" variant={isSelected(property.id, 'rent') ? "default" : "secondary"} className={isSelected(property.id, 'rent') ? "" : "bg-background/80"} onClick={() => handleCompareToggle(property)}>
                        <Scale className="h-4 w-4 mr-1" />{isSelected(property.id, 'rent') ? "Added" : "Compare"}
                      </Button>
                      <Button size="sm" variant="secondary" className="bg-background/80" onClick={() => toast({ title: "Saved", description: `${property.title} added to favorites` })}><Heart className="h-4 w-4" /></Button>
                      <Button size="sm" variant="secondary" className="bg-background/80" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/property/rent/${property.id}`); toast({ title: "Link Copied" }); }}><Share2 className="h-4 w-4" /></Button>
                    </div>
                  </div>

                  <div className="md:col-span-3 p-6">
                    <div className="mb-4">
                      <h3 className="text-2xl font-bold mb-2">{property.title}</h3>
                      <div className="flex items-center text-muted-foreground mb-2"><MapPin className="h-4 w-4 mr-1" />{property.location}</div>
                      <div className="text-3xl font-bold text-primary">{property.price}<span className="text-sm font-normal text-muted-foreground ml-1">{property.period}</span></div>
                    </div>
                    <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                      <div className="flex items-center"><Square className="h-4 w-4 mr-1" />{addStepCount(property.area)}</div>
                      <div className="flex items-center">W: {property.width}</div>
                      <div className="flex items-center">L: {property.length}</div>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {property.features.map((feature, i) => (<Badge key={i} variant="outline">{feature}</Badge>))}
                    </div>

                    {property.similar.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-lg font-semibold mb-3">Similar Shops</h4>
                        <ScrollArea className="w-full whitespace-nowrap">
                          <div className="flex space-x-4 pb-4">
                            {property.similar.map((s) => (
                              <Card key={s.id} className="flex-shrink-0 w-48 hover:shadow-md transition-shadow">
                                <CardContent className="p-3">
                                  <img src={s.image} alt={s.title} className="w-full h-32 object-cover rounded-md mb-2" />
                                  <h5 className="font-medium text-sm truncate">{s.title}</h5>
                                  <p className="text-primary font-semibold text-sm">{s.price}</p>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <Button className="flex items-center gap-2" onClick={() => setViewShopProperty(property)}>
                        <Eye className="h-4 w-4" />View Shop
                      </Button>
                      <Button variant="hero" className="flex items-center gap-2" onClick={() => handleLiveView(property)}>
                        <Video className="h-4 w-4" />Live View — ₦500
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2" onClick={() => handleContactAgent('phone', property)}><Phone className="h-4 w-4" />Call</Button>
                      <Button variant="outline" className="flex items-center gap-2" onClick={() => handleContactAgent('whatsapp', property)}><MessageSquare className="h-4 w-4" />WhatsApp</Button>
                      <Button variant="outline" className="flex items-center gap-2 col-span-2" onClick={() => handleContactAgent('email', property)}><Mail className="h-4 w-4" />Email</Button>
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
        <LiveViewModal open={!!liveViewProperty} onOpenChange={(open) => !open && setLiveViewProperty(null)} property={liveViewProperty} />
      )}
      {viewShopProperty && (
        <ShopViewModal open={!!viewShopProperty} onOpenChange={(open) => !open && setViewShopProperty(null)} property={viewShopProperty} />
      )}
    </div>
  );
};

export default ShopRentals;
