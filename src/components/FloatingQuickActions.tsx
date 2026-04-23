import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
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

  const actions = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/profile", color: "bg-slate-700", requiresAuth: true },
    { icon: Upload, label: "Upload Property", href: "/upload-property", color: "bg-primary" },
    { icon: Home, label: "Rent Property", href: "/rental-properties", color: "bg-blue-500" },
    { icon: Store, label: "Rent a Shop", href: "/shop-rentals", color: "bg-amber-500" },
    { icon: Building, label: "Buy Property", href: "/buy-property", color: "bg-orange-500" },
    { icon: Handshake, label: "Joint Ventures", href: "/joint-ventures", color: "bg-purple-500" },
    { icon: Megaphone, label: "Ads Manager", href: "/ads-manager", color: "bg-pink-500", requiresAuth: true },
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
            <div className="bg-card border shadow-xl rounded-2xl p-3 min-w-[200px]">
              <p className="text-xs text-muted-foreground mb-2 px-2">Quick Actions</p>
              <div className="space-y-1">
                {actions.map((action) => (
                  <button
                    key={action.href}
                    type="button"
                    onClick={() => handleActionClick(action.href, action.requiresAuth)}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors group text-left"
                  >
                    <div className={`p-1.5 rounded-lg ${action.color} text-white`}>
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
        size="lg"
        className={`h-14 w-14 rounded-full shadow-lg transition-all duration-300 ${
          isOpen ? "rotate-45 bg-muted-foreground hover:bg-muted-foreground" : ""
        }`}
      >
        {isOpen ? <X className="h-6 w-6" /> : <Plus className="h-6 w-6" />}
      </Button>
    </div>
  );
};

export default FloatingQuickActions;
