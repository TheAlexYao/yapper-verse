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
    console.log('Auth Callback - Component mounted');
    const handleCallback = async () => {
      try {
        // Get the URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        if (error) {
          console.error('Auth Callback - Error:', error, errorDescription);
          navigate('/auth', { replace: true });
          return;
        }

        // Let Supabase handle the token exchange
        const { data, error: sessionError } = await supabase.auth.getSession();
        console.log('Auth Callback - Session check result:', data?.session ? 'Session present' : 'No session');
        
        if (sessionError) {
          console.error('Auth Callback - Session error:', sessionError);
          navigate('/auth', { replace: true });
          return;
        }

        if (data?.session) {
          console.log('Auth Callback - Valid session found, proceeding with auth flow');
          // The Auth component will handle the rest of the flow
          navigate('/auth', { replace: true });
        } else {
          console.log('Auth Callback - No session found, redirecting to auth');
          navigate('/auth', { replace: true });
        }
      } catch (error) {
        console.error('Auth Callback - Unexpected error:', error);
        navigate('/auth', { replace: true });
      }
    };

    handleCallback();
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