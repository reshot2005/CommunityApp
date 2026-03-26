import { useEffect, useState } from "react";
import { fetchCurrentProfile, saveStudentProfile } from "../api/profile";
import PageHeader from "../components/common/PageHeader";
import PageTransition from "../components/motion/PageTransition";

function SettingsAccountPage() {
  const [profileData, setProfileData] = useState(null);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [studentForm, setStudentForm] = useState({
    skills: "",
    projects: "",
    resumeUrl: ""
  });

  useEffect(() => {
    async function loadProfile() {
      setIsLoading(true);

      try {
        const data = await fetchCurrentProfile();
        setProfileData(data);
        setStudentForm({
          skills: Array.isArray(data.profile?.skills) ? data.profile.skills.join(", ") : "",
          projects: Array.isArray(data.profile?.projects)
            ? data.profile.projects.join("\n")
            : "",
          resumeUrl: data.profile?.resumeUrl || ""
        });
        setError("");
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to load profile");
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, []);

  const user = profileData?.user;
  const profile = profileData?.profile;

  function handleStudentFormChange(event) {
    const { name, value } = event.target;
    setStudentForm((current) => ({
      ...current,
      [name]: value
    }));
  }

  function normalizeList(value, separatorPattern) {
    return value
      .split(separatorPattern)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  async function handleStudentProfileSave(event) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const updatedProfile = await saveStudentProfile({
        skills: normalizeList(studentForm.skills, /,/),
        projects: normalizeList(studentForm.projects, /\n/),
        resumeUrl: studentForm.resumeUrl.trim()
      });

      setProfileData((current) => ({
        ...current,
        profile: updatedProfile
      }));
      setSuccessMessage("Profile details saved");
    } catch (requestError) {
      const errorDetails = requestError.response?.data?.details;
      setError(
        Array.isArray(errorDetails) && errorDetails.length > 0
          ? errorDetails.join(", ")
          : requestError.response?.data?.message || "Failed to save profile"
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PageTransition className="space-y-8">
      <PageHeader
        eyebrow="Settings"
        title="Account Overview"
        description="Review your account details, role-specific profile information, and saved resume or project links."
      />

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
      {successMessage ? <p className="text-sm text-emerald-300">{successMessage}</p> : null}
      {isLoading ? <p className="text-sm text-gray-300">Loading account overview...</p> : null}

      {!isLoading && !error && user ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-[1.75rem] border border-gray-700 bg-gray-800 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
            <p className="text-sm uppercase tracking-[0.2em] text-blue-300">Account</p>
            <div className="mt-5 space-y-4 text-sm text-gray-200">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Name</p>
                <p className="mt-1 text-lg font-semibold text-white">{user.name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Email</p>
                <p className="mt-1">{user.email}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Role</p>
                <p className="mt-1 capitalize">{user.role}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Member Since</p>
                <p className="mt-1">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Recently"}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[1.75rem] border border-gray-700 bg-gray-800 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
            <p className="text-sm uppercase tracking-[0.2em] text-blue-300">Profile Details</p>

            {profile ? (
              <div className="mt-5 space-y-5 text-sm text-gray-200">
                {Array.isArray(profile.skills) ? (
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Skills</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {profile.skills.length > 0 ? (
                        profile.skills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded-full border border-gray-600 px-3 py-1 text-xs"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <p className="text-gray-400">No skills added yet.</p>
                      )}
                    </div>
                  </div>
                ) : null}

                {Array.isArray(profile.projects) ? (
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Projects</p>
                    <ul className="mt-2 space-y-2 text-gray-300">
                      {profile.projects.length > 0 ? (
                        profile.projects.map((project) => <li key={project}>{project}</li>)
                      ) : (
                        <li>No projects added yet.</li>
                      )}
                    </ul>
                  </div>
                ) : null}

                {profile.resumeUrl ? (
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Resume</p>
                    <a
                      href={profile.resumeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 inline-flex text-sm text-blue-300 hover:text-blue-200"
                    >
                      View resume
                    </a>
                  </div>
                ) : null}

                {profile.companyName ? (
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Company</p>
                    <p className="mt-1 text-white">{profile.companyName}</p>
                    <p className="mt-2 text-gray-300">{profile.description}</p>
                  </div>
                ) : null}

                {profile.collegeName ? (
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-gray-400">College</p>
                    <p className="mt-1 text-white">{profile.collegeName}</p>
                    <p className="mt-2 text-gray-300">{profile.location}</p>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="mt-5 text-sm text-gray-400">
                No role-specific profile details are available yet.
              </p>
            )}
          </section>
        </div>
      ) : null}

      {!isLoading && user?.role === "student" ? (
        <section className="rounded-[1.75rem] border border-gray-700 bg-gray-800 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.32)]">
          <p className="text-sm uppercase tracking-[0.2em] text-blue-300">
            Update Student Profile
          </p>
          <form className="mt-5 space-y-5" onSubmit={handleStudentProfileSave}>
            <div>
              <label
                htmlFor="skills"
                className="mb-2 block text-sm font-medium text-gray-100"
              >
                Skills
              </label>
              <textarea
                id="skills"
                name="skills"
                rows="3"
                value={studentForm.skills}
                onChange={handleStudentFormChange}
                placeholder="React, Node.js, PostgreSQL"
                className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-brand-500 focus:shadow-[0_0_0_1px_rgba(59,130,246,0.35),0_0_24px_rgba(59,130,246,0.12)]"
              />
              <p className="mt-2 text-xs text-gray-400">
                Enter skills separated by commas.
              </p>
            </div>

            <div>
              <label
                htmlFor="projects"
                className="mb-2 block text-sm font-medium text-gray-100"
              >
                Projects Done
              </label>
              <textarea
                id="projects"
                name="projects"
                rows="4"
                value={studentForm.projects}
                onChange={handleStudentFormChange}
                placeholder={"Campus placement portal\nRealtime recruiter chat app"}
                className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-brand-500 focus:shadow-[0_0_0_1px_rgba(59,130,246,0.35),0_0_24px_rgba(59,130,246,0.12)]"
              />
              <p className="mt-2 text-xs text-gray-400">
                Add one project per line.
              </p>
            </div>

            <div>
              <label
                htmlFor="resumeUrl"
                className="mb-2 block text-sm font-medium text-gray-100"
              >
                Resume Link
              </label>
              <input
                id="resumeUrl"
                name="resumeUrl"
                type="url"
                value={studentForm.resumeUrl}
                onChange={handleStudentFormChange}
                placeholder="https://example.com/resume.pdf"
                className="w-full rounded-2xl border border-gray-700 bg-gray-900 px-4 py-3 text-white outline-none transition placeholder:text-gray-500 focus:border-brand-500 focus:shadow-[0_0_0_1px_rgba(59,130,246,0.35),0_0_24px_rgba(59,130,246,0.12)]"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="interactive-button glow-button rounded-full bg-gradient-to-r from-blue-500 to-purple-500 px-6 py-3.5 text-sm font-semibold text-white hover:from-blue-400 hover:to-purple-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save Profile Details"}
            </button>
          </form>
        </section>
      ) : null}
    </PageTransition>
  );
}

export default SettingsAccountPage;
