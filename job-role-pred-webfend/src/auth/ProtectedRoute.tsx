// src/auth/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import type { PropsWithChildren } from "react";

export default function ProtectedRoute({ children }: PropsWithChildren) {
  const { user, accessToken } = useAuth();

  const isLoggedIn = !!user && !!accessToken;

  return isLoggedIn ? <>{children}</> : <Navigate to="/login" replace />;
}
