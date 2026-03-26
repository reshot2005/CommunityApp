import api from "./client";

const demoJobs = [
  {
    id: "demo-job-frontend",
    title: "Frontend Developer",
    companyName: "Google",
    description: "Build polished React interfaces, collaborate with product teams, and ship accessible UI at scale.",
    location: "Bengaluru",
    salary: 1200000,
    createdAt: "2026-03-20T09:00:00.000Z",
    jobType: "Full-time",
    isDemoJob: true
  },
  {
    id: "demo-job-backend",
    title: "Backend Developer",
    companyName: "Amazon",
    description: "Design APIs, improve data flows, and build reliable backend services for high-traffic products.",
    location: "Hyderabad",
    salary: 1350000,
    createdAt: "2026-03-19T09:00:00.000Z",
    jobType: "Full-time",
    isDemoJob: true
  },
  {
    id: "demo-job-fullstack",
    title: "Full Stack Developer",
    companyName: "Microsoft",
    description: "Work across React and Node.js, deliver end-to-end features, and help shape developer workflows.",
    location: "Remote",
    salary: 1450000,
    createdAt: "2026-03-18T09:00:00.000Z",
    jobType: "Remote",
    isDemoJob: true
  },
  {
    id: "demo-job-intern",
    title: "Software Engineering Intern",
    companyName: "Infosys",
    description: "Learn on a live engineering team, contribute to features, and gain hands-on product experience.",
    location: "Chennai",
    salary: 250000,
    createdAt: "2026-03-17T09:00:00.000Z",
    jobType: "Internship",
    isDemoJob: true
  },
  {
    id: "demo-job-uiux",
    title: "UI/UX Designer",
    companyName: "Adobe",
    description: "Design intuitive product flows, create polished design systems, and collaborate closely with frontend teams.",
    location: "Pune",
    salary: 950000,
    createdAt: "2026-03-16T09:00:00.000Z",
    jobType: "Full-time",
    isDemoJob: true
  },
  {
    id: "demo-job-devops",
    title: "DevOps Engineer",
    companyName: "Zoho",
    description: "Build deployment pipelines, improve infrastructure reliability, and automate release workflows across environments.",
    location: "Chennai",
    salary: 1400000,
    createdAt: "2026-03-15T09:00:00.000Z",
    jobType: "Hybrid",
    isDemoJob: true
  },
  {
    id: "demo-job-data",
    title: "Data Analyst",
    companyName: "Accenture",
    description: "Turn product and hiring data into actionable insights through dashboards, reporting, and trend analysis.",
    location: "Mumbai",
    salary: 800000,
    createdAt: "2026-03-14T09:00:00.000Z",
    jobType: "Full-time",
    isDemoJob: true
  },
  {
    id: "demo-job-qa",
    title: "QA Engineer",
    companyName: "TCS",
    description: "Own test planning, automate regression coverage, and improve overall product quality before release.",
    location: "Noida",
    salary: 780000,
    createdAt: "2026-03-13T09:00:00.000Z",
    jobType: "Full-time",
    isDemoJob: true
  },
  {
    id: "demo-job-product",
    title: "Associate Product Manager",
    companyName: "Flipkart",
    description: "Work with engineering and design to define features, prioritize roadmaps, and ship measurable outcomes.",
    location: "Bengaluru",
    salary: 1600000,
    createdAt: "2026-03-12T09:00:00.000Z",
    jobType: "Full-time",
    isDemoJob: true
  },
  {
    id: "demo-job-mobile",
    title: "React Native Developer",
    companyName: "Swiggy",
    description: "Build high-quality mobile experiences, integrate APIs, and improve performance for customer-facing apps.",
    location: "Remote",
    salary: 1250000,
    createdAt: "2026-03-11T09:00:00.000Z",
    jobType: "Remote",
    isDemoJob: true
  },
  {
    id: "demo-job-cyber",
    title: "Cybersecurity Analyst",
    companyName: "Wipro",
    description: "Monitor incidents, improve defensive controls, and support secure engineering practices across the platform.",
    location: "Hyderabad",
    salary: 1100000,
    createdAt: "2026-03-10T09:00:00.000Z",
    jobType: "Hybrid",
    isDemoJob: true
  }
];

function normalizeJob(job, index) {
  return {
    id: job.id ?? `job-${index}`,
    title: job.title ?? "Untitled role",
    companyName: job.companyName || job.company || "Company",
    description: job.description || "No description provided.",
    location: job.location || "Remote",
    salary: job.salary ?? null,
    createdAt: job.createdAt ?? null,
    applicationCount: job.applicationCount ?? 0,
    ...job
  };
}

export async function fetchJobs() {
  try {
    const { data } = await api.get("/jobs");
    const jobs = Array.isArray(data) ? data : data.jobs ?? [];

    if (jobs.length === 0) {
      return demoJobs.map(normalizeJob);
    }

    return jobs.map(normalizeJob);
  } catch {
    return demoJobs.map(normalizeJob);
  }
}

export async function fetchAppliedJobs() {
  const { data } = await api.get("/jobs/applied");
  return data.applications ?? [];
}

export async function createJob(payload) {
  const { data } = await api.post("/jobs", payload);
  return data.job;
}

export async function applyToJob(jobId) {
  const { data } = await api.post("/jobs/apply", { jobId });
  return data.application;
}

export async function cancelJobApplication(jobId) {
  try {
    const { data } = await api.delete(`/jobs/apply/${jobId}`);
    return data.application;
  } catch {
    try {
      const { data } = await api.post(`/jobs/apply/${jobId}/cancel`);
      return data.application;
    } catch {
      const { data } = await api.post("/jobs/cancel-application", { jobId });
      return data.application;
    }
  }
}
