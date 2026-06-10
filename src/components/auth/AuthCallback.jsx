import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token")?.trim();

    if (!token) {
      navigate("/login", {
        replace: true,
        state: { message: "LinkedIn authentication failed. Please try again." },
      });
      return;
    }

    localStorage.setItem("user", JSON.stringify({ token: token }));
    const redirectTo = sessionStorage.getItem("postAuthRedirect");
    sessionStorage.removeItem("postAuthRedirect");
    navigate(
      redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")
        ? redirectTo
        : "/dashboard",
      { replace: true }
    );
  }, [navigate, searchParams]);

  return (
    <div className="vh-100 d-flex justify-content-center align-items-center">
      <h4>Signing you in...</h4>
    </div>
  );
}
