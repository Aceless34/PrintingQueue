import { useState } from "react";

export default function SettingsPanel({
  manufacturers,
  materials,
  onAddManufacturer,
  onUpdateManufacturer,
  onDeleteManufacturer,
  onAddMaterial,
  onUpdateMaterial,
  onDeleteMaterial,
}) {
  const [newManufacturer, setNewManufacturer] = useState("");
  const [newMaterial, setNewMaterial] = useState("");
  const [editManufacturer, setEditManufacturer] = useState(null);
  const [editMaterial, setEditMaterial] = useState(null);

  const submitNewManufacturer = async (event) => {
    event.preventDefault();
    const trimmed = newManufacturer.trim();
    if (!trimmed) return;
    await onAddManufacturer(trimmed);
    setNewManufacturer("");
  };

  const submitNewMaterial = async (event) => {
    event.preventDefault();
    const trimmed = newMaterial.trim();
    if (!trimmed) return;
    await onAddMaterial(trimmed);
    setNewMaterial("");
  };

  const submitEditManufacturer = async (event) => {
    event.preventDefault();
    if (!editManufacturer) return;
    await onUpdateManufacturer(editManufacturer.id, { name: editManufacturer.name });
    setEditManufacturer(null);
  };

  const submitEditMaterial = async (event) => {
    event.preventDefault();
    if (!editMaterial) return;
    await onUpdateMaterial(editMaterial.id, { name: editMaterial.name });
    setEditMaterial(null);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <div>
            <div className="text-sm font-semibold text-ink dark:text-haze">
              Hersteller
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500">
              Liste fuer Farb-Auswahl pflegen.
            </div>
          </div>
        </div>
        <form className="flex flex-wrap items-end gap-2 px-4 py-4" onSubmit={submitNewManufacturer}>
          <label className="flex flex-col gap-1 text-xs text-slate-500">
            Neuer Hersteller
            <input
              className="rounded-full border border-slate-200 px-3 py-2 text-xs text-ink outline-none focus:border-accent dark:border-slate-700 dark:bg-slate-900 dark:text-haze"
              type="text"
              value={newManufacturer}
              onChange={(event) => setNewManufacturer(event.target.value)}
            />
          </label>
          <button
            className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 hover:border-accent hover:text-accent"
            type="submit"
          >
            Hinzufuegen
          </button>
        </form>
        {manufacturers.length === 0 ? (
          <div className="px-4 pb-4 text-sm text-slate-500 dark:text-slate-400">
            Noch keine Hersteller.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-xs uppercase tracking-[0.2em] text-slate-400 dark:bg-slate-900 dark:text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3 text-right">Aktion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {manufacturers.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 hover:border-accent hover:text-accent"
                          onClick={() =>
                            setEditManufacturer({ id: item.id, name: item.name })
                          }
                        >
                          Bearbeiten
                        </button>
                        <button
                          className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-500 hover:border-rose-400 hover:text-rose-600"
                          onClick={() => onDeleteManufacturer(item.id)}
                        >
                          Loeschen
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

      <div className="rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
          <div>
            <div className="text-sm font-semibold text-ink dark:text-haze">
              Materialien
            </div>
            <div className="text-xs text-slate-400 dark:text-slate-500">
              Verwalte die Materialtypen fuer Farbauswahl.
            </div>
          </div>
        </div>
        <form className="flex flex-wrap items-end gap-2 px-4 py-4" onSubmit={submitNewMaterial}>
          <label className="flex flex-col gap-1 text-xs text-slate-500">
            Neues Material
            <input
              className="rounded-full border border-slate-200 px-3 py-2 text-xs text-ink outline-none focus:border-accent dark:border-slate-700 dark:bg-slate-900 dark:text-haze"
              type="text"
              value={newMaterial}
              onChange={(event) => setNewMaterial(event.target.value)}
            />
          </label>
          <button
            className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-500 hover:border-accent hover:text-accent"
            type="submit"
          >
            Hinzufuegen
          </button>
        </form>
        {materials.length === 0 ? (
          <div className="px-4 pb-4 text-sm text-slate-500 dark:text-slate-400">
            Noch keine Materialien.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white text-xs uppercase tracking-[0.2em] text-slate-400 dark:bg-slate-900 dark:text-slate-500">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3 text-right">Aktion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {materials.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3">
                      {item.name}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 hover:border-accent hover:text-accent"
                          onClick={() =>
                            setEditMaterial({ id: item.id, name: item.name })
                          }
                        >
                          Bearbeiten
                        </button>
                        <button
                          className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-500 hover:border-rose-400 hover:text-rose-600"
                          onClick={() => onDeleteMaterial(item.id)}
                        >
                          Loeschen
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

      {editManufacturer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-8">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-card dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-ink dark:text-haze">
                Hersteller bearbeiten
              </h3>
              <button
                type="button"
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500"
                onClick={() => setEditManufacturer(null)}
              >
                Schliessen
              </button>
            </div>
            <form className="mt-5 grid gap-4" onSubmit={submitEditManufacturer}>
              <label className="flex flex-col gap-1 text-xs text-slate-500">
                Name
                <input
                  className="rounded-full border border-slate-200 px-3 py-2 text-xs text-ink outline-none focus:border-accent"
                  type="text"
                  value={editManufacturer.name}
                  onChange={(event) =>
                    setEditManufacturer((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  required
                />
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500"
                  onClick={() => setEditManufacturer(null)}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white"
                >
                  Speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-8">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-card dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-ink dark:text-haze">
                Material bearbeiten
              </h3>
              <button
                type="button"
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500"
                onClick={() => setEditMaterial(null)}
              >
                Schliessen
              </button>
            </div>
            <form className="mt-5 grid gap-4" onSubmit={submitEditMaterial}>
              <label className="flex flex-col gap-1 text-xs text-slate-500">
                Name
                <input
                  className="rounded-full border border-slate-200 px-3 py-2 text-xs text-ink outline-none focus:border-accent"
                  type="text"
                  value={editMaterial.name}
                  onChange={(event) =>
                    setEditMaterial((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  required
                />
              </label>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500"
                  onClick={() => setEditMaterial(null)}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white"
                >
                  Speichern
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
