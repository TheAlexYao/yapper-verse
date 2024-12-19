import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import OnboardingWizard from "@/pages/Onboarding";
import ScenarioHub from "@/pages/ScenarioHub";
import Character from "@/pages/Character";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/onboarding" element={<OnboardingWizard />} />
        <Route path="/scenarios" element={<ScenarioHub />} />
        <Route path="/character" element={<Character />} />
      </Routes>
    </Router>
  );
}

export default App;