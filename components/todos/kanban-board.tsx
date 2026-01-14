"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { EditTodoDialog } from "./edit-todo-dialog";
import { Trash2, Pencil } from "lucide-react";

type TodoStatus = "DRAFT" | "IN_PROGRESS" | "COMPLETED";

type Todo = {
  id: string;
  title: string;
  description: string;
  status: TodoStatus;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
};

async function fetchTodos(): Promise<Todo[]> {
  const response = await fetch("/api/todos");
  if (!response.ok) {
    throw new Error("Failed to fetch todos");
  }
  return response.json();
}

async function deleteTodo(id: string) {
  const response = await fetch(`/api/todos/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete todo");
  }

  return response.json();
}

async function updateTodoStatus(id: string, status: TodoStatus) {
  const response = await fetch(`/api/todos/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update todo");
  }

  return response.json();
}

const STATUSES: { value: TodoStatus; label: string; color: string }[] = [
  { value: "DRAFT", label: "Draft", color: "bg-gray-50 border-gray-200" },
  { value: "IN_PROGRESS", label: "In Progress", color: "bg-blue-50 border-blue-200" },
  { value: "COMPLETED", label: "Completed", color: "bg-green-50 border-green-200" },
];

function TodoCard({
  todo,
  currentUserId,
  currentUserRole,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  todo: Todo;
  currentUserId: string;
  currentUserRole: string;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TodoStatus) => void;
}) {
  const canEdit = currentUserRole === "USER" && todo.userId === currentUserId;
  const canDelete =
    (currentUserRole === "ADMIN") ||
    (currentUserRole === "USER" && todo.userId === currentUserId && todo.status === "DRAFT");

  const statusOptions = STATUSES.filter(s => s.value !== todo.status);

  return (
    <Card className="mb-3 hover:shadow-md transition-shadow">
      <CardContent className="pt-4">
        <h3 className="font-semibold text-sm mb-1">{todo.title}</h3>
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{todo.description}</p>
        
        <div className="text-xs text-muted-foreground mb-3">
          <span className="font-medium">By: {todo.user.name}</span>
        </div>

        <div className="flex gap-2 flex-wrap mb-3">
          {canEdit && statusOptions.length > 0 && (
            <div className="flex gap-1">
              {statusOptions.map(status => (
                <button
                  key={status.value}
                  onClick={() => onStatusChange(todo.id, status.value)}
                  className="text-xs px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 transition"
                  title={`Move to ${status.label}`}
                >
                  → {status.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          {canEdit && (
            <button
              onClick={() => onEdit(todo)}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs rounded bg-blue-100 hover:bg-blue-200 text-blue-900 transition"
            >
              <Pencil className="h-3 w-3" />
              Edit
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => onDelete(todo.id)}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs rounded bg-red-100 hover:bg-red-200 text-red-900 transition"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function KanbanColumn({
  status,
  label,
  todos,
  currentUserId,
  currentUserRole,
  onEdit,
  onDelete,
  onStatusChange,
}: {
  status: TodoStatus;
  label: string;
  todos: Todo[];
  currentUserId: string;
  currentUserRole: string;
  onEdit: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: TodoStatus) => void;
}) {
  const statusConfig = STATUSES.find(s => s.value === status);

  return (
    <div className={`flex-1 border rounded-lg p-4 ${statusConfig?.color} min-h-96`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg">{label}</h2>
        <span className="bg-gray-300 text-gray-900 text-sm font-semibold px-2 py-1 rounded">
          {todos.length}
        </span>
      </div>

      <div className="space-y-2">
        {todos.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No todos</p>
        ) : (
          todos.map(todo => (
            <TodoCard
              key={todo.id}
              todo={todo}
              currentUserId={currentUserId}
              currentUserRole={currentUserRole}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({
  currentUserId,
  currentUserRole,
}: {
  currentUserId: string;
  currentUserRole: string;
}) {
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: todos, isLoading, error } = useQuery({
    queryKey: ["todos"],
    queryFn: fetchTodos,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      toast({
        title: "Success",
        description: "Todo deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TodoStatus }) =>
      updateTodoStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      toast({
        title: "Success",
        description: "Todo status updated",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <p className="text-muted-foreground">Loading todos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center py-8">
        <p className="text-destructive">Error loading todos</p>
      </div>
    );
  }

  const draftTodos = (todos || []).filter(t => t.status === "DRAFT");
  const inProgressTodos = (todos || []).filter(t => t.status === "IN_PROGRESS");
  const completedTodos = (todos || []).filter(t => t.status === "COMPLETED");

  return (
    <>
      <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
        <KanbanColumn
          status="DRAFT"
          label="Draft"
          todos={draftTodos}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          onEdit={setEditingTodo}
          onDelete={(id) => deleteMutation.mutate(id)}
          onStatusChange={(id, status) => statusMutation.mutate({ id, status })}
        />
        <KanbanColumn
          status="IN_PROGRESS"
          label="In Progress"
          todos={inProgressTodos}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          onEdit={setEditingTodo}
          onDelete={(id) => deleteMutation.mutate(id)}
          onStatusChange={(id, status) => statusMutation.mutate({ id, status })}
        />
        <KanbanColumn
          status="COMPLETED"
          label="Completed"
          todos={completedTodos}
          currentUserId={currentUserId}
          currentUserRole={currentUserRole}
          onEdit={setEditingTodo}
          onDelete={(id) => deleteMutation.mutate(id)}
          onStatusChange={(id, status) => statusMutation.mutate({ id, status })}
        />
      </div>

      {editingTodo && (
        <EditTodoDialog
          todo={editingTodo}
          onClose={() => setEditingTodo(null)}
        />
      )}
    </>
  );
}
