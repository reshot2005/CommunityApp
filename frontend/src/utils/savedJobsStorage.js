const SAVED_JOBS_KEY = "savedJobs";

function getParsedSavedJobs() {
  const rawSavedJobs = localStorage.getItem(SAVED_JOBS_KEY);

  if (!rawSavedJobs) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawSavedJobs);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    localStorage.removeItem(SAVED_JOBS_KEY);
    return [];
  }
}

export function getSavedJobs() {
  return getParsedSavedJobs();
}

export function isJobSaved(jobId) {
  return getParsedSavedJobs().some((job) => job.id === jobId);
}

export function saveJob(job) {
  const current = getParsedSavedJobs();

  if (current.some((item) => item.id === job.id)) {
    return current;
  }

  const next = [job, ...current];
  localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(next));
  return next;
}

export function removeSavedJob(jobId) {
  const next = getParsedSavedJobs().filter((job) => job.id !== jobId);
  localStorage.setItem(SAVED_JOBS_KEY, JSON.stringify(next));
  return next;
}
