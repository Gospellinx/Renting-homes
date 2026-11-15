import { useState, useRef, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Bot, ArrowLeft, MapPin, Bed, Bath, Square, Eye, UserRound } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { allProperties, Property } from "@/data/mockProperties";
import { smartMockStreamChat, ChatMessage } from "@/lib/mockAI";
import { ExternalLink } from "lucide-react";

type Message = ChatMessage;

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/property-chatbot`;



// allProperties imported from @/data/mockProperties
const quickSuggestions = [
  "Find me a 3-bedroom in Lekki",
  "Any JV opportunities in Abuja?",
  "Shops for rent in Lagos",
  "How do I verify a property?",
];

const AISearch = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const navigate = useNavigate();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // A simple heuristic for demonstrating filtering based on conversation context
  // In a real app, the AI could return JSON of search filters along with its message.
  const [displayedProperties, setDisplayedProperties] = useState<Property[]>(allProperties);
  const [isSearchingWeb, setIsSearchingWeb] = useState(false);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (initialQuery && messages.length === 0) {
      send(initialQuery);
    } else if (messages.length === 0) {
      // Just show default prompt
    }
  }, [initialQuery]);

  useEffect(() => {
    // Simple mock filter based on conversation history
    const history = messages.map(m => m.content.toLowerCase()).join(" ");
    
    let filtered = allProperties;
    
    if (history.includes("lekki")) {
      filtered = filtered.filter(p => p.location.toLowerCase().includes("lekki"));
    } else if (history.includes("abuja") || history.includes("asokoro") || history.includes("maitama") || history.includes("wuse") || history.includes("garki") || history.includes("gwarinpa")) {
      filtered = filtered.filter(p => p.location.toLowerCase().includes("abuja"));
    }
    
    if (history.includes("rent")) {
      filtered = filtered.filter(p => p.type === "rent");
    } else if (history.includes("buy") || history.includes("sale")) {
      filtered = filtered.filter(p => p.type === "sale");
    }

    if (history.includes("shop") || history.includes("store") || history.includes("retail")) {
      filtered = filtered.filter(p => p.propertyType.toLowerCase() === "shop" || p.propertyType.toLowerCase() === "commercial");
    } else if (history.includes("3 bedroom") || history.includes("3 bed")) {
      filtered = filtered.filter(p => p.beds >= 3);
    }
    
    setDisplayedProperties(filtered);
  }, [messages]);

  const send = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((p) => [...p, userMsg]);
    setInput("");
    setIsLoading(true);

    let assistantSoFar = "";
    const upsert = (chunk: string) => {
      assistantSoFar += chunk;
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        if (last?.role === "assistant") {
          return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
        }
        return [...prev, { role: "assistant", content: assistantSoFar }];
      });
    };

    try {
      await smartMockStreamChat({
        messages: [...messages, userMsg],
        onDelta: upsert,
        onDone: () => setIsLoading(false),
        isMainSearch: true,
      });
      
      // Wait a short tick for state to update filtering
      setTimeout(() => {
        checkAndTriggerWebSearch([...messages, userMsg].map(m => m.content.toLowerCase()).join(" "));
      }, 500);

    } catch {
      setMessages((p) => [...p, { role: "assistant", content: "⚠️ Connection error. Please try again." }]);
      setIsLoading(false);
    }
  };

  const checkAndTriggerWebSearch = async (history: string) => {
    // If we have no local properties matching, we trigger web search
    setDisplayedProperties((currentDisplayed) => {
      if (currentDisplayed.length === 0 && !isSearchingWeb && history.length > 0) {
        triggerWebSearch(history);
      }
      return currentDisplayed;
    });
  };

  const triggerWebSearch = async (history: string) => {
    setIsSearchingWeb(true);
    setMessages((p) => [
      ...p,
      { role: "assistant", content: "I couldn't find exactly what you're looking for in our local database. Let me search the web for available properties..." }
    ]);

    // Simulate network delay for Google search
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate simulated external results
    const locationStr = history.includes("london") ? "London, UK" : 
                        history.includes("new york") ? "New York, USA" : 
                        history.includes("dubai") ? "Dubai, UAE" : "Global Area";
                        
    const propertyTypeStr = history.includes("shop") ? "Commercial Shop" : 
                            history.includes("villa") ? "Luxury Villa" : 
                            history.includes("mansion") ? "Mansion" : "Property";

    const typeStr = history.includes("rent") ? "rent" : "sale";

    const mockWebResults: Property[] = [
      {
        id: Math.floor(Math.random() * 10000) + 1000,
        type: typeStr as "rent" | "sale",
        title: `External Web Listing: ${propertyTypeStr}`,
        location: locationStr,
        price: typeStr === "rent" ? "$2,500/mo" : "$450,000",
        beds: history.includes("3") ? 3 : 2,
        baths: history.includes("3") ? 3 : 2,
        size: "1,500 sqft",
        image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=400",
        verified: false,
        featured: false,
        propertyType: propertyTypeStr,
        isExternal: true,
        externalUrl: `https://www.google.com/search?q=${encodeURIComponent(propertyTypeStr + " in " + locationStr + " for " + typeStr)}`
      },
      {
        id: Math.floor(Math.random() * 10000) + 1000,
        type: typeStr as "rent" | "sale",
        title: `Google Result: Modern ${propertyTypeStr}`,
        location: locationStr,
        price: typeStr === "rent" ? "$3,200/mo" : "$580,000",
        beds: history.includes("3") ? 4 : 3,
        baths: history.includes("3") ? 3 : 2,
        size: "2,200 sqft",
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400",
        verified: false,
        featured: false,
        propertyType: propertyTypeStr,
        isExternal: true,
        externalUrl: `https://www.google.com/search?q=${encodeURIComponent(propertyTypeStr + " in " + locationStr + " for " + typeStr)}`
      }
    ];

    setDisplayedProperties(mockWebResults);
    setIsSearchingWeb(false);
    
    setMessages((p) => [
      ...p,
      { role: "assistant", content: `I found some external listings for you on the web! Let me know if you want to explore any of these.` }
    ]);
  };

  return (
    <div className="flex h-screen w-full flex-col bg-[linear-gradient(180deg,#f2f4fb_0%,#f7f7fb_42%,#f4f1ec_100%)]">
      {/* Header */}
      <header className="relative z-40 flex h-16 shrink-0 items-center justify-between border-b border-[#dce3da] bg-white/80 px-4 backdrop-blur supports-[backdrop-filter]:bg-white/60 sm:px-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="text-[#0c2a1e] hover:bg-[#e8efe6] hover:text-[#0f3d2a]">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col">
            <h1 className="text-lg font-bold leading-tight text-[#0c2a1e] flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              AI Search Assistant
            </h1>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild className="hidden sm:flex border-[#dce3da] text-[#0c2a1e] hover:bg-[#e8efe6] hover:text-[#0f3d2a]">
          <Link to="/">Back to Home</Link>
        </Button>
      </header>

      <div className="flex flex-1 overflow-hidden flex-col md:flex-row">
        {/* Left pane: AI Chat */}
        <div className="flex w-full flex-col border-r border-[#dce3da] bg-white/50 md:w-[400px] lg:w-[450px]">
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="space-y-4 pt-4">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Bot className="h-6 w-6" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-[#0c2a1e]">HomesNG AI</h3>
                  <p className="text-sm text-muted-foreground mt-1">Tell me what you're looking for, your budget, or location.</p>
                </div>
                <div className="grid grid-cols-1 gap-2 pt-2">
                  {quickSuggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-left text-sm px-4 py-3 rounded-xl border border-[#dce3da] bg-white hover:border-[#bfd1c2] hover:bg-[#f7f9f5] transition-all text-[#5b6b62] shadow-sm"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <AnimatePresence>
              {messages.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  key={i} 
                  className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {m.role === "assistant" && (
                    <Avatar className="h-8 w-8 shrink-0 shadow-sm border border-[#dce3da]">
                      <AvatarFallback className="bg-[#e8efe6] text-[#1e8e4e]"><Bot className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                      m.role === "user"
                        ? "bg-[#0f3d2a] text-white rounded-br-sm"
                        : "bg-white border border-[#dce3da] text-[#0c2a1e] rounded-bl-sm"
                    }`}
                  >
                    {m.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none [&>p]:m-0 [&>ul]:mt-1 [&>ol]:mt-1 text-[#5b6b62]">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    ) : (
                      m.content
                    )}
                  </div>
                  {m.role === "user" && (
                    <Avatar className="h-8 w-8 shrink-0 shadow-sm">
                      <AvatarFallback className="bg-[#0f3d2a] text-white"><UserRound className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            
            {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
              <div className="flex justify-start">
                <div className="bg-white border border-[#dce3da] rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-[#74837a]" />
                </div>
              </div>
            )}
          </div>

          <div className="p-4 bg-white border-t border-[#dce3da]">
            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="flex items-center gap-2 rounded-full border border-[#dce3da] bg-[#f7f9f5] p-1.5 shadow-sm focus-within:border-[#bfd1c2] focus-within:ring-1 focus-within:ring-[#bfd1c2]"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about properties..."
                disabled={isLoading}
                className="flex-1 bg-transparent px-3 text-sm outline-none placeholder:text-[#9aa69f] text-[#0c2a1e] disabled:opacity-50"
              />
              <Button 
                type="submit" 
                size="icon" 
                className="rounded-full bg-[#0f3d2a] text-white hover:bg-[#0a2e1f] h-9 w-9 shrink-0" 
                disabled={isLoading || !input.trim()}
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Right pane: Property Results */}
        <div className="flex-1 flex flex-col bg-transparent overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-[#dce3da]/50 bg-white/30 backdrop-blur-sm flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#0c2a1e]">
              {isSearchingWeb ? "Searching the web..." : `${displayedProperties.length} Properties Found`}
            </h2>
            <p className="text-sm text-muted-foreground hidden sm:block">
              {isSearchingWeb ? "Pulling external data" : "Results update automatically as you chat"}
            </p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            {isSearchingWeb ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <Loader2 className="h-10 w-10 animate-spin text-[#1e8e4e] mb-4" />
                <h3 className="text-lg font-semibold text-[#0c2a1e] mb-1">Searching Google...</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  We're looking across the web for available properties that match your criteria.
                </p>
              </div>
            ) : displayedProperties.length > 0 ? (
              <AnimatePresence>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  {displayedProperties.map((property) => (
                    <motion.div 
                      key={`${property.type}-${property.id}`}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="h-full overflow-hidden hover:shadow-lg transition-shadow group border-[#dce3da] shadow-sm">
                        <div className="relative">
                          <img
                            src={property.image}
                            alt={property.title}
                            className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-2 left-2 flex gap-1.5">
                            {property.verified && !property.isExternal && (
                              <Badge className="bg-primary/90 text-primary-foreground text-[10px] px-1.5 py-0">Verified</Badge>
                            )}
                            {property.isExternal && (
                              <Badge className="bg-[#4285F4] text-white text-[10px] px-1.5 py-0 shadow-sm border border-blue-600">Web Result</Badge>
                            )}
                            <Badge variant="secondary" className="capitalize text-[10px] px-1.5 py-0 bg-white/90 text-black">
                              {property.type === "rent" ? "Rent" : "Sale"}
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <h3 className="font-semibold text-sm mb-1 line-clamp-1 text-[#0c2a1e]">
                            {property.isExternal ? <ExternalLink className="inline h-3 w-3 mr-1 text-[#4285F4]" /> : null}
                            {property.title}
                          </h3>
                          <div className="flex items-center text-muted-foreground text-xs mb-2">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="truncate">{property.location}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                            <span className="flex items-center">
                              <Bed className="h-3 w-3 mr-1" />
                              {property.beds}
                            </span>
                            <span className="flex items-center">
                              <Bath className="h-3 w-3 mr-1" />
                              {property.baths}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-base font-bold text-[#0f3d2a]">{property.price}</span>
                            {property.isExternal ? (
                              <Button size="sm" variant="outline" className="h-8 px-2 border-[#dce3da] text-[#5b6b62] hover:bg-[#e8efe6] hover:text-[#0f3d2a]" onClick={() => window.open(property.externalUrl, '_blank')}>
                                View Web
                              </Button>
                            ) : (
                              <Button size="sm" variant="ghost" className="h-8 px-2 text-[#5b6b62] hover:bg-[#e8efe6] hover:text-[#0f3d2a]" asChild>
                                <Link to={`/property/${property.type}/${property.id}`}>
                                  View
                                </Link>
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </AnimatePresence>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="h-16 w-16 rounded-full bg-white border border-[#dce3da] flex items-center justify-center mb-4 shadow-sm">
                  <Search className="h-6 w-6 text-[#74837a]" />
                </div>
                <h3 className="text-lg font-semibold text-[#0c2a1e] mb-1">No matches found</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Try asking the AI to show you different locations, property types, or a broader budget range.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AISearch;
