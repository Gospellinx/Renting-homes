import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Camera,
  Home,
  Key,
  Loader2,
  MapPin,
  Mic,
  Search,
  Store,
  TrendingUp,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import HomesLogo from "@/components/HomesLogo";
import cardBuy from "@/assets/card-buy.jpg";
import cardInvest from "@/assets/card-invest.jpg";
import cardLand from "@/assets/card-land.jpg";
import cardRent from "@/assets/card-rent.jpg";
import cardShop from "@/assets/card-shop.jpg";
import { useAuth } from "@/hooks/useAuth";
import { useAISearch } from "@/hooks/useAISearch";
import { toast } from "@/hooks/use-toast";

const suggestedSearches = [
  "3 bedroom apartment in Lekki",
  "shops for rent in Abuja",
  "verified duplex in Ikeja",
];

const propertyCards = [
  {
    href: "/rental-properties",
    image: cardRent,
    icon: Key,
    badge: "Rent",
    title: "Rent a House",
    description: "Browse apartments, duplexes, and serviced homes in top cities across Nigeria.",
    cta: "Browse rentals",
  },
  {
    href: "/buy-property",
    image: cardBuy,
    icon: Home,
    badge: "Buy",
    title: "Buy a House",
    description: "Explore verified properties for sale with a cleaner path to your next home.",
    cta: "Explore listings",
  },
  {
    href: "/buy-land",
    image: cardLand,
    icon: MapPin,
    badge: "Land",
    title: "Buy Land",
    description: "Find residential, commercial, and investment plots in fast-growing locations.",
    cta: "Browse land",
  },
  {
    href: "/joint-ventures",
    image: cardInvest,
    icon: TrendingUp,
    badge: "Invest",
    title: "Joint Venture Offers",
    description: "Discover smart partnerships for development opportunities and land-backed projects.",
    cta: "View opportunities",
  },
  {
    href: "/shop-rentals",
    image: cardShop,
    icon: Store,
    badge: "Commercial",
    title: "Rent a Shop",
    description: "See retail spaces, lock-up shops, and commercial units ready for business.",
    cta: "Find a shop",
  },
];

const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const { parseSearchQuery, isProcessing } = useAISearch();

  const firstName =
    user?.user_metadata?.full_name?.split(" ")[0] ||
    user?.email?.split("@")[0] ||
    "Peter";

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const parsed = await parseSearchQuery(searchQuery.trim());

    if (parsed) {
      const params = new URLSearchParams();
      params.set("q", searchQuery.trim());

      if (parsed.location) params.set("location", parsed.location);
      if (parsed.propertyType) params.set("propertyType", parsed.propertyType);
      if (parsed.intent) params.set("intent", parsed.intent);
      if (parsed.bedrooms) params.set("bedrooms", parsed.bedrooms.toString());
      if (parsed.priceMin) params.set("priceMin", parsed.priceMin.toString());
      if (parsed.priceMax) params.set("priceMax", parsed.priceMax.toString());

      if (parsed.intent === "verify") {
        navigate("/verify-property");
      } else if (parsed.intent === "rent") {
        navigate(`/rental-properties?${params.toString()}`);
      } else if (parsed.intent === "buy") {
        navigate(`/buy-property?${params.toString()}`);
      } else {
        navigate(`/search?${params.toString()}`);
      }
    } else {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleVoiceSearch = () => {
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SpeechRecognitionConstructor =
        (window as Window & {
          webkitSpeechRecognition?: new () => any;
          SpeechRecognition?: new () => any;
        }).webkitSpeechRecognition ||
        (window as Window & {
          webkitSpeechRecognition?: new () => any;
          SpeechRecognition?: new () => any;
        }).SpeechRecognition;

      if (!SpeechRecognitionConstructor) return;

      const recognition = new SpeechRecognitionConstructor();
      recognition.lang = "en-US";
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(180deg,#f2f4fb_0%,#f7f7fb_42%,#f4f1ec_100%)] px-4 py-4 sm:px-6 sm:py-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(91,104,228,0.16),transparent_34%),radial-gradient(circle_at_top_right,rgba(72,153,255,0.16),transparent_28%),radial-gradient(circle_at_bottom,rgba(162,153,255,0.12),transparent_42%)]" />
      <div className="pointer-events-none absolute -left-16 top-28 h-48 w-48 rounded-full bg-[#eef1ff] blur-3xl sm:h-72 sm:w-72" />
      <div className="pointer-events-none absolute -right-14 bottom-16 h-44 w-44 rounded-full bg-[#e9ecff] blur-3xl sm:h-64 sm:w-64" />

      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="flex items-start justify-between gap-4 px-1 py-5 sm:py-7">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#767ca8]">
              Welcome Home
            </p>
            <p className="mt-2 text-base font-semibold text-[#1f1a54] sm:text-xl">
              Welcome {firstName}
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            className="h-11 rounded-full border-[#d7daf0] bg-white/85 px-4 text-[#241f66] shadow-[0_10px_25px_rgba(31,26,84,0.08)] backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-[#bfc6f5] hover:bg-white"
          >
            <Link to={user ? "/profile" : "/auth"} className="flex items-center gap-2">
              {user ? (
                <Avatar className="h-7 w-7 border border-[#d9dcf1]">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-[#eef1ff] text-xs font-semibold text-[#241f66]">
                    {user.user_metadata?.full_name?.[0]?.toUpperCase() ||
                      user.email?.[0]?.toUpperCase() ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <UserRound className="h-4 w-4" />
              )}
              <span>Profile</span>
            </Link>
          </Button>
        </header>

        <main className="px-1 pb-16 pt-8 sm:pb-20">
          <div className="mx-auto flex w-full max-w-5xl flex-col items-center text-center">
            <div className="mx-auto flex w-full justify-center">
              <div className="w-full max-w-[180px] sm:max-w-[220px]">
                <HomesLogo />
              </div>
            </div>

            <p className="mt-10 w-full text-center text-sm font-medium uppercase tracking-[0.3em] text-[#7f85af]">
              Search smarter
            </p>

            <h1 className="mx-auto mt-5 max-w-4xl text-balance text-center text-4xl font-semibold tracking-[-0.04em] text-[#1f1a54] sm:text-5xl lg:text-6xl">
              Looking to rent, buy, verify or develop?
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-center text-sm leading-7 text-[#6f7599] sm:text-lg">
              Search verified homes, land, and commercial spaces across Nigeria with a
              cleaner, faster experience built around discovery.
            </p>

            <form onSubmit={handleSearch} className="mx-auto mt-8 w-full max-w-4xl sm:mt-10">
              <div className="group flex items-center gap-2 rounded-[28px] border border-white/80 bg-white/90 p-2 pl-4 shadow-[0_20px_50px_rgba(31,26,84,0.12)] ring-1 ring-[#eceffa] backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_60px_rgba(31,26,84,0.16)] focus-within:-translate-y-0.5 focus-within:ring-2 focus-within:ring-[#cfd5fb] sm:gap-3 sm:rounded-full sm:pl-6">
                {isProcessing ? (
                  <Loader2 className="h-5 w-5 shrink-0 animate-spin text-[#4d57c4]" />
                ) : (
                  <Search className="h-5 w-5 shrink-0 text-[#7d84ad]" />
                )}

                <input
                  type="text"
                  placeholder="Try: 'I want a 3 bedroom in Lekki' or 'shops for rent in Abuja'"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isProcessing}
                  className="h-12 min-w-0 flex-1 bg-transparent text-sm text-[#1f1a54] outline-none placeholder:text-[#9ca2c6] disabled:cursor-not-allowed disabled:opacity-60 sm:h-14 sm:text-base"
                />

                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    type="button"
                    onClick={handleVoiceSearch}
                    disabled={isProcessing}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-[#5c6494] transition-all duration-300 hover:bg-[#eef1ff] hover:text-[#2b2770] disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Voice search"
                  >
                    <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>

                  <Link
                    to="/verify-property"
                    className="flex h-10 w-10 items-center justify-center rounded-full text-[#5c6494] transition-all duration-300 hover:bg-[#eef1ff] hover:text-[#2b2770]"
                    aria-label="Verify property"
                  >
                    <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Link>

                  <Button
                    type="submit"
                    disabled={isProcessing || !searchQuery.trim()}
                    className="h-10 rounded-full bg-[#26225f] px-3 text-sm font-medium text-white shadow-[0_12px_24px_rgba(38,34,95,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#1f1b50] hover:shadow-[0_16px_28px_rgba(38,34,95,0.28)] sm:h-11 sm:px-5"
                  >
                    <span className="hidden sm:inline">Search</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </form>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {suggestedSearches.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setSearchQuery(suggestion)}
                  className="rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm text-[#535a86] shadow-[0_8px_20px_rgba(31,26,84,0.06)] backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:border-[#ccd2f8] hover:bg-white hover:text-[#272364]"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-[#646a91]">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#5b68e4]" />
                Verified listings
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#73a2ff]" />
                AI-guided search
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#8d79ff]" />
                Nationwide coverage
              </div>
            </div>
          </div>
        </main>

        <section className="px-1 pb-8 sm:pt-6">
          <div className="flex flex-col gap-3 text-center sm:text-left">
            <p className="text-sm font-medium uppercase tracking-[0.26em] text-[#7f85af]">
              Featured Categories
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-3xl font-semibold tracking-[-0.03em] text-[#1f1a54]">
                  Explore properties your way
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[#6f7599] sm:text-base">
                  Keep browsing beyond search with curated entry points for homes,
                  land, investments, and commercial spaces.
                </p>
              </div>
              <Link
                to="/search"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d9dcf1] bg-white px-5 py-3 text-sm font-medium text-[#26225f] shadow-[0_10px_25px_rgba(31,26,84,0.08)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#bcc4f2] hover:text-[#1f1a54]"
              >
                View all properties
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
            {propertyCards.map((card) => {
              const Icon = card.icon;

              return (
                <Link
                  key={card.href}
                  to={card.href}
                  className="group overflow-hidden rounded-[24px] bg-white shadow-[0_16px_38px_rgba(31,26,84,0.08)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_22px_46px_rgba(31,26,84,0.14)]"
                >
                  <div className="relative h-52 overflow-hidden bg-[#eef1ff]">
                    <img
                      src={card.image}
                      alt={card.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#120f35]/75 via-[#120f35]/10 to-transparent" />
                    <span className="absolute left-4 top-4 rounded-full bg-white/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-white backdrop-blur-md">
                      {card.badge}
                    </span>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef1ff] text-[#26225f] transition-colors duration-300 group-hover:bg-[#e2e7ff]">
                        <Icon className="h-4 w-4" />
                      </div>
                      <h3 className="text-lg font-semibold text-[#1f1a54]">{card.title}</h3>
                    </div>

                    <p className="mt-4 text-sm leading-6 text-[#6f7599]">
                      {card.description}
                    </p>

                    <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#26225f] transition-all duration-300 group-hover:gap-3">
                      {card.cta}
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default Index;
