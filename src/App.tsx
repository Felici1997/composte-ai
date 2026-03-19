import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { LocationProvider } from "@/contexts/LocationContext";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import MobileAppBanner from '@/components/MobileAppBanner';
import Navbar from "@/components/Navbar";
import MobileNav from "@/components/MobileNav";
import MobileHeader from "@/components/MobileHeader";
import MobileHome from "@/pages/MobileHome";
import { useIsMobile } from "@/hooks/useIsMobile";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import Recommendations from "./pages/Recommendations";
import DiseaseScanner from "./pages/DiseaseScanner";
import Market from "./pages/Market";
import Weather from "./pages/Weather";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import SoilAnalysis from "./pages/SoilAnalysis";
import WeatherAnalytics from "./pages/WeatherAnalytics";
import AIAssistant from "./pages/AIAssistant";

const queryClient = new QueryClient();

// Layout interne — accès au hook useIsMobile et useLocation
function AppLayout() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const isAuth   = location.pathname === '/auth';

  return (
    <>
      {/* Desktop : navbar top */}
      {!isMobile && <Navbar />}

      {/* Mobile : header compact + accueil mobile */}
      {isMobile && !isAuth && <MobileHeader />}

      <Routes>
        {/* Route d'accueil : desktop → landing, mobile → dashboard app */}
        <Route path="/" element={isMobile ? <MobileHome /> : <Index />} />
        <Route path="/dashboard" element={isMobile ? <MobileHome /> : <Dashboard />} />

        {/* Routes communes */}
        <Route path="/auth"           element={<Auth />} />
        <Route path="/recommendations"element={<Recommendations />} />
        <Route path="/disease-scanner"element={<DiseaseScanner />} />
        <Route path="/market"         element={<Market />} />
        <Route path="/weather"        element={<Weather />} />
        <Route path="/soil-analysis"  element={<SoilAnalysis />} />
        <Route path="/weather-analytics" element={<WeatherAnalytics />} />
        <Route path="/ai-assistant"   element={<AIAssistant />} />
        <Route path="/profile"        element={<Profile />} />
        <Route path="*"               element={<NotFound />} />
      </Routes>

      {/* Mobile : barre de navigation bottom */}
      {isMobile && !isAuth && <MobileNav />}
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <LocationProvider>
      <TooltipProvider>
      <Toaster />
      <Sonner />
      <MobileAppBanner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <AppLayout />
      </BrowserRouter>
      </TooltipProvider>
      </LocationProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
