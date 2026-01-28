export default function ProjectsTable({
  projects,
  loading,
  showArchived,
  onToggleArchived,
  onUpdateStatus,
  onArchive,
  onDelete,
  statusOptions,
  statusStyles,
  urgencyStyles,
}) {
  return (
    <div className="glass-card rounded-3xl p-6 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-semibold">Admin-Dashboard</h2>
          <p className="text-sm text-slate-500">
            Übersicht, Status und Archivierung deiner Druckprojekte.
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-slate-500">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
            checked={showArchived}
            onChange={onToggleArchived}
          />
          Archivierte anzeigen
        </label>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {loading ? (
          <div className="p-6 text-sm text-slate-500">Lade Projekte...</div>
        ) : projects.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">
            Noch keine Projekte eingereicht.
          </div>
        ) : (
          <div className="max-h-[420px] overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-white text-xs uppercase tracking-[0.25em] text-slate-400">
                <tr>
                  <th className="px-4 py-3">Projekt</th>
                  <th className="px-4 py-3">Dringlichkeit</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Farbe</th>
                  <th className="px-4 py-3 text-right">Aktion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {projects.map((project) => (
                  <tr key={project.id} className="align-top">
                    <td className="px-4 py-4">
                      <div className="flex flex-col gap-1">
                        <a
                          className="text-sm font-semibold text-ink underline-offset-4 hover:underline"
                          href={project.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {project.url}
                        </a>
                        <div className="text-xs text-slate-400">
                          Menge: {project.quantity}
                        </div>
                        {project.notes && (
                          <div className="text-xs text-slate-500">
                            {project.notes}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                          urgencyStyles[project.urgency] ||
                          "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {project.urgency}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <select
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          statusStyles[project.status] ||
                          "bg-slate-100 text-slate-600"
                        }`}
                        value={project.status}
                        onChange={(event) =>
                          onUpdateStatus(project.id, event.target.value)
                        }
                      >
                        {statusOptions.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            project.color_in_stock === 0
                              ? "bg-amber-100 text-amber-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {project.color_name
                            ? `${project.color_name}${
                                project.color_manufacturer
                                  ? ` (${project.color_manufacturer})`
                                  : ""
                              }`
                            : "Keine"}
                        </span>
                        {project.color_in_stock === 0 && (
                          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                            !
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex flex-col items-end gap-2">
                        {!project.archived && (
                          <button
                            className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 hover:border-accent hover:text-accent"
                            onClick={() => onArchive(project.id)}
                          >
                            Archivieren
                          </button>
                        )}
                        <button
                          className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-500 hover:border-rose-400 hover:text-rose-600"
                          onClick={() => onDelete(project.id)}
                        >
                          Löschen
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
