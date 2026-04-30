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
import { useAuth } from "@/context/AuthContext";
import ScrollAuthGate from "@/components/ScrollAuthGate";
import { allProperties } from "@/data/mockProperties";

// allProperties imported from @/data/mockProperties

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
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f2f4fb_0%,#f7f7fb_42%,#f4f1ec_100%)]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(91,104,228,0.16),transparent_34%),radial-gradient(circle_at_top_right,rgba(72,153,255,0.16),transparent_28%),radial-gradient(circle_at_bottom,rgba(162,153,255,0.12),transparent_42%)] z-0" />
      
      {/* Header */}
      <header className="relative z-40 border-b border-[#d7daf0] bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 sticky top-0">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 text-[#1f1a54] hover:text-[#26225f]">
            <Home className="h-8 w-8" />
            <span className="text-2xl font-bold">Homes</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/rental-properties" className="text-sm font-medium text-[#1f1a54] hover:text-[#26225f] transition-colors">Rent</Link>
            <Link to="/buy-property" className="text-sm font-medium text-[#1f1a54] hover:text-[#26225f] transition-colors">Buy</Link>
            <Link to={user ? "/profile" : "/auth?mode=signin"} className="text-sm font-medium text-[#1f1a54] hover:text-[#26225f] transition-colors">
              {user ? "Dashboard" : "Sign In"}
            </Link>
          </nav>
          <Button variant="ghost" size="sm" asChild className="text-[#1f1a54] hover:text-[#26225f] hover:bg-[#eef1ff]">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back Home
            </Link>
          </Button>
        </div>
      </header>

      <div className="relative z-10 container py-8">
        {/* Search Header */}
        <div className="mb-8">
          <Button variant="ghost" size="sm" className="mb-4 text-[#1f1a54] hover:text-[#26225f] hover:bg-[#eef1ff]" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          
          <h1 className="text-3xl font-bold mb-2 text-[#1f1a54]">
            {locationFilter 
              ? `Properties in ${locationFilter}${propertyTypeFilter ? ` - ${propertyTypeFilter}` : ''}`
              : query 
                ? `Search Results for "${query}"` 
                : "Search Properties"}
          </h1>
          <p className="text-[#6f7599]">
            {sortedProperties.length} {sortedProperties.length === 1 ? "property" : "properties"} found
            {locationFilter && ` in ${locationFilter}`}
            {bedroomsFilter && ` with ${bedroomsFilter}+ bedrooms`}
          </p>
        </div>

        {/* Search & Filter Bar */}
        <form onSubmit={handleSearch} className="flex flex-col gap-3 mb-8 p-4 bg-white/90 rounded-xl border border-[#d7daf0] shadow-[0_20px_50px_rgba(31,26,84,0.12)]">
          {/* Row 1: search + type + sort + button */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-5 w-5 text-[#7d84ad]" />
              <Input
                placeholder="Search by location, property type..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-10 h-12 border-[#d7daf0] text-[#1f1a54] placeholder:text-[#9ca2c6]"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-3 top-3 text-[#7d84ad] hover:text-[#1f1a54]"
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
