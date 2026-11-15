import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Bot,
  LayoutDashboard,
  Loader2,
  Megaphone,
  Mic,
  Search,
  Upload,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import HomesLogo from "@/components/HomesLogo";
import SiteFooter from "@/components/SiteFooter";
import cardBuy from "@/assets/card-buy.jpg";
import cardInvest from "@/assets/card-invest.jpg";
import cardLand from "@/assets/card-land.jpg";
import cardRent from "@/assets/card-rent.jpg";
import cardShop from "@/assets/card-shop.jpg";
import { useAuth } from "@/context/AuthContext";
import { getDashboardPathForUser } from "@/lib/dashboardPath";
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
    badge: "Rent",
    title: "Rent a home",
    description: "Apartments, duplexes and serviced homes in cities across Nigeria.",
    span: "lg:col-span-5 lg:row-span-2",
  },
  {
    href: "/buy-property",
    image: cardBuy,
    badge: "Buy",
    title: "Buy a home",
    description: "Houses and apartments for sale, with verified listings marked.",
    span: "lg:col-span-4",
  },
  {
    href: "/buy-land",
    image: cardLand,
    badge: "Land",
    title: "Buy land",
    description: "Residential, commercial and investment plots.",
    span: "lg:col-span-3",
  },
  {
    href: "/shop-rentals",
    image: cardShop,
    badge: "Commercial",
    title: "Rent a shop",
    description: "Lock-up shops, retail units and showrooms.",
    span: "lg:col-span-3",
  },
  {
    href: "/joint-ventures",
    image: cardInvest,
    badge: "Joint venture",
    title: "Develop your land with a partner",
    description: "You bring the land. A developer brings the finance, design and construction.",
    span: "sm:col-span-2 lg:col-span-4",
  },
];

const ownerActions = [
  {
    href: "/upload-property",
    icon: Upload,
    title: "List a property",
    description: "Add photos, documents, pricing and verification details in one guided form.",
  },
  {
    href: "/ads-manager",
    icon: Megaphone,
    title: "Promote a listing",
    description: "Run a campaign and track its reach and spend in the ads manager.",
  },
];

const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect users who haven't completed onboarding
  useEffect(() => {
    if (user && !user.user_metadata?.onboarding_completed) {
      navigate("/onboarding", { replace: true });
    }
  }, [user, navigate]);

  const displayName = user
    ? user.user_metadata?.user_name?.trim() ||
      user.email ||
      user.user_metadata?.full_name?.trim() ||
      user.user_metadata?.name?.trim() ||
      "there"
    : "Visitor";

  const dashboardPath = getDashboardPathForUser(user);

  const handleQuickActionClick = (href: string) => {
    if (!user) {
      sessionStorage.setItem("auth_return_url", href);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsProcessing(true);
    navigate(`/ai-search?q=${encodeURIComponent(searchQuery.trim())}`);
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
    <div className="min-h-screen bg-paper text-ink">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <header className="flex items-start justify-between gap-4 px-1 py-5 sm:py-7">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-leaf">
              Welcome Home
            </p>
            <p className="mt-2 max-w-[16rem] break-words text-base font-semibold text-[#0c2a1e] sm:max-w-none sm:text-xl">
              {user ? `Welcome ${displayName}` : "Welcome to Homes Nigeria"}
            </p>
          </div>

          <Button
            asChild
            variant="outline"
            className="h-11 rounded-full border-[#dce3da] bg-white/85 px-4 text-[#0c2a1e] shadow-[0_10px_25px_rgba(12,42,30,0.08)] transition-all duration-300 hover:border-[#bfd1c2] hover:bg-white"
          >
            <Link to={user ? dashboardPath : "/auth"} className="flex items-center gap-2">
              {user ? (
                <Avatar className="h-7 w-7 border border-[#dce3da]">
                  <AvatarImage src={user.user_metadata?.avatar_url} />
                  <AvatarFallback className="bg-[#e8efe6] text-xs font-semibold text-[#0c2a1e]">
                    {user.user_metadata?.full_name?.[0]?.toUpperCase() ||
                      user.email?.[0]?.toUpperCase() ||
                      "U"}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <UserRound className="h-4 w-4" />
              )}
              <span>{user ? "Dashboard" : "Sign In"}</span>
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

            <p className="mt-10 w-full plot-label text-center text-leaf">
              Search smarter
            </p>

            <h1 className="mx-auto mt-5 max-w-4xl text-balance text-center font-display text-4xl font-bold leading-[1.05] tracking-[-0.035em] text-[#0c2a1e] sm:text-5xl lg:text-[3.75rem]">
              Looking to rent, buy, list, or develop? Just ask our AI.
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-center text-sm leading-7 text-[#5b6b62] sm:text-lg">
              Tell our AI assistant exactly what you're looking for—from budget to location—and let it guide you to the best homes, land, and commercial spaces.
            </p>

            <form onSubmit={handleSearch} className="mx-auto mt-8 w-full max-w-4xl sm:mt-10">
              <div className="group flex items-center gap-2 rounded-[28px] border border-white/80 bg-white/90 p-2 pl-4 shadow-[0_20px_50px_rgba(12,42,30,0.12)] ring-1 ring-[#eceffa] transition-all duration-300 hover:shadow-[0_24px_60px_rgba(12,42,30,0.16)] focus-within:ring-2 focus-within:ring-[#bfd1c2] sm:gap-3 sm:rounded-full sm:pl-6">
                {isProcessing ? (
                  <Loader2 className="h-5 w-5 shrink-0 animate-spin text-[#1e8e4e]" />
                ) : (
                  <Search className="h-5 w-5 shrink-0 text-[#74837a]" />
                )}

                <input
                  type="text"
                  placeholder="Try: 'I want a 3 bedroom in Lekki' or 'shops for rent in Abuja'"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isProcessing}
                  className="h-12 min-w-0 flex-1 bg-transparent text-sm text-[#0c2a1e] outline-none placeholder:text-[#9aa69f] disabled:cursor-not-allowed disabled:opacity-60 sm:h-14 sm:text-base"
                />

                <div className="flex items-center gap-1 sm:gap-2">
                  <button
                    type="button"
                    onClick={handleVoiceSearch}
                    disabled={isProcessing}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-[#5b6b62] transition-all duration-300 hover:bg-[#e8efe6] hover:text-[#0c2a1e] disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Voice search"
                  >
                    <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
                  </button>

                  <Link
                    to={user ? dashboardPath : "/auth?mode=signin"}
                    onClick={() => handleQuickActionClick(dashboardPath)}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-full px-3 text-[#5b6b62] transition-all duration-300 hover:bg-[#e8efe6] hover:text-[#0c2a1e]"
                    aria-label={user ? "Open dashboard" : "Sign in"}
                  >
                    <LayoutDashboard className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden text-sm font-medium sm:inline">
                      {user ? "Dashboard" : "Sign in"}
                    </span>
                  </Link>

                  <Button
                    type="submit"
                    disabled={isProcessing || !searchQuery.trim()}
                    className="h-10 rounded-full bg-[#0f3d2a] px-3 text-sm font-medium text-white shadow-[0_12px_24px_rgba(15,61,42,0.22)] transition-all duration-300 hover:bg-[#0a2e1f] hover:shadow-[0_16px_28px_rgba(15,61,42,0.28)] sm:h-11 sm:px-5"
                  >
                    <span className="hidden sm:inline">Search</span>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </form>

            <div className="mx-auto mt-5 max-w-2xl rounded-2xl border border-[#dce3da] bg-[#f7f9f5]/80 px-5 py-3.5 text-sm text-[#5b6b62] shadow-sm">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 text-center sm:text-left">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8efe6] text-[#1e8e4e]">
                  <Bot className="h-4 w-4" />
                </div>
                <p className="leading-relaxed">
                  <strong className="text-[#0c2a1e]">AI-Powered Search:</strong> Type naturally to describe your dream property, budget, or specifications, and let our assistant find the perfect match.
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {suggestedSearches.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => setSearchQuery(suggestion)}
                  className="rounded-full border border-white/70 bg-white/70 px-4 py-2 text-sm text-[#5b6b62] shadow-[0_8px_20px_rgba(12,42,30,0.06)] transition-all duration-300 hover:border-[#bfd1c2] hover:bg-white hover:text-[#0c2a1e]"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </main>
      </div>

      <div>
        {/* Categories */}
        <section className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4 border-t border-ink/15 pt-8">
            <h2 className="font-display text-3xl font-bold tracking-[-0.035em] text-ink sm:text-4xl">
              Browse by category
            </h2>
            <Link
              to="/search"
              className="group inline-flex items-center gap-2 text-[15px] font-semibold text-ink underline decoration-beacon decoration-2 underline-offset-[6px] hover:decoration-leaf"
            >
              See all properties
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:auto-rows-[250px] lg:grid-cols-12">
            {propertyCards.map((card) => (
              <Link
                key={card.href}
                to={card.href}
                className={`group relative isolate flex min-h-[230px] flex-col justify-end overflow-hidden rounded-2xl bg-ink p-5 text-white sm:p-6 ${card.span}`}
              >
                <img
                  src={card.image}
                  alt=""
                  className="absolute inset-0 -z-10 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#06170f]/95 via-[#06170f]/45 via-45% to-transparent" />
                <span className="plot-label absolute left-5 top-5 rounded-full bg-white/95 px-2.5 py-1 text-ink sm:left-6 sm:top-6">
                  {card.badge}
                </span>
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h3 className="font-display text-2xl font-bold tracking-[-0.03em]">
                      {card.title}
                    </h3>
                    <p className="mt-1.5 max-w-sm text-sm leading-snug text-white/75">
                      {card.description}
                    </p>
                  </div>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 backdrop-blur transition-colors group-hover:bg-beacon group-hover:text-ink">
                    <ArrowUpRight className="h-5 w-5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Owners and agents */}
        <section className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
          <div className="survey-grid grid gap-10 rounded-3xl bg-ink p-7 text-white sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16 lg:p-14">
            <div>
              <p className="plot-label text-beacon">For owners and agents</p>
              <h2 className="mt-4 font-display text-4xl font-bold leading-[1.02] tracking-[-0.04em] sm:text-5xl">
                Got a place to let or sell?
              </h2>
              <p className="mt-5 max-w-md text-[17px] leading-relaxed text-white/70">
                Put it in front of people who are already searching. List it yourself in a few
                minutes, then promote it when you want more reach.
              </p>
            </div>

            <div className="divide-y divide-white/15 self-center border-y border-white/15">
              {ownerActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.href}
                    to={user ? action.href : "/auth?mode=signin"}
                    onClick={() => handleQuickActionClick(action.href)}
                    className="group flex items-center gap-5 py-6 transition-colors hover:bg-white/[0.04] sm:px-3"
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-beacon">
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-display text-xl font-semibold tracking-[-0.02em] sm:text-2xl">
                        {action.title}
                      </span>
                      <span className="mt-1 block text-[15px] leading-snug text-white/65">
                        {action.description}
                      </span>
                    </span>
                    <ArrowRight className="h-5 w-5 shrink-0 text-white/50 transition-all group-hover:translate-x-1 group-hover:text-beacon" />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      <SiteFooter />
    </div>
  );
};

export default Index;
