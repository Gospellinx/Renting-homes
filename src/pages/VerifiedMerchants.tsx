import React, { useState } from 'react';
import { Search, Filter, MapPin, Users, Building, CheckCircle, Star, Phone, Mail, Globe, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from "@/hooks/use-toast";
import AdBanner from '@/components/AdBanner';
import BackButton from '@/components/BackButton';

// Mock data for companies and realtors
const mockCompanies = [
  {
    id: 1,
    name: "Vegas Homes",
    type: "company",
    logo: "/placeholder.svg",
    ceo: "John Adebayo",
    location: "Abuja",
    portfolioSize: 150,
    verified: true,
    rating: 4.8,
    reviews: 45,
    phone: "+234 801 234 5678",
    email: "info@vegashomes.ng",
    website: "www.vegashomes.ng",
    address: "Plot 123, Maitama District, Abuja",
    cac: "RC-1234567",
    staffStrength: 25,
    bio: "Leading real estate company in the FCT with over 10 years of experience in luxury property development.",
    ongoingSales: [
      { name: "Maitama Gardens", units: 24, price: "₦45M - ₦120M" },
      { name: "Asokoro Heights", units: 18, price: "₦80M - ₦250M" }
    ]
  },
  {
    id: 2,
    name: "Sarah Okafor",
    type: "realtor",
    logo: "/placeholder.svg",
    location: "Lagos",
    portfolioSize: 85,
    verified: true,
    rating: 4.6,
    reviews: 32,
    phone: "+234 802 345 6789",
    email: "sarah@properties.ng",
    address: "Victoria Island, Lagos",
    affiliation: "Affiliated to Prime Properties Ltd",
    specialization: "Luxury Residential Properties"
  },
  {
    id: 3,
    name: "Capital Properties Ltd",
    type: "company",
    logo: "/placeholder.svg",
    ceo: "Amina Hassan",
    location: "Abuja",
    portfolioSize: 200,
    verified: false,
    rating: 4.3,
    reviews: 28,
    phone: "+234 803 456 7890",
    email: "info@capitalproperties.ng",
    website: "www.capitalproperties.ng",
    address: "Central Business District, Abuja",
    cac: "RC-2345678",
    staffStrength: 40,
    bio: "Specializing in commercial and residential properties across FCT and neighboring states.",
    ongoingSales: [
      { name: "CBD Tower", units: 32, price: "₦25M - ₦60M" }
    ]
  }
];

const VerifiedMerchants = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [merchants] = useState(mockCompanies);

  const filteredMerchants = merchants.filter(merchant => {
    const matchesSearch = merchant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         merchant.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLocation = selectedLocation === 'all' || merchant.location.toLowerCase() === selectedLocation.toLowerCase();
    return matchesSearch && matchesLocation;
  });

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
    ));
  };

  const MerchantCard = ({ merchant }) => (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedMerchant(merchant)}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={merchant.logo} alt={merchant.name} />
            <AvatarFallback>{merchant.name.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-semibold">{merchant.name}</h3>
              {merchant.verified && (
                <Badge variant="secondary" className="flex items-center space-x-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>Verified</span>
                </Badge>
              )}
            </div>
            
            {merchant.type === 'company' && (
              <p className="text-sm text-muted-foreground">CEO: {merchant.ceo}</p>
            )}
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <MapPin className="h-4 w-4" />
                <span>{merchant.location}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Building className="h-4 w-4" />
                <span>{merchant.portfolioSize} properties</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                {renderStars(merchant.rating)}
              </div>
              <span className="text-sm text-muted-foreground">
                {merchant.rating} ({merchant.reviews} reviews)
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const DetailedProfile = ({ merchant }) => (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={merchant.logo} alt={merchant.name} />
              <AvatarFallback>{merchant.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-2xl">{merchant.name}</CardTitle>
              <div className="flex items-center space-x-2 mt-2">
                {merchant.verified && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>Verified</span>
                  </Badge>
                )}
                <Badge variant="outline">{merchant.type === 'company' ? 'Company' : 'Realtor'}</Badge>
              </div>
            </div>
          </div>
          <Button variant="outline" onClick={() => setSelectedMerchant(null)}>
            Close
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Information</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{merchant.phone}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{merchant.email}</span>
              </div>
              {merchant.website && (
                <div className="flex items-center space-x-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span>{merchant.website}</span>
                </div>
              )}
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{merchant.address}</span>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Portfolio & Rating</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Building className="h-4 w-4 text-muted-foreground" />
                <span>{merchant.portfolioSize} properties</span>
              </div>
              <div className="flex items-center space-x-2">
                {renderStars(merchant.rating)}
                <span>{merchant.rating} ({merchant.reviews} reviews)</span>
              </div>
              {merchant.type === 'company' && (
                <>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{merchant.staffStrength} staff members</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>CAC: {merchant.cac}</span>
                  </div>
                </>
              )}
              {merchant.affiliation && (
                <div className="flex items-center space-x-2">
                  <Building className="h-4 w-4 text-muted-foreground" />
                  <span>{merchant.affiliation}</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <Separator />
        
        {merchant.type === 'company' && merchant.bio && (
          <div>
            <h3 className="text-lg font-semibold mb-2">About {merchant.name}</h3>
            <p className="text-muted-foreground">{merchant.bio}</p>
            {merchant.ceo && (
              <p className="text-sm text-muted-foreground mt-2">Led by CEO: {merchant.ceo}</p>
            )}
          </div>
        )}
        
        {merchant.specialization && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Specialization</h3>
            <p className="text-muted-foreground">{merchant.specialization}</p>
          </div>
        )}
        
        {merchant.ongoingSales && merchant.ongoingSales.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Ongoing Sales</h3>
            <div className="grid gap-4">
              {merchant.ongoingSales.map((sale, index) => (
                <Card key={index} className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium">{sale.name}</h4>
                      <p className="text-sm text-muted-foreground">{sale.units} units available</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{sale.price}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header with Back Button */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center">
          <BackButton />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Verified Merchants Ad Banner */}
        <div className="mb-8">
          <AdBanner type="banner" />
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Verified Merchants</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find trusted real estate companies and realtors in your area
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search by company name, realtor, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedLocation} onValueChange={setSelectedLocation}>
              <SelectTrigger className="md:w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Locations</SelectItem>
                <SelectItem value="abuja">Abuja</SelectItem>
                <SelectItem value="lagos">Lagos</SelectItem>
                <SelectItem value="port-harcourt">Port Harcourt</SelectItem>
                <SelectItem value="kano">Kano</SelectItem>
                <SelectItem value="ibadan">Ibadan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {selectedMerchant ? (
          <DetailedProfile merchant={selectedMerchant} />
        ) : (
          <div className="space-y-6">
            <div className="text-sm text-muted-foreground">
              Showing {filteredMerchants.length} result(s)
            </div>
            
            <div className="space-y-4">
              {filteredMerchants.map((merchant) => (
                <MerchantCard key={merchant.id} merchant={merchant} />
              ))}
            </div>
            
            {filteredMerchants.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">No merchants found matching your criteria.</p>
                <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filter options.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifiedMerchants;