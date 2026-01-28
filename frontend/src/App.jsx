import { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

const urgencyOptions = ["Niedrig", "Mittel", "Hoch"];
const statusOptions = ["Offen", "In Arbeit", "Fertig"];

const urgencyStyles = {
  Niedrig: "bg-emerald-100 text-emerald-700",
  Mittel: "bg-amber-100 text-amber-700",
  Hoch: "bg-rose-100 text-rose-700",
};

const statusStyles = {
  Offen: "bg-sky-100 text-sky-700",
  "In Arbeit": "bg-indigo-100 text-indigo-700",
  Fertig: "bg-emerald-100 text-emerald-700",
};

export default function App() {
  const [formData, setFormData] = useState({
    url: "",
    quantity: 1,
    notes: "",
    urgency: "Mittel",
  });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [error, setError] = useState("");

  const projectCount = useMemo(() => projects.length, [projects]);

  const loadProjects = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${API_BASE}/projects?includeArchived=${showArchived ? "1" : "0"}`
      );
      if (!res.ok) throw new Error("Konnte Projekte nicht laden");
      const data = await res.json();
      setProjects(data);
    } catch (err) {
      setError("Beim Laden ist etwas schiefgelaufen.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [showArchived]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload?.error || "Fehler beim Speichern");
      }

      setFormData({ url: "", quantity: 1, notes: "", urgency: "Mittel" });
      await loadProjects();
    } catch (err) {
      setError(err.message || "Fehler beim Speichern");
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id, status) => {
    setError("");
    try {
      const res = await fetch(`${API_BASE}/projects/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Status konnte nicht aktualisiert werden");
      await loadProjects();
    } catch (err) {
      setError("Status konnte nicht aktualisiert werden.");
    }
  };

  const archiveProject = async (id) => {
    setError("");
    try {
      const res = await fetch(`${API_BASE}/projects/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ archived: true }),
      });
      if (!res.ok) throw new Error("Archivierung fehlgeschlagen");
      await loadProjects();
    } catch (err) {
      setError("Archivierung fehlgeschlagen.");
    }
  };

  const deleteProject = async (id) => {
    const ok = confirm("Projekt wirklich löschen?");
    if (!ok) return;
    setError("");
    try {
      const res = await fetch(`${API_BASE}/projects/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Löschen fehlgeschlagen");
      await loadProjects();
    } catch (err) {
      setError("Löschen fehlgeschlagen.");
    }
  };

  return (
    <div className="min-h-screen app-shell text-ink">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10">
        <header className="flex flex-col gap-4">
          <p className="text-xs uppercase tracking-[0.4em] text-slate-500">
            Printing Queue
          </p>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="font-display text-3xl font-semibold text-ink md:text-4xl">
                3D-Druck Projekte im Blick
              </h1>
              <p className="max-w-xl text-sm text-slate-500">
                Sammle alle Druckaufträge, priorisiere sie schnell und halte den
                Status in einem kompakten Dashboard im Blick.
              </p>
            </div>
            <div className="rounded-full bg-white px-4 py-2 text-sm shadow-card">
              {projectCount} aktive Projekte
            </div>
          </div>
        </header>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        <section className="grid gap-8 lg:grid-cols-[1.1fr_1.4fr]">
          <div className="glass-card rounded-3xl p-6 shadow-card">
            <h2 className="font-display text-xl font-semibold">
              Neues Projekt anlegen
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Schicke deiner Freundin ein kompaktes Formular für neue Druckideen.
            </p>
            <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                Modell-URL
                <input
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-base text-ink shadow-sm outline-none focus:border-accent"
                  name="url"
                  type="url"
                  placeholder="https://www.printables.com/"
                  value={formData.url}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                Gewünschte Anzahl
                <input
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-base text-ink shadow-sm outline-none focus:border-accent"
                  name="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                Notizen / Ergänzungen
                <textarea
                  className="min-h-[120px] rounded-xl border border-slate-200 bg-white px-4 py-2 text-base text-ink shadow-sm outline-none focus:border-accent"
                  name="notes"
                  placeholder="Material, Farbe, Skalierung ..."
                  value={formData.notes}
                  onChange={handleChange}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                Dringlichkeit
                <select
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-base text-ink shadow-sm outline-none focus:border-accent"
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleChange}
                >
                  {urgencyOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="mt-2 rounded-xl bg-accent px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-accentDeep disabled:cursor-not-allowed disabled:opacity-60"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Speichern..." : "Projekt speichern"}
              </button>
            </form>
          </div>

          <div className="glass-card rounded-3xl p-6 shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold">
                  Admin-Dashboard
                </h2>
                <p className="text-sm text-slate-500">
                  Übersicht, Status und Archivierung deiner Druckprojekte.
                </p>
              </div>
              <label className="flex items-center gap-2 text-sm text-slate-500">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-accent focus:ring-accent"
                  checked={showArchived}
                  onChange={(event) => setShowArchived(event.target.checked)}
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
                                urgencyStyles[project.urgency] || "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {project.urgency}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <select
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                statusStyles[project.status] || "bg-slate-100 text-slate-600"
                              }`}
                              value={project.status}
                              onChange={(event) =>
                                updateStatus(project.id, event.target.value)
                              }
                            >
                              {statusOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="flex flex-col items-end gap-2">
                              {!project.archived && (
                                <button
                                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 hover:border-accent hover:text-accent"
                                  onClick={() => archiveProject(project.id)}
                                >
                                  Archivieren
                                </button>
                              )}
                              <button
                                className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-500 hover:border-rose-400 hover:text-rose-600"
                                onClick={() => deleteProject(project.id)}
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
        </section>
      </div>
    </div>
  );
}
