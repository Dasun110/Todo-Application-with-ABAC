import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { KanbanBoard } from "@/components/todos/kanban-board";
import { CreateTodoDialog } from "@/components/todos/create-todo-dialog";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/");
  }

  const canCreate = session.user.role === "USER";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto p-6 space-y-6">
        <DashboardHeader 
          userName={session.user.name} 
          userRole={session.user.role as string}
          canCreate={canCreate}
        />

        <KanbanBoard currentUserId={session.user.id} currentUserRole={session.user.role as string} />
      </div>
    </div>
  );
}
