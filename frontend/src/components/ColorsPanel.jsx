import { useEffect, useState } from "react";

const emptyDraft = {
  name: "",
  manufacturer: "",
  material_type: "",
  hex_color: "",
};

export default function ColorsPanel({
  colors,
  addingColor,
  newColorName,
  newColorManufacturer,
  newColorMaterial,
  newColorHex,
  manufacturerOptions,
  materialOptions,
  onNewColorNameChange,
  onNewColorManufacturerChange,
  onNewColorMaterialChange,
  onNewColorHexChange,
  onSubmit,
  onToggleStock,
  onUpdateColor,
  onDeleteColor,
  manufacturerOptionsId,
}) {
  const [editingColor, setEditingColor] = useState(null);
  const [editDraft, setEditDraft] = useState(emptyDraft);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    if (!editingColor) return;
    setEditDraft({
      name: editingColor.name || "",
      manufacturer: editingColor.manufacturer || "",
      material_type: editingColor.material_type || "",
      hex_color: editingColor.hex_color || "",
    });
  }, [editingColor]);

  const closeEdit = () => {
    setEditingColor(null);
    setEditDraft(emptyDraft);
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditDraft((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!editingColor) return;
    await onUpdateColor(editingColor.id, {
      name: editDraft.name,
      manufacturer: editDraft.manufacturer || null,
      material_type: editDraft.material_type || null,
      hex_color: editDraft.hex_color || null,
    });
    closeEdit();
  };

  const handleSubmitAdd = async (event) => {
    event.preventDefault();
    await onSubmit(event);
    if (!addingColor) {
      setShowAddModal(false);
    }
  };

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
        <div>
          <div className="text-sm font-semibold text-ink dark:text-haze">
            Filamentfarben
          </div>
          <div className="text-xs text-slate-400 dark:text-slate-500">
            Fehlende Farben sind mit einem Ausrufezeichen markiert.
          </div>
        </div>
        <button
          type="button"
          className="rounded-full bg-accent px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white hover:bg-accentDeep"
          onClick={() => setShowAddModal(true)}
        >
          Farbe hinzufuegen
        </button>
      </div>
      {colors.length === 0 ? (
        <div className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
          Noch keine Farben gepflegt.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {colors.map((color) => (
            <div
              key={color.id}
              className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    color.in_stock ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                {color.hex_color && (
                  <span
                    className="h-3 w-3 rounded-full border border-slate-200"
                    style={{ backgroundColor: color.hex_color }}
                    title={color.hex_color}
                  />
                )}
                <span className="font-medium text-ink dark:text-haze">
                  {color.name}
                </span>
                {color.manufacturer && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    ({color.manufacturer})
                  </span>
                )}
                {color.material_type && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {color.material_type}
                  </span>
                )}
                {!color.in_stock && (
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-200">
                    !
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 hover:border-accent hover:text-accent dark:border-slate-700 dark:text-slate-300 dark:hover:border-amber-400 dark:hover:text-amber-300"
                  onClick={() => onToggleStock(color)}
                >
                  {color.in_stock
                    ? "Als fehlend markieren"
                    : "Als vorhanden markieren"}
                </button>
                <button
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500 hover:border-accent hover:text-accent dark:border-slate-700 dark:text-slate-300 dark:hover:border-amber-400 dark:hover:text-amber-300"
                  onClick={() => setEditingColor(color)}
                >
                  Bearbeiten
                </button>
                <button
                  className="rounded-full border border-rose-200 px-3 py-1 text-xs font-semibold text-rose-500 hover:border-rose-400 hover:text-rose-600 dark:border-rose-500/40 dark:text-rose-300 dark:hover:border-rose-400 dark:hover:text-rose-200"
                  onClick={() => onDeleteColor(color.id)}
                >
                  Loeschen
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-8">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-card dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-ink dark:text-haze">
                Farbe hinzufuegen
              </h3>
              <button
                type="button"
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500"
                onClick={() => setShowAddModal(false)}
              >
                Schliessen
              </button>
            </div>
            <form className="mt-5 grid gap-4" onSubmit={handleSubmitAdd}>
              <label className="flex flex-col gap-1 text-xs text-slate-500">
                Farbname
                <input
                  className="rounded-full border border-slate-200 px-3 py-2 text-xs text-ink outline-none focus:border-accent"
                  type="text"
                  value={newColorName}
                  onChange={onNewColorNameChange}
                  required
                />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-xs text-slate-500">
                  Hersteller
                  <select
                    className="rounded-full border border-slate-200 px-3 py-2 text-xs text-ink outline-none focus:border-accent"
                    value={newColorManufacturer}
                    onChange={onNewColorManufacturerChange}
                  >
                    <option value="">Bitte waehlen</option>
                    {manufacturerOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-xs text-slate-500">
                  Material
                  <select
                    className="rounded-full border border-slate-200 px-3 py-2 text-xs text-ink outline-none focus:border-accent"
                    value={newColorMaterial}
                    onChange={onNewColorMaterialChange}
                  >
                    <option value="">Bitte waehlen</option>
                    {materialOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-xs text-slate-500">
                  HEX
                  <input
                    className="h-10 w-16 rounded-full border border-slate-200 px-2 text-xs text-ink outline-none focus:border-accent"
                    type="color"
                    value={newColorHex || "#000000"}
                    onChange={onNewColorHexChange}
                  />
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500"
                  onClick={() => setShowAddModal(false)}
                >
                  Abbrechen
                </button>
                <button
                  type="submit"
                  className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-semibold text-white"
                  disabled={addingColor}
                >
                  {addingColor ? "Speichern..." : "Speichern"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingColor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 py-8">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-card dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-ink dark:text-haze">
                Farbe bearbeiten
              </h3>
              <button
                type="button"
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-500"
                onClick={closeEdit}
              >
                Schliessen
              </button>
            </div>
            <form className="mt-5 grid gap-4" onSubmit={handleEditSubmit}>
              <label className="flex flex-col gap-1 text-xs text-slate-500">
                Name
                <input
                  className="rounded-full border border-slate-200 px-3 py-2 text-xs text-ink outline-none focus:border-accent"
                  type="text"
                  name="name"
                  value={editDraft.name}
                  onChange={handleEditChange}
                  required
                />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="flex flex-col gap-1 text-xs text-slate-500">
                  Hersteller
                  <select
                    className="rounded-full border border-slate-200 px-3 py-2 text-xs text-ink outline-none focus:border-accent"
                    name="manufacturer"
                    value={editDraft.manufacturer}
                    onChange={handleEditChange}
                  >
                    <option value="">Bitte waehlen</option>
                    {manufacturerOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-xs text-slate-500">
                  Material
                  <select
                    className="rounded-full border border-slate-200 px-3 py-2 text-xs text-ink outline-none focus:border-accent"
                    name="material_type"
                    value={editDraft.material_type}
                    onChange={handleEditChange}
                  >
                    <option value="">Bitte waehlen</option>
                    {materialOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-xs text-slate-500">
                  Farbe (HEX)
                  <input
                    className="rounded-full border border-slate-200 px-3 py-2 text-xs text-ink outline-none focus:border-accent"
                    type="text"
                    name="hex_color"
                    placeholder="#RRGGBB"
                    value={editDraft.hex_color}
                    onChange={handleEditChange}
                  />
                </label>
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                <button
                  type="button"
                  className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-500"
                  onClick={closeEdit}
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
