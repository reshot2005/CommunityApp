import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { fetchAppliedJobs, fetchJobs } from "../api/jobs";
import { fetchCurrentProfile } from "../api/profile";
import Card from "../components/common/Card";
import LoadingSpinner from "../components/common/LoadingSpinner";
import PageHeader from "../components/common/PageHeader";
import PageTransition from "../components/motion/PageTransition";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { filterActiveApplications } from "../utils/applicationStatusStorage";
import { getAppliedJobIds } from "../utils/appliedJobsStorage";
import { getSavedJobs } from "../utils/savedJobsStorage";

function MetricCard({ title, value, description, to }) {
  const content = (
    <Card className="space-y-3 transition hover:border-sky-400/40 hover:bg-slate-900/80">
      <p className="text-xs uppercase tracking-[0.2em] text-sky-300">{title}</p>
      <p className="text-4xl font-semibold text-white">{value}</p>
      <p className="text-sm leading-7 text-slate-300">{description}</p>
    </Card>
  );

  if (!to) {
    return content;
  }

  return (
    <Link to={to} className="block">
      {content}
    </Link>
  );
}

function SectionCard({ title, description, children }) {
  return (
    <Card className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        <p className="mt-2 text-sm leading-7 text-slate-300">{description}</p>
      </div>
      {children}
    </Card>
  );
}

function QuickLink({ to, label, variant = "secondary" }) {
  const className =
    variant === "primary"
      ? "interactive-button rounded-full bg-sky-500/15 px-4 py-2.5 text-sm font-medium text-sky-200"
      : "interactive-button rounded-full border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200";

  return (
    <Link to={to} className={className}>
      {label}
    </Link>
  );
}

function StudentDashboard({ stats, profileName }) {
  const cards = [
    {
      title: "Applied Jobs",
      value: stats.appliedJobs,
      description: "Track active applications and keep momentum with your shortlist.",
      to: "/jobs"
    },
    {
      title: "Saved Jobs",
      value: stats.savedJobs,
      description: "Return to promising roles whenever you are ready to apply.",
      to: "/saved-jobs"
    },
    {
      title: "Unread Alerts",
      value: stats.unreadNotifications,
      description: "Stay on top of replies, updates, and new activity across the app.",
      to: "/notifications"
    }
  ];

  return (
    <>
      <PageHeader
        eyebrow="Student Dashboard"
        title={`Welcome back, ${profileName}`}
        description="Keep your job search organized, active, and easy to move forward."
      />

      <div className="flex flex-wrap gap-3">
        <QuickLink to="/jobs" label="Browse Jobs" variant="primary" />
        <QuickLink to="/saved-jobs" label="Saved Jobs" />
        <QuickLink to="/profile" label="Profile" />
        <QuickLink to="/notifications" label="Notifications" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <MetricCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="This Week"
          description="A simple pulse check on where your search currently stands."
        >
          <div className="space-y-3 text-sm text-slate-300">
            <p>You have {stats.appliedJobs} active application{stats.appliedJobs === 1 ? "" : "s"}.</p>
            <p>Your saved list has {stats.savedJobs} role{stats.savedJobs === 1 ? "" : "s"} ready for review.</p>
            <p>{stats.unreadNotifications} unread notification{stats.unreadNotifications === 1 ? "" : "s"} may need attention.</p>
          </div>
        </SectionCard>

        <SectionCard
          title="Suggested Focus"
          description="A quick guide for what to do next from the dashboard."
        >
          <div className="space-y-3 text-sm text-slate-300">
            <p>Update your profile so companies get a clearer picture of your skills and projects.</p>
            <p>Revisit saved jobs and apply to the strongest matches while they are still fresh.</p>
            <p>Check notifications and messages for replies from recruiters or teams.</p>
          </div>
        </SectionCard>
      </div>
    </>
  );
}

function CompanyDashboard({ stats, profileName }) {
  const cards = [
    {
      title: "Jobs Posted",
      value: stats.jobsPosted,
      description: "Open roles currently visible through your company dashboard.",
      to: "/jobs"
    },
    {
      title: "Applications Received",
      value: stats.applicationsReceived,
      description: "Candidate activity captured from your current listings.",
      to: "/notifications"
    },
    {
      title: "Unread Alerts",
      value: stats.unreadNotifications,
      description: "New applications and messages waiting for your review.",
      to: "/notifications"
    }
  ];

  return (
    <>
      <PageHeader
        eyebrow="Company Dashboard"
        title={`Welcome back, ${profileName}`}
        description="Monitor openings, application flow, and candidate activity from one place."
      />

      <div className="flex flex-wrap gap-3">
        <QuickLink to="/jobs" label="Manage Jobs" variant="primary" />
        <QuickLink to="/notifications" label="Notifications" />
        <QuickLink to="/community" label="Community" />
        <QuickLink to="/profile" label="Company Profile" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <MetricCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Hiring Snapshot"
          description="A quick summary of how your recruitment activity looks right now."
        >
          <div className="space-y-3 text-sm text-slate-300">
            <p>{stats.jobsPosted} open role{stats.jobsPosted === 1 ? "" : "s"} are currently listed.</p>
            <p>{stats.applicationsReceived} application event{stats.applicationsReceived === 1 ? "" : "s"} have been recorded.</p>
            <p>{stats.unreadNotifications} unread alert{stats.unreadNotifications === 1 ? "" : "s"} may need follow-up.</p>
          </div>
        </SectionCard>

        <SectionCard
          title="Recommended Actions"
          description="Helpful next steps to keep the hiring pipeline moving."
        >
          <div className="space-y-3 text-sm text-slate-300">
            <p>Review recent notifications for new applications and direct messages.</p>
            <p>Keep role descriptions updated so the right candidates are more likely to apply.</p>
            <p>Use the community section to build visibility and attract stronger talent.</p>
          </div>
        </SectionCard>
      </div>
    </>
  );
}

function CollegeDashboard({ stats, profileName }) {
  const cards = [
    {
      title: "Opportunities Visible",
      value: stats.jobsPosted,
      description: "Roles students can currently discover across the platform.",
      to: "/jobs"
    },
    {
      title: "Community Activity",
      value: stats.unreadNotifications,
      description: "Unread alerts and ongoing platform activity worth reviewing.",
      to: "/notifications"
    },
    {
      title: "Profile Readiness",
      value: "Active",
      description: "Keep institution details current to support student placement workflows.",
      to: "/profile"
    }
  ];

  return (
    <>
      <PageHeader
        eyebrow="College Dashboard"
        title={`Welcome back, ${profileName}`}
        description="Track ecosystem activity and keep your students connected to opportunities."
      />

      <div className="flex flex-wrap gap-3">
        <QuickLink to="/jobs" label="View Opportunities" variant="primary" />
        <QuickLink to="/community" label="Community Feed" />
        <QuickLink to="/notifications" label="Notifications" />
        <QuickLink to="/profile" label="College Profile" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => (
          <MetricCard key={card.title} {...card} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <SectionCard
          title="Platform Overview"
          description="A high-level view designed for coordination and placement support."
        >
          <div className="space-y-3 text-sm text-slate-300">
            <p>{stats.jobsPosted} opportunity listings are visible across the platform.</p>
            <p>{stats.unreadNotifications} notification{stats.unreadNotifications === 1 ? "" : "s"} can help you stay aligned with activity.</p>
            <p>Your dashboard is tailored for student support, coordination, and visibility.</p>
          </div>
        </SectionCard>

        <SectionCard
          title="Suggested Focus"
          description="A few good next steps for college-facing use of the platform."
        >
          <div className="space-y-3 text-sm text-slate-300">
            <p>Review live opportunities and guide students toward the strongest matches.</p>
            <p>Use community updates to keep communication active with companies and learners.</p>
            <p>Keep the profile current so institutional details stay accurate and visible.</p>
          </div>
        </SectionCard>
      </div>
    </>
  );
}

function DashboardPage() {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    appliedJobs: 0,
    savedJobs: 0,
    jobsPosted: 0,
    applicationsReceived: 0,
    unreadNotifications: 0,
    profileName: user?.name || "User"
  });

  useEffect(() => {
    async function loadDashboard() {
      setIsLoading(true);

      const [jobs, appliedJobs, profileData] = await Promise.all([
        fetchJobs().catch(() => []),
        user?.role === "student" ? fetchAppliedJobs().catch(() => []) : Promise.resolve([]),
        fetchCurrentProfile().catch(() => null)
      ]);

      const activeApplications = filterActiveApplications(appliedJobs);
      const localAppliedJobIds = user?.role === "student" ? getAppliedJobIds(user?.id) : [];
      const uniqueAppliedJobs = new Set([
        ...activeApplications.map((application) => application.jobId),
        ...localAppliedJobIds
      ]);
      const savedJobs = getSavedJobs();
      const companyApplications =
        jobs.reduce((total, job) => total + Number(job.applicationCount || 0), 0) || 0;

      setStats({
        appliedJobs: uniqueAppliedJobs.size,
        savedJobs: savedJobs.length,
        jobsPosted: jobs.length,
        applicationsReceived: companyApplications,
        unreadNotifications: unreadCount,
        profileName: profileData?.user?.name || user?.name || "User"
      });
      setIsLoading(false);
    }

    loadDashboard();
  }, [unreadCount, user?.id, user?.name, user?.role]);

  const dashboardContent = useMemo(() => {
    if (user?.role === "student") {
      return <StudentDashboard stats={stats} profileName={stats.profileName} />;
    }

    if (user?.role === "company") {
      return <CompanyDashboard stats={stats} profileName={stats.profileName} />;
    }

    return <CollegeDashboard stats={stats} profileName={stats.profileName} />;
  }, [stats, user?.role]);

  if (isLoading) {
    return <LoadingSpinner label="Loading dashboard..." />;
  }

  return <PageTransition className="space-y-8">{dashboardContent}</PageTransition>;
}

export default DashboardPage;
