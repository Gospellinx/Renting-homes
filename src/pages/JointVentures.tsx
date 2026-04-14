import React, { useState } from 'react';
import { addStepCount } from "@/lib/utils";
import { ArrowLeft, ArrowRight, MapPin, Building, Users, Upload, CheckCircle, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import AdBanner from '@/components/AdBanner';
import BackButton from '@/components/BackButton';
import JVPropertyViewModal from '@/components/JVPropertyViewModal';
import { useAuth } from '@/hooks/useAuth';
import ScrollAuthGate from '@/components/ScrollAuthGate';

const JointVentures = () => {
  const { user, loading } = useAuth();
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [viewProperty, setViewProperty] = useState<any>(null);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState({});

  const isGuest = !loading && !user;

  const properties = [
    { id: 1, title: "Prime Commercial Land - Wuse 2", location: "Abuja", size: "2,500 sqm", type: "Commercial Land", price: "₦850M", description: "Strategic location perfect for mixed-use development", image: "/placeholder.svg", owner: "Lagos Properties Ltd", features: ["Corner piece", "C of O", "Fully serviced", "High traffic area"] },
    { id: 2, title: "Residential Estate Land - Lekki", location: "Lagos", size: "5,000 sqm", type: "Residential Land", price: "₦1.2B", description: "Ideal for luxury residential estate development", image: "/placeholder.svg", owner: "Abuja Land Consortium", features: ["Waterfront", "Gated community", "Infrastructure ready", "Title perfected"] },
    { id: 3, title: "Industrial Complex - Ikeja", location: "Lagos", size: "10,000 sqm", type: "Industrial Land", price: "₦2.5B", description: "Perfect for manufacturing and logistics hub", image: "/placeholder.svg", owner: "Federal Capital Properties", features: ["Power substation", "Rail access", "24/7 security", "Warehouse facilities"] },
    { id: 4, title: "Mixed-Use Development - Garki", location: "Abuja", size: "3,200 sqm", type: "Mixed-Use Land", price: "₦950M", description: "High-potential area for commercial and residential mix", image: "/placeholder.svg", owner: "Kano Investment Group", features: ["Central location", "Approved plans", "Metro access", "Shopping district"] },
    { id: 5, title: "Luxury Resort Land - Victoria Island", location: "Lagos", size: "8,000 sqm", type: "Hospitality Land", price: "₦3.8B", description: "Premium waterfront location for resort development", image: "/placeholder.svg", owner: "Coastal Developments", features: ["Beach access", "Luxury neighborhood", "Tourist zone", "High ROI potential"] },
    { id: 6, title: "Tech Hub Land - Maitama", location: "Abuja", size: "4,500 sqm", type: "Commercial Land", price: "₦1.8B", description: "Perfect for technology and innovation center", image: "/placeholder.svg", owner: "Digital Properties Inc", features: ["Fiber optic ready", "Tech district", "Government backing", "Startup ecosystem"] },
    { id: 7, title: "Shopping Mall Land - Alausa", location: "Lagos", size: "6,000 sqm", type: "Commercial Land", price: "₦2.0B", description: "Prime location for retail mall development", image: "/placeholder.svg", owner: "Alausa Developers", features: ["Main road access", "High population density", "Approved building plan"] },
    { id: 8, title: "Residential Layout - Lugbe", location: "Abuja", size: "15,000 sqm", type: "Residential Land", price: "₦600M", description: "Large plot ideal for affordable housing estate", image: "/placeholder.svg", owner: "Lugbe Estates Ltd", features: ["Road network", "Electricity supply", "School nearby", "Market access"] },
    { id: 9, title: "Hotel Development Site - Eko Atlantic", location: "Lagos", size: "3,000 sqm", type: "Hospitality Land", price: "₦5.0B", description: "Ultra-premium site for 5-star hotel development", image: "/placeholder.svg", owner: "Eko Atlantic Corp", features: ["Ocean view", "Private beach", "Helipad", "Premium infrastructure"] },
    { id: 10, title: "Agro-Industrial Park - Kuje", location: "Abuja", size: "50,000 sqm", type: "Agricultural Land", price: "₦400M", description: "Massive land for agricultural and industrial purposes", image: "/placeholder.svg", owner: "Green Farms Nigeria", features: ["Water source", "Fertile soil", "Road access", "Power line nearby"] },
  ];

  const locations = ['all', 'Lagos', 'Abuja', 'Kano', 'Port Harcourt'];

  const filteredProperties = selectedLocation === 'all' 
    ? properties 
    : properties.filter(p => p.location.toLowerCase() === selectedLocation.toLowerCase());

  const locationGroups: Record<string, typeof properties> = locations.slice(1).reduce((acc, location) => {
    acc[location] = properties.filter(p => p.location === location);
    return acc;
  }, {} as Record<string, typeof properties>);

  const nextSlide = (location) => {
    setCurrentSlideIndex(prev => ({
      ...prev,
      [location]: ((prev[location] || 0) + 1) % locationGroups[location].length
    }));
  };

  const prevSlide = (location) => {
    setCurrentSlideIndex(prev => ({
      ...prev,
      [location]: ((prev[location] || 0) - 1 + locationGroups[location].length) % locationGroups[location].length
    }));
  };

  const handleApplyForJV = (property) => {
    setSelectedProperty(property);
    setShowApplicationForm(true);
    setFormSubmitted(false);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    toast({
      title: "Application Submitted Successfully",
      description: "Your joint venture application has been received. You will be contacted within 5-7 working days.",
    });
  };

  if (formSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 p-6">
        <div className="max-w-2xl mx-auto pt-20">
          <Card className="text-center p-8">
            <CardContent className="space-y-6">
              <CheckCircle className="h-16 w-16 text-trust mx-auto" />
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Application Submitted Successfully!</h2>
                <p className="text-muted-foreground mb-6">
                  Thank you for your interest in partnering with <strong>{selectedProperty?.owner}</strong> on the <strong>{selectedProperty?.title}</strong> project.
                </p>
                <div className="bg-secondary/20 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">What happens next?</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Your application will be reviewed within 2-3 working days</li>
                    <li>• Property owner will contact you via email or phone within 5-7 working days</li>
                    <li>• If interested, a meeting will be scheduled at their office</li>
                    <li>• Due diligence and partnership terms discussion will follow</li>
                  </ul>
                </div>
              </div>
              <Button onClick={() => setFormSubmitted(false)} variant="outline">
                Apply for Another Property
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 ${isGuest ? 'max-h-screen overflow-hidden relative' : ''}`}>
      {isGuest && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <ScrollAuthGate />
        </div>
      )}
      {/* Header with Back Button */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container flex h-16 items-center">
          <BackButton />
        </div>
      </header>

      {/* Title Section */}
      <section className="pt-12 pb-12 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
            Joint Venture <span className="text-trust">Opportunities</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Partner with property owners and unlock premium development opportunities across Nigeria
          </p>
        </div>
      </section>

      {/* Joint Ventures Ad Banner */}
      <section className="px-6 mb-8">
        <div className="max-w-7xl mx-auto">
          <AdBanner type="banner" />
        </div>
      </section>

      {/* Filter Section */}
      <section className="px-6 mb-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap gap-4 justify-center mb-8">
            {locations.map((location) => (
              <Button
                key={location}
                variant={selectedLocation === location ? "default" : "outline"}
                onClick={() => setSelectedLocation(location)}
                className="capitalize"
              >
                {location === 'all' ? 'All Locations' : location}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Location-based Sliding Sections */}
      {selectedLocation === 'all' && (
        <section className="px-6 mb-16">
          <div className="max-w-7xl mx-auto space-y-12">
            {Object.entries(locationGroups).map(([location, locationProperties]) => (
              <div key={location} className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                    <MapPin className="h-6 w-6 text-trust" />
                    {location} Opportunities
                  </h2>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => prevSlide(location)}
                      disabled={locationProperties.length <= 1}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => nextSlide(location)}
                      disabled={locationProperties.length <= 1}
                    >
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="relative overflow-hidden">
                  <div 
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{
                      transform: `translateX(-${(currentSlideIndex[location] || 0) * 100}%)`
                    }}
                  >
                    {locationProperties.map((property) => (
                      <div key={property.id} className="w-full flex-shrink-0 px-2">
                        <Card className="group hover:shadow-xl transition-all duration-300 bg-card border-border">
                          <CardHeader className="pb-4">
                            <div className="flex justify-between items-start mb-2">
                              <Badge variant="secondary" className="mb-2">
                                {property.type}
                              </Badge>
                              <span className="text-2xl font-bold text-trust">{property.price}</span>
                            </div>
                            <CardTitle className="text-xl group-hover:text-trust transition-colors">
                              {property.title}
                            </CardTitle>
                            <div className="flex items-center text-muted-foreground">
                              <MapPin className="h-4 w-4 mr-1" />
                              {property.location} • {addStepCount(property.size)}
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <p className="text-muted-foreground">{property.description}</p>
                            
                            <div className="flex flex-wrap gap-2">
                              {property.features.map((feature, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                            
                            <div className="flex items-center justify-between pt-4 border-t border-border">
                              <div className="flex items-center gap-2">
                                <Building className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm text-muted-foreground">{property.owner}</span>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  onClick={() => setViewProperty(property)}
                                  variant="outline"
                                  size="sm"
                                >
                                  <Eye className="h-4 w-4 mr-1" />
                                  View
                                </Button>
                                <Button 
                                  onClick={() => handleApplyForJV(property)}
                                  variant="hero"
                                  size="sm"
                                >
                                  Apply for JV
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* All Properties Grid (when filtered) */}
      {selectedLocation !== 'all' && (
        <section className="px-6 mb-16">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProperties.map((property) => (
                <Card key={property.id} className="group hover:shadow-xl transition-all duration-300 bg-card border-border">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant="secondary" className="mb-2">
                        {property.type}
                      </Badge>
                      <span className="text-2xl font-bold text-trust">{property.price}</span>
                    </div>
                    <CardTitle className="text-xl group-hover:text-trust transition-colors">
                      {property.title}
                    </CardTitle>
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-1" />
                      {property.location} • {addStepCount(property.size)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">{property.description}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      {property.features.map((feature, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{property.owner}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => setViewProperty(property)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          onClick={() => handleApplyForJV(property)}
                          variant="hero"
                          size="sm"
                        >
                          Apply for JV
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Application Form Dialog */}
      <Dialog open={showApplicationForm} onOpenChange={setShowApplicationForm}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              Joint Venture Application - {selectedProperty?.title}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleFormSubmit} className="space-y-6 mt-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input id="companyName" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input id="email" type="email" required />
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" type="tel" required />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="portfolioLink">Project Portfolio Link</Label>
                <Input id="portfolioLink" type="url" placeholder="https://" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="officeAddress">Office Address *</Label>
              <Textarea id="officeAddress" required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="letterOfInterest">Letter of Interest *</Label>
              <Textarea 
                id="letterOfInterest" 
                placeholder="Please include your company letterhead and detailed proposal..."
                className="min-h-[120px]"
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reference">Reference (Previous Property Owner Worked With)</Label>
              <Textarea 
                id="reference" 
                placeholder="Name, company, contact details, and project details..."
                className="min-h-[80px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cacDocument">CAC Document Upload *</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <Input id="cacDocument" type="file" accept=".pdf,.jpg,.jpeg,.png" required className="hidden" />
                <Label htmlFor="cacDocument" className="cursor-pointer text-sm text-muted-foreground">
                  Click to upload CAC document (PDF, JPG, PNG)
                </Label>
              </div>
            </div>
            
            <div className="flex gap-4 pt-6">
              <Button type="button" variant="outline" onClick={() => setShowApplicationForm(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" variant="hero" className="flex-1">
                Submit Application
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {viewProperty && (
        <JVPropertyViewModal
          open={!!viewProperty}
          onOpenChange={(open) => !open && setViewProperty(null)}
          property={viewProperty}
        />
      )}
    </div>
  );
};

export default JointVentures;