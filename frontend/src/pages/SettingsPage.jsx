import { useEffect, useState } from "react";
import { fetchAppliedJobs } from "../api/jobs";
import { Link } from "react-router-dom";
import PageHeader from "../components/common/PageHeader";
import PageTransition from "../components/motion/PageTransition";
import { useAuth } from "../context/AuthContext";

const statusClasses = {
  applied: "border-blue-400/30 bg-blue-500/10 text-blue-200",
  reviewed: "border-amber-400/30 bg-amber-500/10 text-amber-200",
  shortlisted: "border-violet-400/30 bg-violet-500/10 text-violet-200",
  accepted: "border-emerald-400/30 bg-emerald-500/10 text-emerald-200",
  rejected: "border-rose-400/30 bg-rose-500/10 text-rose-200"
};

const currencyFormatter = new Intl.NumberFormat("en-IN");

function SettingsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user?.role !== "student") {
      setApplications([]);
      return;
    }

    async function loadApplications() {
      setIsLoading(true);

      try {
        const data = await fetchAppliedJobs();
        setApplications(data);
        setError("");
      } catch (requestError) {
        setError(
          requestError.response?.data?.message || "Failed to load applied jobs"
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadApplications();
  }, [user?.role]);

  function formatSalary(salary) {
    if (!salary) {
      return "Salary not specified";
    }

    return `Rs. ${currencyFormatter.format(Number(salary))}`;
  }

  if (user?.role !== "student") {
    return (
      <PageTransition className="space-y-8">
        <PageHeader
          eyebrow="Settings"
          title="Settings"
          description="This section currently highlights applied jobs for student accounts."
        />
        <div className="rounded-[1.75rem] border border-dashed border-gray-600 bg-gray-800/70 p-8 text-sm text-gray-300">
          Applied job tracking is available for student accounts. Log in as a student to view saved applications here.
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition className="space-y-8">
      <PageHeader
        eyebrow="Settings"
        title="Applied Jobs"
        description="Review the roles you have already applied for and track the current application status."
      />

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      {isLoading ? <p className="text-sm text-gray-300">Loading applied jobs...</p> : null}

      {!isLoading && !error && applications.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-gray-600 bg-gray-800/70 p-8 text-center text-sm text-gray-300">
          You have not applied to any jobs yet.
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2">
        {applications.map((application) => (
          <article
            key={application.id}
            className="rounded-[1.75rem] border border-gray-700 bg-gray-800 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.32)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-blue-300">
                  Applied Role
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-white">
                  {application.title}
                </h2>
                <p className="mt-2 text-sm text-gray-300">
                  {application.companyName || "Company not available"}
                </p>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-medium capitalize ${
                  statusClasses[application.status] || "border-gray-600 text-gray-200"
                }`}
              >
                {application.status}
              </span>
            </div>

            <p className="mt-5 text-sm leading-7 text-gray-300">
              {application.description}
            </p>

            <div className="mt-5 flex flex-wrap gap-2 text-xs text-gray-300">
              <span className="rounded-full border border-gray-600 px-3 py-1">
                {application.location}
              </span>
              <span className="rounded-full border border-gray-600 px-3 py-1">
                {formatSalary(application.salary)}
              </span>
            </div>

            <div className="mt-5 space-y-2 text-sm text-gray-400">
              <p>
                Applied{" "}
                {application.createdAt
                  ? new Date(application.createdAt).toLocaleDateString()
                  : "recently"}
              </p>
              <p>
                Posted{" "}
                {application.jobCreatedAt
                  ? new Date(application.jobCreatedAt).toLocaleDateString()
                  : "recently"}
              </p>
              <p>Application ID: {application.id}</p>
            </div>

            <Link
              to="/jobs"
              className="interactive-button mt-5 inline-flex rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2.5 text-sm font-medium text-blue-200 hover:border-blue-300/40 hover:bg-blue-500/15"
            >
              Back To Jobs
            </Link>
          </article>
        ))}
      </div>
    </PageTransition>
  );
}

export default SettingsPage;
