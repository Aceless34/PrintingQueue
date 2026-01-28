export default function Header({ projectCount, theme, onToggleTheme }) {
  return (
    <header className="flex flex-col gap-4">
      <p className="text-xs uppercase tracking-[0.4em] text-slate-500 dark:text-slate-400">
        Printing Queue
      </p>
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink dark:text-haze md:text-4xl">
            3D-Druck Projekte im Blick
          </h1>
          <p className="max-w-xl text-sm text-slate-500 dark:text-slate-400">
            Sammle alle Druckaufträge, priorisiere sie schnell und halte den
            Status in einem kompakten Dashboard im Blick.
          </p>
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
          <div className="rounded-full bg-white px-4 py-2 text-sm shadow-card dark:bg-slate-900 dark:text-slate-100 dark:shadow-none">
            {projectCount} aktive Projekte
          </div>
        </div>
      </div>
    </header>
  );
}