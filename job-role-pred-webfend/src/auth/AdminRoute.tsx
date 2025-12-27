import { Navigate } from "react-router-dom";
import type { PropsWithChildren } from "react";
import { useAuth } from "./AuthContext";

export default function AdminRoute({ children }: PropsWithChildren) {
  const { user, accessToken } = useAuth();

  const isLoggedIn = !!user && !!accessToken;

  if (!isLoggedIn) return <Navigate to="/" replace />;

  if (user.role !== "ADMIN") {
    return <Navigate to="/not-authorized" replace />;
  }

  return <>{children}</>;
}
