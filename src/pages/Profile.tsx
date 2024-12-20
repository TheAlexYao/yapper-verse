import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { PersonalInfo } from "@/components/profile/PersonalInfo";
import { LanguageSettings } from "@/components/profile/LanguageSettings";
import { VoiceSettings } from "@/components/profile/VoiceSettings";
import { LearningGoals } from "@/components/profile/LearningGoals";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { LogOut, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
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

        setProfile(data);
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

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out successfully",
        description: "You have been logged out of your account",
      });
      
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProfile = async () => {
    setIsDeleting(true);
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profile?.id);

      if (profileError) throw profileError;

      const { error: authError } = await supabase.auth.admin.deleteUser(
        profile?.id as string
      );

      if (authError) throw authError;

      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted",
      });

      navigate("/auth");
    } catch (error) {
      console.error("Error deleting profile:", error);
      toast({
        title: "Error",
        description: "Failed to delete your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

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

              <div className="space-y-4">
                <Button
                  type="button"
                  variant="destructive"
                  className="w-full"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </Button>

                <div className="rounded-lg border border-destructive/50 p-4 mt-8">
                  <div className="flex items-center gap-2 text-destructive mb-4">
                    <AlertTriangle className="h-5 w-5" />
                    <h3 className="font-semibold">Danger Zone</h3>
                  </div>
                  
                  <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                    <DialogTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full border-destructive text-destructive hover:bg-destructive/90 hover:text-destructive-foreground"
                      >
                        Delete Account
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Are you absolutely sure?</DialogTitle>
                        <DialogDescription>
                          This action cannot be undone. This will permanently delete your
                          account and remove all your data from our servers.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setShowDeleteDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteProfile}
                          disabled={isDeleting}
                        >
                          {isDeleting ? "Deleting..." : "Delete Account"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
};

export default Profile;