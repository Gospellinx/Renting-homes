import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import TourPaywall from "@/components/TourPaywall";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, Maximize2, Minimize2, ZoomIn, ZoomOut, RotateCcw,
  Home, UtensilsCrossed, Bed, Bath, TreePine, ChevronLeft, ChevronRight
} from "lucide-react";

// 360 tour room data
const tourData: Record<string, any> = {
  "1": {
    title: "Modern 2-Bedroom Apartment",
    rooms: [
      { 
        id: "living", 
        name: "Living Room", 
        icon: Home,
        image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=1920&h=1080&fit=crop",
        description: "Spacious open-plan living area with floor-to-ceiling windows"
      },
      { 
        id: "kitchen", 
        name: "Kitchen", 
        icon: UtensilsCrossed,
        image: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=1920&h=1080&fit=crop",
        description: "Modern gourmet kitchen with premium appliances"
      },
      { 
        id: "master", 
        name: "Master Bedroom", 
        icon: Bed,
        image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1920&h=1080&fit=crop",
        description: "Luxurious master suite with en-suite bathroom"
      },
      { 
        id: "bedroom2", 
        name: "Second Bedroom", 
        icon: Bed,
        image: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=1920&h=1080&fit=crop",
        description: "Comfortable second bedroom with built-in wardrobes"
      },
      { 
        id: "bathroom", 
        name: "Bathroom", 
        icon: Bath,
        image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1920&h=1080&fit=crop",
        description: "Elegant bathroom with premium fixtures"
      },
      { 
        id: "exterior", 
        name: "Exterior", 
        icon: TreePine,
        image: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=1920&h=1080&fit=crop",
        description: "Beautiful exterior with landscaped surroundings"
      },
    ]
  },
  "5": {
    title: "Spacious 3-Bedroom House",
    rooms: [
      { 
        id: "living", 
        name: "Living Room", 
        icon: Home,
        image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=1920&h=1080&fit=crop",
        description: "Grand living room with high ceilings"
      },
      { 
        id: "kitchen", 
        name: "Kitchen", 
        icon: UtensilsCrossed,
        image: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=1920&h=1080&fit=crop",
        description: "Chef's kitchen with island and breakfast bar"
      },
      { 
        id: "master", 
        name: "Master Bedroom", 
        icon: Bed,
        image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1920&h=1080&fit=crop",
        description: "Spacious master with walk-in closet"
      },
      { 
        id: "bathroom", 
        name: "Bathroom", 
        icon: Bath,
        image: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=1920&h=1080&fit=crop",
        description: "Spa-like bathroom experience"
      },
      { 
        id: "exterior", 
        name: "Pool Area", 
        icon: TreePine,
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&h=1080&fit=crop",
        description: "Private pool and garden area"
      },
    ]
  },
  "9": {
    title: "Executive 4-Bedroom Duplex",
    rooms: [
      { 
        id: "living", 
        name: "Living Room", 
        icon: Home,
        image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=1920&h=1080&fit=crop",
        description: "Double-height living room"
      },
      { 
        id: "kitchen", 
        name: "Kitchen", 
        icon: UtensilsCrossed,
        image: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=1920&h=1080&fit=crop",
        description: "State-of-the-art modern kitchen"
      },
      { 
        id: "master", 
        name: "Master Suite", 
        icon: Bed,
        image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=1920&h=1080&fit=crop",
        description: "Executive master suite"
      },
      { 
        id: "exterior", 
        name: "Exterior", 
        icon: TreePine,
        image: "https://images.unsplash.com/photo-1488972685288-c3fd157d7c7a?w=1920&h=1080&fit=crop",
        description: "Contemporary exterior design"
      },
    ]
  },
};

const VirtualTour360 = () => {
  const { id, type } = useParams<{ id: string; type: string }>();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [currentRoomIndex, setCurrentRoomIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  const tour = tourData[id || "1"];

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  if (!tour) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Tour not available</h2>
          <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  const currentRoom = tour.rooms[currentRoomIndex];
  const propertyImage = tour.rooms[0]?.image || "";

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
    setRotation(prev => prev + (e.movementX * 0.1));
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    setPosition({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleTouchEnd = () => setIsDragging(false);

  const goToRoom = (index: number) => {
    setCurrentRoomIndex(index);
    handleReset();
  };

  const nextRoom = () => goToRoom((currentRoomIndex + 1) % tour.rooms.length);
  const prevRoom = () => goToRoom((currentRoomIndex - 1 + tour.rooms.length) % tour.rooms.length);

  const tourContent = (
    <div 
      ref={containerRef}
      className="h-screen w-screen bg-black overflow-hidden relative select-none"
    >
      {/* 360° Image Viewer */}
      <div
        className="absolute inset-0 cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `scale(${zoom}) rotate(${rotation}deg) translate(${position.x / zoom}px, ${position.y / zoom}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        }}
      >
        <img
          src={currentRoom.image}
          alt={currentRoom.name}
          className="w-full h-full object-cover"
          draggable={false}
        />
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 pointer-events-none" />
      </div>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 z-20">
        <div className="flex items-center justify-between">
          <Button 
            variant="ghost" 
            className="text-white hover:bg-white/20 backdrop-blur-sm"
            onClick={() => navigate(`/property/${type}/${id}`)}
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Property
          </Button>
          
          <div className="flex items-center gap-2">
            <Badge className="bg-white/20 text-white backdrop-blur-sm border-0">
              360° Virtual Tour
            </Badge>
          </div>
        </div>
      </div>

      {/* Property Title */}
      <div className="absolute top-16 left-0 right-0 text-center z-10">
        <h1 className="text-white text-2xl md:text-3xl font-bold drop-shadow-lg">
          {tour.title}
        </h1>
      </div>

      {/* Current Room Info */}
      <div className="absolute bottom-32 left-0 right-0 text-center z-10">
        <div className="inline-block bg-black/50 backdrop-blur-md rounded-2xl px-6 py-4 text-white">
          <div className="flex items-center justify-center gap-3 mb-2">
            {currentRoom.icon && <currentRoom.icon className="h-6 w-6" />}
            <h2 className="text-xl font-bold">{currentRoom.name}</h2>
          </div>
          <p className="text-white/80 text-sm">{currentRoom.description}</p>
        </div>
      </div>

      {/* Navigation Arrows */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 h-14 w-14 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
        onClick={prevRoom}
      >
        <ChevronLeft className="h-8 w-8" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-14 w-14 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
        onClick={nextRoom}
      >
        <ChevronRight className="h-8 w-8" />
      </Button>

      {/* Control Panel */}
      <div className="absolute bottom-24 right-4 z-20 flex flex-col gap-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
          onClick={handleZoomIn}
        >
          <ZoomIn className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
          onClick={handleZoomOut}
        >
          <ZoomOut className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
          onClick={handleReset}
        >
          <RotateCcw className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-12 w-12 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-black/70"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
        </Button>
      </div>

      {/* Room Navigation */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="bg-black/70 backdrop-blur-md p-4">
          <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {tour.rooms.map((room: any, index: number) => {
              const Icon = room.icon;
              return (
                <button
                  key={room.id}
                  onClick={() => goToRoom(index)}
                  className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all min-w-[80px] ${
                    index === currentRoomIndex
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium whitespace-nowrap">{room.name}</span>
                </button>
              );
            })}
          </div>
          
          {/* Progress indicator */}
          <div className="flex justify-center gap-1 mt-3">
            {tour.rooms.map((_: any, index: number) => (
              <div
                key={index}
                className={`h-1 rounded-full transition-all ${
                  index === currentRoomIndex ? 'w-8 bg-primary' : 'w-2 bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Drag instruction */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
        <div className={`bg-black/50 backdrop-blur-sm text-white px-6 py-3 rounded-full transition-opacity duration-500 ${
          isDragging ? 'opacity-0' : 'opacity-70'
        }`}>
          <p className="text-sm">Drag to look around • Scroll or use controls to zoom</p>
        </div>
      </div>
    </div>
  );

  return (
    <TourPaywall
      propertyId={id || "1"}
      propertyTitle={tour.title}
      propertyImage={propertyImage}
      propertyType={type || "rent"}
    >
      {tourContent}
    </TourPaywall>
  );
};

export default VirtualTour360;
