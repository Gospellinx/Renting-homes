import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import VerifiedBadge from "@/components/VerifiedBadge";
import { addStepCount } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MapPin, Store, Ruler } from "lucide-react";

interface ShopProperty {
  id: number;
  title: string;
  location: string;
  price: string;
  period: string;
  area: string;
  width: string;
  length: string;
  features: string[];
  image: string;
  agentName: string;
  verified?: boolean;
}

interface ShopViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: ShopProperty;
}

const shopGalleryImages: Record<number, string[]> = {
  101: [
    "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1528698827591-e19cef51a699?w=800&h=500&fit=crop",
  ],
  104: [
    "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1528698827591-e19cef51a699?w=800&h=500&fit=crop",
  ],
  107: [
    "https://images.unsplash.com/photo-1528698827591-e19cef51a699?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&h=500&fit=crop",
    "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&h=500&fit=crop",
  ],
};

// Default gallery for shops without specific images
const defaultGallery = [
  "https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=800&h=500&fit=crop",
  "https://images.unsplash.com/photo-1528698827591-e19cef51a699?w=800&h=500&fit=crop",
];

const ShopViewModal = ({ open, onOpenChange, property }: ShopViewModalProps) => {
  const images = shopGalleryImages[property.id] || defaultGallery;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" />
            {property.title}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {property.location}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Photo Gallery */}
          <div className="grid grid-cols-1 gap-2">
            <div className="rounded-lg overflow-hidden aspect-video">
              <img src={images[0]} alt={property.title} className="w-full h-full object-cover" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {images.slice(1).map((img, i) => (
                <div key={i} className="rounded-lg overflow-hidden aspect-video">
                  <img src={img} alt={`${property.title} ${i + 2}`} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          {/* Size / Dimensions */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-semibold mb-3 text-sm flex items-center gap-2">
              <Ruler className="h-4 w-4 text-primary" />
              Shop Dimensions
            </h4>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Width</p>
                <p className="font-bold text-lg">{property.width}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Length</p>
                <p className="font-bold text-lg">{property.length}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Total Area</p>
                <p className="font-bold text-lg">{addStepCount(property.area)}</p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-primary">{property.price}<span className="text-sm font-normal text-muted-foreground ml-1">{property.period}</span></span>
            </div>
            <div className="flex flex-wrap gap-2">
              {property.features.map((feature, i) => (
                <Badge key={i} variant="outline" className="text-xs">{feature}</Badge>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
              <Store className="h-4 w-4" />
              <span className="flex items-center gap-1">Agent: {property.agentName} {property.verified && <VerifiedBadge />}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShopViewModal;
