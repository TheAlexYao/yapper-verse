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
          console.log('Auth flow - Session detected:', session.user.id);
          console.log('Auth flow - User metadata:', session.user.user_metadata);
          
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (error) {
            console.error('Error checking profile:', error);
            return;
          }

          console.log('Auth flow - Profile check result:', profile);

          if (!profile) {
            // If no profile exists, create one
            console.log('Auth flow - Creating new profile for user:', session.user.id);
            const { error: insertError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: session.user.id,
                  full_name: session.user.user_metadata.full_name || session.user.user_metadata.name,
                  avatar_url: session.user.user_metadata.avatar_url,
                }
              ]);

            if (insertError) {
              console.error('Error creating profile:', insertError);
              return;
            }
            console.log('Auth flow - Profile created, redirecting to onboarding...');
            navigate("/onboarding");
          } else if (!profile.onboarding_completed) {
            console.log('Auth flow - Existing profile found, onboarding incomplete. Redirecting to onboarding...');
            navigate("/onboarding");
          } else {
            console.log('Auth flow - Profile complete, redirecting to dashboard...');
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