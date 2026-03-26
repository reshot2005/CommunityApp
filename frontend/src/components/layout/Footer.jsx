import { NavLink } from "react-router-dom";

const quickLinks = [
  { to: "/", label: "Home" },
  { to: "/jobs", label: "Jobs" },
  { to: "/community", label: "Community" },
  { to: "/dashboard", label: "Dashboard" }
];

const socialLinks = [
  { label: "LinkedIn", href: "#" },
  { label: "X", href: "#" },
  { label: "GitHub", href: "#" }
];

function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950/90">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-10 sm:px-6 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <h3 className="text-lg font-semibold text-white">About</h3>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            NexaWork brings jobs, student profiles, and community updates into one practical hiring workflow.
          </p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Quick Links</h3>
          <div className="mt-4 flex flex-col gap-3">
            {quickLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className="text-sm text-slate-300 transition hover:text-sky-300"
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Contact</h3>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <p>support@nexawork.dev</p>
            <p>+91 98765 43210</p>
            <p>Bengaluru, India</p>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white">Social</h3>
          <div className="mt-4 flex flex-wrap gap-3">
            {socialLinks.map((social) => (
              <a
                key={social.label}
                href={social.href}
                className="interactive-button rounded-full border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-slate-200 hover:border-sky-400/40 hover:text-sky-300"
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-slate-800 px-4 py-4 text-center text-sm text-slate-500">
        Copyright (c) 2026 NexaWork. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
