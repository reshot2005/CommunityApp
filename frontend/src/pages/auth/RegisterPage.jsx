import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getOAuthUrl, registerUser } from "../../api/auth";
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

function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { id, value } = event.target;
    setFormData((current) => ({
      ...current,
      [id]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await registerUser(formData);

      login({
        id: response.user.id,
        token: response.token,
        role: response.user.role,
        user: response.user
      });

      showToast("Account created successfully", "success");
      navigate("/dashboard");
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

  function handleSocialSignup(provider) {
    if (!formData.role) {
      showToast("Select a role before using Google or LinkedIn", "error");
      return;
    }

    window.location.assign(getOAuthUrl(provider, formData.role));
  }

  return (
    <PageTransition className="mx-auto max-w-xl">
      <Card className="p-6 md:p-10">
        <PageHeader
          eyebrow="Join The Platform"
          title="Create Account"
          description="Register as a student, company, or college to access the community and opportunity network."
        />

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <TextField
            id="name"
            label="Name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
          />
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
            placeholder="Create a secure password"
          />
          <SelectField
            id="role"
            label="Role"
            value={formData.role}
            onChange={handleChange}
            options={roleOptions}
            placeholder="Select your role"
          />

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <div className="mt-8 space-y-4">
          <p className="text-center text-sm text-slate-400">
            Or create your account with a social provider
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Button variant="secondary" className="w-full" onClick={() => handleSocialSignup("google")}>
              Sign up with Google
            </Button>
            <Button variant="secondary" className="w-full" onClick={() => handleSocialSignup("linkedin")}>
              Sign up with LinkedIn
            </Button>
          </div>
        </div>
      </Card>
    </PageTransition>
  );
}

export default RegisterPage;
