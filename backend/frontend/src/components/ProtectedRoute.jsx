import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

/**
 * ProtectedRoute
 * - If not logged in → redirect to /login
 * - If logged in but wrong role → redirect to their own dashboard
 * - Otherwise → render children
 */
export default function ProtectedRoute({ children, role }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  // Not logged in at all
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const userRole = user.role || localStorage.getItem("role");

  // Role mismatch — send them to their correct dashboard
  if (role && userRole !== role) {
    const redirect = userRole === "official" ? "/official-dashboard" : "/dashboard";
    return <Navigate to={redirect} replace />;
  }

  return children;
}
