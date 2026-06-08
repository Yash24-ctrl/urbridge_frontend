import { useContext, useEffect, useRef, useState } from "react";
import API from "../../api/axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/auth-context";
import { GoogleLogin } from "@react-oauth/google";
import logo from "../../Icon.png";
import { validateLoginPassword } from "../../utils/passwordValidation";
import { clearStoredUser } from "../../utils/authSession";
import { isValidEmail, normalizeEmail } from "../../utils/emailValidation";

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(() => location.state?.message || "");
  const [passwordTouched, setPasswordTouched] = useState(false);
  const googleButtonRef = useRef(null);
  const [googleButtonWidth, setGoogleButtonWidth] = useState(320);

  const passwordError = validateLoginPassword(password);

  useEffect(() => {
    const updateWidth = () => {
      if (!googleButtonRef.current) return;
      setGoogleButtonWidth(Math.max(220, Math.floor(googleButtonRef.current.offsetWidth)));
    };

    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    setLoading(true);

    // Clear old expired tokens
    clearStoredUser();

    try {
      const res = await API.post("/user/google-login", {
        credential: credentialResponse?.credential,
      });

      if (!res.data?.user) {
        throw new Error("User data missing in response");
      }

      login(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      console.error("GOOGLE LOGIN ERROR:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Google login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    console.error("GOOGLE LOGIN ERROR: login failed");
    setError("Google login failed");
  };

  const handleLinkedInLogin = () => {
    setError("");
    clearStoredUser();
    window.location.href = "/api/auth/linkedin";
  };

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setPasswordTouched(true);

    // Clear old expired tokens
    clearStoredUser();

    if (!email.trim() || !password) {
      setError("Please provide email and password.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (passwordError) {
      setError(passwordError);
      return;
    }

    try {
      setLoading(true);
      const normalizedEmail = normalizeEmail(email);

      const res = await API.post("/user/login", {
        email: normalizedEmail,
        password,
      });
      
      if (!res.data?.user) {
        throw new Error("User data missing in response");
      }

      login(res.data.user);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/dashboard");
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError(
        err.response?.data?.message ||
        err.message ||
        "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div
        className="min-vh-100 d-flex align-items-center justify-content-center bg-light auth-pattern-bg px-3 px-md-4"
      >
        <div
          className="w-100 d-flex justify-content-center"
          style={{ maxWidth: "760px" }}
        >
          <div className="w-100">
              <div className="login-card card shadow-lg border-0 rounded-3" style={{
                background: "#00000000", color: "black", boxShadow: "0 12px 30px rgba(0,0,0,0.6)",
              }}>
                <div className="card-body p-4 p-md-5">
                  {/* Header */}
                  <div className="text-center mb-4">
                    <div className="brand-logo mb-3">
                      <img
                        src={logo}
                        alt="UrBridgeAI"
                        style={{
                          width: "clamp(220px, 36vw, 320px)",
                          height: "auto",
                          display: "block",
                          margin: "0 auto",
                          objectFit: "contain",
                        }}
                        className="img-fluid"
                      />
                    </div>
                    <p className="text-black mb-0">Sign in to your account</p>
                  </div>

                  {/* Error Alert */}
                  {error && (
                    <div className="alert alert-danger alert-dismissible fade show" role="alert">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      {error}
                      <button type="button" className="btn-close" onClick={() => setError("")}></button>
                    </div>
                  )}

                  {/* Login Form */}
                  <form onSubmit={submit} noValidate>
                    <div className="mb-3">
                      <label htmlFor="email" className="form-label fw-semibold">
                        <i className="fas fa-envelope me-2 text-muted"></i>
                        Email Address
                      </label>
                      <input
                        id="email"
                        className="form-control form-control-lg"
                        type="text"
                        inputMode="email"
                        autoComplete="email"
                        placeholder="Enter your email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        style={{ borderRadius: "10px" }}
                      />
                    </div>

                    <div className="mb-3">
                      <label htmlFor="password" className="form-label fw-semibold">
                        <i className="fas fa-lock me-2 text-muted"></i>
                        Password
                      </label>
                      <input
                        id="password"
                        className={`form-control form-control-lg ${
                          passwordTouched && passwordError ? "is-invalid" : ""
                        }`}
                        type="password"
                        placeholder="Enter your password"
                        required
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (!passwordTouched) {
                            setPasswordTouched(true);
                          }
                        }}
                        onBlur={() => setPasswordTouched(true)}
                        style={{ borderRadius: "10px" }}
                      />
                      {passwordTouched && passwordError ? (
                        <div className="invalid-feedback d-block">
                          {passwordError}
                        </div>
                      ) : null}
                    </div>

                    <div className="mb-4 text-end">
                      <Link to="/forgot-password" className="text-decoration-none text-black large">
                        Forgot your password?
                      </Link>
                    </div>

                    <button
                      className="btn btn btn-lg w-100 mb-3"
                      disabled={loading}
                      style={{ borderRadius: "10px", padding: "12px" }}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Signing in...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-sign-in-alt me-2"></i>
                          Sign In
                        </>
                      )}
                    </button>
                  </form>

                  <div className="d-flex align-items-center my-3">
                    <hr className="flex-grow-1 me-3" />
                    <span className="text-muted" style={{ fontSize: "1.3rem", fontWeight: 600 }}>or</span>
                    <hr className="flex-grow-1 ms-3" />
                  </div>

                  {/* Google Button — Centered */}
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
                    <div className="auth-google-shell" ref={googleButtonRef}>
                      <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        text="signin_with"
                        theme="outline"
                        size="large"
                        shape="rectangular"
                        logo_alignment="left"
                        width={String(googleButtonWidth)}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "12px" }}>
                    <button
                      type="button"
                      className="auth-linkedin-button"
                      disabled={loading}
                      onClick={handleLinkedInLogin}
                    >
                      <span className="auth-linkedin-icon">in</span>
                      Continue with LinkedIn
                    </button>
                  </div>

                  {/* Register Link */}
                  <div className="text-center">
                    <p className="text-black mb-2">Don't have an account?
                      <Link to="/register">
                        <i className="fas fa-user-plus me-1"></i>
                        Create Account
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
          </div>
        </div>

        <style>{`
        .login-card {
          width: 100%;
          max-width: 700px;
        }

        @media (max-width: 768px) {
          .login-card {
            width: 100%;
            max-width: 100%;
          }
        }

        .login-card.card {
          backdrop-filter: blur(10px);
          background: rgba(255, 255, 255, 0.95);
        }

        .form-control:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }

        .btn {
          background: #000080 !important;
          color: #ffffff !important;
          border: solid 1px #000080 !important;
        }

        .btn:hover,
        .btn:focus,
        .btn:active,
        .btn:disabled {
          background: #000080 !important;
          color: #ffffff !important;
          border: solid 1px #868697 !important;
          opacity: 1;
        }

        .auth-google-shell {
          display: flex;
          justify-content: center;
          width: 420px;
          max-width: 100%;
          margin: 0 auto;
        }

        .auth-google-shell > div,
        .auth-google-shell iframe {
          width: 100% !important;
          min-width: 100% !important;
        }

        .auth-linkedin-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          width: 420px;
          max-width: 100%;
          min-height: 44px;
          border: 0;
          border-radius: 6px;
          background: #0077B5;
          color: #ffffff;
          font-size: 0.95rem;
          font-weight: 600;
          box-shadow: 0 10px 22px rgba(0, 119, 181, 0.22);
        }

        .auth-linkedin-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .auth-linkedin-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 4px;
          background: #ffffff;
          color: #0077B5;
          font-family: Arial, sans-serif;
          font-size: 0.86rem;
          font-weight: 800;
          line-height: 1;
        }

        @media (max-width: 576px) {
          .min-vh-100 {
            align-items: flex-start !important;
            padding-top: 16px;
            padding-bottom: 16px;
          }

          .card-body {
            padding: 1rem !important;
          }
          
          .brand-logo img {
            display: block;
            margin: 0 auto;
            width: min(210px, 70vw) !important;
          }

          .text-end {
            text-align: left !important;
          }

          .form-control.form-control-lg {
            font-size: 0.95rem;
            padding: 0.8rem 0.95rem;
          }

          .auth-google-shell {
            width: 100%;
          }

          .auth-linkedin-button {
            width: 100%;
          }
        }
      `}</style>

      </div>
    </>
  );
}
