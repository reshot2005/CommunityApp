import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useNotifications } from "../../context/NotificationContext";
import { useToast } from "../../context/ToastContext";
import Button from "../common/Button";

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/jobs", label: "Jobs" },
  { to: "/community", label: "Community" },
  { to: "/chat", label: "Messages" },
  { to: "/dashboard", label: "Dashboard" }
];

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();
  const { showToast } = useToast();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isHomePage = location.pathname === "/";
  const visibleNavLinks = isHomePage ? navLinks.filter((link) => link.to === "/") : navLinks;

  function handleLogout() {
    logout();
    setIsMobileOpen(false);
    showToast("Logged out successfully", "success");
    navigate("/login");
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <NavLink to="/" className="flex items-center gap-3 text-lg font-semibold text-white">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 text-sm font-bold text-white shadow-[0_10px_30px_rgba(14,165,233,0.25)]">
            NW
          </span>
          <div>
            <span className="block">NexaWork</span>
            <span className="block text-xs font-medium uppercase tracking-[0.24em] text-slate-400">
              Community Platform
            </span>
          </div>
        </NavLink>

        <nav className="hidden items-center gap-2 md:flex">
          {visibleNavLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `interactive-button rounded-full px-4 py-2.5 text-sm font-medium ${
                  isActive
                    ? "bg-sky-500/15 text-sky-200"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          {user ? (
            <>
              <NavLink
                to="/notifications"
                className="interactive-button relative rounded-full border border-slate-700 px-4 py-2.5 text-sm text-slate-200 hover:border-sky-400/40 hover:bg-slate-900"
              >
                Notifications
                {unreadCount > 0 ? (
                  <span className="ml-2 rounded-full bg-sky-500 px-2 py-0.5 text-[11px] font-semibold text-white">
                    {unreadCount}
                  </span>
                ) : null}
              </NavLink>
              <NavLink
                to="/profile"
                className="interactive-button rounded-full border border-slate-700 px-4 py-2.5 text-sm text-slate-200 hover:border-sky-400/40 hover:bg-slate-900"
              >
                {user.name || "Profile"}
              </NavLink>
              <Button variant="danger" className="px-4 py-2.5" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className="interactive-button rounded-full border border-slate-700 px-4 py-2.5 text-sm text-slate-200 hover:border-sky-400/40 hover:bg-slate-900"
              >
                Login
              </NavLink>
              <NavLink to="/register">
                <Button className="px-4 py-2.5">Register</Button>
              </NavLink>
            </>
          )}
        </nav>

        <button
          type="button"
          onClick={() => setIsMobileOpen((current) => !current)}
          className="interactive-button inline-flex rounded-2xl border border-slate-800 bg-slate-900 p-3 text-slate-100 md:hidden"
          aria-label="Toggle navigation"
        >
          <span className="flex h-5 w-5 flex-col justify-center gap-1.5">
            <span className="h-0.5 w-full rounded-full bg-current" />
            <span className="h-0.5 w-full rounded-full bg-current" />
            <span className="h-0.5 w-full rounded-full bg-current" />
          </span>
        </button>
      </div>

      {isMobileOpen ? (
        <div className="border-t border-slate-800 px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-2">
            {visibleNavLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setIsMobileOpen(false)}
                className={({ isActive }) =>
                  `interactive-button rounded-2xl px-4 py-3 text-sm font-medium ${
                    isActive
                      ? "bg-sky-500/15 text-sky-200"
                      : "border border-slate-800 bg-slate-900 text-slate-200 hover:border-sky-400/40"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            {user ? (
              <>
                <NavLink
                  to="/notifications"
                  onClick={() => setIsMobileOpen(false)}
                  className="interactive-button rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-200"
                >
                  Notifications{unreadCount > 0 ? ` (${unreadCount})` : ""}
                </NavLink>
                <NavLink
                  to="/profile"
                  onClick={() => setIsMobileOpen(false)}
                  className="interactive-button rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-200"
                >
                  {user.name || "Profile"}
                </NavLink>
                <Button variant="danger" className="rounded-2xl" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <NavLink
                  to="/login"
                  onClick={() => setIsMobileOpen(false)}
                  className="interactive-button rounded-2xl border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-200"
                >
                  Login
                </NavLink>
                <NavLink to="/register" onClick={() => setIsMobileOpen(false)}>
                  <Button className="w-full rounded-2xl">Register</Button>
                </NavLink>
              </>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  );
}

export default Navbar;
