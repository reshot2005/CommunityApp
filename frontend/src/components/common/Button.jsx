function Button({
  children,
  type = "button",
  variant = "primary",
  className = "",
  ...props
}) {
  const variants = {
    primary:
      "glow-button bg-gradient-to-r from-sky-500 to-blue-600 text-white hover:from-sky-400 hover:to-blue-500",
    secondary:
      "border border-slate-700 bg-slate-900 text-slate-100 hover:border-sky-400/40 hover:bg-slate-800",
    ghost:
      "border border-slate-700/80 bg-transparent text-slate-200 hover:border-sky-400/40 hover:bg-slate-900/70",
    success:
      "border border-emerald-400/30 bg-emerald-500/15 text-emerald-100 hover:bg-emerald-500/20",
    danger:
      "border border-rose-400/30 bg-rose-500/15 text-rose-100 hover:bg-rose-500/20"
  };

  return (
    <button
      type={type}
      className={`interactive-button rounded-full px-5 py-3 text-sm font-semibold ${variants[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
