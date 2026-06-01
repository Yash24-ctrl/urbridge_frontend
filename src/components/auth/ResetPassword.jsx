    import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../../api/axios";
import logo from "../../Icon.png";

export default function ResetPassword() {
    const navigate = useNavigate();
    const [params] = useSearchParams();
    const token = params.get("token");

    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const isFormValid =
        newPassword.trim() !== "" &&
        confirmPassword.trim() !== "" &&
        newPassword === confirmPassword;

    const handleReset = async (e) => {
        e.preventDefault();
        if (!token) {
            setError("Invalid or expired reset link");
            return;
        }

        try {
            setLoading(true);

            await API.post("/user/reset-password", {
                token,
                newPassword,
            });

            setSuccess(true);
            navigate("/login", { replace: true });
        } catch (err) {
            setError(err.response?.data?.message || "Reset password failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3 px-md-4" style={{ background: "linear-gradient(#fff)" }}>
            <div className="w-100 d-flex justify-content-center" style={{ maxWidth: "760px" }}>
                <div className="w-100">
                    <div className="reset-card card shadow-lg border-0 rounded-3" style={{
                        background: "#00000000", color: "black", boxShadow: "0 12px 30px rgba(0,0,0,0.6)",
                    }}>
                        <div className="card-body p-4 p-md-5">
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
                                <p className="text-black mb-0">Create a new password</p>
                            </div>

                            {error && (
                                <div className="alert alert-danger py-2">{error}</div>
                            )}

                            <form onSubmit={handleReset}>
                                <div className="mb-3">
                                    <label htmlFor="newPassword" className="form-label fw-semibold">
                                        <i className="fas fa-lock me-2 text-muted"></i>
                                        New Password
                                    </label>
                                    <input
                                        id="newPassword"
                                        type="password"
                                        className="form-control form-control-lg"
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        style={{ borderRadius: "10px" }}
                                    />
                                </div>

                                <div className="mb-3">
                                    <label htmlFor="confirmPassword" className="form-label fw-semibold">
                                        <i className="fas fa-lock me-2 text-muted"></i>
                                        Confirm Password
                                    </label>
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        className="form-control form-control-lg"
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        style={{ borderRadius: "10px" }}
                                    />
                                    {confirmPassword && newPassword !== confirmPassword && (
                                        <small className="text-danger">
                                            Passwords do not match
                                        </small>
                                    )}
                                </div>

                                <button
                                    className="btn btn-lg w-100 mb-3"
                                    disabled={!isFormValid || loading}
                                    style={{ borderRadius: "10px", padding: "12px" }}
                                >
                                    {loading ? "Resetting..." : "Reset Password"}
                                </button>
                            </form>

                            {success && (
                                <div className="alert alert-success mt-3 text-center">
                                    Password reset successfully
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .reset-card {
                    width: 100%;
                    max-width: 700px;
                }

                .reset-card.card {
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
                    opacity: 1;
                    border: solid 1px #868697 !important;
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
                        width: min(210px, 70vw) !important;
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
