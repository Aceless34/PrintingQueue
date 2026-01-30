export default function PageHeader({
  title,
  description,
  projectCount,
  theme,
  onToggleTheme,
}) {
  return (
    <header className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink dark:text-haze md:text-4xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
              {description}
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 shadow-card transition hover:border-accent hover:text-accent dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:shadow-none dark:hover:border-amber-400 dark:hover:text-amber-300"
            type="button"
            aria-pressed={theme === "dark"}
            onClick={onToggleTheme}
          >
            {theme === "dark" ? "Lightmode" : "Darkmode"}
          </button>
          {typeof projectCount === "number" && (
            <div className="rounded-full bg-white px-4 py-2 text-sm shadow-card dark:bg-slate-900 dark:text-slate-100 dark:shadow-none">
              {projectCount} aktive Projekte
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
