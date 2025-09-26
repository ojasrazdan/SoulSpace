import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { AccessibilityProvider, useAccessibility } from "@/hooks/AccessibilityContext";
import { LanguageProvider } from "@/hooks/LanguageContext";

// Core Components
import Header from "@/components/ui/header";
import { Chatbot } from "@/components/ui/chatbot";

// All Page Imports
import Home from "@/pages/Index";
import Profile from "@/pages/Profile";
import Resources from "@/pages/Resources";
import SOS from "@/pages/SOS";
import Assessment from "@/pages/Assessment";
import DailyCheckin from "@/pages/DailyCheckin";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/NotFound";
import DisabilityCheck from "@/pages/DisabilityCheck";
import Games from "@/pages/Games";
import Goals from "@/pages/Goals";
import Vault from "@/pages/Vault";
import Rewards from "@/pages/Rewards";
import Community from "@/pages/Community";
import Consultation from "@/pages/Consultation";
import StudentCompanion from "@/pages/StudentCompanion";
import AdminDashboard from "@/pages/AdminDashboard"; // Import the new Admin Dashboard
import Auth from "@/pages/Auth";
import { ChatbotTest } from "@/pages/ChatbotTest";

// Game imports
import ZenGarden from "@/pages/games/ZenGarden";
import FocusFlow from "@/pages/games/FocusFlow";
import BreathingOrb from "@/pages/games/BreathingOrb";

const RouteAnnouncer = () => {
  const location = useLocation();
  const { ttsEnabled, speakText } = useAccessibility();
  
  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
    
    // Accessibility announcement
    if (ttsEnabled) {
      const title = document.title || location.pathname.replace('/', '') || 'Home';
      speakText(`Navigated to ${title}`);
    }
  }, [location.pathname, ttsEnabled, speakText]);
  
  return null;
};

const AppRoutes = () => (
  <>
    <Header />
    <RouteAnnouncer />
    <Routes>
      {/* User-facing routes */}
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/resources" element={<Resources />} />
      <Route path="/sos" element={<SOS />} />
      <Route path="/assessment" element={<Assessment />} />
      <Route path="/daily-checkin" element={<DailyCheckin />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/disability-check" element={<DisabilityCheck />} />
      <Route path="/games" element={<Games />} />
      <Route path="/games/zen-garden" element={<ZenGarden />} />
      <Route path="/games/focus-flow" element={<FocusFlow />} />
      <Route path="/games/breathing-orb" element={<BreathingOrb />} />
      <Route path="/goals" element={<Goals />} />
      <Route path="/vault" element={<Vault />} />
      <Route path="/rewards" element={<Rewards />} />
      <Route path="/community" element={<Community />} />
      <Route path="/consultation" element={<Consultation />} />
      <Route path="/student-companion" element={<StudentCompanion />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/chatbot-test" element={<ChatbotTest />} />
      {/* Admin route */}
      <Route path="/admin" element={<AdminDashboard />} />
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
    <Toaster position="top-right" />
    <Chatbot />
  </>
);

const App = () => {
  return (
    <LanguageProvider>
      <AccessibilityProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AccessibilityProvider>
    </LanguageProvider>
  );
};

export default App;