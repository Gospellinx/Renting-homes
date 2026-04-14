import { useState } from "react";
import { addStepCount } from "@/lib/utils";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Home, Search, MapPin, Bed, Bath, Square, ArrowLeft, Eye, Scale, X } from "lucide-react";
import { useCompareProperties, CompareProperty } from "@/hooks/useCompareProperties";
import CompareFloatingButton from "@/components/CompareFloatingButton";
import { useToast } from "@/hooks/use-toast";
import { nigerianCities, getAreasForCity } from "@/data/nigerianLocations";
import { useAuth } from "@/hooks/useAuth";
import ScrollAuthGate from "@/components/ScrollAuthGate";

// Combined property data from rentals and sales
const allProperties = [
  // Rental Properties
  { id: 1, type: "rent" as const, title: "Modern 3 Bedroom Apartment", location: "Victoria Island, Lagos", price: "₦3.5M/year", beds: 3, baths: 2, size: "1,500 sqft", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400", verified: true, featured: true, propertyType: "Apartment" },
  { id: 2, type: "rent" as const, title: "Luxury 4 Bedroom Duplex", location: "Lekki Phase 1, Lagos", price: "₦8M/year", beds: 4, baths: 4, size: "3,200 sqft", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400", verified: true, featured: false, propertyType: "Duplex" },
  { id: 3, type: "rent" as const, title: "Cozy 2 Bedroom Flat", location: "Ikeja GRA, Lagos", price: "₦2.2M/year", beds: 2, baths: 2, size: "1,100 sqft", image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400", verified: true, featured: false, propertyType: "Flat" },
  { id: 4, type: "rent" as const, title: "Executive 5 Bedroom Mansion", location: "Ikoyi, Lagos", price: "₦15M/year", beds: 5, baths: 6, size: "5,500 sqft", image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400", verified: true, featured: true, propertyType: "Mansion" },
  { id: 5, type: "rent" as const, title: "Studio Apartment", location: "Yaba, Lagos", price: "₦800K/year", beds: 1, baths: 1, size: "450 sqft", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400", verified: false, featured: false, propertyType: "Studio" },
  { id: 6, type: "rent" as const, title: "3 Bedroom Bungalow", location: "Ajah, Lagos", price: "₦1.8M/year", beds: 3, baths: 2, size: "1,800 sqft", image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400", verified: true, featured: false, propertyType: "Bungalow" },
  { id: 7, type: "rent" as const, title: "Penthouse Suite", location: "Banana Island, Lagos", price: "₦25M/year", beds: 4, baths: 4, size: "4,000 sqft", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400", verified: true, featured: true, propertyType: "Penthouse" },
  { id: 8, type: "rent" as const, title: "2 Bedroom Apartment", location: "Surulere, Lagos", price: "₦1.2M/year", beds: 2, baths: 1, size: "900 sqft", image: "https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400", verified: true, featured: false, propertyType: "Apartment" },
  
  // Abuja Rental Properties
  { id: 9, type: "rent" as const, title: "4 Bedroom Semi-Detached", location: "Asokoro, Abuja", price: "₦6M/year", beds: 4, baths: 3, size: "2,800 sqft", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400", verified: true, featured: true, propertyType: "Semi-Detached" },
  { id: 10, type: "rent" as const, title: "3 Bedroom Terrace", location: "Maitama, Abuja", price: "₦5M/year", beds: 3, baths: 3, size: "2,200 sqft", image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400", verified: true, featured: false, propertyType: "Terrace" },
  { id: 11, type: "rent" as const, title: "Luxury Villa", location: "Wuse 2, Abuja", price: "₦12M/year", beds: 5, baths: 5, size: "4,500 sqft", image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400", verified: true, featured: true, propertyType: "Villa" },
  { id: 12, type: "rent" as const, title: "2 Bedroom Flat", location: "Garki, Abuja", price: "₦2.5M/year", beds: 2, baths: 2, size: "1,000 sqft", image: "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=400", verified: true, featured: false, propertyType: "Flat" },
  { id: 13, type: "rent" as const, title: "Executive 4 Bedroom", location: "Jabi, Abuja", price: "₦4.5M/year", beds: 4, baths: 3, size: "2,400 sqft", image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400", verified: true, featured: false, propertyType: "Apartment" },
  { id: 14, type: "rent" as const, title: "Modern Studio", location: "Gwarinpa, Abuja", price: "₦1.2M/year", beds: 1, baths: 1, size: "550 sqft", image: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=400", verified: false, featured: false, propertyType: "Studio" },
  
  // Buy Properties - Lagos
  { id: 101, type: "sale" as const, title: "Premium 4 Bedroom Duplex", location: "Victoria Island, Lagos", price: "₦180M", beds: 4, baths: 4, size: "3,500 sqft", image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400", verified: true, featured: true, propertyType: "Duplex" },
  { id: 102, type: "sale" as const, title: "Waterfront Mansion", location: "Banana Island, Lagos", price: "₦850M", beds: 6, baths: 7, size: "8,000 sqft", image: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400", verified: true, featured: true, propertyType: "Mansion" },
  { id: 103, type: "sale" as const, title: "3 Bedroom Apartment", location: "Lekki Phase 1, Lagos", price: "₦75M", beds: 3, baths: 3, size: "1,800 sqft", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400", verified: true, featured: false, propertyType: "Apartment" },
  { id: 104, type: "sale" as const, title: "5 Bedroom Detached House", location: "Ikoyi, Lagos", price: "₦350M", beds: 5, baths: 5, size: "4,500 sqft", image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400", verified: true, featured: true, propertyType: "Detached" },
  { id: 105, type: "sale" as const, title: "2 Bedroom Starter Home", location: "Ajah, Lagos", price: "₦35M", beds: 2, baths: 2, size: "1,200 sqft", image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=400", verified: true, featured: false, propertyType: "House" },
  { id: 106, type: "sale" as const, title: "Luxury Penthouse", location: "Eko Atlantic, Lagos", price: "₦450M", beds: 4, baths: 4, size: "4,200 sqft", image: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400", verified: true, featured: true, propertyType: "Penthouse" },
  
  // Buy Properties - Abuja
  { id: 107, type: "sale" as const, title: "Executive 5 Bedroom Villa", location: "Asokoro, Abuja", price: "₦280M", beds: 5, baths: 5, size: "5,000 sqft", image: "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=400", verified: true, featured: true, propertyType: "Villa" },
  { id: 108, type: "sale" as const, title: "4 Bedroom Terrace", location: "Maitama, Abuja", price: "₦120M", beds: 4, baths: 4, size: "2,800 sqft", image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400", verified: true, featured: false, propertyType: "Terrace" },
  { id: 109, type: "sale" as const, title: "3 Bedroom Semi-Detached", location: "Wuse 2, Abuja", price: "₦85M", beds: 3, baths: 3, size: "2,000 sqft", image: "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=400", verified: true, featured: false, propertyType: "Semi-Detached" },
  { id: 110, type: "sale" as const, title: "Luxury Estate Home", location: "Gwarinpa, Abuja", price: "₦95M", beds: 4, baths: 4, size: "2,600 sqft", image: "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=400", verified: true, featured: false, propertyType: "House" },
  { id: 111, type: "sale" as const, title: "Presidential Villa", location: "Asokoro Extension, Abuja", price: "₦500M", beds: 7, baths: 8, size: "10,000 sqft", image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400", verified: true, featured: true, propertyType: "Villa" },
  { id: 112, type: "sale" as const, title: "Modern 2 Bedroom Flat", location: "Jabi, Abuja", price: "₦45M", beds: 2, baths: 2, size: "1,100 sqft", image: "https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=400", verified: true, featured: false, propertyType: "Flat" },
];

const SearchResults = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const { addProperty, removeProperty, isSelected, properties: compareProperties } = useCompareProperties();
  
  // Get AI-parsed search params
  const query = searchParams.get("q") || "";
  const locationFilter = searchParams.get("location") || "";
  const propertyTypeFilter = searchParams.get("propertyType") || "";
  const intentFilter = searchParams.get("intent") || "";
  const bedroomsFilter = searchParams.get("bedrooms") || "";
  const typeFilter = searchParams.get("type") || (intentFilter === "rent" ? "rent" : intentFilter === "buy" ? "buy" : "all");
  
  const [searchInput, setSearchInput] = useState(query);
  const [propertyType, setPropertyType] = useState(typeFilter);
  const [sortBy, setSortBy] = useState("relevance");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedArea, setSelectedArea] = useState("");

  const isGuest = !loading && !user;
  const availableAreas = getAreasForCity(selectedCity);

  const handleCityChange = (val: string) => {
    setSelectedCity(val);
    setSelectedArea("");
  };

  // Filter properties based on search query and AI-parsed params
  const filteredProperties = allProperties.filter((property) => {
    const searchLower = query.toLowerCase();
    
    // AI-enhanced location matching
    const matchesLocation = !locationFilter || 
      property.location.toLowerCase().includes(locationFilter.toLowerCase());
    
    // City/area dropdown matching
    const cityObj = nigerianCities.find(c => c.value === selectedCity);
    const areaObj = availableAreas.find(a => a.value === selectedArea);
    const matchesCity = !selectedCity || (
      (selectedCity === "abuja" && property.location.toLowerCase().includes("abuja")) ||
      (selectedCity === "lagos" && property.location.toLowerCase().includes("lagos")) ||
      (selectedCity === "port-harcourt" && property.location.toLowerCase().includes("port harcourt")) ||
      (cityObj && property.location.toLowerCase().includes(cityObj.state.toLowerCase()))
    );
    const matchesArea = !selectedArea || 
      property.location.toLowerCase().includes((areaObj?.label || "").toLowerCase());

    // AI-enhanced property type matching
    const matchesPropertyType = !propertyTypeFilter ||
      property.propertyType.toLowerCase().includes(propertyTypeFilter.toLowerCase()) ||
      property.title.toLowerCase().includes(propertyTypeFilter.toLowerCase());
    
    // Bedrooms filter
    const matchesBedrooms = !bedroomsFilter || property.beds >= parseInt(bedroomsFilter);
    
    // Basic text search fallback
    const matchesSearch = !query || 
      property.location.toLowerCase().includes(searchLower) ||
      property.title.toLowerCase().includes(searchLower) ||
      property.propertyType.toLowerCase().includes(searchLower);
    
    // Type filter (rent/sale)
    const matchesType = propertyType === "all" || 
      property.type === propertyType || 
      (propertyType === "buy" && property.type === "sale");
    
    return (matchesLocation || matchesSearch) && 
      matchesPropertyType && 
      matchesBedrooms && 
      matchesType &&
      (selectedCity ? matchesCity : true) &&
      (selectedArea ? matchesArea : true);
  });

  // Sort properties
  const sortedProperties = [...filteredProperties].sort((a, b) => {
    if (sortBy === "price-low") {
      return parseFloat(a.price.replace(/[^0-9.]/g, "")) - parseFloat(b.price.replace(/[^0-9.]/g, ""));
    }
    if (sortBy === "price-high") {
      return parseFloat(b.price.replace(/[^0-9.]/g, "")) - parseFloat(a.price.replace(/[^0-9.]/g, ""));
    }
    if (sortBy === "size") {
      return parseFloat(b.size.replace(/[^0-9]/g, "")) - parseFloat(a.size.replace(/[^0-9]/g, ""));
    }
    // Default: relevance (featured first)
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: searchInput, type: propertyType });
  };

  const handleTypeChange = (value: string) => {
    setPropertyType(value);
    setSearchParams({ q: query, type: value });
  };

  const clearSearch = () => {
    setSearchInput("");
    setSearchParams({});
  };

  const handleCompareToggle = (property: typeof allProperties[0]) => {
    const propertyForCompare: CompareProperty = {
      id: property.id,
      type: property.type,
      title: property.title,
      location: property.location,
      price: property.price,
      bedrooms: property.beds,
      bathrooms: property.baths,
      area: property.size,
      image: property.image,
      features: [],
    };

    if (isSelected(property.id, property.type)) {
      removeProperty(property.id, property.type);
      toast({
        title: "Removed from comparison",
        description: `${property.title} has been removed.`,
      });
    } else {
      if (compareProperties.length >= 4) {
        toast({
          title: "Comparison limit reached",
          description: "You can compare up to 4 properties at a time.",
          variant: "destructive",
        });
      } else {
        addProperty(propertyForCompare);
        toast({
          title: "Added to comparison",
          description: `${property.title} added. Select up to 4 properties.`,
        });
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Home className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-foreground">Homes</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/rental-properties" className="text-sm font-medium hover:text-primary transition-colors">Rent</Link>
            <Link to="/buy-property" className="text-sm font-medium hover:text-primary transition-colors">Buy</Link>
            <Link to="/verify-property" className="text-sm font-medium hover:text-primary transition-colors">Verify</Link>
          </nav>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back Home
            </Link>
          </Button>
        </div>
      </header>

      <div className="container py-8">
        {/* Search Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <h1 className="text-3xl font-bold mb-2">
            {locationFilter 
              ? `Properties in ${locationFilter}${propertyTypeFilter ? ` - ${propertyTypeFilter}` : ''}`
              : query 
                ? `Search Results for "${query}"` 
                : "Search Properties"}
          </h1>
          <p className="text-muted-foreground">
            {sortedProperties.length} {sortedProperties.length === 1 ? "property" : "properties"} found
            {locationFilter && ` in ${locationFilter}`}
            {bedroomsFilter && ` with ${bedroomsFilter}+ bedrooms`}
          </p>
        </div>

        {/* Search & Filter Bar */}
        <form onSubmit={handleSearch} className="flex flex-col gap-3 mb-8 p-4 bg-card rounded-xl border">
          {/* Row 1: search + type + sort + button */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by location, property type..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 h-12"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>
            
            <Select value={propertyType} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-full md:w-40 h-12">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="rent">For Rent</SelectItem>
                <SelectItem value="buy">For Sale</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-44 h-12">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="size">Size</SelectItem>
              </SelectContent>
            </Select>

            <Button type="submit" variant="hero" className="h-12 px-8">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Row 2: City + Town/Area filters */}
          <div className="flex flex-col md:flex-row gap-3">
            <Select value={selectedCity} onValueChange={handleCityChange}>
              <SelectTrigger className="h-10 md:w-64">
                <SelectValue placeholder="Filter by City / State" />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {nigerianCities.map((city) => (
                  <SelectItem key={city.value} value={city.value}>
                    {city.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={selectedArea}
              onValueChange={setSelectedArea}
              disabled={!selectedCity}
            >
              <SelectTrigger className="h-10 md:w-64">
                <SelectValue placeholder={selectedCity ? "Filter by Town / Area" : "Select city first"} />
              </SelectTrigger>
              <SelectContent className="max-h-72">
                {availableAreas.map((area) => (
                  <SelectItem key={area.value} value={area.value}>
                    {area.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {(selectedCity || selectedArea) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-10 text-muted-foreground"
                onClick={() => { setSelectedCity(""); setSelectedArea(""); }}
              >
                <X className="h-4 w-4 mr-1" /> Clear location
              </Button>
            )}
          </div>
        </form>

        {/* Results Grid */}
        {sortedProperties.length > 0 ? (
          <div className="relative">
            <div className={`grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${isGuest ? 'max-h-[600px] overflow-hidden' : ''}`}>
              {sortedProperties.map((property) => (
                <Card key={`${property.type}-${property.id}`} className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="relative">
                    <img
                      src={property.image}
                      alt={property.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      {property.verified && (
                        <Badge className="bg-primary text-primary-foreground">Verified</Badge>
                      )}
                      <Badge variant="secondary" className="capitalize">
                        {property.type === "rent" ? "For Rent" : "For Sale"}
                      </Badge>
                    </div>
                    {property.featured && (
                      <Badge className="absolute top-3 right-3 bg-accent text-accent-foreground">
                        Featured
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">{property.title}</h3>
                    <div className="flex items-center text-muted-foreground text-sm mb-3">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.location}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center">
                        <Bed className="h-4 w-4 mr-1" />
                        {property.beds}
                      </span>
                      <span className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" />
                        {property.baths}
                      </span>
                      <span className="flex items-center">
                        <Square className="h-4 w-4 mr-1" />
                        {addStepCount(property.size)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-primary">{property.price}</span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" className="flex-1" asChild>
                        <Link to={`/property/${property.type}/${property.id}`}>
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      <Button
                        size="sm"
                        variant={isSelected(property.id, property.type) ? "default" : "secondary"}
                        onClick={() => handleCompareToggle(property)}
                      >
                        <Scale className="h-4 w-4 mr-1" />
                        {isSelected(property.id, property.type) ? "Added" : "Compare"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            {isGuest && <ScrollAuthGate />}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
              <Search className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No properties found</h2>
            <p className="text-muted-foreground mb-6">
              We couldn't find any properties matching "{query}"
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="outline" onClick={clearSearch}>
                Clear Search
              </Button>
              <Button asChild>
                <Link to="/rental-properties">Browse All Rentals</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link to="/buy-property">Browse Properties for Sale</Link>
              </Button>
            </div>
          </div>
        )}

        {/* Popular Locations */}
        {!query && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Popular Locations</h2>
            <div className="flex flex-wrap gap-3">
              {["Victoria Island", "Lekki", "Ikoyi", "Asokoro", "Maitama", "Wuse 2", "Banana Island", "Ajah", "Ikeja", "Gwarinpa"].map((location) => (
                <Button
                  key={location}
                  variant="outline"
                  onClick={() => {
                    setSearchInput(location);
                    setSearchParams({ q: location, type: propertyType });
                  }}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  {location}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>

      <CompareFloatingButton />
    </div>
  );
};

export default SearchResults;
