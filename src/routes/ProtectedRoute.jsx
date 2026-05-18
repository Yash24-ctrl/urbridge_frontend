import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/auth-context";

export default function ProtectedRoute({ children }) {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

