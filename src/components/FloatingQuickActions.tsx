import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { getDashboardPathForUser } from "@/lib/dashboardPath";
import { 
  Plus, 
  X, 
  Upload, 
  Home, 
  Handshake, 
  Building, 
  Megaphone,
  Store,
  LayoutDashboard
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const FloatingQuickActions = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dashboardPath = getDashboardPathForUser(user);

  const actions = [
    { icon: LayoutDashboard, label: "Dashboard", href: dashboardPath, color: "bg-ink", requiresAuth: true },
    { icon: Upload, label: "Upload Property", href: "/upload-property", color: "bg-ink" },
    { icon: Home, label: "Rent Property", href: "/rental-properties", color: "bg-ink" },
    { icon: Store, label: "Rent a Shop", href: "/shop-rentals", color: "bg-ink" },
    { icon: Building, label: "Buy Property", href: "/buy-property", color: "bg-ink" },
    { icon: Handshake, label: "Joint Ventures", href: "/joint-ventures", color: "bg-ink" },
    { icon: Megaphone, label: "Ads Manager", href: "/ads-manager", color: "bg-ink", requiresAuth: true },
  ];

  const handleActionClick = (href: string, requiresAuth?: boolean) => {
    setIsOpen(false);

    if (requiresAuth && !user) {
      sessionStorage.setItem("auth_return_url", href);
      navigate("/auth?mode=signin");
      return;
    }

    navigate(href);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-16 right-0 mb-2"
          >
            <div className="min-w-[220px] rounded-2xl border border-ink/10 bg-white p-2 shadow-[0_24px_60px_rgba(12,42,30,0.22)]">
              <p className="plot-label px-3 pb-1 pt-2 text-ink/50">Go to</p>
              <div className="space-y-1">
                {actions.map((action) => (
                  <button
                    key={action.href}
                    type="button"
                    onClick={() => handleActionClick(action.href, action.requiresAuth)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors group text-left"
                  >
                    <div className={`p-1.5 rounded-lg ${action.color} text-beacon`}>
                      <action.icon className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium group-hover:text-primary transition-colors">
                      {action.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close quick actions" : "Open quick actions"}
        size="lg"
        className={`h-14 w-14 rounded-full bg-ink text-beacon shadow-[0_14px_30px_rgba(12,42,30,0.3)] transition-all duration-300 hover:bg-[#0f3d2a] ${
          isOpen ? "bg-[#0f3d2a]" : ""
        }`}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </Button>
    </div>
  );
};

export default FloatingQuickActions;
