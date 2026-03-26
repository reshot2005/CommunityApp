import { useState } from "react";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchOAuthProviders, getOAuthUrl, loginUser } from "../../api/auth";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import PageHeader from "../../components/common/PageHeader";
import PageTransition from "../../components/motion/PageTransition";
import SelectField from "../../components/common/SelectField";
import TextField from "../../components/common/TextField";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const roleOptions = [
  { value: "student", label: "Student" },
  { value: "company", label: "Company" },
  { value: "college", label: "College" }
];

function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "student"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oauthProviders, setOauthProviders] = useState({
    google: { configured: false },
    linkedin: { configured: false }
  });

  useEffect(() => {
    let isMounted = true;

    async function loadOAuthProviders() {
      try {
        const providers = await fetchOAuthProviders();

        if (isMounted) {
          setOauthProviders({
            google: providers.google || { configured: false },
            linkedin: providers.linkedin || { configured: false }
          });
        }
      } catch {
        if (isMounted) {
          setOauthProviders({
            google: { configured: false },
            linkedin: { configured: false }
          });
        }
      }
    }

    loadOAuthProviders();

    return () => {
      isMounted = false;
    };
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const email = formData.email.trim();
    const password = formData.password;

    if (!email || !password) {
      showToast("Email and password are required", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await loginUser({ email, password });

      login({
        token: response.token,
        role: response.user.role,
        id: response.user.id,
        user: response.user
      });
      showToast("Login successful", "success");
      navigate(location.state?.from || "/dashboard");
    } catch (requestError) {
      const errorDetails = requestError.response?.data?.details;
      showToast(
        Array.isArray(errorDetails) && errorDetails.length > 0
          ? errorDetails.join(", ")
          : requestError.response?.data?.message ||
              "Backend server is not reachable. Start the backend on port 5000 and try again.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSocialLogin(provider) {
    if (!oauthProviders[provider]?.available) {
      showToast(
        `${provider === "google" ? "Google" : "LinkedIn"} login is not configured on the backend yet.`,
        "error"
      );
      return;
    }

    window.location.assign(getOAuthUrl(provider, formData.role || "student"));
  }

  return (
    <PageTransition className="mx-auto max-w-xl">
      <Card className="p-6 md:p-10">
        <PageHeader
          eyebrow="Welcome Back"
          title="Login"
          description="Sign in to continue to your dashboard, jobs, and community updates."
        />

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <TextField
            id="email"
            label="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email address"
          />
          <TextField
            id="password"
            label="Password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
          />
          <SelectField
            id="role"
            label="Role for first-time social sign-in"
            value={formData.role}
            onChange={handleChange}
            options={roleOptions}
            placeholder="Select a role"
          />

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </form>

        <div className="mt-8 space-y-4">
          <p className="text-center text-sm text-slate-400">
            Or continue with a social account
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              variant="secondary"
              className="w-full"
              disabled={!oauthProviders.google?.available}
              onClick={() => handleSocialLogin("google")}
            >
              {oauthProviders.google?.configured
                ? "Continue with Google"
                : oauthProviders.google?.mockEnabled
                  ? "Continue with Google (Demo)"
                  : "Google Setup Required"}
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              disabled={!oauthProviders.linkedin?.available}
              onClick={() => handleSocialLogin("linkedin")}
            >
              {oauthProviders.linkedin?.configured
                ? "Continue with LinkedIn"
                : oauthProviders.linkedin?.mockEnabled
                  ? "Continue with LinkedIn (Demo)"
                : "LinkedIn Setup Required"}
            </Button>
          </div>
        </div>
      </Card>
    </PageTransition>
  );
}

export default LoginPage;
