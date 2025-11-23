import { Navigate } from "react-router-dom";

export default function AuthGuard({ children, role }: any) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  if (!token || !userRole) {
    return <Navigate to="/sign" replace />;
  }

  if (role && userRole !== role) {
    return <Navigate to="/sign" replace />;
  }

  return children;
}
