import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Character = () => {
  const navigate = useNavigate();
  const [selectedCharacter, setSelectedCharacter] = React.useState(null);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b bg-card px-4 py-3">
        <h1 className="text-2xl font-bold">Choose Your Character</h1>
      </header>
      
      <div className="flex flex-1 flex-col items-center justify-center p-4">
        <h1 className="mb-2 text-center text-4xl font-bold">
          Let's have a conversation!
        </h1>
        <p className="mb-8 text-center text-lg text-muted-foreground">
          Who do you want to talk to?
        </p>
        
        {/* Character selection section */}
        <div className="flex space-x-4">
          {/* Example character buttons */}
          <Button onClick={() => setSelectedCharacter("Marie")}>Marie</Button>
          <Button onClick={() => setSelectedCharacter("Jean")}>Jean</Button>
        </div>
        
        <Button
          className="mt-8"
          size="lg"
          onClick={() => navigate("/guided-chat")}
          disabled={!selectedCharacter}
        >
          Let's Get Started
        </Button>
      </div>
    </div>
  );
};

export default Character;
