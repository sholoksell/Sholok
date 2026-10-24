import { Navigate, useLocation } from "react-router-dom";
import { ReactNode } from "react";
import { useAuth } from "@/store/authContext";

interface Props {
  children: ReactNode;
  /** Optional role gate — if set, user must have one of these roles */
  roles?: Array<"customer" | "seller" | "admin">;
  redirectTo?: string;
}

export default function ProtectedRoute({ children, roles, redirectTo = "/login" }: Props) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh] text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  if (!user) return <Navigate to={redirectTo} state={{ from: location.pathname }} replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return <>{children}</>;
}
