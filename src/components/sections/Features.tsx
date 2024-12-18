import { Globe, MessageSquare, Star, Users } from "lucide-react";

const Features = () => {
  return (
    <section id="features" className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4 relative">
        <h2 className="text-4xl md:text-6xl font-bold text-center mb-16 bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent leading-normal md:leading-relaxed pb-4">
          Your Language Adventure Awaits
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: MessageSquare,
              title: "Real Conversations",
              description: "Chat with AI characters in authentic scenarios"
            },
            {
              icon: Globe,
              title: "Cultural Immersion",
              description: "Experience language in its cultural context"
            },
            {
              icon: Users,
              title: "Personalized Learning",
              description: "AI adapts to your learning style"
            },
            {
              icon: Star,
              title: "Instant Feedback",
              description: "Real-time pronunciation assessment"
            }
          ].map((feature, index) => (
            <div key={feature.title} className="group hover:scale-105 transform transition-all duration-300 cursor-pointer">
              <div className="relative p-8 rounded-lg bg-gradient-to-br from-white/5 to-white/10 border border-white/10 backdrop-blur-sm animate-fadeIn opacity-0" style={{ animationDelay: `${0.2 * (index + 1)}s` }}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#38b6ff]/10 to-[#7843e6]/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
                <feature.icon className="w-16 h-16 text-[#38b6ff] mb-6 group-hover:scale-110 transition-transform" />
                <h3 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">{feature.title}</h3>
                <p className="text-xl text-muted-foreground">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;