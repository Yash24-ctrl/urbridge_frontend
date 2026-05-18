import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/auth-context";

/* ================= ROUTES ================= */
import PublicRoute from "./routes/PublicRoute";
import ProtectedRoute from "./routes/ProtectedRoute";

/* ================= AUTH ================= */
import Login from "./components/auth/Login.jsx";
import Register from "./components/auth/Register";
import ForgotPassword from "./components/auth/ForgetPassword";
import ResetPassword from "./components/auth/ResetPassword";

/* ================= DASHBOARD ================= */
import DashboardPage from "./Dashboard/DashboardPage";

/* ================= INTERVIEW PREP ================= */
import InterviewPrep from "./pages/InterviewPrep";

export default function App() {
  const { loading } = useContext(AuthContext);

  /* ===== GLOBAL LOADER ===== */
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
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* ================= PUBLIC ================= */}
        <Route
          path="/login"
          element={<PublicRoute><Login /></PublicRoute>}
        />

        <Route
          path="/register"
          element={<PublicRoute><Register /></PublicRoute>}
        />
        {/* ================= PROTECTED ================= */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
        />

        <Route
          path="/interview-prep"
          element={<ProtectedRoute><InterviewPrep /></ProtectedRoute>}
        />

        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* ================= FALLBACK ================= */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}
