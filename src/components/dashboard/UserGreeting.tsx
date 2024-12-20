import { Card } from "@/components/ui/card";

export function UserGreeting() {
  return (
    <Card className="p-6 bg-gradient-to-r from-[#38b6ff]/10 to-[#7843e6]/10">
      <h2 className="text-2xl font-semibold mb-2">Welcome back, User!</h2>
      <p className="text-muted-foreground">
        You've completed 3 scenarios this week. Keep up the great work!
      </p>
    </Card>
  );
}