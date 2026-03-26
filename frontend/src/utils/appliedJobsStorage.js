const APPLIED_JOBS_KEY = "appliedJobsByUser";

function getStorageKey(userId) {
  return `${APPLIED_JOBS_KEY}:${userId || "guest"}`;
}

function getParsedAppliedJobIds(userId) {
  const rawValue = localStorage.getItem(getStorageKey(userId));

  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue);
    return Array.isArray(parsed)
      ? parsed.filter((jobId) => typeof jobId === "string")
      : [];
  } catch {
    localStorage.removeItem(getStorageKey(userId));
    return [];
  }
}

function setAppliedJobIds(userId, jobIds) {
  localStorage.setItem(getStorageKey(userId), JSON.stringify(jobIds));
}

export function getAppliedJobIds(userId) {
  return getParsedAppliedJobIds(userId);
}

export function addAppliedJobId(userId, jobId) {
  const currentJobIds = getParsedAppliedJobIds(userId);

  if (currentJobIds.includes(jobId)) {
    return currentJobIds;
  }

  const nextJobIds = [...currentJobIds, jobId];
  setAppliedJobIds(userId, nextJobIds);
  return nextJobIds;
}

export function removeAppliedJobId(userId, jobId) {
  const nextJobIds = getParsedAppliedJobIds(userId).filter(
    (currentJobId) => currentJobId !== jobId
  );
  setAppliedJobIds(userId, nextJobIds);
  return nextJobIds;
}
