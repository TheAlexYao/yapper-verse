import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Globe, MessageSquare, Star, Users } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed w-full bg-background/80 backdrop-blur-sm z-50 border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent hover:scale-105 transition-transform cursor-pointer">
            Yapper
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#how-it-works" className="text-foreground/80 hover:text-foreground transition-colors hover:scale-105">
              How It Works
            </a>
            <a href="#features" className="text-foreground/80 hover:text-foreground transition-colors hover:scale-105">
              Features
            </a>
            <Button 
              variant="default" 
              className="bg-[#7843e6] hover:bg-[#7843e6]/90 hover:scale-105 transform transition-all duration-200 shadow-[0_0_15px_rgba(120,67,230,0.3)] hover:shadow-[0_0_25px_rgba(120,67,230,0.5)]"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#38b6ff]/10 via-transparent to-[#7843e6]/10" />
        <div className="container mx-auto text-center relative">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fadeIn opacity-0" style={{ animationDelay: "0.2s" }}>
            Learn to Speak a New Language by{" "}
            <span className="bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">
              Actually Talking
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fadeIn opacity-0" style={{ animationDelay: "0.4s" }}>
            Yapper uses real-world scenarios and AI-driven conversations to help you gain confidence and fluency.
          </p>
          <Button 
            size="lg" 
            className="bg-[#38b6ff] hover:bg-[#38b6ff]/90 animate-fadeIn opacity-0 hover:scale-105 transform transition-all duration-200 shadow-[0_0_15px_rgba(56,182,255,0.3)] hover:shadow-[0_0_25px_rgba(56,182,255,0.5)]" 
            style={{ animationDelay: "0.6s" }}
          >
            Start Learning Now
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#38b6ff]/5 via-transparent to-[#7843e6]/5" />
        <div className="container mx-auto px-4 relative">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">
            Why Choose Yapper
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<MessageSquare className="w-8 h-8 text-[#38b6ff]" />}
              title="Real Conversations"
              description="Practice with AI characters in realistic scenarios"
              delay={0.2}
            />
            <FeatureCard
              icon={<Globe className="w-8 h-8 text-[#38b6ff]" />}
              title="Cultural Context"
              description="Learn language within its cultural framework"
              delay={0.4}
            />
            <FeatureCard
              icon={<Users className="w-8 h-8 text-[#38b6ff]" />}
              title="Personalized Learning"
              description="Adaptive system that grows with you"
              delay={0.6}
            />
            <FeatureCard
              icon={<Star className="w-8 h-8 text-[#38b6ff]" />}
              title="Instant Feedback"
              description="Get real-time pronunciation assessment"
              delay={0.8}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-bl from-[#38b6ff]/5 via-transparent to-[#7843e6]/5" />
        <div className="container mx-auto px-4 relative">
          <h2 className="text-3xl font-bold text-center mb-12 bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">
            How It Works
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <StepCard
              number="01"
              title="Set Your Preferences"
              description="Choose your native language, target language, and learning goals"
              delay={0.2}
            />
            <StepCard
              number="02"
              title="Select a Scenario"
              description="Pick from pre-built scenarios or create your own"
              delay={0.4}
            />
            <StepCard
              number="03"
              title="Practice Speaking"
              description="Engage in natural conversations with AI characters"
              delay={0.6}
            />
            <StepCard
              number="04"
              title="Track Progress"
              description="Get feedback and watch your skills improve"
              delay={0.8}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#38b6ff]/10 to-[#7843e6]/10" />
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">
            Ready to Start Speaking Confidently?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are already improving their language skills with Yapper.
          </p>
          <Button 
            size="lg" 
            className="bg-[#7843e6] hover:bg-[#7843e6]/90 hover:scale-105 transform transition-all duration-200 shadow-[0_0_15px_rgba(120,67,230,0.3)] hover:shadow-[0_0_25px_rgba(120,67,230,0.5)]"
          >
            Create Your Account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              © 2024 Yapper. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:scale-105">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:scale-105">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors hover:scale-105">
                Contact
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description, delay }: { icon: React.ReactNode; title: string; description: string; delay: number }) => (
  <Card className="p-6 animate-fadeIn opacity-0 hover:scale-105 transform transition-all duration-200 bg-gradient-to-br from-white to-[#38b6ff]/5 border border-[#38b6ff]/10 shadow-lg hover:shadow-xl" style={{ animationDelay: `${delay}s` }}>
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </Card>
);

const StepCard = ({ number, title, description, delay }: { number: string; title: string; description: string; delay: number }) => (
  <div className="animate-fadeIn opacity-0 hover:scale-105 transform transition-all duration-200 p-6 rounded-lg bg-gradient-to-br from-white to-[#7843e6]/5 border border-[#7843e6]/10 shadow-lg hover:shadow-xl" style={{ animationDelay: `${delay}s` }}>
    <div className="text-4xl font-bold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent mb-4">{number}</div>
    <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default Index;