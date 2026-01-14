import { prisma } from "./db";

export type UserWithRole = {
  id: string;
  role: string;
};

export type TodoWithUser = {
  id: string;
  userId: string;
  status: string;
};

export class ABACService {
  static canViewTodo(user: UserWithRole, todo: TodoWithUser): boolean {
    if (user.role === "USER") {
      return todo.userId === user.id;
    }
    
    if (user.role === "MANAGER" || user.role === "ADMIN") {
      return true;
    }
    
    return false;
  }

  static async canViewTodos(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    
    return !!user;
  }

  static async canCreateTodo(userId: string): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    
    return user?.role === "USER";
  }

  static async canUpdateTodo(userId: string, todo: TodoWithUser): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    
    if (!user) return false;
    
    if (user.role === "USER") {
      return todo.userId === userId;
    }
    
    return false;
  }

  static async canDeleteTodo(userId: string, todo: TodoWithUser): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    
    if (!user) return false;
    
    if (user.role === "USER") {
      return todo.userId === userId && todo.status === "DRAFT";
    }
    
    if (user.role === "ADMIN") {
      return true;
    }
    
    return false;
  }

  static async getTodosForUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    
    if (!user) {
      throw new Error("User not found");
    }
    
    if (user.role === "USER") {
      return await prisma.todo.findMany({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }
    
    if (user.role === "MANAGER" || user.role === "ADMIN") {
      return await prisma.todo.findMany({
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });
    }
    
    return [];
  }
}

export { prisma };
