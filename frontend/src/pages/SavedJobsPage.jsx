import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Card from "../components/common/Card";
import EmptyState from "../components/common/EmptyState";
import PageHeader from "../components/common/PageHeader";
import PageTransition from "../components/motion/PageTransition";
import { getSavedJobs, removeSavedJob } from "../utils/savedJobsStorage";

function SavedJobsPage() {
  const [savedJobs, setSavedJobs] = useState([]);

  useEffect(() => {
    setSavedJobs(getSavedJobs());
  }, []);

  function handleRemove(jobId) {
    setSavedJobs(removeSavedJob(jobId));
  }

  return (
    <PageTransition className="space-y-8">
      <PageHeader
        eyebrow="Bookmarks"
        title="Saved Jobs"
        description="Keep promising roles in one shortlist so you can return and apply later."
      />

      {savedJobs.length === 0 ? (
        <EmptyState
          title="No saved jobs yet"
          description="Bookmark jobs from the jobs page and they will appear here."
          actionLabel="Browse Jobs"
          actionTo="/jobs"
        />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {savedJobs.map((job) => (
            <Card key={job.id} className="space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-sky-300">Saved Role</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{job.title}</h2>
                  <p className="mt-2 text-sm text-slate-300">{job.companyName || "Company"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemove(job.id)}
                  className="interactive-button rounded-full border border-rose-400/30 bg-rose-500/15 px-3 py-1.5 text-xs font-medium text-rose-100"
                >
                  Remove
                </button>
              </div>
              <p className="text-sm leading-7 text-slate-300">{job.description}</p>
              <div className="flex flex-wrap gap-2 text-xs text-slate-300">
                <span className="rounded-full border border-slate-700 px-3 py-1">{job.location}</span>
                {job.jobType ? (
                  <span className="rounded-full border border-slate-700 px-3 py-1">{job.jobType}</span>
                ) : null}
              </div>
              <Link
                to="/jobs"
                className="interactive-button inline-flex rounded-full bg-sky-500/15 px-4 py-2.5 text-sm font-medium text-sky-200"
              >
                View In Jobs
              </Link>
            </Card>
          ))}
        </div>
      )}
    </PageTransition>
  );
}

export default SavedJobsPage;
