"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CreateTodoDialog } from "@/components/todos/create-todo-dialog";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/hooks/use-toast";

export function DashboardHeader({
  userName,
  userRole,
  canCreate,
}: {
  userName: string;
  userRole: string;
  canCreate: boolean;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">My Todos</h1>
        <p className="text-muted-foreground mt-1">
          Welcome, {userName} ({userRole})
        </p>
      </div>
      <div className="flex gap-2">
        {canCreate && <CreateTodoDialog />}
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
