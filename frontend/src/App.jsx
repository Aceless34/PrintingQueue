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
    colorId: "",
    colorName: "",
  });
  const [projects, setProjects] = useState([]);
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [error, setError] = useState("");
  const [addingColor, setAddingColor] = useState(false);
  const [newColorName, setNewColorName] = useState("");

  const projectCount = useMemo(() => projects.length, [projects]);
  const availableColors = useMemo(
    () => colors.filter((color) => color.in_stock),
    [colors]
  );

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

  const loadColors = async () => {
    try {
      const res = await fetch(`${API_BASE}/filament-colors`);
      if (!res.ok) throw new Error("Konnte Farben nicht laden");
      const data = await res.json();
      setColors(data);
    } catch (err) {
      setError("Filamentfarben konnten nicht geladen werden.");
    }
  };

  useEffect(() => {
    loadProjects();
  }, [showArchived]);

  useEffect(() => {
    loadColors();
  }, []);

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
      const payload = {
        url: formData.url,
        quantity: formData.quantity,
        notes: formData.notes,
        urgency: formData.urgency,
      };

      if (formData.colorId === "new") {
        const trimmedName = formData.colorName.trim();
        if (!trimmedName) {
          setError("Bitte eine neue Farbe angeben.");
          setSubmitting(false);
          return;
        }
        payload.colorName = trimmedName;
      } else if (formData.colorId) {
        payload.colorId = Number(formData.colorId);
      }

      const res = await fetch(`${API_BASE}/projects`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const payload = await res.json();
        throw new Error(payload?.error || "Fehler beim Speichern");
      }

      setFormData({
        url: "",
        quantity: 1,
        notes: "",
        urgency: "Mittel",
        colorId: "",
        colorName: "",
      });
      await loadProjects();
      await loadColors();
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

  const addColor = async (event) => {
    event.preventDefault();
    const trimmedName = newColorName.trim();
    if (!trimmedName) {
      setError("Bitte eine Farbe eingeben.");
      return;
    }
    setAddingColor(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/filament-colors`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: trimmedName, in_stock: true }),
      });
      if (!res.ok) throw new Error("Farbe konnte nicht gespeichert werden");
      setNewColorName("");
      await loadColors();
    } catch (err) {
      setError("Farbe konnte nicht gespeichert werden.");
    } finally {
      setAddingColor(false);
    }
  };

  const toggleColorStock = async (color) => {
    setError("");
    try {
      const res = await fetch(`${API_BASE}/filament-colors/${color.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ in_stock: !color.in_stock }),
      });
      if (!res.ok) throw new Error("Farbe konnte nicht aktualisiert werden");
      await loadColors();
    } catch (err) {
      setError("Farbe konnte nicht aktualisiert werden.");
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
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                Filamentfarbe
                <select
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-base text-ink shadow-sm outline-none focus:border-accent"
                  name="colorId"
                  value={formData.colorId}
                  onChange={(event) => {
                    handleChange(event);
                    if (event.target.value !== "new") {
                      setFormData((prev) => ({ ...prev, colorName: "" }));
                    }
                  }}
                >
                  <option value="">Keine Auswahl</option>
                  {availableColors.map((color) => (
                    <option key={color.id} value={String(color.id)}>
                      {color.name}
                    </option>
                  ))}
                  <option value="new">Andere / nicht vorhanden</option>
                </select>
              </label>
              {formData.colorId === "new" && (
                <label className="flex flex-col gap-2 text-sm font-medium text-slate-600">
                  Neue Farbe
                  <input
                    className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-base text-ink shadow-sm outline-none focus:border-amber-400"
                    name="colorName"
                    type="text"
                    placeholder="z.B. Pastell Blau"
                    value={formData.colorName}
                    onChange={handleChange}
                    required
                  />
                  <span className="text-xs text-amber-600">
                    Hinweis: Diese Farbe wird als nicht vorhanden markiert.
                  </span>
                </label>
              )}
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
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span
                                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                                  project.color_in_stock === 0
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {project.color_name || "Keine"}
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

            <div className="mt-6 rounded-2xl border border-slate-200 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                <div>
                  <div className="text-sm font-semibold text-ink">
                    Filamentfarben
                  </div>
                  <div className="text-xs text-slate-400">
                    Fehlende Farben sind mit einem Ausrufezeichen markiert.
                  </div>
                </div>
                <form className="flex flex-wrap items-center gap-2" onSubmit={addColor}>
                  <input
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs text-ink outline-none focus:border-accent"
                    type="text"
                    placeholder="Neue Farbe hinzufuegen"
                    value={newColorName}
                    onChange={(event) => setNewColorName(event.target.value)}
                  />
                  <button
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 hover:border-accent hover:text-accent disabled:opacity-60"
                    type="submit"
                    disabled={addingColor}
                  >
                    {addingColor ? "Speichern..." : "Hinzufuegen"}
                  </button>
                </form>
              </div>
              {colors.length === 0 ? (
                <div className="px-4 py-4 text-sm text-slate-500">
                  Noch keine Farben gepflegt.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {colors.map((color) => (
                    <div
                      key={color.id}
                      className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            color.in_stock ? "bg-emerald-500" : "bg-amber-500"
                          }`}
                        />
                        <span className="font-medium text-ink">{color.name}</span>
                        {!color.in_stock && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                            !
                          </span>
                        )}
                      </div>
                      <button
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 hover:border-accent hover:text-accent"
                        onClick={() => toggleColorStock(color)}
                      >
                        {color.in_stock ? "Als fehlend markieren" : "Als vorhanden markieren"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
