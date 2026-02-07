import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import BrowseRooms from "./pages/BrowseRooms";
import BrowseRoommates from "./pages/BrowseRoommates";
import RoomDetails from "./pages/RoomDetails";
import RoommateDetails from "./pages/RoommateDetails";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import ListRoom from "./pages/ListRoom";
import Admin from "./pages/Admin";
import AdminVerification from "./pages/AdminVerification";
import AdminPayouts from "./pages/AdminPayouts";
import AdminSafetyCenter from "./pages/AdminSafetyCenter";
import MyViewings from "./pages/MyViewings";
import Chats from "./pages/Chats";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import SafetyTips from "./pages/SafetyTips";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Refund from "./pages/Refund";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/rooms" element={<BrowseRooms />} />
              <Route path="/rooms/:id" element={<RoomDetails />} />
              <Route path="/roommates" element={<BrowseRoommates />} />
              <Route path="/roommates/:id" element={<RoommateDetails />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/list-room" element={<ListRoom />} />
              <Route path="/my-viewings" element={<MyViewings />} />
              <Route path="/chats" element={<Chats />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/verification" element={<AdminVerification />} />
              <Route path="/admin/payouts" element={<AdminPayouts />} />
              <Route path="/admin/safety" element={<AdminSafetyCenter />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/safety-tips" element={<SafetyTips />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/refund" element={<Refund />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
