const CANCELLED_APPLICATIONS_KEY = "cancelledApplicationJobIds";

function getParsedCancelledApplicationJobIds() {
  const rawValue = localStorage.getItem(CANCELLED_APPLICATIONS_KEY);

  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed) ? parsed.filter((jobId) => typeof jobId === "string") : [];
  } catch {
    return [];
  }
}

function setCancelledApplicationJobIds(jobIds) {
  localStorage.setItem(CANCELLED_APPLICATIONS_KEY, JSON.stringify(jobIds));
}

export function getCancelledApplicationJobIds() {
  return getParsedCancelledApplicationJobIds();
}

export function isApplicationMarkedCancelled(jobId) {
  return getParsedCancelledApplicationJobIds().includes(jobId);
}

export function markApplicationCancelled(jobId) {
  const currentJobIds = getParsedCancelledApplicationJobIds();

  if (currentJobIds.includes(jobId)) {
    return currentJobIds;
  }

  const nextJobIds = [...currentJobIds, jobId];
  setCancelledApplicationJobIds(nextJobIds);
  return nextJobIds;
}

export function clearCancelledApplication(jobId) {
  const nextJobIds = getParsedCancelledApplicationJobIds().filter(
    (currentJobId) => currentJobId !== jobId
  );
  setCancelledApplicationJobIds(nextJobIds);
  return nextJobIds;
}

export function filterActiveApplications(applications) {
  const cancelledJobIds = new Set(getParsedCancelledApplicationJobIds());
  return applications.filter((application) => !cancelledJobIds.has(application.jobId));
}
