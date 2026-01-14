import { createAuthClient } from "better-auth/react";

const baseURL = 
  typeof window !== "undefined" 
    ? `${window.location.protocol}//${window.location.host}`
    : process.env.NEXT_PUBLIC_BETTER_AUTH_URL || "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL,
});

export const { signIn, signUp, signOut, useSession } = authClient;
