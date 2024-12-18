import { Button } from "@/components/ui/button";
import { Globe, MessageSquare, Star, Users, ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

const Index = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      const scrollPx = document.documentElement.scrollTop;
      const winHeightPx = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = `${scrollPx / winHeightPx * 100}%`;
      setScrollProgress(scrollPx / winHeightPx * 100);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Scroll Progress Indicator */}
      <div 
        className="fixed top-0 left-0 h-1 bg-gradient-to-r from-[#38b6ff] to-[#7843e6] z-50 transition-all duration-300"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Navigation */}
      <nav className="fixed w-full bg-background/80 backdrop-blur-sm z-50 border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-2xl font-bold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent hover:scale-105 transition-transform cursor-pointer animate-float">
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
              className="bg-[#7843e6] hover:bg-[#7843e6]/90 hover:scale-105 transform transition-all duration-200 shadow-[0_0_15px_rgba(120,67,230,0.3)] hover:shadow-[0_0_25px_rgba(120,67,230,0.5)] group"
            >
              Start Your Adventure
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#38b6ff]/10 via-transparent to-[#7843e6]/10 animate-gradient-x" />
        <div 
          className="absolute -top-40 -right-40 w-96 h-96 bg-[#38b6ff] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"
          style={{
            transform: `translate(${(mousePosition.x - window.innerWidth / 2) * 0.02}px, ${(mousePosition.y - window.innerHeight / 2) * 0.02}px)`,
          }}
        />
        <div 
          className="absolute -bottom-40 -left-40 w-96 h-96 bg-[#7843e6] rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"
          style={{
            transform: `translate(${(mousePosition.x - window.innerWidth / 2) * -0.02}px, ${(mousePosition.y - window.innerHeight / 2) * -0.02}px)`,
          }}
        />
        <div className="container mx-auto text-center relative">
          <h1 className="text-4xl md:text-7xl font-bold mb-6 animate-spotlight opacity-0">
            Learn Languages Through
            <span className="bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent block mt-2 relative">
              Adventure
              <Sparkles className="absolute -right-12 top-0 text-[#38b6ff] animate-float" />
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-spotlight opacity-0" style={{ animationDelay: "0.2s" }}>
            Your pocket-sized portal to mini language adventures. Chat with friendly AI characters, explore virtual cities, and learn naturally through play.
          </p>
          <div className="flex flex-col md:flex-row gap-4 justify-center items-center animate-spotlight opacity-0" style={{ animationDelay: "0.4s" }}>
            <Button 
              size="lg" 
              className="bg-[#38b6ff] hover:bg-[#38b6ff]/90 hover:scale-105 transform transition-all duration-200 shadow-[0_0_15px_rgba(56,182,255,0.3)] hover:shadow-[0_0_25px_rgba(56,182,255,0.5)] w-full md:w-auto group"
            >
              Begin Your Journey
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="group hover:scale-105 transform transition-all duration-200 w-full md:w-auto"
            >
              Watch Demo
              <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">→</span>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#38b6ff]/5 via-transparent to-[#7843e6]/5" />
        <div className="container mx-auto px-4 relative">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">
            Your Language Adventure Awaits
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group hover:scale-105 transform transition-all duration-300 cursor-pointer">
              <div className="relative p-6 rounded-lg bg-gradient-to-br from-white/5 to-white/10 border border-white/10 backdrop-blur-sm animate-fadeIn opacity-0" style={{ animationDelay: "0.2s" }}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#38b6ff]/10 to-[#7843e6]/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                <MessageSquare className="w-12 h-12 text-[#38b6ff] mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">Real Conversations</h3>
                <p className="text-muted-foreground">Chat with AI characters in authentic scenarios</p>
              </div>
            </div>
            <div className="group hover:scale-105 transform transition-all duration-300 cursor-pointer">
              <div className="relative p-6 rounded-lg bg-gradient-to-br from-white/5 to-white/10 border border-white/10 backdrop-blur-sm animate-fadeIn opacity-0" style={{ animationDelay: "0.4s" }}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#38b6ff]/10 to-[#7843e6]/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                <Globe className="w-12 h-12 text-[#38b6ff] mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">Cultural Immersion</h3>
                <p className="text-muted-foreground">Experience language in its cultural context</p>
              </div>
            </div>
            <div className="group hover:scale-105 transform transition-all duration-300 cursor-pointer">
              <div className="relative p-6 rounded-lg bg-gradient-to-br from-white/5 to-white/10 border border-white/10 backdrop-blur-sm animate-fadeIn opacity-0" style={{ animationDelay: "0.6s" }}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#38b6ff]/10 to-[#7843e6]/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                <Users className="w-12 h-12 text-[#38b6ff] mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">Personalized Learning</h3>
                <p className="text-muted-foreground">AI adapts to your learning style</p>
              </div>
            </div>
            <div className="group hover:scale-105 transform transition-all duration-300 cursor-pointer">
              <div className="relative p-6 rounded-lg bg-gradient-to-br from-white/5 to-white/10 border border-white/10 backdrop-blur-sm animate-fadeIn opacity-0" style={{ animationDelay: "0.8s" }}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#38b6ff]/10 to-[#7843e6]/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                <Star className="w-12 h-12 text-[#38b6ff] mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">Instant Feedback</h3>
                <p className="text-muted-foreground">Real-time pronunciation assessment</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-bl from-[#38b6ff]/5 via-transparent to-[#7843e6]/5" />
        <div className="container mx-auto px-4 relative">
          <h2 className="text-3xl md:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">
            Your Journey Begins Here
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="relative animate-fadeIn opacity-0" style={{ animationDelay: "0.2s" }}>
              <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-gradient-to-r from-[#38b6ff] to-[#7843e6] flex items-center justify-center text-white font-bold">
                1
              </div>
              <div className="p-6 rounded-lg bg-gradient-to-br from-white/5 to-white/10 border border-white/10 backdrop-blur-sm h-full hover:scale-105 transform transition-all duration-300">
                <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">Choose Your Path</h3>
                <p className="text-muted-foreground">Select your native language and learning goals</p>
              </div>
            </div>
            <div className="relative animate-fadeIn opacity-0" style={{ animationDelay: "0.4s" }}>
              <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-gradient-to-r from-[#38b6ff] to-[#7843e6] flex items-center justify-center text-white font-bold">
                2
              </div>
              <div className="p-6 rounded-lg bg-gradient-to-br from-white/5 to-white/10 border border-white/10 backdrop-blur-sm h-full hover:scale-105 transform transition-all duration-300">
                <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">Pick Your Adventure</h3>
                <p className="text-muted-foreground">Choose from exciting scenarios or create your own</p>
              </div>
            </div>
            <div className="relative animate-fadeIn opacity-0" style={{ animationDelay: "0.6s" }}>
              <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-gradient-to-r from-[#38b6ff] to-[#7843e6] flex items-center justify-center text-white font-bold">
                3
              </div>
              <div className="p-6 rounded-lg bg-gradient-to-br from-white/5 to-white/10 border border-white/10 backdrop-blur-sm h-full hover:scale-105 transform transition-all duration-300">
                <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">Meet Characters</h3>
                <p className="text-muted-foreground">Interact with unique AI personalities</p>
              </div>
            </div>
            <div className="relative animate-fadeIn opacity-0" style={{ animationDelay: "0.8s" }}>
              <div className="absolute -top-4 -left-4 w-8 h-8 rounded-full bg-gradient-to-r from-[#38b6ff] to-[#7843e6] flex items-center justify-center text-white font-bold">
                4
              </div>
              <div className="p-6 rounded-lg bg-gradient-to-br from-white/5 to-white/10 border border-white/10 backdrop-blur-sm h-full hover:scale-105 transform transition-all duration-300">
                <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">Level Up</h3>
                <p className="text-muted-foreground">Track progress and unlock achievements</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Languages Marquee */}
      <div className="relative py-10 overflow-hidden bg-gradient-to-r from-[#38b6ff]/10 to-[#7843e6]/10">
        <div className="flex space-x-8 animate-marquee whitespace-nowrap">
          {["English", "Spanish", "French", "German", "Italian", "Portuguese", "Chinese", "Japanese", "Korean", "Russian"].map((language) => (
            <span key={language} className="text-2xl font-bold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">
              {language}
            </span>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#38b6ff]/10 to-[#7843e6]/10" />
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">
            Ready to Start Your Adventure?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of language explorers discovering new worlds through conversation.
          </p>
          <Button 
            size="lg" 
            className="bg-[#7843e6] hover:bg-[#7843e6]/90 hover:scale-105 transform transition-all duration-200 shadow-[0_0_15px_rgba(120,67,230,0.3)] hover:shadow-[0_0_25px_rgba(120,67,230,0.5)]"
          >
            Begin Your Journey
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
      
      {/* Custom Cursor */}
      <div 
        className="fixed w-4 h-4 bg-gradient-to-r from-[#38b6ff] to-[#7843e6] rounded-full pointer-events-none z-50 mix-blend-difference transition-transform duration-150"
        style={{
          transform: `translate(${mousePosition.x - 8}px, ${mousePosition.y - 8}px)`,
        }}
      />
    </div>
  );
};

export default Index;
