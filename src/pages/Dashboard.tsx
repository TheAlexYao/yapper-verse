import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AddLanguageModal } from "@/components/dashboard/AddLanguageModal";
import { LanguageSelector } from "@/components/dashboard/LanguageSelector";
import { DailyTip } from "@/components/dashboard/DailyTip";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { UserGreeting } from "@/components/dashboard/UserGreeting";
import { Bell, User, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [isAddLanguageOpen, setIsAddLanguageOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState("fr-FR");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account",
      });
      
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <h1 
            onClick={() => navigate("/dashboard")}
            className="text-2xl font-bold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent cursor-pointer"
          >
            Yapper
          </h1>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate("/profile")}>
              <User className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleSignOut}
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <UserGreeting />
        
        <section className="space-y-4">
          <LanguageSelector 
            currentLanguage={currentLanguage}
            onLanguageChange={setCurrentLanguage}
            onAddLanguage={() => setIsAddLanguageOpen(true)}
          />
        </section>

        <QuickActions currentLanguage={currentLanguage} />
        
        <DailyTip language={currentLanguage} />
      </main>

      <AddLanguageModal 
        open={isAddLanguageOpen} 
        onOpenChange={setIsAddLanguageOpen}
      />
    </div>
  );
}