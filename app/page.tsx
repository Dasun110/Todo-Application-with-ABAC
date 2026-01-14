"use client";

import { useState } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const [showLogin, setShowLogin] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md space-y-4">
        <div className="text-center space-y-2 mb-8">
          <h1 className="text-4xl font-bold tracking-tight">Todo App</h1>
          <p className="text-muted-foreground">
            with Attribute-Based Access Control
          </p>
        </div>

        {showLogin ? <LoginForm /> : <RegisterForm />}

        <div className="text-center">
          <Button
            variant="link"
            onClick={() => setShowLogin(!showLogin)}
            className="text-sm"
          >
            {showLogin
              ? "Don't have an account? Register"
              : "Already have an account? Login"}
          </Button>
        </div>
      </div>
    </div>
  );
}
