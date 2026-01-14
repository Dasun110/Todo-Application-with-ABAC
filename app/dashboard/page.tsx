import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
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

  // Get user with role from database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, role: true },
  });

  if (!user) {
    redirect("/");
  }

  const canCreate = user.role === "USER";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto p-6 space-y-6">
        <DashboardHeader 
          userName={user.name} 
          userRole={user.role}
          canCreate={canCreate}
        />

        <KanbanBoard currentUserId={user.id} currentUserRole={user.role} />
      </div>
    </div>
  );
}
