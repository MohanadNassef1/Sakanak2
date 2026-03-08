import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useProfileCompletionGuard } from "@/hooks/useProfileCompletionGuard";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import BrowseRooms from "./pages/BrowseRooms";
import RoomDetails from "./pages/RoomDetails";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import ListRoom from "./pages/ListRoom";
import EditRoom from "./pages/EditRoom";
import VerifyIdentity from "./pages/VerifyIdentity";
import Admin from "./pages/Admin";
import AdminVerification from "./pages/AdminVerification";
import AdminFeaturedRooms from "./pages/AdminFeaturedRooms";
import AdminPayouts from "./pages/AdminPayouts";
import AdminSafetyCenter from "./pages/AdminSafetyCenter";
import AdminReferrals from "./pages/AdminReferrals";
import AdminUsers from "./pages/AdminUsers";
import AdminUserProfile from "./pages/AdminUserProfile";
import AdminEmails from "./pages/AdminEmails";
import AdminRoomStatus from "./pages/AdminRoomStatus";
import AdminSupport from "./pages/AdminSupport";
import MyViewings from "./pages/MyViewings";
import Chats from "./pages/Chats";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import SafetyTips from "./pages/SafetyTips";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Refund from "./pages/Refund";
import ResetPassword from "./pages/ResetPassword";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";
import LocationLanding from "./pages/LocationLanding";
import CompleteProfile from "./pages/CompleteProfile";
import UserProfile from "./pages/UserProfile";

const queryClient = new QueryClient();

const AppRoutes = () => {
  useProfileCompletionGuard();

  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/complete-profile" element={<CompleteProfile />} />
      <Route path="/verify-identity" element={<VerifyIdentity />} />
      <Route path="/rooms" element={<BrowseRooms />} />
      <Route path="/rooms/:id" element={<RoomDetails />} />
      <Route path="/messages" element={<Messages />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/list-room" element={<ListRoom />} />
      <Route path="/edit-room/:id" element={<EditRoom />} />
      <Route path="/my-viewings" element={<MyViewings />} />
      <Route path="/chats" element={<Chats />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/admin/verification" element={<AdminVerification />} />
      <Route path="/admin/featured-rooms" element={<AdminFeaturedRooms />} />
      <Route path="/admin/payouts" element={<AdminPayouts />} />
      <Route path="/admin/safety" element={<AdminSafetyCenter />} />
      <Route path="/admin/referrals" element={<AdminReferrals />} />
      <Route path="/admin/users" element={<AdminUsers />} />
      <Route path="/admin/user/:userId" element={<AdminUserProfile />} />
      <Route path="/admin/emails" element={<AdminEmails />} />
      <Route path="/admin/room-status" element={<AdminRoomStatus />} />
      <Route path="/admin/support" element={<AdminSupport />} />
      <Route path="/user/:userId" element={<UserProfile />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/safety-tips" element={<SafetyTips />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/refund" element={<Refund />} />
      <Route path="/install" element={<Install />} />
      {/* SEO Location Landing Pages */}
      <Route path="/rooms-cairo" element={<LocationLanding />} />
      <Route path="/rooms-giza" element={<LocationLanding />} />
      <Route path="/roommates-cairo" element={<LocationLanding />} />
      <Route path="/roommates-giza" element={<LocationLanding />} />
      <Route path="/student-housing-cairo" element={<LocationLanding />} />
      <Route path="/:slug" element={<LocationLanding />} />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
