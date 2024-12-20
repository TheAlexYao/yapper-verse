import { useState } from "react";
import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { UserRound, Edit } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PersonalInfoProps {
  form: UseFormReturn<any>;
}

export function PersonalInfo({ form }: PersonalInfoProps) {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async () => {
    setIsUpdating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: form.getValues("fullName"),
        })
        .eq("id", user.id);

      if (error) throw error;

      setIsEditing(false);
      toast({
        title: "Success",
        description: "Personal information updated successfully",
      });
    } catch (error) {
      console.error("Error updating personal info:", error);
      toast({
        title: "Error",
        description: "Failed to update personal information",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Personal Information</h2>
        {!isEditing ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="text-muted-foreground"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        ) : (
          <Button
            onClick={handleSave}
            disabled={isUpdating}
            size="sm"
            className="bg-gradient-to-r from-[#38b6ff] to-[#7843e6] hover:opacity-90"
          >
            Save Changes
          </Button>
        )}
      </div>

      <FormField
        control={form.control}
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Full Name</FormLabel>
            <div className="relative">
              <Input
                {...field}
                disabled={!isEditing}
                className="pl-9"
                placeholder="Enter your full name"
              />
              <UserRound className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
          </FormItem>
        )}
      />
    </section>
  );
}