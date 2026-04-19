import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import RentalProperties from "./pages/RentalProperties";
import BuyProperty from "./pages/BuyProperty";
import BuyLand from "./pages/BuyLand";
import VerifyProperty from "./pages/VerifyProperty";
import Community from "./pages/Community";
import JointVentures from "./pages/JointVentures";
import UploadProperty from "./pages/UploadProperty";
import VerifiedMerchants from "./pages/VerifiedMerchants";
import NotFound from "./pages/NotFound";
import PropertyTour from "./pages/PropertyTour";
import PropertyDetails from "./pages/PropertyDetails";
import VirtualTour360 from "./pages/VirtualTour360";
import CompareProperties from "./pages/CompareProperties";
import SearchResults from "./pages/SearchResults";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import AdminDashboard from "./pages/AdminDashboard";
import GroupChats from "./pages/GroupChats";
import AdsManager from "./pages/AdsManager";
import ShopRentals from "./pages/ShopRentals";
import FloatingQuickActions from "./components/FloatingQuickActions";
import ChatBot from "./components/ChatBot";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/rental-properties" element={<RentalProperties />} />
            <Route path="/buy-property" element={<BuyProperty />} />
            <Route path="/buy-land" element={<BuyLand />} />
            <Route path="/verify-property" element={<VerifyProperty />} />
            <Route path="/community" element={<Community />} />
            <Route path="/joint-ventures" element={<JointVentures />} />
            <Route path="/upload-property" element={<UploadProperty />} />
            <Route path="/verified-merchants" element={<VerifiedMerchants />} />
            <Route path="/property-tour/:type/:id" element={<PropertyTour />} />
            <Route path="/property/:type/:id" element={<PropertyDetails />} />
            <Route path="/virtual-tour/:type/:id" element={<VirtualTour360 />} />
            <Route path="/compare-properties" element={<CompareProperties />} />
            <Route path="/search" element={<SearchResults />} />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/messages" 
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/group-chats" 
              element={
                <ProtectedRoute>
                  <GroupChats />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/ads-manager" 
              element={
                <ProtectedRoute>
                  <AdsManager />
                </ProtectedRoute>
              } 
            />
            <Route path="/shop-rentals" element={<ShopRentals />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <FloatingQuickActions />
          <ChatBot />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
