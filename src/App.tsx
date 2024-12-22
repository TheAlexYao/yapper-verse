import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthGuard } from "@/components/auth/AuthGuard";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import OnboardingWizard from "@/pages/Onboarding";
import ScenarioHub from "@/pages/ScenarioHub";
import Character from "@/pages/Character";
import GuidedChat from "@/pages/GuidedChat";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import ScenarioFeedback from "@/pages/ScenarioFeedback";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Create a client
const queryClient = new QueryClient();

// Callback component to handle auth redirects
const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Clean URL and redirect
    const path = window.location.pathname;
    window.history.replaceState({}, '', '/auth');
    navigate('/auth', { replace: true });
  }, [navigate]);

  return null;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionContextProvider supabaseClient={supabase}>
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route
              path="/onboarding"
              element={
                <AuthGuard>
                  <OnboardingWizard />
                </AuthGuard>
              }
            />
            <Route
              path="/scenarios"
              element={
                <AuthGuard>
                  <ScenarioHub />
                </AuthGuard>
              }
            />
            <Route
              path="/character"
              element={
                <AuthGuard>
                  <Character />
                </AuthGuard>
              }
            />
            <Route
              path="/chat"
              element={
                <AuthGuard>
                  <GuidedChat />
                </AuthGuard>
              }
            />
            <Route
              path="/dashboard"
              element={
                <AuthGuard>
                  <Dashboard />
                </AuthGuard>
              }
            />
            <Route
              path="/profile"
              element={
                <AuthGuard>
                  <Profile />
                </AuthGuard>
              }
            />
            <Route
              path="/feedback"
              element={
                <AuthGuard>
                  <ScenarioFeedback />
                </AuthGuard>
              }
            />
          </Routes>
        </Router>
      </SessionContextProvider>
    </QueryClientProvider>
  );
}

export default App;