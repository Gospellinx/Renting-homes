import { Button } from "@/components/ui/button";
import { addStepCount } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Bed, 
  Bath, 
  Square, 
  MapPin, 
  X, 
  Check, 
  Minus,
  GraduationCap,
  Hospital,
  UtensilsCrossed,
  Bus,
  ShoppingBag,
  Star
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCompareProperties, CompareProperty } from "@/hooks/useCompareProperties";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// Mock neighborhood data for properties without it
const getNeighborhoodData = (property: CompareProperty) => {
  if (property.neighborhood) return property.neighborhood;
  
  // Default neighborhood data based on location
  const locationData: Record<string, any> = {
    "Victoria Island, Lagos": {
      schools: [
        { name: "Corona School", distance: "0.5 km", rating: 4.8 },
        { name: "Greensprings School", distance: "1.2 km", rating: 4.7 },
      ],
      hospitals: [
        { name: "Reddington Hospital", distance: "0.8 km", rating: 4.6 },
      ],
      restaurants: [
        { name: "The Wheatbaker", distance: "0.3 km", rating: 4.7 },
      ],
      transportation: [
        { name: "VI Bus Stop", type: "bus", distance: "0.2 km" },
      ],
      shopping: [
        { name: "The Palms Mall", distance: "2.0 km" },
      ],
    },
    "Ikoyi, Lagos": {
      schools: [
        { name: "Loyola Jesuit College", distance: "0.8 km", rating: 4.9 },
      ],
      hospitals: [
        { name: "Lagoon Hospital", distance: "0.5 km", rating: 4.7 },
      ],
      restaurants: [
        { name: "Eko Hotel", distance: "1.0 km", rating: 4.5 },
      ],
      transportation: [
        { name: "Ikoyi Link Bridge", type: "bus", distance: "0.3 km" },
      ],
      shopping: [
        { name: "Falomo Shopping Centre", distance: "0.6 km" },
      ],
    },
    "Lekki, Lagos": {
      schools: [
        { name: "Chrisland School", distance: "0.6 km", rating: 4.6 },
      ],
      hospitals: [
        { name: "First Cardiology", distance: "1.0 km", rating: 4.5 },
      ],
      restaurants: [
        { name: "Hard Rock Cafe", distance: "0.8 km", rating: 4.4 },
      ],
      transportation: [
        { name: "Lekki Toll Gate", type: "bus", distance: "0.5 km" },
      ],
      shopping: [
        { name: "Lekki Mall", distance: "1.5 km" },
      ],
    },
  };
  
  return locationData[property.location] || {
    schools: [{ name: "Local School", distance: "1.0 km", rating: 4.0 }],
    hospitals: [{ name: "General Hospital", distance: "1.5 km", rating: 4.0 }],
    restaurants: [{ name: "Local Restaurant", distance: "0.5 km", rating: 4.0 }],
    transportation: [{ name: "Bus Stop", type: "bus", distance: "0.3 km" }],
    shopping: [{ name: "Local Market", distance: "0.8 km" }],
  };
};

const CompareProperties = () => {
  const navigate = useNavigate();
  const { properties, removeProperty, clearAll } = useCompareProperties();

  // All unique features across all properties
  const allFeatures = Array.from(
    new Set(properties.flatMap(p => p.features))
  ).sort();

  if (properties.length < 2) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
          <div className="container flex h-16 items-center">
            <Link to="/" className="flex items-center space-x-2">
              <ArrowLeft className="h-5 w-5" />
              <span className="text-lg font-semibold">Back to Home</span>
            </Link>
          </div>
        </header>
        
        <div className="container py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Compare Properties</h1>
          <p className="text-muted-foreground mb-8">
            Select at least 2 properties to compare. You can select up to 4 properties.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate('/rental-properties')}>
              Browse Rental Properties
            </Button>
            <Button variant="outline" onClick={() => navigate('/buy-property')}>
              Browse Properties for Sale
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <ArrowLeft className="h-5 w-5" />
            <span className="text-lg font-semibold">Back to Home</span>
          </Link>
          <Button variant="outline" size="sm" onClick={clearAll}>
            Clear All
          </Button>
        </div>
      </header>

      <div className="container py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">
            Compare Properties
          </h1>
          <p className="text-xl text-muted-foreground">
            Side-by-side comparison of {properties.length} properties
          </p>
        </div>

        <ScrollArea className="w-full">
          <div className="min-w-max">
            {/* Property Cards Row */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `200px repeat(${properties.length}, minmax(280px, 1fr))` }}>
              <div /> {/* Empty cell for labels column */}
              {properties.map((property) => (
                <Card key={`${property.type}-${property.id}`} className="relative overflow-hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 z-10 bg-background/80 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={() => removeProperty(property.id, property.type)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <img 
                    src={property.image} 
                    alt={property.title}
                    className="w-full h-48 object-cover"
                  />
                  <CardHeader className="pb-2">
                    <Badge variant="secondary" className="w-fit mb-2">
                      {property.type === 'rent' ? 'For Rent' : 'For Sale'}
                    </Badge>
                    <CardTitle className="text-lg line-clamp-2">{property.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center text-muted-foreground text-sm mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.location}
                    </div>
                    <div className="text-2xl font-bold text-primary">
                      {property.price}
                      {property.period && (
                        <span className="text-sm font-normal text-muted-foreground ml-1">
                          {property.period}
                        </span>
                      )}
                    </div>
                    <Button 
                      className="w-full mt-4" 
                      variant="outline"
                      onClick={() => navigate(`/property/${property.type}/${property.id}`)}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Comparison Table */}
            <div className="mt-8 border rounded-lg overflow-hidden">
              {/* Basic Info Section */}
              <div className="bg-muted/50 px-4 py-3 font-semibold border-b">
                Basic Information
              </div>
              
              {/* Bedrooms */}
              <div className="grid gap-4 px-4 py-3 border-b items-center" style={{ gridTemplateColumns: `200px repeat(${properties.length}, minmax(280px, 1fr))` }}>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Bed className="h-4 w-4" />
                  Bedrooms
                </div>
                {properties.map((property) => (
                  <div key={`bed-${property.type}-${property.id}`} className="font-medium">
                    {property.bedrooms} {property.bedrooms === 1 ? 'Bedroom' : 'Bedrooms'}
                  </div>
                ))}
              </div>

              {/* Bathrooms */}
              <div className="grid gap-4 px-4 py-3 border-b items-center" style={{ gridTemplateColumns: `200px repeat(${properties.length}, minmax(280px, 1fr))` }}>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Bath className="h-4 w-4" />
                  Bathrooms
                </div>
                {properties.map((property) => (
                  <div key={`bath-${property.type}-${property.id}`} className="font-medium">
                    {property.bathrooms} {property.bathrooms === 1 ? 'Bathroom' : 'Bathrooms'}
                  </div>
                ))}
              </div>

              {/* Area */}
              <div className="grid gap-4 px-4 py-3 border-b items-center" style={{ gridTemplateColumns: `200px repeat(${properties.length}, minmax(280px, 1fr))` }}>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Square className="h-4 w-4" />
                  Size
                </div>
                {properties.map((property) => (
                  <div key={`area-${property.type}-${property.id}`} className="font-medium">
                    {addStepCount(property.area)}
                  </div>
                ))}
              </div>

              {/* Features Section */}
              <div className="bg-muted/50 px-4 py-3 font-semibold border-b">
                Features & Amenities
              </div>
              
              {allFeatures.map((feature) => (
                <div 
                  key={feature} 
                  className="grid gap-4 px-4 py-3 border-b items-center" 
                  style={{ gridTemplateColumns: `200px repeat(${properties.length}, minmax(280px, 1fr))` }}
                >
                  <div className="text-muted-foreground">{feature}</div>
                  {properties.map((property) => (
                    <div key={`feature-${property.type}-${property.id}-${feature}`}>
                      {property.features.includes(feature) ? (
                        <Check className="h-5 w-5 text-green-500" />
                      ) : (
                        <Minus className="h-5 w-5 text-muted-foreground/50" />
                      )}
                    </div>
                  ))}
                </div>
              ))}

              {/* Neighborhood Section */}
              <div className="bg-muted/50 px-4 py-3 font-semibold border-b">
                Neighborhood & Nearby Places
              </div>

              {/* Schools */}
              <div className="grid gap-4 px-4 py-3 border-b" style={{ gridTemplateColumns: `200px repeat(${properties.length}, minmax(280px, 1fr))` }}>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <GraduationCap className="h-4 w-4" />
                  Schools
                </div>
                {properties.map((property) => {
                  const neighborhood = getNeighborhoodData(property);
                  return (
                    <div key={`schools-${property.type}-${property.id}`} className="space-y-1">
                      {neighborhood.schools.slice(0, 2).map((school: any, idx: number) => (
                        <div key={idx} className="text-sm">
                          <span className="font-medium">{school.name}</span>
                          <span className="text-muted-foreground ml-2">{school.distance}</span>
                          {school.rating && (
                            <span className="ml-2 text-yellow-500 flex items-center inline-flex">
                              <Star className="h-3 w-3 fill-current" />
                              {school.rating}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>

              {/* Hospitals */}
              <div className="grid gap-4 px-4 py-3 border-b" style={{ gridTemplateColumns: `200px repeat(${properties.length}, minmax(280px, 1fr))` }}>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Hospital className="h-4 w-4" />
                  Hospitals
                </div>
                {properties.map((property) => {
                  const neighborhood = getNeighborhoodData(property);
                  return (
                    <div key={`hospitals-${property.type}-${property.id}`} className="space-y-1">
                      {neighborhood.hospitals.slice(0, 2).map((hospital: any, idx: number) => (
                        <div key={idx} className="text-sm">
                          <span className="font-medium">{hospital.name}</span>
                          <span className="text-muted-foreground ml-2">{hospital.distance}</span>
                          {hospital.rating && (
                            <span className="ml-2 text-yellow-500 flex items-center inline-flex">
                              <Star className="h-3 w-3 fill-current" />
                              {hospital.rating}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>

              {/* Restaurants */}
              <div className="grid gap-4 px-4 py-3 border-b" style={{ gridTemplateColumns: `200px repeat(${properties.length}, minmax(280px, 1fr))` }}>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <UtensilsCrossed className="h-4 w-4" />
                  Restaurants
                </div>
                {properties.map((property) => {
                  const neighborhood = getNeighborhoodData(property);
                  return (
                    <div key={`restaurants-${property.type}-${property.id}`} className="space-y-1">
                      {neighborhood.restaurants.slice(0, 2).map((restaurant: any, idx: number) => (
                        <div key={idx} className="text-sm">
                          <span className="font-medium">{restaurant.name}</span>
                          <span className="text-muted-foreground ml-2">{restaurant.distance}</span>
                          {restaurant.rating && (
                            <span className="ml-2 text-yellow-500 flex items-center inline-flex">
                              <Star className="h-3 w-3 fill-current" />
                              {restaurant.rating}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>

              {/* Transportation */}
              <div className="grid gap-4 px-4 py-3 border-b" style={{ gridTemplateColumns: `200px repeat(${properties.length}, minmax(280px, 1fr))` }}>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Bus className="h-4 w-4" />
                  Transportation
                </div>
                {properties.map((property) => {
                  const neighborhood = getNeighborhoodData(property);
                  return (
                    <div key={`transport-${property.type}-${property.id}`} className="space-y-1">
                      {neighborhood.transportation.slice(0, 2).map((transport: any, idx: number) => (
                        <div key={idx} className="text-sm">
                          <span className="font-medium">{transport.name}</span>
                          <span className="text-muted-foreground ml-2">{transport.distance}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>

              {/* Shopping */}
              <div className="grid gap-4 px-4 py-3" style={{ gridTemplateColumns: `200px repeat(${properties.length}, minmax(280px, 1fr))` }}>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <ShoppingBag className="h-4 w-4" />
                  Shopping
                </div>
                {properties.map((property) => {
                  const neighborhood = getNeighborhoodData(property);
                  return (
                    <div key={`shopping-${property.type}-${property.id}`} className="space-y-1">
                      {neighborhood.shopping.slice(0, 2).map((shop: any, idx: number) => (
                        <div key={idx} className="text-sm">
                          <span className="font-medium">{shop.name}</span>
                          <span className="text-muted-foreground ml-2">{shop.distance}</span>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </div>
  );
};

export default CompareProperties;
