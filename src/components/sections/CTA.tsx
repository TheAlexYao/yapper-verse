import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CTA = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#38b6ff]/10 to-[#7843e6]/10" />
      <div className="container mx-auto px-4 text-center relative">
        <h2 className="text-4xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">
          Ready to Start Your Adventure?
        </h2>
        <p className="text-2xl md:text-3xl text-muted-foreground mb-10 max-w-3xl mx-auto">
          Join thousands of language explorers discovering new worlds through conversation.
        </p>
        <Button 
          size="xl"
          className="bg-[#7843e6] hover:bg-[#7843e6]/90 hover:scale-105 transform transition-all duration-200 shadow-[0_0_15px_rgba(120,67,230,0.3)] hover:shadow-[0_0_25px_rgba(120,67,230,0.5)] text-xl py-6 px-8"
          onClick={() => navigate('/auth')}
        >
          Begin Your Journey
        </Button>
      </div>
    </section>
  );
};

export default CTA;