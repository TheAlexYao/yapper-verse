import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
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

function App() {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
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
  );
}

export default App;