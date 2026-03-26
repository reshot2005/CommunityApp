function Card({ children, className = "" }) {
  return (
    <section
      className={`rounded-[1.75rem] border border-slate-800 bg-slate-900/90 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.3)] ${className}`.trim()}
    >
      {children}
    </section>
  );
}

export default Card;
