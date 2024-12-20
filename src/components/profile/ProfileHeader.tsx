import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function ProfileHeader() {
  const navigate = useNavigate();
  
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-4">
        <Button
          variant="ghost"
          className="hover:bg-background/60"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    </header>
  );
}