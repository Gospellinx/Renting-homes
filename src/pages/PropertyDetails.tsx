import { useState } from "react";
import VerifiedBadge from "@/components/VerifiedBadge";
import { addStepCount } from "@/lib/utils";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { 
  ArrowLeft, MapPin, Bed, Bath, Square, Phone, MessageSquare, Mail,
  Heart, Share2, Star, Home, Car, Shield, Zap, Waves, Dumbbell,
  Trees, Wifi, AirVent, Camera, Calendar, Eye, GraduationCap,
  Hospital, UtensilsCrossed, Bus, Train, ShoppingBag, Flag
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ReportPropertyModal from "@/components/ReportPropertyModal";

// Property data with comprehensive details
const propertyData: Record<string, any> = {
  "1": {
    id: 1,
    title: "Modern 2-Bedroom Apartment",
    location: "Victoria Island, Lagos",
    address: "Plot 15, Adeola Odeku Street, Victoria Island, Lagos",
    price: "₦850,000",
    salePrice: "₦85,000,000",
    bedrooms: 2,
    bathrooms: 2,
    area: "120 sqm",
    propertyType: "Apartment",
    yearBuilt: 2022,
    rating: 4.8,
    verified: true,
    description: "Experience luxury living in this stunning modern apartment located in the heart of Victoria Island. This beautifully designed 2-bedroom residence offers an open-plan living space flooded with natural light, premium finishes throughout, and breathtaking city views. The property features a gourmet kitchen with high-end appliances, spacious bedrooms with built-in wardrobes, and modern bathrooms with premium fixtures.",
    amenities: [
      { icon: "Car", label: "Parking Space" },
      { icon: "Shield", label: "24/7 Security" },
      { icon: "Zap", label: "Standby Generator" },
      { icon: "Waves", label: "Swimming Pool" },
      { icon: "Dumbbell", label: "Fitness Center" },
      { icon: "Trees", label: "Garden" },
      { icon: "Wifi", label: "High-Speed Internet" },
      { icon: "AirVent", label: "Central AC" },
      { icon: "Camera", label: "CCTV Surveillance" },
    ],
    images: [
      "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=1200&h=800&fit=crop",
    ],
    gallery: [
      { label: "Living Room", image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=600&h=400&fit=crop" },
      { label: "Kitchen", image: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=600&h=400&fit=crop" },
      { label: "Master Bedroom", image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=400&fit=crop" },
      { label: "Bathroom", image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=600&h=400&fit=crop" },
      { label: "Balcony", image: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=600&h=400&fit=crop" },
      { label: "Exterior", image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=400&fit=crop" },
    ],
    neighborhood: {
      schools: [
        { name: "Corona School", distance: "0.5 km", rating: 4.8 },
        { name: "British International School", distance: "1.2 km", rating: 4.9 },
        { name: "Greensprings School", distance: "2.0 km", rating: 4.7 },
      ],
      hospitals: [
        { name: "Reddington Hospital", distance: "0.8 km", rating: 4.6 },
        { name: "St. Nicholas Hospital", distance: "1.5 km", rating: 4.8 },
      ],
      restaurants: [
        { name: "The Wheatbaker", distance: "0.3 km", rating: 4.7 },
        { name: "Craft Gourmet", distance: "0.6 km", rating: 4.5 },
        { name: "Sky Restaurant", distance: "1.0 km", rating: 4.6 },
      ],
      transportation: [
        { name: "VI Bus Stop", type: "bus", distance: "0.2 km" },
        { name: "Adeola Odeku Taxi Stand", type: "taxi", distance: "0.1 km" },
        { name: "Lekki-Ikoyi Link Bridge", type: "road", distance: "1.5 km" },
      ],
      shopping: [
        { name: "The Palms Shopping Mall", distance: "2.0 km" },
        { name: "Mega Plaza", distance: "0.8 km" },
      ],
    },
    agentName: "David Okonkwo",
    agentCompany: "Premium Estates Limited",
    agentPhone: "+234 803 123 4567",
    agentEmail: "david@premiumestates.com",
    agentWhatsapp: "+234 803 123 4567",
    agentImage: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop",
  },
  "5": {
    id: 5,
    title: "Spacious 3-Bedroom House",
    location: "Ikoyi, Lagos",
    address: "12 Bourdillon Road, Ikoyi, Lagos",
    price: "₦1,500,000",
    salePrice: "₦120,000,000",
    bedrooms: 3,
    bathrooms: 3,
    area: "200 sqm",
    propertyType: "Detached House",
    yearBuilt: 2021,
    rating: 4.9,
    verified: true,
    description: "Discover elegant family living in this magnificent 3-bedroom detached house in prestigious Ikoyi. This exceptional property boasts a grand entrance, spacious living areas, a modern chef's kitchen, and beautifully landscaped gardens. Each bedroom is generously proportioned with en-suite facilities, while the outdoor space includes a private swimming pool and covered parking.",
    amenities: [
      { icon: "Car", label: "2-Car Garage" },
      { icon: "Shield", label: "24/7 Security" },
      { icon: "Zap", label: "Solar Power" },
      { icon: "Waves", label: "Private Pool" },
      { icon: "Trees", label: "Large Garden" },
      { icon: "Wifi", label: "Smart Home" },
      { icon: "AirVent", label: "Central AC" },
      { icon: "Camera", label: "Security System" },
    ],
    images: [
      "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1200&h=800&fit=crop",
    ],
    gallery: [
      { label: "Living Room", image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=600&h=400&fit=crop" },
      { label: "Kitchen", image: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=600&h=400&fit=crop" },
      { label: "Master Bedroom", image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=400&fit=crop" },
      { label: "Pool Area", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&h=400&fit=crop" },
    ],
    neighborhood: {
      schools: [
        { name: "Grange School", distance: "0.3 km", rating: 4.9 },
        { name: "Lagos Preparatory School", distance: "0.8 km", rating: 4.7 },
      ],
      hospitals: [
        { name: "Lagoon Hospital", distance: "0.5 km", rating: 4.9 },
        { name: "First Cardiology Consultants", distance: "1.0 km", rating: 4.8 },
      ],
      restaurants: [
        { name: "NOK by Alara", distance: "0.4 km", rating: 4.8 },
        { name: "Café Maison", distance: "0.5 km", rating: 4.6 },
        { name: "La Taverna", distance: "0.7 km", rating: 4.5 },
      ],
      transportation: [
        { name: "Falomo Roundabout", type: "bus", distance: "0.5 km" },
        { name: "Ikoyi Link Bridge", type: "road", distance: "0.8 km" },
      ],
      shopping: [
        { name: "Jabi Lake Mall", distance: "3.0 km" },
        { name: "Circle Mall", distance: "1.5 km" },
      ],
    },
    agentName: "Sarah Johnson",
    agentCompany: "Elite Properties Nigeria",
    agentPhone: "+234 901 234 5678",
    agentEmail: "sarah@eliteproperties.ng",
    agentWhatsapp: "+234 901 234 5678",
    agentImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop",
  },
  "9": {
    id: 9,
    title: "Executive 4-Bedroom Duplex",
    location: "Lekki, Lagos",
    address: "45 Admiralty Way, Lekki Phase 1, Lagos",
    price: "₦650,000",
    salePrice: "₦95,000,000",
    bedrooms: 4,
    bathrooms: 4,
    area: "280 sqm",
    propertyType: "Duplex",
    yearBuilt: 2023,
    rating: 4.7,
    verified: true,
    description: "Step into executive living with this brand new 4-bedroom duplex in Lekki. This contemporary masterpiece features an impressive double-height living room, state-of-the-art kitchen, private study, and luxurious bedrooms. The property includes a rooftop terrace with panoramic views, a home gym, and premium finishes throughout.",
    amenities: [
      { icon: "Car", label: "3-Car Parking" },
      { icon: "Shield", label: "Gated Estate" },
      { icon: "Zap", label: "Inverter System" },
      { icon: "Dumbbell", label: "Home Gym" },
      { icon: "Wifi", label: "Fiber Internet" },
      { icon: "AirVent", label: "Split AC Units" },
      { icon: "Camera", label: "Intercom System" },
    ],
    images: [
      "https://images.unsplash.com/photo-1524230572899-a752b3835840?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?w=1200&h=800&fit=crop",
      "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=1200&h=800&fit=crop",
    ],
    gallery: [
      { label: "Living Room", image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=600&h=400&fit=crop" },
      { label: "Kitchen", image: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=600&h=400&fit=crop" },
      { label: "Bedroom", image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&h=400&fit=crop" },
    ],
    neighborhood: {
      schools: [
        { name: "Chrisland School", distance: "0.6 km", rating: 4.6 },
        { name: "Lekki British School", distance: "1.0 km", rating: 4.8 },
        { name: "Rainbow College", distance: "1.8 km", rating: 4.5 },
      ],
      hospitals: [
        { name: "Evercare Hospital", distance: "1.2 km", rating: 4.7 },
        { name: "Union Diagnostics", distance: "0.8 km", rating: 4.5 },
      ],
      restaurants: [
        { name: "Hard Rock Café", distance: "0.5 km", rating: 4.6 },
        { name: "Bottles Restaurant", distance: "0.3 km", rating: 4.4 },
        { name: "Ocean Basket", distance: "1.0 km", rating: 4.5 },
      ],
      transportation: [
        { name: "Lekki Phase 1 Bus Stop", type: "bus", distance: "0.3 km" },
        { name: "Admiralty Toll Plaza", type: "road", distance: "0.5 km" },
        { name: "Lekki-Epe Expressway", type: "road", distance: "0.8 km" },
      ],
      shopping: [
        { name: "Filmhouse IMAX Lekki", distance: "0.5 km" },
        { name: "Circle Mall Lekki", distance: "1.2 km" },
        { name: "Shoprite Lekki", distance: "1.5 km" },
      ],
    },
    agentName: "Michael Adebayo",
    agentCompany: "Lekki Properties Hub",
    agentPhone: "+234 805 345 6789",
    agentEmail: "michael@lekkiproperties.com",
    agentWhatsapp: "+234 805 345 6789",
    agentImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
  },
};

const iconMap: Record<string, any> = {
  Car, Shield, Zap, Waves, Dumbbell, Trees, Wifi, AirVent, Camera
};

const PropertyDetails = () => {
  const { id, type } = useParams<{ id: string; type: string }>();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const property = propertyData[id || "1"];

  if (!property) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
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
      toast({ title: "Calling Agent", description: `Calling ${property.agentName}` });
    } else if (method === 'whatsapp') {
      window.open(`https://wa.me/${property.agentWhatsapp.replace(/\s/g, '')}?text=Hi, I'm interested in ${property.title}`, '_blank');
      toast({ title: "Opening WhatsApp", description: `Starting chat with ${property.agentName}` });
    } else if (method === 'email') {
      window.open(`mailto:${property.agentEmail}?subject=Inquiry about ${property.title}`, '_self');
      toast({ title: "Opening Email", description: `Composing email to ${property.agentName}` });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link Copied", description: "Property link copied to clipboard" });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate(type === 'rent' ? '/rental-properties' : type === 'buy' ? '/buy-property' : '/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="hidden sm:inline">Back to Listings</span>
          </Button>
          <div className="flex items-center gap-2">
            <Button 
              size="icon" 
              variant="ghost"
              onClick={() => setShowReport(true)}
              title="Report this property"
            >
              <Flag className="h-5 w-5" />
            </Button>
            <Button 
              size="icon" 
              variant="ghost"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button size="icon" variant="ghost" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Image Slider */}
      <section className="relative">
        <Carousel className="w-full">
          <CarouselContent>
            {property.images.map((image: string, index: number) => (
              <CarouselItem key={index}>
                <div className="relative h-[50vh] md:h-[60vh]">
                  <img
                    src={image}
                    alt={`${property.title} - View ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-4" />
          <CarouselNext className="right-4" />
        </Carousel>
        
        {/* Image Counter */}
        <div className="absolute bottom-4 right-4 bg-black/60 text-white px-3 py-1 rounded-full text-sm">
          {property.images.length} Photos
        </div>
      </section>

      {/* Property Info */}
      <section className="py-8">
        <div className="container">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title & Price */}
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {property.verified && (
                    <Badge className="bg-primary">✓ Verified</Badge>
                  )}
                  <Badge variant="secondary">
                    <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                    {property.rating}
                  </Badge>
                  <Badge variant="outline">{property.propertyType}</Badge>
                </div>
                
                <h1 className="text-3xl md:text-4xl font-bold mb-2">{property.title}</h1>
                
                <div className="flex items-center text-muted-foreground mb-4">
                  <MapPin className="h-5 w-5 mr-2" />
                  <span>{property.address}</span>
                </div>

                <div className="text-3xl md:text-4xl font-bold text-primary">
                  {type === "rent" ? property.price : property.salePrice}
                  {type === "rent" && (
                    <span className="text-lg font-normal text-muted-foreground ml-2">
                      per month
                    </span>
                  )}
                </div>
              </div>

              {/* Key Details */}
              <Card>
                <CardContent className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Bed className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Bedrooms</p>
                        <p className="text-xl font-bold">{property.bedrooms}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Bath className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Bathrooms</p>
                        <p className="text-xl font-bold">{property.bathrooms}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Square className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Area</p>
                        <p className="text-xl font-bold">{addStepCount(property.area)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Home className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Built</p>
                        <p className="text-xl font-bold">{property.yearBuilt}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Description */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">About This Property</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {property.description}
                  </p>
                </CardContent>
              </Card>

              {/* Amenities */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Amenities & Features</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {property.amenities.map((amenity: any, index: number) => {
                      const IconComponent = iconMap[amenity.icon];
                      return (
                        <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                          {IconComponent && <IconComponent className="h-5 w-5 text-primary" />}
                          <span className="font-medium">{amenity.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Image Gallery */}
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Property Gallery</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {property.gallery.map((item: any, index: number) => (
                      <div key={index} className="group relative overflow-hidden rounded-lg cursor-pointer">
                        <img
                          src={item.image}
                          alt={item.label}
                          className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <span className="text-white font-medium">{item.label}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Neighborhood */}
              {property.neighborhood && (
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-2xl font-bold mb-6">Neighborhood & Nearby Places</h2>
                    
                    <div className="space-y-6">
                      {/* Schools */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <GraduationCap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <h3 className="text-lg font-semibold">Schools</h3>
                        </div>
                        <div className="grid gap-3">
                          {property.neighborhood.schools.map((school: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                              <div>
                                <p className="font-medium">{school.name}</p>
                                <p className="text-sm text-muted-foreground">{school.distance} away</p>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">{school.rating}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* Hospitals */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30">
                            <Hospital className="h-5 w-5 text-red-600 dark:text-red-400" />
                          </div>
                          <h3 className="text-lg font-semibold">Hospitals & Healthcare</h3>
                        </div>
                        <div className="grid gap-3">
                          {property.neighborhood.hospitals.map((hospital: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                              <div>
                                <p className="font-medium">{hospital.name}</p>
                                <p className="text-sm text-muted-foreground">{hospital.distance} away</p>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">{hospital.rating}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* Restaurants */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                            <UtensilsCrossed className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                          </div>
                          <h3 className="text-lg font-semibold">Restaurants & Dining</h3>
                        </div>
                        <div className="grid gap-3">
                          {property.neighborhood.restaurants.map((restaurant: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                              <div>
                                <p className="font-medium">{restaurant.name}</p>
                                <p className="text-sm text-muted-foreground">{restaurant.distance} away</p>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                <span className="text-sm font-medium">{restaurant.rating}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* Transportation */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                            <Bus className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                          </div>
                          <h3 className="text-lg font-semibold">Transportation</h3>
                        </div>
                        <div className="grid gap-3">
                          {property.neighborhood.transportation.map((transport: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                              <div>
                                <p className="font-medium">{transport.name}</p>
                                <p className="text-sm text-muted-foreground">{transport.distance} away</p>
                              </div>
                              <Badge variant="secondary" className="capitalize">
                                {transport.type}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      {/* Shopping */}
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                            <ShoppingBag className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <h3 className="text-lg font-semibold">Shopping</h3>
                        </div>
                        <div className="grid gap-3">
                          {property.neighborhood.shopping.map((shop: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                              <div>
                                <p className="font-medium">{shop.name}</p>
                                <p className="text-sm text-muted-foreground">{shop.distance} away</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Action Buttons */}
              <Card className="sticky top-24">
                <CardContent className="p-6 space-y-4">
                  <Button 
                    className="w-full h-12 text-lg"
                    onClick={() => toast({ title: "Booking Requested", description: "Agent will contact you shortly" })}
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Book Inspection
                  </Button>
                  
                  <Button 
                    variant="outline"
                    className="w-full h-12 text-lg"
                    onClick={() => navigate(`/virtual-tour/${type}/${id}`)}
                  >
                    <Eye className="h-5 w-5 mr-2" />
                    Virtual Tour
                  </Button>

                  <Separator />

                  {/* Agent Card */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Contact Agent</h3>
                    <div className="flex items-center gap-4">
                      <img
                        src={property.agentImage}
                        alt={property.agentName}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-bold flex items-center gap-1">{property.agentName} {property.verified && <VerifiedBadge />}</p>
                        <p className="text-sm text-muted-foreground">{property.agentCompany}</p>
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Button 
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleContactAgent('phone')}
                      >
                        <Phone className="h-4 w-4 mr-3" />
                        {property.agentPhone}
                      </Button>
                      <Button 
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleContactAgent('whatsapp')}
                      >
                        <MessageSquare className="h-4 w-4 mr-3" />
                        WhatsApp
                      </Button>
                      <Button 
                        variant="outline"
                        className="w-full justify-start"
                        onClick={() => handleContactAgent('email')}
                      >
                        <Mail className="h-4 w-4 mr-3" />
                        Send Email
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <ReportPropertyModal
        open={showReport}
        onOpenChange={setShowReport}
        propertyId={id || "1"}
        propertyTitle={property.title}
      />
    </div>
  );
};

export default PropertyDetails;
