import { useEffect, useState } from "react";
import {
  fetchCurrentProfile,
  saveCollegeProfile,
  saveCompanyProfile,
  saveStudentProfile
} from "../api/profile";
import Button from "../components/common/Button";
import Card from "../components/common/Card";
import LoadingSpinner from "../components/common/LoadingSpinner";
import PageHeader from "../components/common/PageHeader";
import TextField from "../components/common/TextField";
import PageTransition from "../components/motion/PageTransition";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const defaultStudentSkills = ["React", "Node.js", "PostgreSQL"];
const defaultStudentProjects = ["Portfolio website", "Job tracking dashboard"];

function buildFormData(profile = {}) {
  return {
    skills: Array.isArray(profile.skills) ? profile.skills.join(", ") : "",
    projects: Array.isArray(profile.projects) ? profile.projects.join("\n") : "",
    resumeUrl: profile.resumeUrl || "",
    companyName: profile.companyName || "",
    description: profile.description || "",
    collegeName: profile.collegeName || "",
    location: profile.location || ""
  };
}

function normalizeList(value, separatorPattern) {
  return value
    .split(separatorPattern)
    .map((item) => item.trim())
    .filter(Boolean);
}

function ProfilePage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    skills: "",
    projects: "",
    resumeUrl: "",
    companyName: "",
    description: "",
    collegeName: "",
    location: ""
  });

  useEffect(() => {
    async function loadProfile() {
      try {
        const data = await fetchCurrentProfile();
        setProfileData(data);
        setFormData(buildFormData(data.profile));
      } catch {
        showToast("Failed to load profile", "error");
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, [showToast]);

  function handleChange(event) {
    const { name, value } = event.target;
    setIsEditing(true);
    setFormData((current) => ({ ...current, [name]: value }));
  }

  function handleEditToggle() {
    if (isEditing) {
      setFormData(buildFormData(profileData?.profile));
    }

    setIsEditing((current) => !current);
  }

  async function handleSave(event) {
    event.preventDefault();
    setIsSaving(true);

    try {
      let profile;

      if (user?.role === "student") {
        profile = await saveStudentProfile({
          skills: normalizeList(formData.skills, /,|\n/),
          projects: normalizeList(formData.projects, /\n|,/),
          resumeUrl: formData.resumeUrl.trim()
        });
      } else if (user?.role === "company") {
        profile = await saveCompanyProfile({
          companyName: formData.companyName.trim() || user?.name || "Company",
          description: formData.description.trim()
        });
      } else {
        profile = await saveCollegeProfile({
          collegeName: formData.collegeName.trim() || user?.name || "College",
          location: formData.location.trim()
        });
      }

      setProfileData((current) => ({ ...current, profile }));
      setFormData(buildFormData(profile));
      setIsEditing(false);
      showToast("Profile updated", "success");
    } catch {
      showToast("Failed to update profile", "error");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <LoadingSpinner label="Loading profile..." />;
  }

  const profile = profileData?.profile || {};
  const skills =
    Array.isArray(profile.skills) && profile.skills.length > 0
      ? profile.skills
      : defaultStudentSkills;
  const projects =
    Array.isArray(profile.projects) && profile.projects.length > 0
      ? profile.projects
      : defaultStudentProjects;

  return (
    <PageTransition className="space-y-8">
      <PageHeader
        eyebrow="Profile"
        title="Your profile"
        description="Keep your public profile current so the portal looks and behaves like a real hiring product."
      />

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-sky-300">{user?.role || "User"}</p>
              <h2 className="mt-2 text-3xl font-semibold text-white">{profileData?.user?.name}</h2>
              <p className="mt-2 text-sm text-slate-300">{profileData?.user?.email}</p>
            </div>
            <Button variant="secondary" onClick={handleEditToggle}>
              {isEditing ? "Cancel" : "Edit Profile"}
            </Button>
          </div>

          {user?.role === "student" ? (
            <>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Skills</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {skills.map((skill) => (
                    <span key={skill} className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Projects</p>
                <div className="mt-3 space-y-2 text-sm text-slate-300">
                  {projects.map((project) => (
                    <p key={project}>{project}</p>
                  ))}
                </div>
              </div>
            </>
          ) : null}

          {user?.role === "company" ? (
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Company Overview</p>
              <p className="text-xl font-semibold text-white">{profile.companyName || profileData?.user?.name}</p>
              <p className="text-sm leading-7 text-slate-300">
                {profile.description || "Add a short company summary so students understand your team and open roles."}
              </p>
            </div>
          ) : null}

          {user?.role === "college" ? (
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Campus Details</p>
              <p className="text-xl font-semibold text-white">{profile.collegeName || profileData?.user?.name}</p>
              <p className="text-sm text-slate-300">{profile.location || "Campus location not set"}</p>
            </div>
          ) : null}
        </Card>

        <Card>
          <form className="space-y-5" onSubmit={handleSave}>
            {user?.role === "student" ? (
              <>
                <TextField
                  name="resumeUrl"
                  id="resumeUrl"
                  label="Resume URL"
                  value={formData.resumeUrl}
                  onChange={handleChange}
                  placeholder="https://..."
                />
                <div className="space-y-2">
                  <label htmlFor="skills" className="text-sm font-medium text-slate-100">
                    Skills
                  </label>
                  <textarea
                    id="skills"
                    name="skills"
                    rows="3"
                    value={formData.skills}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-brand-500"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="projects" className="text-sm font-medium text-slate-100">
                    Projects
                  </label>
                  <textarea
                    id="projects"
                    name="projects"
                    rows="5"
                    value={formData.projects}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-brand-500"
                  />
                </div>
              </>
            ) : null}

            {user?.role === "company" ? (
              <>
                <TextField
                  name="companyName"
                  id="companyName"
                  label="Company Name"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Your company"
                />
                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium text-slate-100">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    rows="6"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-brand-500"
                  />
                </div>
              </>
            ) : null}

            {user?.role === "college" ? (
              <>
                <TextField
                  name="collegeName"
                  id="collegeName"
                  label="College Name"
                  value={formData.collegeName}
                  onChange={handleChange}
                  placeholder="Campus name"
                />
                <TextField
                  name="location"
                  id="location"
                  label="Location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="City, State"
                />
              </>
            ) : null}

            <Button type="submit" disabled={!isEditing || isSaving} className="w-full">
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </Card>
      </div>
    </PageTransition>
  );
}

export default ProfilePage;
