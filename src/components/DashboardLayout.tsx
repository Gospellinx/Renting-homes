import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import logo from "@/assets/homes-logo.png";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  UserCircle,
  Building2,
  Star,
  MessageSquare,
  Heart,
  LogOut,
} from "lucide-react";
import ProfileCompletionModal from "./ProfileCompletionModal";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
          <span>WhatsApp: +234 816 168 6883</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/dashboard/user" className="hover:underline">Dashboard</Link>
          <button onClick={handleSignOut} className="hover:underline">Sign Out</button>
        </div>
      </div>

      {/* Secondary White Bar */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center">
            <img src={logo} alt="Homes" className="h-12 w-auto" />
          </Link>
          
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

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 bg-[#5cb85c] text-white hidden md:flex flex-col">
          <nav className="flex-1 py-6 space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
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
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      <ProfileCompletionModal />
    </div>
  );
};

export default DashboardLayout;
