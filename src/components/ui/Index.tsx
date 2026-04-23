import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Search, Mic, Upload, Handshake, Home, Megaphone, Building, Loader2, ArrowRight, Key, TrendingUp, Store, MapPin, LayoutDashboard } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useAISearch } from "@/hooks/useAISearch";
import { toast } from "@/hooks/use-toast";
import HomesLogo from "@/components/HomesLogo";
// hero bg no longer used as background image — Booking.com style uses solid dark green
import cardRent from "@/assets/card-rent.jpg";
import cardBuy from "@/assets/card-buy.jpg";
import cardInvest from "@/assets/card-invest.jpg";
import cardShop from "@/assets/card-shop.jpg";
import cardLand from "@/assets/card-land.jpg";

const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const { parseSearchQuery, isProcessing } = useAISearch();

  const handleProtectedLink = (href: string) => {
    if (!user) {
      sessionStorage.setItem("auth_return_url", href);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const parsed = await parseSearchQuery(searchQuery.trim());
    
    if (parsed) {
      const params = new URLSearchParams();
      params.set('q', searchQuery.trim());
      
      if (parsed.location) params.set('location', parsed.location);
      if (parsed.propertyType) params.set('propertyType', parsed.propertyType);
      if (parsed.intent) params.set('intent', parsed.intent);
      if (parsed.bedrooms) params.set('bedrooms', parsed.bedrooms.toString());
      if (parsed.priceMin) params.set('priceMin', parsed.priceMin.toString());
      if (parsed.priceMax) params.set('priceMax', parsed.priceMax.toString());
      
      if (parsed.intent === 'rent') {
        navigate(`/rental-properties?${params.toString()}`);
      } else if (parsed.intent === 'buy') {
        navigate(`/buy-property?${params.toString()}`);
      } else {
        navigate(`/search?${params.toString()}`);
      }
    } else {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleVoiceSearch = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        toast({
          title: "Voice captured",
          description: `"${transcript}" - Press search or Enter to find properties`,
        });
      };
      recognition.onerror = () => {
        toast({
          title: "Voice search error",
          description: "Could not capture voice. Please try again.",
          variant: "destructive",
        });
      };
      recognition.start();
    } else {
      toast({
        title: "Not supported",
        description: "Voice search is not supported in your browser",
        variant: "destructive",
      });
    }
  };

  const shortcuts = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, href: user ? "/profile" : "/auth?mode=signin" },
    { id: "upload", label: "Upload property", icon: Upload, href: "/upload-property" },
    { id: "jv", label: "JV opportunities", icon: Handshake, href: "/joint-ventures" },
    { id: "buy", label: "Buy property", icon: Home, href: "/buy-property" },
    { id: "ads", label: "Ads Manager", icon: Megaphone, href: "/ads-manager" },
    { id: "rent", label: "Rent property", icon: Building, href: "/rental-properties" },
    { id: "shop", label: "Rent a shop", icon: Store, href: "/shop-rentals" },
  ];

  const adCards = [
    {
      href: "/rental-properties",
      image: cardRent,
      icon: Key,
      badge: "Rent",
      title: "Rent a House",
      description: "Find your perfect rental — apartments, duplexes & more across Nigeria.",
      cta: "Browse rentals",
    },
    {
      href: "/buy-property",
      image: cardBuy,
      icon: Home,
      badge: "Buy",
      title: "Buy a House",
      description: "Own your dream home — browse verified properties available for purchase.",
      cta: "Explore listings",
    },
    {
      href: "/buy-land",
      image: cardLand,
      icon: MapPin,
      badge: "Land",
      title: "Buy a Land",
      description: "Secure prime plots of land across Nigeria — residential, commercial & agricultural.",
      cta: "Browse land",
    },
    {
      href: "/joint-ventures",
      image: cardInvest,
      icon: TrendingUp,
      badge: "Invest",
      title: "Joint Venture Offers",
      description: "Partner with developers & landowners — explore high-value JV opportunities.",
      cta: "View opportunities",
    },
    {
      href: "/shop-rentals",
      image: cardShop,
      icon: Store,
      badge: "Shops",
      title: "Rent a Shop",
      description: "Find retail spaces, lock-up shops & commercial units for your business.",
      cta: "Find a shop",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Compact dark green header — Booking.com style */}
      <div className="relative bg-[hsl(152,50%,12%)]">
        {/* Top Right Auth Buttons */}
        <header className="relative z-10 flex justify-between items-center px-6 py-3">
          <HomesLogo />
          {user ? (
            <Link to="/profile" className="flex items-center gap-2">
              <Avatar className="h-9 w-9 border-2 border-white/20">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-accent text-accent-foreground text-sm font-bold">
                  {user.user_metadata?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="text-white font-medium text-sm hidden sm:inline">Dashboard</span>
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/auth">
                <Button variant="ghost" className="text-white hover:bg-white/10 rounded-full px-5 text-sm">
                  Sign in
                </Button>
              </Link>
              <Link to="/auth">
                <Button className="bg-white text-[hsl(152,50%,12%)] hover:bg-white/90 rounded-full px-5 text-sm font-semibold">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </header>

        {/* Hero content */}
        <main className="relative z-10 flex flex-col items-center px-4 pb-20 pt-6">
          <h1 className="text-white text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-3">
            Looking to rent, buy, list, or develop?
          </h1>

          {user && (
            <p className="text-white/80 text-base sm:text-lg font-medium mb-5 text-center">
              Welcome back, {user.user_metadata?.full_name || user.email?.split("@")[0]} 👋
            </p>
          )}
          {!user && <p className="text-white/60 text-sm mb-5">Search verified properties across Nigeria</p>}

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="w-full max-w-2xl mb-8">
            <div className="relative flex items-center bg-white rounded-full shadow-lg hover:shadow-xl transition-shadow">
              {isProcessing ? (
                <Loader2 className="absolute left-5 h-5 w-5 text-primary animate-spin" />
              ) : (
                <Search className="absolute left-5 h-5 w-5 text-muted-foreground" />
              )}
              <input
                type="text"
                placeholder="Try: 'I want a 3 bedroom in Lekki' or 'shops for rent in Abuja'"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isProcessing}
                className="w-full h-14 pl-14 pr-44 text-base text-foreground bg-transparent rounded-full outline-none placeholder:text-muted-foreground disabled:opacity-50"
              />
              <div className="absolute right-3 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  disabled={isProcessing}
                  className="p-2 hover:bg-muted rounded-full transition-colors disabled:opacity-50"
                  aria-label="Voice search"
                >
                  <Mic className="h-5 w-5 text-muted-foreground" />
                </button>
                <Link
                  to={user ? "/profile" : "/auth?mode=signin"}
                  onClick={() => handleProtectedLink("/profile")}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                  aria-label={user ? "Open dashboard" : "Sign in"}
                >
                  <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
                </Link>
                <Link
                  to="/ads-manager"
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-accent/20 hover:bg-accent/30 rounded-full text-sm font-medium text-primary transition-colors"
                >
                  <Megaphone className="h-4 w-4" />
                  Advertise
                </Link>
              </div>
            </div>
          </form>

          {/* Shortcut Icons */}
          <div className="flex flex-wrap justify-center gap-4 max-w-3xl">
            {shortcuts.map((shortcut) => {
              const Icon = shortcut.icon;
              return (
                <Link
                  key={shortcut.id}
                  to={shortcut.href}
                  onClick={() => shortcut.id === "dashboard" && handleProtectedLink("/profile")}
                  className="flex flex-col items-center gap-2 p-3 rounded-xl transition-all hover:bg-white/10 hover:scale-105"
                >
                  <div className="w-12 h-12 rounded-full border-2 border-white/40 bg-white/10 backdrop-blur-sm flex items-center justify-center">
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xs text-white/90 font-medium max-w-[80px] text-center leading-tight">
                    {shortcut.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </main>
      </div>

      {/* Bottom Ad Cards — on clean background */}
      <section className="bg-background px-4 py-14 w-full">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-foreground">Explore by Category</h2>
          <p className="text-muted-foreground text-center mb-10">Choose what you're looking for and get started instantly.</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {adCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.href}
                  to={card.href}
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card hover:shadow-xl transition-all hover:scale-[1.02]"
                >
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <span className="absolute top-3 right-3 text-[10px] font-semibold uppercase tracking-widest text-white bg-primary/80 px-2.5 py-1 rounded-full">
                      {card.badge}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <h3 className="font-bold text-foreground">{card.title}</h3>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                      {card.description}
                    </p>
                    <div className="inline-flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                      {card.cta} <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <footer className="bg-background pb-6" />
    </div>
  );
};

export default Index;
