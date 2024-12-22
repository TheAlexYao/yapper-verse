import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { deleteAllUserConversations } from "@/utils/conversationUtils";

export default function Index() {
  const { toast } = useToast();

  const handleDeleteConversations = async () => {
    try {
      await deleteAllUserConversations();
      toast({
        title: "Success",
        description: "All conversations have been deleted",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversations. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button 
        variant="destructive"
        onClick={handleDeleteConversations}
        className="w-full md:w-auto"
      >
        Delete All My Conversations
      </Button>
    </div>
  );
}