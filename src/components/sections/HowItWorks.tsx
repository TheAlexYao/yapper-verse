import Lottie from 'lottie-react';
import pathAnimation from '../animations/choose-path.json';
import adventureAnimation from '../animations/adventure.json';
import characterAnimation from '../animations/character.json';
import levelUpAnimation from '../animations/level-up.json';

const HowItWorks = () => {
  const steps = [
    {
      step: 1,
      title: "Choose Your Path",
      description: "Select your native language and learning goals",
      animation: pathAnimation,
    },
    {
      step: 2,
      title: "Pick Your Adventure",
      description: "Choose from exciting scenarios or create your own",
      animation: adventureAnimation,
    },
    {
      step: 3,
      title: "Meet Characters",
      description: "Interact with unique AI personalities",
      animation: characterAnimation,
    },
    {
      step: 4,
      title: "Level Up",
      description: "Track progress and unlock achievements",
      animation: levelUpAnimation,
    }
  ];

  return (
    <section id="how-it-works" className="py-20 relative overflow-hidden">
      <div className="container mx-auto px-4 relative">
        <h2 className="text-4xl md:text-6xl font-bold text-center mb-16 bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent leading-normal md:leading-relaxed pb-4">
          Your Journey Begins Here
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 max-w-6xl mx-auto">
          {steps.map((item, index) => (
            <div key={item.step} className="relative animate-fadeIn opacity-0" style={{ animationDelay: `${0.2 * (index + 1)}s` }}>
              <div className="pt-8 p-8 rounded-lg bg-gradient-to-br from-white/5 to-white/10 border border-white/10 backdrop-blur-sm h-full hover:scale-105 transform transition-all duration-300">
                <div className="w-32 h-32 mx-auto mb-6 relative">
                  <Lottie
                    animationData={item.animation}
                    loop={true}
                    autoplay={true}
                    className="w-full h-full absolute top-0 left-0"
                    style={{
                      transform: 'scale(1.5)',
                    }}
                  />
                </div>
                <div className="absolute top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-gradient-to-r from-[#38b6ff] to-[#7843e6] flex items-center justify-center text-white text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-2xl font-semibold mb-4 bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent">
                  {item.title}
                </h3>
                <p className="text-xl text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;