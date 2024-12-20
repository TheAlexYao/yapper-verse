import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";

const Auth = () => {
  const session = useSession();
  const supabase = useSupabaseClient();
  const navigate = useNavigate();

  useEffect(() => {
    if (session) {
      // Check if user has a profile
      const checkProfile = async () => {
        try {
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.error('Error checking profile:', error);
            return;
          }

          console.log('Profile check result:', profile);

          // If no profile exists or onboarding not completed, redirect to onboarding
          // If profile exists and onboarding completed, redirect to dashboard
          if (!profile || !profile.onboarding_completed) {
            console.log('Redirecting to onboarding...');
            navigate("/onboarding");
          } else {
            console.log('Redirecting to dashboard...');
            navigate("/dashboard");
          }
        } catch (error) {
          console.error('Error in checkProfile:', error);
        }
      };

      checkProfile();
    }
  }, [session, navigate, supabase]);

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent hover:scale-105 transition-transform cursor-pointer">
            Yapper
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Your gateway to natural language learning
          </p>
        </div>

        {/* Auth UI */}
        <div className="bg-card border rounded-lg shadow-lg p-6">
          <SupabaseAuth 
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#7843e6',
                    brandAccent: '#38b6ff',
                  },
                },
              },
            }}
            providers={["google"]}
            redirectTo={`${window.location.origin}/auth`}
            view="sign_in"
            showLinks={false}
            onlyThirdPartyProviders={true}
          />
        </div>

        {/* Footer */}
        <div className="text-center space-y-2">
          <div className="text-sm text-muted-foreground">
            By continuing, you agree to our{" "}
            <a href="#" className="text-[#38b6ff] hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-[#38b6ff] hover:underline">
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Auth;