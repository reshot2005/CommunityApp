function PageHeader({ eyebrow, title, description, className = "" }) {
  return (
    <div className={`space-y-3 ${className}`.trim()}>
      {eyebrow ? (
        <p className="text-sm uppercase tracking-[0.3em] text-blue-300">{eyebrow}</p>
      ) : null}
      <h1 className="text-3xl font-semibold text-white md:text-4xl">{title}</h1>
      {description ? (
        <p className="max-w-2xl text-sm leading-7 text-gray-300">{description}</p>
      ) : null}
    </div>
  );
}

export default PageHeader;
