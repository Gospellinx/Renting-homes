import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { addStepCount } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building, Play } from "lucide-react";
import { useState } from "react";

interface JVProperty {
  id: number;
  title: string;
  location: string;
  size: string;
  type: string;
  price: string;
  description: string;
  image: string;
  owner: string;
  features: string[];
}

interface JVPropertyViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property: JVProperty;
}

const mockJVVideos: Record<number, string> = {
  1: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  2: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  3: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
  4: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  5: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  6: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
};

const mockJVImages: Record<number, string> = {
  1: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=500&fit=crop",
  2: "https://images.unsplash.com/photo-1524230572899-a752b3835840?w=800&h=500&fit=crop",
  3: "https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?w=800&h=500&fit=crop",
  4: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=800&h=500&fit=crop",
  5: "https://images.unsplash.com/photo-1487958449943-2429e8be8625?w=800&h=500&fit=crop",
  6: "https://images.unsplash.com/photo-1524230572899-a752b3835840?w=800&h=500&fit=crop",
};

const JVPropertyViewModal = ({ open, onOpenChange, property }: JVPropertyViewModalProps) => {
  const [showVideo, setShowVideo] = useState(false);

  const propertyImage = mockJVImages[property.id] || mockJVImages[1];
  const propertyVideo = mockJVVideos[property.id] || mockJVVideos[1];

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setShowVideo(false); }}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="h-5 w-5 text-primary" />
            {property.title}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {property.location} • {addStepCount(property.size)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Property Image */}
          <div className="rounded-lg overflow-hidden aspect-video">
            <img
              src={propertyImage}
              alt={property.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Video Section */}
          <div>
            <h4 className="font-semibold mb-2 text-sm">Property Video</h4>
            {showVideo ? (
              <div className="rounded-lg overflow-hidden bg-black aspect-video">
                <video
                  controls
                  autoPlay
                  className="w-full h-full"
                  poster={propertyImage}
                  src={propertyVideo}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : (
              <div
                className="relative rounded-lg overflow-hidden cursor-pointer group aspect-video"
                onClick={() => setShowVideo(true)}
              >
                <img src={propertyImage} alt={property.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/50 transition-colors">
                  <div className="bg-primary rounded-full p-4 shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="h-8 w-8 text-primary-foreground fill-primary-foreground" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">{property.type}</Badge>
              <span className="text-xl font-bold text-primary">{property.price}</span>
            </div>
            <p className="text-sm text-muted-foreground">{property.description}</p>
            <div className="flex flex-wrap gap-2">
              {property.features.map((feature, i) => (
                <Badge key={i} variant="outline" className="text-xs">{feature}</Badge>
              ))}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
              <Building className="h-4 w-4" />
              <span>Owner: {property.owner}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JVPropertyViewModal;
