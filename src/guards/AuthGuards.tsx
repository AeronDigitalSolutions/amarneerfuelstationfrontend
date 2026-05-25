import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

type AuthGuardProps = {
  children: ReactNode;
  role?: string;
  roles?: string[];
  permissionKey?: string;
};

export default function AuthGuard({ children, role, roles, permissionKey }: AuthGuardProps) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");
  const modulePermissionsRaw = localStorage.getItem("modulePermissions");

  if (!token || !userRole) {
    return <Navigate to="/sign" replace />;
  }

  const allowedRoles = roles && roles.length > 0 ? roles : role ? [role] : [];
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/sign" replace />;
  }

  if (permissionKey && userRole === "Admin") {
    try {
      const permissions = modulePermissionsRaw ? JSON.parse(modulePermissionsRaw) : {};
      if (!permissions[permissionKey]) {
        return <Navigate to="/dashboardmain" replace />;
      }
    } catch {
      return <Navigate to="/dashboardmain" replace />;
    }
  }

  return children;
}
