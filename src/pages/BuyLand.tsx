import { useState } from "react";
import { addStepCount } from "@/lib/utils";
import { Link } from "react-router-dom";
import { MapPin, Ruler, Search, ArrowLeft, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import BackButton from "@/components/BackButton";

const dummyLands = [
  { id: "land-1", title: "Residential Plot in Gwarinpa", location: "Gwarinpa, Abuja", price: "₦25,000,000", size: "600 sqm", type: "Residential", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop" },
  { id: "land-2", title: "Commercial Land in Wuse 2", location: "Wuse 2, Abuja", price: "₦85,000,000", size: "1,200 sqm", type: "Commercial", image: "https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=400&h=300&fit=crop" },
  { id: "land-3", title: "Agricultural Land in Kuje", location: "Kuje, Abuja", price: "₦8,000,000", size: "5 Hectares", type: "Agricultural", image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&h=300&fit=crop" },
  { id: "land-4", title: "Corner Plot in Lekki Phase 1", location: "Lekki Phase 1, Lagos", price: "₦120,000,000", size: "800 sqm", type: "Residential", image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400&h=300&fit=crop" },
  { id: "land-5", title: "Estate Land in Lugbe", location: "Lugbe, Abuja", price: "₦12,000,000", size: "450 sqm", type: "Residential", image: "https://images.unsplash.com/photo-1573481078935-b9605167e06b?w=400&h=300&fit=crop" },
  { id: "land-6", title: "Waterfront Plot in Ikoyi", location: "Ikoyi, Lagos", price: "₦350,000,000", size: "1,500 sqm", type: "Commercial", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop" },
  { id: "land-7", title: "Industrial Land in Idu", location: "Idu Industrial, Abuja", price: "₦45,000,000", size: "3,000 sqm", type: "Industrial", image: "https://images.unsplash.com/photo-1590496793929-36417d3117de?w=400&h=300&fit=crop" },
  { id: "land-8", title: "Serviced Plot in Maitama", location: "Maitama, Abuja", price: "₦180,000,000", size: "900 sqm", type: "Residential", image: "https://images.unsplash.com/photo-1518098268026-4e89f1a2cd8e?w=400&h=300&fit=crop" },
  { id: "land-9", title: "Farm Land in Gwagwalada", location: "Gwagwalada, Abuja", price: "₦5,000,000", size: "10 Hectares", type: "Agricultural", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=400&h=300&fit=crop" },
  { id: "land-10", title: "Mixed-Use Land in Jabi", location: "Jabi, Abuja", price: "₦65,000,000", size: "1,000 sqm", type: "Mixed-Use", image: "https://images.unsplash.com/photo-1628624747186-a941c476b7ef?w=400&h=300&fit=crop" },
];

const BuyLand = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLands = dummyLands.filter(
    (land) =>
      land.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      land.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      land.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-primary text-primary-foreground px-4 py-6">
        <div className="max-w-6xl mx-auto">
          <BackButton />
          <h1 className="text-2xl font-bold mt-2">Buy a Land</h1>
          <p className="text-primary-foreground/80 text-sm mt-1">
            Browse verified plots of land across Nigeria
          </p>
          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by location, type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-background text-foreground rounded-full"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <p className="text-sm text-muted-foreground mb-4">{filteredLands.length} lands found</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredLands.map((land) => (
            <div key={land.id} className="border border-border rounded-2xl overflow-hidden bg-card hover:shadow-lg transition-shadow">
              <div className="relative h-48 overflow-hidden">
                <img src={land.image} alt={land.title} className="w-full h-full object-cover" loading="lazy" />
                <span className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-widest text-primary-foreground bg-primary/80 px-2.5 py-1 rounded-full">
                  {land.type}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-bold text-foreground mb-1">{land.title}</h3>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                  <MapPin className="h-3.5 w-3.5" />
                  {land.location}
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                  <Ruler className="h-3.5 w-3.5" />
                  {addStepCount(land.size)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">{land.price}</span>
                  <Link to={`/property/land/${land.id}`}>
                    <Button size="sm" variant="outline" className="gap-1">
                      <Eye className="h-4 w-4" /> View
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BuyLand;
