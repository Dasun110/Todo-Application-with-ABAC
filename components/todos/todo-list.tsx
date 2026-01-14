"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

function getStatusColor(status: TodoStatus) {
  switch (status) {
    case "DRAFT":
      return "bg-gray-100 text-gray-800";
    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-800";
    case "COMPLETED":
      return "bg-green-100 text-green-800";
  }
}

function getStatusLabel(status: TodoStatus) {
  switch (status) {
    case "DRAFT":
      return "Draft";
    case "IN_PROGRESS":
      return "In Progress";
    case "COMPLETED":
      return "Completed";
  }
}

export function TodoList({ currentUserId, currentUserRole }: { currentUserId: string; currentUserRole: string }) {
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

  const canEdit = (todo: Todo) => {
    return currentUserRole === "USER" && todo.userId === currentUserId;
  };

  const canDelete = (todo: Todo) => {
    if (currentUserRole === "ADMIN") {
      return true;
    }
    if (currentUserRole === "USER" && todo.userId === currentUserId && todo.status === "DRAFT") {
      return true;
    }
    return false;
  };

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

  if (!todos || todos.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <p className="text-muted-foreground">No todos found. Create your first todo!</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {todos.map((todo) => (
          <Card key={todo.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <h3 className="font-semibold text-lg">{todo.title}</h3>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(todo.status)}`}>
                      {getStatusLabel(todo.status)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  {canEdit(todo) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingTodo(todo)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  )}
                  {canDelete(todo) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteMutation.mutate(todo.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">{todo.description}</p>
              <div className="text-xs text-muted-foreground">
                <p>Created by: {todo.user.name}</p>
                <p>Role: {todo.user.role}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editingTodo && (
        <EditTodoDialog
          todo={editingTodo}
          open={!!editingTodo}
          onOpenChange={(open) => !open && setEditingTodo(null)}
        />
      )}
    </>
  );
}
