import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const session = useSession();
  const supabase = useSupabaseClient();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isDevelopment = import.meta.env.DEV;

  useEffect(() => {
    console.log('Auth component mounted');
    console.log('Initial session state:', session);

    const handleSession = async () => {
      console.log('handleSession called');
      if (session) {
        try {
          console.log('Auth flow - Session detected:', session.user.id);
          console.log('Auth flow - User metadata:', session.user.user_metadata);
          console.log('Auth flow - Provider:', session.user.app_metadata.provider);
          console.log('Auth flow - Access token:', session.access_token ? 'Present' : 'Missing');
          console.log('Auth flow - Full session:', JSON.stringify(session, null, 2));
          
          // Remove hash if present in URL
          if (window.location.hash) {
            window.history.replaceState(null, '', window.location.pathname);
          }

          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();

          if (error) {
            console.error('Error checking profile:', error);
            throw error;
          }

          console.log('Auth flow - Profile check result:', profile);

          if (!profile) {
            console.log('Auth flow - No profile found, creating new profile');
            const { error: insertError } = await supabase
              .from('profiles')
              .insert([
                {
                  id: session.user.id,
                  full_name: session.user.user_metadata.full_name,
                  avatar_url: session.user.user_metadata.avatar_url,
                }
              ]);

            if (insertError) {
              console.error('Error creating profile:', insertError);
              throw insertError;
            }
            console.log('Auth flow - Profile created, redirecting to onboarding...');
            navigate("/onboarding");
          } else {
            console.log('Auth flow - Existing profile found:', profile);
            if (!profile.onboarding_completed) {
              console.log('Auth flow - Onboarding incomplete, redirecting to onboarding...');
              navigate("/onboarding");
            } else {
              console.log('Auth flow - Profile complete, redirecting to dashboard...');
              navigate("/dashboard");
            }
          }
        } catch (error: any) {
          console.error('Error in handleSession:', error);
          toast({
            title: "Error",
            description: "There was a problem setting up your profile. Please try again.",
            variant: "destructive",
          });
        }
      } else {
        console.log('Auth flow - No session detected');
      }
    };

    // Add auth state change listener with enhanced logging
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed - Event:', event);
      console.log('Auth state changed - Session:', session ? 'Present' : 'None');
      if (session) {
        console.log('Auth state changed - User ID:', session.user.id);
        console.log('Auth state changed - Provider:', session.user.app_metadata.provider);
        console.log('Auth state changed - Full metadata:', session.user);
      }
      handleSession();
    });

    // Initial session check
    handleSession();

    // Cleanup subscription
    return () => {
      console.log('Auth component unmounting, cleaning up subscription');
      subscription.unsubscribe();
    };
  }, [session, navigate, supabase, toast]);

  // Determine the redirect URL based on environment
  const baseUrl = isDevelopment 
    ? 'http://localhost:5173'
    : 'https://preview--yapper-verse.lovable.app';
  
  const redirectUrl = `${baseUrl}/auth/callback`;
  console.log('Auth component - Using redirect URL:', redirectUrl);

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-[#38b6ff] to-[#7843e6] bg-clip-text text-transparent hover:scale-105 transition-transform cursor-pointer">
            Yapper
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Your gateway to natural language learning
          </p>
        </div>

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
            redirectTo={redirectUrl}
            view="sign_in"
            showLinks={false}
            onlyThirdPartyProviders={true}
          />
        </div>

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