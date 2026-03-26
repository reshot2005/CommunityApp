function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-[1.75rem] border border-slate-800 bg-slate-900/70 p-10 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-700 border-t-sky-400" />
      <p className="text-sm text-slate-300">{label}</p>
    </div>
  );
}

export default LoadingSpinner;
