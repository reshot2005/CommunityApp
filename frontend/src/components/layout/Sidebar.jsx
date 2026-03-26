import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const primaryLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/jobs", label: "Jobs" },
  { to: "/community", label: "Community" },
  { to: "/chat", label: "Chat" }
];

const settingsLinks = [
  { to: "/settings/account", label: "Account Overview" },
  { to: "/settings/applied-jobs", label: "Applied Jobs" }
];

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isSettingsSectionActive = location.pathname.startsWith("/settings");
  const [isSettingsOpen, setIsSettingsOpen] = useState(isSettingsSectionActive);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <aside className="flex w-full flex-col rounded-[2rem] border border-gray-700 bg-gray-800 p-5 shadow-[0_24px_80px_rgba(0,0,0,0.35)] lg:min-h-[calc(100vh-3rem)] lg:w-72 lg:p-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Workspace</p>
        <h2 className="mt-3 text-2xl font-semibold text-white">CareerHub</h2>
        <p className="mt-2 text-sm leading-6 text-gray-300">
          Navigate your dashboard, opportunities, and community activity.
        </p>
      </div>

      <nav className="mt-8 flex flex-1 flex-col gap-2.5 text-sm text-gray-200">
        {primaryLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `interactive-button ${isActive ? "glow-button" : ""} rounded-2xl px-4 py-3.5 transition ${
                isActive
                  ? "border border-blue-400/50 bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                  : "border border-gray-700 bg-gray-900 hover:border-blue-400/40 hover:bg-gray-700"
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}

        <div className="rounded-2xl border border-gray-700 bg-gray-900">
          <button
            type="button"
            onClick={() => setIsSettingsOpen((current) => !current)}
            className={`interactive-button flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left transition ${
              isSettingsSectionActive
                ? "glow-button border border-blue-400/50 bg-gradient-to-r from-blue-500 to-purple-500 text-white"
                : "hover:border-blue-400/40 hover:bg-gray-700"
            }`}
          >
            <span>Settings</span>
            <span className="text-xs">{isSettingsOpen ? "−" : "+"}</span>
          </button>

          {isSettingsOpen ? (
            <div className="flex flex-col gap-2 border-t border-gray-700 px-3 py-3">
              {settingsLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  className={({ isActive }) =>
                    `interactive-button rounded-xl px-3 py-2.5 text-sm transition ${
                      isActive
                        ? "border border-blue-400/50 bg-blue-500/15 text-white"
                        : "border border-gray-700 bg-gray-800 text-gray-200 hover:border-blue-400/40 hover:bg-gray-700"
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
          ) : null}
        </div>
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="interactive-button mt-6 rounded-2xl border border-rose-400/30 bg-rose-500/15 px-4 py-3.5 text-left text-sm font-medium text-rose-100 transition hover:border-rose-300/40 hover:bg-rose-500/20"
      >
        Logout
      </button>
    </aside>
  );
}

export default Sidebar;
