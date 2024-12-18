import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Globe, MessageSquare, Star, Users } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed w-full bg-background/80 backdrop-blur-sm z-50 border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-yapper-teal to-yapper-indigo bg-clip-text text-transparent">
            Yapper
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#how-it-works" className="text-foreground/80 hover:text-foreground transition-colors">
              How It Works
            </a>
            <a href="#features" className="text-foreground/80 hover:text-foreground transition-colors">
              Features
            </a>
            <Button variant="default" className="bg-yapper-indigo hover:bg-yapper-indigo/90">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fadeIn opacity-0" style={{ animationDelay: "0.2s" }}>
            Learn to Speak a New Language by Actually Talking
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fadeIn opacity-0" style={{ animationDelay: "0.4s" }}>
            Yapper uses real-world scenarios and AI-driven conversations to help you gain confidence and fluency.
          </p>
          <Button 
            size="lg" 
            className="bg-yapper-teal hover:bg-yapper-teal/90 animate-fadeIn opacity-0" 
            style={{ animationDelay: "0.6s" }}
          >
            Start Learning Now
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose Yapper</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<MessageSquare className="w-8 h-8 text-yapper-teal" />}
              title="Real Conversations"
              description="Practice with AI characters in realistic scenarios"
              delay={0.2}
            />
            <FeatureCard
              icon={<Globe className="w-8 h-8 text-yapper-teal" />}
              title="Cultural Context"
              description="Learn language within its cultural framework"
              delay={0.4}
            />
            <FeatureCard
              icon={<Users className="w-8 h-8 text-yapper-teal" />}
              title="Personalized Learning"
              description="Adaptive system that grows with you"
              delay={0.6}
            />
            <FeatureCard
              icon={<Star className="w-8 h-8 text-yapper-teal" />}
              title="Instant Feedback"
              description="Get real-time pronunciation assessment"
              delay={0.8}
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
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
      <section className="py-20 bg-gradient-to-r from-yapper-teal/10 to-yapper-indigo/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Start Speaking Confidently?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of learners who are already improving their language skills with Yapper.
          </p>
          <Button size="lg" className="bg-yapper-teal hover:bg-yapper-teal/90">
            Create Your Account
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-muted-foreground">
              © 2024 Yapper. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
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
  <Card className="p-6 animate-fadeIn opacity-0" style={{ animationDelay: `${delay}s` }}>
    <div className="mb-4">{icon}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </Card>
);

const StepCard = ({ number, title, description, delay }: { number: string; title: string; description: string; delay: number }) => (
  <div className="animate-fadeIn opacity-0" style={{ animationDelay: `${delay}s` }}>
    <div className="text-4xl font-bold text-yapper-teal mb-4">{number}</div>
    <h3 className="text-xl font-semibold mb-2">{title}</h3>
    <p className="text-muted-foreground">{description}</p>
  </div>
);

export default Index;