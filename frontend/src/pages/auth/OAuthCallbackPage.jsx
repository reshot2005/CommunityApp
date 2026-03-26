import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import PageTransition from "../../components/motion/PageTransition";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

function OAuthCallbackPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const errorMessage = searchParams.get("error");
    const mode = searchParams.get("mode");
    const token = searchParams.get("token");
    const rawUser = searchParams.get("user");

    if (errorMessage) {
      showToast(errorMessage, "error");
      navigate("/login", { replace: true });
      return;
    }

    if (!token || !rawUser) {
      showToast("Social login could not be completed", "error");
      navigate("/login", { replace: true });
      return;
    }

    try {
      const user = JSON.parse(rawUser);

      login({
        id: user.id,
        token,
        role: user.role,
        user
      });
      showToast(mode === "mock" ? "Demo social login successful" : "Login successful", "success");
      navigate("/dashboard", { replace: true });
    } catch {
      showToast("Social login returned invalid account data", "error");
      navigate("/login", { replace: true });
    }
  }, [login, navigate, showToast]);

  return (
    <PageTransition className="mx-auto max-w-xl">
      <Card className="p-6 md:p-10">
        <PageHeader
          eyebrow="Social Login"
          title="Signing you in"
          description="Completing your Google or LinkedIn login and preparing your dashboard."
        />
      </Card>
    </PageTransition>
  );
}

export default OAuthCallbackPage;
