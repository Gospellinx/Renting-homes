import { Button } from "@/components/ui/button";
import { addStepCount } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { MapPin, Bed, Bath, Square, CheckCircle, Eye } from "lucide-react";
import heroImage from "@/assets/hero-estate.jpg";
import propertyShowcase from "@/assets/property-showcase.jpg";
import virtualTour from "@/assets/virtual-tour.jpg";

const sampleProperties = [
  {
    id: 1,
    title: "Modern 4-Bedroom Duplex",
    location: "Maitama, Abuja",
    price: "₦85,000,000",
    type: "For Sale",
    bedrooms: 4,
    bathrooms: 3,
    size: "350 sqm",
    image: heroImage,
    verified: true,
    features: ["Swimming Pool", "24/7 Security", "Parking Space"]
  },
  {
    id: 2,
    title: "Luxury 3-Bedroom Apartment",
    location: "Victoria Island, Lagos",
    price: "₦45,000,000",
    type: "For Sale",
    bedrooms: 3,
    bathrooms: 2,
    size: "180 sqm",
    image: propertyShowcase,
    verified: true,
    features: ["Ocean View", "Gym Access", "Generator"]
  },
  {
    id: 3,
    title: "Executive 2-Bedroom Flat",
    location: "Ikoyi, Lagos",
    price: "₦3,500,000/year",
    type: "For Rent",
    bedrooms: 2,
    bathrooms: 2,
    size: "120 sqm",
    image: virtualTour,
    verified: true,
    features: ["Furnished", "Air Conditioning", "Backup Power"]
  }
];

export const PropertySlider = () => {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Featured Verified Properties
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover hand-picked, FCDA-verified properties across Nigeria's premium locations
          </p>
        </div>

        <Carousel className="w-full max-w-6xl mx-auto">
          <CarouselContent className="-ml-4">
            {sampleProperties.map((property) => (
              <CarouselItem key={property.id} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <Card className="overflow-hidden border-0 shadow-lg bg-gradient-to-br from-card to-card/50 hover:shadow-xl transition-all duration-300">
                  <div className="relative">
                    <img 
                      src={property.image} 
                      alt={property.title}
                      className="w-full h-64 object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <Badge className={property.type === "For Sale" ? "bg-primary text-primary-foreground" : "bg-accent text-accent-foreground"}>
                        {property.type}
                      </Badge>
                    </div>
                    {property.verified && (
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-lg p-2">
                        <div className="flex items-center space-x-1">
                          <CheckCircle className="h-4 w-4 text-primary" />
                          <span className="text-xs font-medium text-primary">FCDA Verified</span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">{property.title}</h3>
                        <div className="flex items-center text-muted-foreground text-sm mb-3">
                          <MapPin className="h-4 w-4 mr-1" />
                          {property.location}
                        </div>
                        <div className="text-2xl font-bold text-primary mb-4">
                          {property.price}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
                        <div className="flex items-center space-x-1">
                          <Bed className="h-4 w-4" />
                          <span>{property.bedrooms} Beds</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Bath className="h-4 w-4" />
                          <span>{property.bathrooms} Baths</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Square className="h-4 w-4" />
                          <span>{addStepCount(property.size)}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {property.features.slice(0, 2).map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {property.features.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{property.features.length - 2} more
                          </Badge>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button variant="hero" className="flex-1">
                          View Property
                        </Button>
                        <Button variant="outline" className="flex-1">
                          <Eye className="mr-2 h-4 w-4" />
                          Virtual Tour
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex" />
          <CarouselNext className="hidden md:flex" />
        </Carousel>
      </div>
    </section>
  );
};