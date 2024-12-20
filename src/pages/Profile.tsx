import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PersonalInfo } from "@/components/profile/PersonalInfo";
import { LanguageSettings } from "@/components/profile/LanguageSettings";
import { VoiceSettings } from "@/components/profile/VoiceSettings";
import { LearningGoals } from "@/components/profile/LearningGoals";
import { DangerZone } from "@/components/profile/DangerZone";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

interface UserProfile {
  id: string;
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
      fullName: "",
      nativeLanguage: "",
      targetLanguage: "",
      voicePreference: "",
      learningGoals: [],
      customGoals: [],
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

        setProfile({
          id: user.id,
          ...data
        });
        
        form.reset({
          fullName: data.full_name || "",
          nativeLanguage: data.native_language || "",
          targetLanguage: data.target_language || "",
          voicePreference: data.voice_preference || "",
          learningGoals: data.learning_goals || [],
          customGoals: data.custom_goals || [],
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ProfileHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-8">
          <h1 className="text-3xl font-bold">Your Profile</h1>

          <Form {...form}>
            <form className="space-y-8">
              <PersonalInfo form={form} />
              
              <Separator className="my-8" />
              
              <LanguageSettings form={form} />
              
              <Separator className="my-8" />
              
              <VoiceSettings
                currentVoice={profile?.voice_preference || null}
                onVoiceChange={(voice) => {
                  form.setValue("voicePreference", voice);
                }}
              />
              
              <Separator className="my-8" />
              
              <LearningGoals
                learningGoals={profile?.learning_goals || []}
                customGoals={profile?.custom_goals || []}
                onGoalsUpdate={(goals, type) => {
                  if (type === 'learning') {
                    form.setValue("learningGoals", goals);
                  } else {
                    form.setValue("customGoals", goals);
                  }
                }}
              />

              <Separator className="my-8" />

              <DangerZone userId={profile?.id || ''} />
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
};

export default Profile;