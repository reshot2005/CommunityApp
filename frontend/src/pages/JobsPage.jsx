import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  applyToJob,
  cancelJobApplication,
  createJob,
  fetchAppliedJobs,
  fetchJobs
} from "../api/jobs";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import EmptyState from "../components/common/EmptyState";
import LoadingSpinner from "../components/common/LoadingSpinner";
import PageHeader from "../components/common/PageHeader";
import SelectField from "../components/common/SelectField";
import TextField from "../components/common/TextField";
import PageTransition from "../components/motion/PageTransition";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import {
  clearCancelledApplication,
  filterActiveApplications,
  isApplicationMarkedCancelled,
  markApplicationCancelled
} from "../utils/applicationStatusStorage";
import {
  addAppliedJobId,
  getAppliedJobIds,
  removeAppliedJobId
} from "../utils/appliedJobsStorage";
import { getSavedJobs, removeSavedJob, saveJob } from "../utils/savedJobsStorage";

const currencyFormatter = new Intl.NumberFormat("en-IN");
const inferredJobTypes = ["Full-time", "Internship", "Remote", "Hybrid"];

function inferJobType(job, index) {
  const source = `${job.title} ${job.description} ${job.location}`.toLowerCase();
  if (source.includes("intern")) return "Internship";
  if (source.includes("remote")) return "Remote";
  if (source.includes("hybrid")) return "Hybrid";
  return inferredJobTypes[index % inferredJobTypes.length];
}

function JobsPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [jobs, setJobs] = useState([]);
  const [appliedJobIds, setAppliedJobIds] = useState([]);
  const [savedJobIds, setSavedJobIds] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [jobTypeFilter, setJobTypeFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [jobForm, setJobForm] = useState({
    title: "",
    description: "",
    location: "",
    salary: ""
  });

  useEffect(() => {
    async function loadJobs() {
      setIsLoading(true);

      try {
        const jobsData = await fetchJobs();
        const applications =
          user?.role === "student" ? await fetchAppliedJobs().catch(() => []) : [];

        const enrichedJobs = jobsData.map((job, index) => ({
          ...job,
          jobType: job.jobType || inferJobType(job, index)
        }));
        const activeApplications = filterActiveApplications(applications);
        const localAppliedJobIds = user?.role === "student" ? getAppliedJobIds(user?.id) : [];

        setJobs(enrichedJobs);
        setAppliedJobIds([
          ...new Set([
            ...activeApplications.map((application) => application.jobId),
            ...localAppliedJobIds
          ])
        ]);
        setSavedJobIds(getSavedJobs().map((job) => job.id));
      } catch {
        showToast("Failed to load jobs", "error");
      } finally {
        setIsLoading(false);
      }
    }

    loadJobs();
  }, [showToast, user?.role]);

  function handleChange(event) {
    const { name, value } = event.target;
    setJobForm((current) => ({ ...current, [name]: value }));
  }

  async function handleCreateJob(event) {
    event.preventDefault();

    try {
      const job = await createJob({
        ...jobForm,
        salary: jobForm.salary ? Number(jobForm.salary) : null
      });
      setJobs((current) => [{ ...job, jobType: inferJobType(job, 0) }, ...current]);
      setJobForm({ title: "", description: "", location: "", salary: "" });
      showToast("Job posted successfully", "success");
    } catch {
      showToast("Failed to create job", "error");
    }
  }

  async function handleApply(jobId) {
    const job = jobs.find((currentJob) => currentJob.id === jobId);

    if (appliedJobIds.includes(jobId)) {
      showToast("You have already applied to this job", "error");
      return;
    }

    try {
      if (!job?.isDemoJob) {
        await applyToJob(jobId);
      }

      clearCancelledApplication(jobId);
      addAppliedJobId(user?.id, jobId);
      setAppliedJobIds((current) => [...new Set([...current, jobId])]);
      showToast("Application submitted", "success");
    } catch (error) {
      if (error?.response?.status === 409 && isApplicationMarkedCancelled(jobId)) {
        clearCancelledApplication(jobId);
        addAppliedJobId(user?.id, jobId);
        setAppliedJobIds((current) => [...new Set([...current, jobId])]);
        showToast("Application submitted", "success");
        return;
      }

      if (job?.isDemoJob) {
        clearCancelledApplication(jobId);
        addAppliedJobId(user?.id, jobId);
        setAppliedJobIds((current) => [...new Set([...current, jobId])]);
        showToast("Application submitted", "success");
        return;
      }

      showToast(error?.response?.data?.message || "Failed to apply to job", "error");
    }
  }

  async function handleCancelApplication(jobId) {
    const job = jobs.find((currentJob) => currentJob.id === jobId);

    markApplicationCancelled(jobId);
    removeAppliedJobId(user?.id, jobId);
    setAppliedJobIds((current) => current.filter((currentJobId) => currentJobId !== jobId));

    try {
      if (!job?.isDemoJob) {
        await cancelJobApplication(jobId);
      }

      showToast("Application cancelled", "success");
    } catch (error) {
      if (job?.isDemoJob) {
        showToast("Application cancelled", "success");
        return;
      }

      showToast(error?.response?.data?.message || "Application cancelled from your list", "success");
    }
  }

  function handleSaveJob(job) {
    if (savedJobIds.includes(job.id)) {
      removeSavedJob(job.id);
      setSavedJobIds((current) => current.filter((jobId) => jobId !== job.id));
      showToast("Job removed from saved list", "success");
      return;
    }

    saveJob(job);
    setSavedJobIds((current) => [...current, job.id]);
    showToast("Job saved", "success");
  }

  const locationOptions = useMemo(
    () => ["all", ...new Set(jobs.map((job) => job.location).filter(Boolean))],
    [jobs]
  );
  const jobTypeOptions = useMemo(
    () => ["all", ...new Set(jobs.map((job) => job.jobType).filter(Boolean))],
    [jobs]
  );

  const filteredJobs = jobs.filter((job) => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !normalizedSearch ||
      [job.title, job.companyName, job.description]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(normalizedSearch));
    const matchesLocation = locationFilter === "all" || job.location === locationFilter;
    const matchesJobType = jobTypeFilter === "all" || job.jobType === jobTypeFilter;

    return matchesSearch && matchesLocation && matchesJobType;
  });

  function formatSalary(salary) {
    if (!salary) return "Salary not specified";
    return `Rs. ${currencyFormatter.format(Number(salary))}`;
  }

  return (
    <PageTransition className="space-y-8">
      <PageHeader
        eyebrow="Opportunities"
        title="Find jobs that fit"
        description="Search openings, apply directly, and keep a shortlist of roles worth revisiting."
      />

      <div className="flex justify-end">
        <Link
          to="/saved-jobs"
          className="interactive-button rounded-full border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200 hover:border-sky-400/40 hover:text-sky-300"
        >
          View Saved Jobs
        </Link>
      </div>

      <Card className="grid gap-4 md:grid-cols-3">
        <TextField
          id="job-search"
          name="job-search"
          label="Search by title"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          placeholder="Frontend developer"
        />
        <SelectField
          id="location-filter"
          label="Location"
          value={locationFilter}
          onChange={(event) => setLocationFilter(event.target.value)}
          options={locationOptions.filter((option) => option !== "all").map((option) => ({ value: option, label: option }))}
          placeholder="All locations"
          placeholderValue="all"
        />
        <SelectField
          id="job-type-filter"
          label="Job Type"
          value={jobTypeFilter}
          onChange={(event) => setJobTypeFilter(event.target.value)}
          options={jobTypeOptions.filter((option) => option !== "all").map((option) => ({ value: option, label: option }))}
          placeholder="All job types"
          placeholderValue="all"
        />
      </Card>

      {user?.role === "company" ? (
        <Card>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={handleCreateJob}>
            <TextField id="title" label="Job title" value={jobForm.title} onChange={handleChange} placeholder="Frontend Developer" />
            <TextField id="location" label="Location" value={jobForm.location} onChange={handleChange} placeholder="Bengaluru / Remote" />
            <div className="md:col-span-2">
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium text-slate-100">Description</label>
                <textarea id="description" name="description" rows="5" value={jobForm.description} onChange={handleChange} placeholder="Describe the role and requirements" className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-brand-500" />
              </div>
            </div>
            <TextField id="salary" label="Salary" type="number" value={jobForm.salary} onChange={handleChange} placeholder="300000" />
            <div className="flex items-end">
              <Button type="submit" className="w-full">Post Job</Button>
            </div>
          </form>
        </Card>
      ) : null}

      {isLoading ? <LoadingSpinner label="Loading jobs..." /> : null}

      {!isLoading && filteredJobs.length === 0 ? (
        <EmptyState
          title="No jobs available"
          description="No jobs match the current search and filter combination."
        />
      ) : null}

      {!isLoading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredJobs.map((job) => {
            const hasApplied = appliedJobIds.includes(job.id);
            const isSaved = savedJobIds.includes(job.id);

            return (
              <Card key={job.id} className="interactive-card space-y-5 hover:border-sky-400/30">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-sky-300">Job Opening</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">{job.title}</h2>
                    <p className="mt-2 text-sm text-slate-300">{job.companyName || "Company"}</p>
                  </div>
                  <span className="rounded-full border border-sky-400/20 bg-sky-500/10 px-3 py-1 text-xs text-sky-200">
                    {job.jobType}
                  </span>
                </div>

                <p className="text-sm leading-7 text-slate-300">{job.description}</p>

                <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                  <span className="rounded-full border border-slate-700 px-3 py-1">{job.location}</span>
                  <span className="rounded-full border border-slate-700 px-3 py-1">{formatSalary(job.salary)}</span>
                  {job.isDemoJob ? (
                    <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-amber-200">
                      Demo Job
                    </span>
                  ) : null}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm text-slate-400">
                    Posted {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "recently"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {user?.role === "student" ? (
                      hasApplied ? (
                        <Button variant="danger" onClick={() => handleCancelApplication(job.id)}>
                          Cancel Application
                        </Button>
                      ) : (
                        <Button onClick={() => handleApply(job.id)}>Apply</Button>
                      )
                    ) : null}
                    <Button variant="secondary" onClick={() => handleSaveJob(job)}>
                      {isSaved ? "Saved" : "Save Job"}
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : null}
    </PageTransition>
  );
}

export default JobsPage;
