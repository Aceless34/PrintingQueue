export default function Sidebar({ currentPage, onChange }) {
  const items = [
    { id: "home", label: "Projekt anlegen" },
    { id: "admin", label: "Admin Dashboard" },
    { id: "filament", label: "Filamentmanagement" },
    { id: "settings", label: "Einstellungen" },
  ];

  return (
    <aside className="w-full max-w-[240px] rounded-3xl bg-white/70 p-5 shadow-card backdrop-blur dark:bg-slate-900/70 dark:shadow-none">
      <div className="text-xs uppercase tracking-[0.4em] text-slate-400">
        Printing Queue
      </div>
      <nav className="mt-6 flex flex-col gap-2">
        {items.map((item) => {
          const isActive = currentPage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
                isActive
                  ? "bg-accent text-white shadow-card"
                  : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
      <div className="mt-6 rounded-2xl border border-slate-200 px-3 py-2 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
        Navigation
      </div>
    </aside>
  );
}
