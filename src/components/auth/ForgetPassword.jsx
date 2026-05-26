import { useState } from "react";
import API from "../../api/axios";
import logo from "../../Icon.png";
import { isValidEmail, normalizeEmail } from "../../utils/emailValidation";

const RESET_PASSWORD_PAGE_URL =
    "https://urbridge.in/reset-password";

function getResetLink(data) {
    const resetLink = data?.resetLink || data?.resetUrl || data?.link || data?.url;
    const token = data?.token || data?.resetToken;

    if (resetLink) {
        return resetLink;
    }

    if (token) {
        return `${RESET_PASSWORD_PAGE_URL}?token=${token}`;
    }

    return "";
}

function saveResetLink(resetLink) {
    if (!resetLink) return;

    localStorage.setItem("resetPasswordLink", resetLink);

    fetch("/__dev/reset-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetLink }),
    }).catch(() => {});
}

function isEmailServiceUnavailable(data) {
    return !!(data?.resetLink || data?.token);
}

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");
        if (!email) {
            setError("Please enter your email");
            return;
        }

        if (!isValidEmail(email)) {
            setError("Please enter a valid email address.");
            return;
        }

        try {
            setLoading(true);
            const res = await API.post("/user/forgot-password", {
                email: normalizeEmail(email),
                resetUrl: RESET_PASSWORD_PAGE_URL,
            });

            const link = getResetLink(res.data);
            saveResetLink(link);

            if (isEmailServiceUnavailable(res.data)) {
                const reason = res.data?.emailError
                    ? `Reason: ${res.data.emailError}`
                    : "Please use the reset link shown in the browser console or check localStorage for 'resetPasswordLink'.";
                setSuccess(`Email service is currently unavailable. ${reason}`);
                console.log("Reset link:", link);
            } else {
                setSuccess("Reset link sent to registered email");
            }

            setEmail("");
        } catch (err) {
            console.error("FORGOT PASSWORD ERROR:", err);
            setError(
    err.response?.data?.message ||
    "Something went wrong. Please try again later."
);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3 px-md-4" style={{ background: "linear-gradient(#fff)" }}>
            <div className="w-100 d-flex justify-content-center" style={{ maxWidth: "760px" }}>
                <div className="w-100">
                    <div className="forget-card card shadow-lg border-0 rounded-3" style={{
                        background: "#00000000", color: "black", boxShadow: "0 12px 30px rgba(0,0,0,0.6)",
                    }}>
                        <div className="card-body p-4 p-md-5">
                            <div className="text-center mb-4">
                                <div className="logo-circle mb-3">
                                    <img
                                        src={logo}
                                        style={{
                                            height: "90px",
                                            objectFit: "contain",
                                        }}
                                        className="img-fluid"
                                    />
                                </div>
                                <h2 className="card-title mb-2 fw-bold text-black">
                                    UrBridge.ai
                                </h2>
                                <p className="text-black mb-0">Reset your password</p>
                            </div>

                            {error && (
                                <div className="alert alert-danger alert-dismissible fade show" role="alert">
                                    <i className="fas fa-exclamation-triangle me-2"></i>
                                    {error}
                                    <button type="button" className="btn-close" onClick={() => setError("")}></button>
                                </div>
                            )}

                            {success && (
                                <div className="alert alert-success alert-dismissible fade show" role="alert">
                                    <i className="fas fa-check-circle me-2"></i>
                                    {success}
                                    <button type="button" className="btn-close" onClick={() => setSuccess("")}></button>
                                </div>
                            )}

                            <form onSubmit={submit} noValidate>
                                <div className="mb-3">
                                    <label htmlFor="email" className="form-label fw-semibold">
                                        <i className="fas fa-envelope me-2 text-muted"></i>
                                        Email Address
                                    </label>
                                    <input
                                        id="email"
                                        type="text"
                                        inputMode="email"
                                        autoComplete="email"
                                        className="form-control form-control-lg"
                                        placeholder="Enter registered email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        style={{ borderRadius: "10px" }}
                                    />
                                </div>

                                <button
                                    className="btn btn-lg w-100 mb-3"
                                    disabled={loading}
                                    style={{ borderRadius: "10px", padding: "12px" }}
                                >
                                    {loading ? "Sending..." : "Send Reset Link"}
                                </button>
                            </form>

                            <div className="text-center mt-3">
                                <small className="text-black">
                                    You will receive a password reset link
                                </small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .forget-card {
                    width: 100%;
                    max-width: 700px;
                }

                .forget-card.card {
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

                @media (max-width: 576px) {
                    .min-vh-100 {
                        align-items: flex-start !important;
                        padding-top: 16px;
                        padding-bottom: 16px;
                    }

                    .card-body {
                        padding: 1rem !important;
                    }

                    .logo-circle img {
                        height: 60px !important;
                    }

                    .card-title {
                        font-size: 1.35rem !important;
                    }

                    .form-control.form-control-lg {
                        font-size: 0.95rem;
                        padding: 0.8rem 0.95rem;
                    }
                }
            `}</style>
        </div>
    );
}

