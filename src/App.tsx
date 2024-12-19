import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Character from "./pages/Character";
import Onboarding from "./pages/Onboarding";
import ScenarioHub from "./pages/ScenarioHub";
import GuidedChat from "./pages/GuidedChat";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/character" element={<Character />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/scenario-hub" element={<ScenarioHub />} />
        <Route path="/guided-chat" element={<GuidedChat />} />
      </Routes>
    </Router>
  );
}

export default App;