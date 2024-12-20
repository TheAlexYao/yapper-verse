import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import OnboardingWizard from "@/pages/Onboarding";
import ScenarioHub from "@/pages/ScenarioHub";
import Character from "@/pages/Character";
import GuidedChat from "@/pages/GuidedChat";
import Dashboard from "@/pages/Dashboard";
import Profile from "@/pages/Profile";
import ScenarioFeedback from "@/pages/ScenarioFeedback";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/onboarding" element={<OnboardingWizard />} />
        <Route path="/scenarios" element={<ScenarioHub />} />
        <Route path="/character" element={<Character />} />
        <Route path="/chat" element={<GuidedChat />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/feedback" element={<ScenarioFeedback />} />
      </Routes>
    </Router>
  );
}

export default App;