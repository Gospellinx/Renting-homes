import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import logo from "@/assets/homes-logo.png";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  UserCircle,
  Building2,
  Star,
  MessageSquare,
  Heart,
  LogOut,
  Menu,
  X
} from "lucide-react";
import ProfileCompletionModal from "./ProfileCompletionModal";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const navItems = [
    { label: "Dashboard", path: "/dashboard/user", icon: LayoutDashboard },
    { label: "My Profile", path: "/profile", icon: UserCircle },
    { label: "My Properties", path: "/dashboard/manager", icon: Building2 },
    { label: "Profile Reviews", path: "#", icon: Star },
    { label: "Property Reviews", path: "#", icon: MessageSquare },
    { label: "Favorites", path: "#", icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col">
      {/* Top Green Bar */}
      <div className="bg-[#5cb85c] text-white px-4 py-2 flex justify-between items-center text-sm">
        <div className="flex items-center gap-2">
          {/* WhatsApp number removed as requested */}
        </div>
        <div className="flex items-center gap-4">
          <Link to="/dashboard/user" className="hover:underline">Dashboard</Link>
          <button onClick={handleSignOut} className="hover:underline">Sign Out</button>
        </div>
      </div>

      {/* Secondary White Bar */}
      <header className="bg-white border-b sticky top-0 z-30">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 rounded-md hover:bg-gray-100 text-gray-700 transition-colors"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link to="/" className="flex items-center">
              <img src={logo} alt="Homes" className="h-12 w-auto" />
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center gap-6 font-medium text-gray-700">
            <Link to="/" className="hover:text-[#5cb85c]">Home</Link>
            <Link to="/buy-property" className="hover:text-[#5cb85c]">Buy</Link>
            <Link to="/rental-properties" className="hover:text-[#5cb85c]">Rent</Link>
            <Link to="/short-let" className="hover:text-[#5cb85c]">Short Let</Link>
            <Link to="/sellers" className="hover:text-[#5cb85c]">Sellers</Link>
            <Link to="/affiliates" className="hover:text-[#5cb85c]">Affiliates</Link>
            <Button asChild className="bg-[#1f1a54] text-white hover:bg-[#15113d]">
              <Link to="/upload-property">List A Property</Link>
            </Button>
          </nav>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside 
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-64 bg-[#5cb85c] text-white flex flex-col transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex justify-end p-4 md:hidden">
            <button onClick={() => setIsSidebarOpen(false)}>
              <X className="h-6 w-6 text-white hover:text-gray-200 transition-colors" />
            </button>
          </div>
          <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-6 py-3 transition-colors ${
                    isActive ? "bg-white/20 border-l-4 border-white font-medium" : "hover:bg-white/10"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          
          <div className="p-4 border-t border-white/20">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-2 w-full text-left hover:bg-white/10 transition-colors rounded"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto w-full">
          {children}
        </main>
      </div>

      <ProfileCompletionModal />
    </div>
  );
};

export default DashboardLayout;
