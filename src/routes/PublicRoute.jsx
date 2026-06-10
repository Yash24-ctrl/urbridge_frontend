import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/auth-context";

export default function PublicRoute({ children }) {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const getSafeRedirect = (value) =>
    typeof value === "string" && value.startsWith("/") && !value.startsWith("//")
      ? value
      : "";

  if (user) {
    const storedRedirect = getSafeRedirect(sessionStorage.getItem("postAuthRedirect"));
    const redirectTo = getSafeRedirect(location.state?.redirectTo) || storedRedirect || "/dashboard";

    if (storedRedirect) {
      sessionStorage.removeItem("postAuthRedirect");
    }

    return <Navigate to={redirectTo} replace />;
  }

  return children;
}
