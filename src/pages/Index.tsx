import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  Loader2,
  Megaphone,
  Mic,
  Search,
  Upload,
} from "lucide-react";

import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import PlotCorners from "@/components/PlotCorners";
import heroEstate from "@/assets/hero-estate.jpg";
import cardBuy from "@/assets/card-buy.jpg";
import cardInvest from "@/assets/card-invest.jpg";
import cardLand from "@/assets/card-land.jpg";
import cardRent from "@/assets/card-rent.jpg";
import cardShop from "@/assets/card-shop.jpg";
import { useAuth } from "@/context/AuthContext";
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
      <SiteHeader />

      <main>
        {/* Hero: the search is the product */}
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:pb-24 lg:pt-20">
          <div>
            <p className="plot-label rise-in text-leaf">
              {user ? `Welcome back, ${displayName}` : "Property search · Nigeria"}
            </p>

            <h1 className="rise-in rise-in-2 mt-5 text-balance font-display text-[2.75rem] font-extrabold leading-[0.98] tracking-[-0.045em] text-ink sm:text-6xl lg:text-[4.75rem]">
              Describe the place.
              <br />
              We'll find the{" "}
              <span className="relative whitespace-nowrap">
                <span className="relative z-10">space.</span>
                <span
                  aria-hidden
                  className="absolute inset-x-[-0.06em] bottom-[0.08em] z-0 h-[0.34em] bg-beacon"
                />
              </span>
            </h1>

            <p className="rise-in rise-in-3 mt-6 max-w-xl text-lg leading-relaxed text-[#4a5b52]">
              Type what you need the way you'd say it to an agent: the area, the budget, the
              number of rooms. Our AI search turns it into homes, land and shops that fit.
            </p>

            <form onSubmit={handleSearch} className="rise-in rise-in-4 mt-9 max-w-2xl">
              <div className="flex items-center gap-1 rounded-2xl border-2 border-ink bg-white p-1.5 pl-4 shadow-[6px_6px_0_0_#0c2a1e] transition-shadow focus-within:shadow-[6px_6px_0_0_#1e8e4e] sm:pl-5">
                {isProcessing ? (
                  <Loader2 className="h-5 w-5 shrink-0 animate-spin text-leaf" />
                ) : (
                  <Search className="h-5 w-5 shrink-0 text-ink/50" />
                )}
                <label htmlFor="home-search" className="sr-only">
                  Describe the property you are looking for
                </label>
                <input
                  id="home-search"
                  type="text"
                  placeholder="3 bedroom flat in Lekki under ₦5M a year"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={isProcessing}
                  className="h-12 min-w-0 flex-1 bg-transparent px-2 text-base text-ink outline-none placeholder:text-ink/40 focus-visible:outline-none disabled:opacity-60 sm:h-14 sm:text-lg"
                />
                <button
                  type="button"
                  onClick={handleVoiceSearch}
                  disabled={isProcessing}
                  aria-label="Search by voice"
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-ink/60 transition-colors hover:bg-ink/5 hover:text-ink disabled:opacity-50"
                >
                  <Mic className="h-5 w-5" />
                </button>
                <button
                  type="submit"
                  disabled={isProcessing || !searchQuery.trim()}
                  className="inline-flex h-11 shrink-0 items-center gap-2 rounded-xl bg-ink px-4 text-[15px] font-semibold text-white transition-colors hover:bg-[#0f3d2a] disabled:cursor-not-allowed disabled:opacity-40 sm:h-12 sm:px-6"
                >
                  <span className="hidden sm:inline">Search</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-5 flex flex-wrap items-center gap-x-2 gap-y-2">
                <span className="plot-label mr-1 text-ink/50">Try</span>
                {suggestedSearches.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setSearchQuery(suggestion)}
                    className="rounded-full border border-ink/15 bg-white/60 px-3.5 py-1.5 text-sm text-ink/80 transition-colors hover:border-ink hover:bg-white hover:text-ink"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </form>
          </div>

          <div className="rise-in rise-in-3 relative mx-2 mb-6 lg:mx-0">
            <div className="relative">
              <PlotCorners />
              <img
                src={heroEstate}
                alt="A street of two-storey homes lined with palm trees"
                className="aspect-[4/5] w-full object-cover object-[72%_50%] sm:aspect-[16/10] lg:aspect-[4/5]"
              />
            </div>
            <div className="absolute -bottom-6 left-4 flex max-w-[17rem] items-start gap-3 rounded-xl bg-white p-4 shadow-[0_18px_40px_rgba(12,42,30,0.18)] sm:-left-8">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-leaf text-white">
                <BadgeCheck className="h-4 w-4" />
              </span>
              <p className="text-sm leading-snug text-ink/70">
                <span className="block font-semibold text-ink">Look for the Verified mark</span>
                It shows on listings whose details have been checked.
              </p>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4 border-t border-ink/15 pt-8">
            <h2 className="font-display text-3xl font-bold tracking-[-0.035em] text-ink sm:text-4xl">
              Or start with what you're after
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
      </main>

      <SiteFooter />
    </div>
  );
};

export default Index;
