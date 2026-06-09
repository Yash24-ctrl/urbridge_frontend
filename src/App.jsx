import { useContext } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthContext } from "./context/auth-context";
import Login from "./components/auth/Login.jsx";
import Register from "./components/auth/Register";
import AuthCallback from "./components/auth/AuthCallback";
import DashboardPage from "./Dashboard/DashboardPage";
import Counselling from "./pages/Counselling";
import InterviewPrep from "./pages/InterviewPrep";
import MarketingLanding from "./pages/MarketingLanding";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

export default function App() {
  const { loading } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center">
        <h4>Loading...</h4>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MarketingLanding />} />
        <Route
          path="/login"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          }
        />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/counselling"
          element={
            <ProtectedRoute>
              <Counselling />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview-prep"
          element={
            <ProtectedRoute>
              <InterviewPrep />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
