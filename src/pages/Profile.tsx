import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { LanguageSettings } from "@/components/profile/LanguageSettings";
import { VoiceSettings } from "@/components/profile/VoiceSettings";
import { LearningGoals } from "@/components/profile/LearningGoals";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  full_name: string;
  native_language: string;
  target_language: string;
  voice_preference: string;
  learning_goals: string[];
  custom_goals: string[];
}

const Profile = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  const form = useForm({
    defaultValues: {
      nativeLanguage: "",
      targetLanguage: "",
    },
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("No user found");

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        setProfile(data);
        form.reset({
          nativeLanguage: data.native_language || "",
          targetLanguage: data.target_language || "",
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Failed to load profile data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleVoiceChange = (voice: string) => {
    setProfile(prev => prev ? { ...prev, voice_preference: voice } : null);
  };

  const handleGoalsUpdate = (goals: string[], type: 'learning' | 'custom') => {
    setProfile(prev => prev ? {
      ...prev,
      [type === 'learning' ? 'learning_goals' : 'custom_goals']: goals
    } : null);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <ProfileHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-8">
          <h1 className="text-3xl font-bold">Your Profile</h1>

          <LanguageSettings form={form} />
          
          <VoiceSettings
            currentVoice={profile?.voice_preference || null}
            onVoiceChange={handleVoiceChange}
          />
          
          <LearningGoals
            learningGoals={profile?.learning_goals || []}
            customGoals={profile?.custom_goals || []}
            onGoalsUpdate={handleGoalsUpdate}
          />
        </div>
      </main>
    </div>
  );
};

export default Profile;